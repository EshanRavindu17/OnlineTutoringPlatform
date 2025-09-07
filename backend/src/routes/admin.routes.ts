import { Router } from 'express';
import {
  adminSignup,
  adminLogin,
  adminRefresh,
  adminLogout,
  adminMe,
  adminMetrics,
} from '../controllers/adminAuth.controller';
import { requireAdminJWT } from '../middleware/requireAdminJWT';

const r = Router();

// Auth
r.post('/auth/signup', adminSignup);
r.post('/auth/login', adminLogin);
r.post('/auth/refresh', adminRefresh);
r.post('/auth/logout', requireAdminJWT, adminLogout);
r.get('/auth/me', requireAdminJWT, adminMe);

// Example secured feature route
r.get('/dashboard/metrics', requireAdminJWT, adminMetrics);

export default r;
