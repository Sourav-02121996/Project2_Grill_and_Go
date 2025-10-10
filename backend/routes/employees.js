import express from 'express';
import { ObjectId } from 'mongodb';
import { getDb } from '../db/mongoClient.js';

const router = express.Router();

const formatEmployee = (doc) => {
  if (!doc || typeof doc !== 'object') return doc;

  const { _id, firstName, lastName, email, role, department, ...rest } = doc;

  return {
    id: _id ? _id.toString() : undefined,
    name: [firstName, lastName].filter(Boolean).join(' ') || doc.name || '',
    email: email ?? '',
    role: role ?? '',
    department: department ?? '',
    ...rest,
  };
};

router.get('/', async (_req, res, next) => {
  try {
    const db = await getDb();
    const employees = await db.collection('employees').find({}).toArray();
    res.json({ success: true, employees: employees.map(formatEmployee) });
  } catch (error) {
    next(error);
  }
});

router.get('/:employeeId', async (req, res, next) => {
  try {
    const db = await getDb();
    const { employeeId } = req.params;

    let query;
    try {
      query = { _id: new ObjectId(employeeId) };
    } catch {
      query = { id: employeeId };
    }

    const employee = await db.collection('employees').findOne(query);
    if (!employee) {
      res.status(404).json({ success: false, message: 'Employee not found.' });
      return;
    }

    res.json({ success: true, employee: formatEmployee(employee) });
  } catch (error) {
    next(error);
  }
});

export default router;
