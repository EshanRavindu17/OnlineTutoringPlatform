import { Router } from 'express';
import { earningsController } from '../controllers/earningsController';

const router = Router();

// Get comprehensive earnings statistics
router.get('/:firebaseUid/all', earningsController.getTutorEarnings);

// Get recent payments
router.get('/:firebaseUid/payments', earningsController.getRecentPayments);

// Get earnings by date range
router.get('/:firebaseUid/date-range', earningsController.getEarningsByDateRange);

// Get payment statistics
router.get('/:firebaseUid/statistics', earningsController.getPaymentStatistics);

// Get earnings dashboard summary
router.get('/:firebaseUid/dashboard', earningsController.getEarningsDashboard);

export default router;