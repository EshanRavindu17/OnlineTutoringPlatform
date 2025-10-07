import { Router } from 'express';
import { reviewsController } from '../controllers/reviewsController';

const router = Router();

// Get all reviews with optional filters
router.get('/:firebaseUid/all', reviewsController.getTutorReviews);

// Get comprehensive review statistics
router.get('/:firebaseUid/statistics', reviewsController.getReviewStatistics);

// Get reviews by rating
router.get('/:firebaseUid/rating/:rating', reviewsController.getReviewsByRating);

// Get reviews by subject
router.get('/:firebaseUid/subject/:subject', reviewsController.getReviewsBySubject);

// Get reviews by date range
router.get('/:firebaseUid/date-range', reviewsController.getReviewsByDateRange);

// Get review analytics
router.get('/:firebaseUid/analytics', reviewsController.getReviewAnalytics);

// Get top-rated sessions
router.get('/:firebaseUid/top-rated', reviewsController.getTopRatedSessions);

// Get reviews dashboard summary
router.get('/:firebaseUid/dashboard', reviewsController.getReviewsDashboard);

export default router;