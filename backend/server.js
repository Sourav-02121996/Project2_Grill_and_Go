import express from 'express';

console.log('Initializing backend...');

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || '127.0.0.1';

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
