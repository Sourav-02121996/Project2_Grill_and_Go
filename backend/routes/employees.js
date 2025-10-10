import { Router } from 'express';
import { loadJson } from '../utils/loadJson.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const employees = await loadJson('employees.json');
    res.json({ success: true, employees });
  } catch (error) {
    next(error);
  }
});

router.get('/:employeeId', async (req, res, next) => {
  try {
    const employees = await loadJson('employees.json');
    const employee = employees.find((record) => record.id === req.params.employeeId);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }
    res.json({ success: true, employee });
  } catch (error) {
    next(error);
  }
});

export default router;
