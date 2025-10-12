import { Router } from "express";
import { getDb } from "../db/mongoClient.js";

const router = Router();

const COLLECTION_NAME = "Rosters";

const getRostersCollection = async () => {
  const db = await getDb();
  return db.collection(COLLECTION_NAME);
};

const toIsoOrNull = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const mapDailySchedule = (schedule) => {
  const normalized = Array.isArray(schedule)
    ? schedule.map((day) => ({
        shift:
          typeof day?.shift === "string" && day.shift.trim()
            ? day.shift.trim()
            : "OFF",
        hours:
          typeof day?.hours === "number" && Number.isFinite(day.hours)
            ? day.hours
            : 0,
      }))
    : [];

  while (normalized.length < 7) {
    normalized.push({ shift: "OFF", hours: 0 });
  }

  return normalized;
};

const normalizeRosterEntry = (entry) => {
  const dailySchedule = mapDailySchedule(entry?.dailySchedule);

  const totalHours =
    typeof entry?.totalHours === "number" && Number.isFinite(entry.totalHours)
      ? entry.totalHours
      : dailySchedule.reduce((sum, day) => sum + day.hours, 0);

  return {
    employeeId:
      typeof entry?.employeeId === "string" && entry.employeeId.trim()
        ? entry.employeeId.trim()
        : null,
    email:
      typeof entry?.email === "string" && entry.email.trim()
        ? entry.email.trim().toLowerCase()
        : null,
    name:
      typeof entry?.name === "string" && entry.name.trim()
        ? entry.name.trim()
        : "",
    totalHours,
    dailySchedule,
  };
};

const mapRoster = (doc) => ({
  id: doc._id?.toString(),
  weekStart: toIsoOrNull(doc.weekStart),
  entries: Array.isArray(doc.entries)
    ? doc.entries.map((entry) => ({
        employeeId: entry.employeeId ?? null,
        email: entry.email ?? null,
        name: entry.name ?? "",
        totalHours: entry.totalHours ?? 0,
        dailySchedule: mapDailySchedule(entry.dailySchedule),
      }))
    : [],
  createdAt: toIsoOrNull(doc.createdAt),
  updatedAt: toIsoOrNull(doc.updatedAt),
});

const parseWeekStart = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setHours(0, 0, 0, 0);
  return date;
};

router.get("/", async (req, res, next) => {
  try {
    const { weekStart } = req.query ?? {};
    const collection = await getRostersCollection();

    let rosterDoc;
    if (weekStart) {
      const parsedDate = parseWeekStart(weekStart);
      if (!parsedDate) {
        res
          .status(400)
          .json({ success: false, message: "Invalid weekStart parameter." });
        return;
      }

      rosterDoc = await collection.findOne({ weekStart: parsedDate });
    } else {
      rosterDoc = await collection
        .find({})
        .sort({ weekStart: -1, createdAt: -1 })
        .limit(1)
        .next();
    }

    if (!rosterDoc) {
      res.json({ success: true, roster: null });
      return;
    }

    res.json({ success: true, roster: mapRoster(rosterDoc) });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { weekStart, entries } = req.body ?? {};

    if (typeof weekStart !== "string" || !weekStart.trim()) {
      res
        .status(400)
        .json({ success: false, message: "weekStart is required." });
      return;
    }

    if (!Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({
        success: false,
        message: "At least one roster entry is required.",
      });
      return;
    }

    const parsedWeekStart = parseWeekStart(weekStart);
    if (!parsedWeekStart) {
      res.status(400).json({
        success: false,
        message: "weekStart must be a valid date string.",
      });
      return;
    }

    const normalizedEntries = entries.map(normalizeRosterEntry);
    const now = new Date();
    const collection = await getRostersCollection();

    const result = await collection.findOneAndUpdate(
      { weekStart: parsedWeekStart },
      {
        $set: {
          entries: normalizedEntries,
          updatedAt: now,
        },
        $setOnInsert: {
          createdAt: now,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    const roster = result?.value ?? result;
    const status = result?.lastErrorObject?.updatedExisting ? 200 : 201;

    res.status(status).json({
      success: true,
      roster: mapRoster(roster),
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const { weekStart } = req.query ?? {};
    if (typeof weekStart !== "string" || !weekStart.trim()) {
      res.status(400).json({
        success: false,
        message: "weekStart query parameter is required.",
      });
      return;
    }

    const parsedWeekStart = parseWeekStart(weekStart);
    if (!parsedWeekStart) {
      res.status(400).json({
        success: false,
        message: "weekStart must be a valid date string.",
      });
      return;
    }

    const collection = await getRostersCollection();
    const result = await collection.deleteOne({ weekStart: parsedWeekStart });

    if (!result.deletedCount) {
      res.status(404).json({ success: false, message: "Roster not found." });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
