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
