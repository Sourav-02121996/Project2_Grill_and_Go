import express from 'express';
import { getDb } from '../db/mongoClient.js';

const router = express.Router();

const formatEmployee = (doc) => {
  if (!doc || typeof doc !== 'object') return doc;
  const { _id, firstName, lastName, email, role, department, ...rest } = doc;

  return {
    id: _id?.toString() ?? '',
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
    const docs = await db.collection('employees').find({}).toArray();
    const employees = docs.map(formatEmployee);
    res.json({ employees });
  } catch (error) {
    next(error);
  }
});

export default router;
