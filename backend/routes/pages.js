import path from 'path';
import express from 'express';
import bcrypt from 'bcrypt';
import { getDb } from '../db/mongoClient.js';

const normalizeEmail = (email) => email.trim().toLowerCase();

const createPagesRouter = (frontendDir) => {
  const router = express.Router();

  const sendFrontendFile = (res, relativePath) => {
    res.sendFile(path.join(frontendDir, relativePath));
  };

  router.get('/', (_req, res) => {
    sendFrontendFile(res, 'index.html');
  });

  router.get('/login', (_req, res) => {
    sendFrontendFile(res, 'login.html');
  });

  router.get('/employees', (_req, res) => {
    sendFrontendFile(res, 'employees.html');
  });

  router.post('/login', async (req, res, next) => {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password.trim()) {
      res.redirect('/login?error=missing');
      return;
    }

    try {
      const db = await getDb();
      const normalizedEmail = normalizeEmail(email);
      const employee = await db.collection('employees').findOne({
        $or: [{ email }, { email: normalizedEmail }, { emailLower: normalizedEmail }],
      });

      const storedHash = employee?.passwordHash ?? employee?.password;
      const passwordMatches = storedHash ? await bcrypt.compare(password, storedHash) : false;

      if (!employee || !passwordMatches) {
        res.redirect('/login?error=invalid');
        return;
      }

      const role = (employee.role ?? '').toLowerCase();

      if (role === 'admin') {
        res.redirect('/admin/dashboard');
        return;
      }

      res.redirect('/staff/dashboard');
    } catch (error) {
      next(error);
    }
  });

  router.get('/admin/dashboard', (_req, res) => {
    sendFrontendFile(res, path.join('admin', 'AdminDashboard.html'));
  });

  router.get('/staff/dashboard', (_req, res) => {
    sendFrontendFile(res, path.join('admin', 'StaffDashboard.html'));
  });

  return router;
};

export default createPagesRouter;
