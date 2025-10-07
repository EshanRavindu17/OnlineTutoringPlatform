import { Router } from 'express';
import {
  adminSignup,
  adminLogin,
  adminRefresh,
  adminLogout,
  adminMe,
  adminMetrics,
  adminAnalytics,
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
import {
  listAllReportsController,
  toggleReportStatusController,
} from '../controllers/report.controller';
import {
  getCommissionController,
  updateCommissionController,
  getFinanceAnalyticsController,
  getPaymentRatesController,
  createPaymentRateController,
  updatePaymentRateController,
} from '../controllers/finance.controller';
import {
  getIndividualSessionsController,
  getMassClassSlotsController,
  getSessionStatsController,
  updateIndividualSessionStatusController,
  updateMassSlotStatusController,
  getZakTokenController,
  getAdminHostUrlController,
  getSessionDetailsController,
  getClassSlotDetailsController,
} from '../controllers/adminSession.controller';
import {
  getAllUsersController,
  createAdminMeetingController,
  getAdminSessionsController,
  sendMeetingEmailController,
  deleteAdminSessionController,
  updateAdminSessionStatusController,
} from '../controllers/adminMeeting.controller';

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

// Dashboard & Analytics
r.get('/dashboard/metrics', requireAdminJWT, adminMetrics);
r.get('/analytics', requireAdminJWT, adminAnalytics);

// Policies (CRUD) — secured
r.get('/policies', requireAdminJWT, listPolicies);
r.get('/policies/:id', requireAdminJWT, getPolicy);
r.post('/policies', requireAdminJWT, createPolicy);
r.put('/policies/:id', requireAdminJWT, updatePolicy, () => console.log('Policy updated'));
r.delete('/policies/:id', requireAdminJWT, deletePolicy);

// Reports / Complaints — secured
r.get('/reports', requireAdminJWT, listAllReportsController);
r.put('/reports/:id/toggle-status', requireAdminJWT, toggleReportStatusController);

// Finance — secured
r.get('/finance/commission', requireAdminJWT, getCommissionController);
r.put('/finance/commission', requireAdminJWT, updateCommissionController);
r.get('/finance/payment-rates', requireAdminJWT, getPaymentRatesController);
r.post('/finance/payment-rates/:type', requireAdminJWT, createPaymentRateController);
r.put('/finance/payment-rates/:type', requireAdminJWT, updatePaymentRateController);
r.get('/finance/analytics', requireAdminJWT, getFinanceAnalyticsController);

// Session Management — secured
r.get('/sessions/individual', requireAdminJWT, getIndividualSessionsController);
r.get('/sessions/mass', requireAdminJWT, getMassClassSlotsController);
r.get('/sessions/stats', requireAdminJWT, getSessionStatsController);
r.get('/sessions/individual/:sessionId', requireAdminJWT, getSessionDetailsController);
r.get('/sessions/mass/:slotId', requireAdminJWT, getClassSlotDetailsController);
r.put('/sessions/individual/:sessionId/status', requireAdminJWT, updateIndividualSessionStatusController);
r.put('/sessions/mass/:slotId/status', requireAdminJWT, updateMassSlotStatusController);
r.get('/sessions/zoom/zak', requireAdminJWT, getZakTokenController);
r.post('/sessions/zoom/host-url', requireAdminJWT, getAdminHostUrlController);

// Admin Meeting Creation & Email — secured
r.get('/meetings/users', requireAdminJWT, getAllUsersController);
r.post('/meetings/create', requireAdminJWT, createAdminMeetingController);
r.get('/meetings/sessions', requireAdminJWT, getAdminSessionsController);
r.post('/meetings/send-email', requireAdminJWT, sendMeetingEmailController);
r.delete('/meetings/sessions/:sessionId', requireAdminJWT, deleteAdminSessionController);
r.put('/meetings/sessions/:sessionId/status', requireAdminJWT, updateAdminSessionStatusController);

export default r;
