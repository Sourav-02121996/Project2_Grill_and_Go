import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/orders.js";
import menuRoutes from "./routes/menu.js";
import employeeRoutes from "./routes/employees.js";
import rosterRoutes from "./routes/roster.js";
import promotionRoutes from "./routes/promotions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = 5001;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/roster", rosterRoutes);
app.use("/api/promotions", promotionRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Serve frontend pages
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📂 Frontend: http://localhost:${port}`);
  console.log(`🔌 API: http://localhost:${port}/api`);
});
