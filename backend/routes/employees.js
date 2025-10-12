import { Router } from "express";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongoClient.js";

const router = Router();

const COLLECTION_NAME = "Employees";
const normalizeEmail = (email = "") => email.trim().toLowerCase();

const toIsoStringOrNull = (value) => {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const buildEmployeeName = (employee) => {
  const direct = typeof employee?.name === "string" ? employee.name.trim() : "";
  if (direct) {
    return direct;
  }

  const first =
    typeof employee?.firstName === "string" ? employee.firstName.trim() : "";
  const last =
    typeof employee?.lastName === "string" ? employee.lastName.trim() : "";
  const combined = [first, last].filter(Boolean).join(" ");
  if (combined) {
    return combined;
  }

  return "";
};

const mapEmployee = (employee) => ({
  id: employee._id?.toString(),
  name: buildEmployeeName(employee),
  email: employee.email ?? "",
  phone: employee.phone ?? null,
  role: (employee.role ?? "staff").toLowerCase(),
  createdAt: toIsoStringOrNull(employee.createdAt),
  updatedAt: toIsoStringOrNull(employee.updatedAt),
});

const getEmployeesCollection = async () => {
  const db = await getDb();
  return db.collection(COLLECTION_NAME);
};

const ensureObjectId = (id) => {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
};

router.get("/", async (_req, res, next) => {
  try {
    const collection = await getEmployeesCollection();
    const employees = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({
      success: true,
      employees: employees.map(mapEmployee),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:employeeId", async (req, res, next) => {
  try {
    const employeeId = ensureObjectId(req.params.employeeId);
    if (!employeeId) {
      res.status(400).json({ success: false, message: "Invalid employee id." });
      return;
    }

    const collection = await getEmployeesCollection();
    const employee = await collection.findOne({ _id: employeeId });

    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found." });
      return;
    }

    res.json({ success: true, employee: mapEmployee(employee) });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { name, email, phone, role = "staff", password } = req.body ?? {};

    if (typeof name !== "string" || !name.trim()) {
      res.status(400).json({ success: false, message: "Name is required." });
      return;
    }

    if (typeof email !== "string" || !email.trim()) {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
    }

    if (typeof password !== "string" || password.length < 6) {
      res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
      return;
    }

    const emailLower = normalizeEmail(email);
    const collection = await getEmployeesCollection();

    const existing = await collection.findOne({
      emailLower,
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: "An employee with this email already exists.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    const doc = {
      name: name.trim(),
      email: email.trim(),
      emailLower,
      phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
      role: typeof role === "string" ? role.trim().toLowerCase() : "staff",
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(doc);

    res.status(201).json({
      success: true,
      employee: mapEmployee({ ...doc, _id: result.insertedId }),
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:employeeId", async (req, res, next) => {
  try {
    const employeeId = ensureObjectId(req.params.employeeId);
    if (!employeeId) {
      res.status(400).json({ success: false, message: "Invalid employee id." });
      return;
    }

    const { name, email, phone, role, password } = req.body ?? {};
    const updates = {};

    if (typeof name === "string" && name.trim()) {
      updates.name = name.trim();
    }

    if (typeof email === "string" && email.trim()) {
      updates.email = email.trim();
      updates.emailLower = normalizeEmail(email);
    }

    if (typeof phone === "string") {
      updates.phone = phone.trim() || null;
    }

    if (typeof role === "string" && role.trim()) {
      updates.role = role.trim().toLowerCase();
    }

    if (typeof password === "string" && password) {
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters.",
        });
        return;
      }
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "No valid fields provided to update.",
      });
      return;
    }

    const collection = await getEmployeesCollection();

    if (updates.emailLower) {
      const existing = await collection.findOne({
        _id: { $ne: employeeId },
        emailLower: updates.emailLower,
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: "An employee with this email already exists.",
        });
        return;
      }
    }

    updates.updatedAt = new Date();

    const updateResult = await collection.findOneAndUpdate(
      { _id: employeeId },
      { $set: updates },
      { returnDocument: "after" },
    );

    const employee = updateResult?.value ?? updateResult;

    if (!employee) {
      res.status(404).json({ success: false, message: "Employee not found." });
      return;
    }

    res.json({ success: true, employee: mapEmployee(employee) });
  } catch (error) {
    next(error);
  }
});

router.delete("/:employeeId", async (req, res, next) => {
  try {
    const employeeId = ensureObjectId(req.params.employeeId);
    if (!employeeId) {
      res.status(400).json({ success: false, message: "Invalid employee id." });
      return;
    }

    const collection = await getEmployeesCollection();
    const result = await collection.deleteOne({ _id: employeeId });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: "Employee not found." });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
