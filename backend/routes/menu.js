import { Router } from 'express';
import { loadJson } from '../utils/loadJson.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const menuItems = await loadJson('menu-items.json');
    res.json({ success: true, items: menuItems });
  } catch (error) {
    next(error);
  }
});

router.get('/ingredients', async (_req, res, next) => {
  try {
    const ingredients = await loadJson('ingredients.json');
    res.json({ success: true, ingredients });
  } catch (error) {
    next(error);
  }
});

export default router;
