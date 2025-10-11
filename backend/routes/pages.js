import path from 'path';
import express from 'express';
import bcrypt from 'bcrypt';
import { getDb } from '../db/mongoClient.js';

const normalizeEmail = (email) => email.trim().toLowerCase();

const AUTH_STORAGE_KEY = 'grillandgo.auth';

const createPagesRouter = (frontendDir) => {
  const router = express.Router();

  const sendFrontendFile = (res, relativePath) => {
    res.sendFile(path.join(frontendDir, relativePath));
  };

  const sendAuthScriptResponse = (res, payload, redirectPath) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Redirecting…</title>
</head>
<body>
  <script>
    (function () {
      try {
        localStorage.setItem(${JSON.stringify(AUTH_STORAGE_KEY)}, ${JSON.stringify(JSON.stringify(payload))});
      } catch (error) {
        console.error('Failed to persist auth info', error);
      }
      window.location.replace(${JSON.stringify(redirectPath)});
    })();
  </script>
</body>
</html>`);
  };

  const sendLogoutScriptResponse = (res) => {
    res.type('html').send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Logging out…</title>
</head>
<body>
  <script>
    (function () {
      try {
        localStorage.removeItem(${JSON.stringify(AUTH_STORAGE_KEY)});
      } catch (error) {
        console.error('Failed to clear auth info', error);
      }
      window.location.replace('/login?status=loggedout');
    })();
  </script>
</body>
</html>`);
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
      const redirectPath = role === 'admin' ? '/admin/dashboard' : '/staff/dashboard';

      const payload = {
        email: normalizedEmail,
        role,
        name: employee.name ?? [employee.firstName, employee.lastName].filter(Boolean).join(' '),
        type: 'employee',
      };

      sendAuthScriptResponse(res, payload, redirectPath);
    } catch (error) {
      next(error);
    }
  });

  router.get('/auth/logout', (_req, res) => {
    sendLogoutScriptResponse(res);
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
