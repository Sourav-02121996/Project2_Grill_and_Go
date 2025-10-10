import { Router } from 'express';
import { loadJson } from '../utils/loadJson.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const promotions = await loadJson('promotions.json');
    res.json({ success: true, promotions });
  } catch (error) {
    next(error);
  }
});

export default router;
