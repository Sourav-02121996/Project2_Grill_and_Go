import { Router } from 'express';
import { loadJson } from '../utils/loadJson.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const orders = await loadJson('orders.json');
    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

router.get('/:orderId', async (req, res, next) => {
  try {
    const orders = await loadJson('orders.json');
    const order = orders.find((record) => record.id === req.params.orderId);
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
});

export default router;
