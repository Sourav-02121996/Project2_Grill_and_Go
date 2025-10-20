import { Router } from "express";
import { loadJson } from "../utils/loadJson.js";

const router = Router();


router.post("/logout", (_req, res) => {
  res.json({ success: true });
});

router.get("/status", (_req, res) => {
  res.json({ success: true, message: "Auth service ready." });
});

export default router;
