import express from 'express';

const router = express.Router();

router.get('/listings', (_req, res) => {
  res.send('Hello Sourav');
});

export default router;
