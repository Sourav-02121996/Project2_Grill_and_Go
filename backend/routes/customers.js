import { Router } from "express";
import bcrypt from "bcrypt";
import { getDb } from "../db/mongoClient.js";

const router = Router();
const COLLECTION_NAME = "Customers";

const normalizeEmail = (email) => email.trim().toLowerCase();

const buildCustomerResponse = (customer) => ({
  id: customer._id?.toString(),
  name: customer.name,
  email: customer.email,
  phone: customer.phone ?? null,
});

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body ?? {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      password.length < 6
    ) {
      res.status(400).json({
        success: false,
        message:
          "Name, email, and a password with at least 6 characters are required.",
      });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
      return;
    }

    const db = await getDb();
    const customers = db.collection(COLLECTION_NAME);
    const normalizedEmail = normalizeEmail(email);

    const existing = await customers.findOne({
      emailLower: normalizedEmail,
    });

    if (existing) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date();

    const customerDoc = {
      name: name.trim(),
      email: email.trim(),
      emailLower: normalizedEmail,
      phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    const result = await customers.insertOne(customerDoc);

    res.status(201).json({
      success: true,
      customer: {
        id: result.insertedId.toString(),
        name: customerDoc.name,
        email: customerDoc.email,
        phone: customerDoc.phone,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof password !== "string" ||
      !password
    ) {
      res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
      return;
    }

    const db = await getDb();
    const customers = db.collection(COLLECTION_NAME);
    const normalizedEmail = normalizeEmail(email);

    const customer = await customers.findOne({
      emailLower: normalizedEmail,
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Account not found. Please sign up.",
      });
      return;
    }

    const storedHash = customer.passwordHash || customer.password;
    const passwordMatches =
      typeof storedHash === "string" && storedHash
        ? await bcrypt.compare(password, storedHash)
        : false;

    if (!passwordMatches) {
      res.status(401).json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
      return;
    }

    res.json({
      success: true,
      customer: buildCustomerResponse(customer),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/health", (_req, res) => {
  res.json({ success: true });
});

export default router;
