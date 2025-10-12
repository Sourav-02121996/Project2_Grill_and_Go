import { Router } from "express";
import { loadJson } from "../utils/loadJson.js";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email } = req.body ?? {};
    if (typeof email !== "string" || !email.trim()) {
      res.status(400).json({ success: false, message: "Email is required." });
      return;
    }

    const employees = await loadJson("employees.json");
    const match = employees.find(
      (employee) => employee.email.toLowerCase() === email.trim().toLowerCase(),
    );

    if (!match) {
      res.status(401).json({ success: false, message: "Invalid credentials." });
      return;
    }

    res.json({ success: true, user: match });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/status", (_req, res) => {
  res.json({ success: true, message: "Auth service ready." });
});

export default router;
