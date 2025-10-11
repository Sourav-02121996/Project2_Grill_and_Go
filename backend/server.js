import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

import createPagesRouter from './routes/pages.js';
import listingsRouter from './routes/listings.js';
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import menuRoutes from './routes/menu.js';
import employeesRoutes from './routes/employees.js';
import rosterRoutes from './routes/roster.js';
import promotionRoutes from './routes/promotions.js';
import customersRoutes from './routes/customers.js';
import { closeDb } from './db/mongoClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.join(__dirname, '../frontend');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '127.0.0.1';

// Core middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static assets
app.use(express.static(frontendDir));

// Health checks
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Page routes (login flow, dashboards, etc.)
app.use('/', createPagesRouter(frontendDir));

// API routes
app.use('/api', listingsRouter);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/roster', rosterRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/customers', customersRoutes);

// Fallback to index.html for any other route (after API/page routers)
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// Error handling
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  console.log(`📂 Frontend: http://${HOST}:${PORT}`);
  console.log(`🔌 API base: http://${HOST}:${PORT}/api`);
});

const shutdown = async () => {
  try {
    await closeDb();
  } catch (error) {
    console.error('Error closing database connection', error);
  } finally {
    server.close(() => {
      process.exit(0);
    });
  }
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);