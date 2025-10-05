import { Router } from 'express';
import {
  adminSignup,
  adminLogin,
  adminRefresh,
  adminLogout,
  adminMe,
  adminMetrics,
} from '../controllers/adminAuth.controller';
import {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
} from '../controllers/adminProfile.controller';
import { requireAdminJWT } from '../middleware/requireAdminJWT';
import {
  listPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
} from '../controllers/policy.controller';

const r = Router();

// Auth
r.post('/auth/signup', adminSignup);
r.post('/auth/login', adminLogin);
r.post('/auth/refresh', adminRefresh);
r.post('/auth/logout', requireAdminJWT, adminLogout);
r.get('/auth/me', requireAdminJWT, adminMe);

// Profile
r.get('/profile', requireAdminJWT, getAdminProfile);
r.put('/profile', requireAdminJWT, updateAdminProfile);
r.put('/profile/password', requireAdminJWT, changeAdminPassword);

// Dashboard
r.get('/dashboard/metrics', requireAdminJWT, adminMetrics);

// Policies (CRUD) — secured
r.get('/policies', requireAdminJWT, listPolicies);
r.get('/policies/:id', requireAdminJWT, getPolicy);
r.post('/policies', requireAdminJWT, createPolicy);
r.put('/policies/:id', requireAdminJWT, updatePolicy, () => console.log('Policy updated'));
r.delete('/policies/:id', requireAdminJWT, deletePolicy);

export default r;
