import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import createPagesRouter from './routes/pages.js';
import listingsRouter from './routes/listings.js';
import employeesRouter from './routes/employees.js';
import { closeDb } from './db/mongoClient.js';

console.log('Initializing backend...');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '127.0.0.1';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, '../frontend');

app.use(express.static(frontendDir));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', createPagesRouter(frontendDir));
app.use('/api', listingsRouter);
app.use('/api/employees', employeesRouter);

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

const shutdown = async () => {
  try {
    await closeDb();
  } catch (error) {
    console.error('Error closing database connection', error);
  } finally {
    process.exit(0);
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

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
