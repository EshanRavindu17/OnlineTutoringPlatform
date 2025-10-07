import { Request, Response } from 'express';
import { reviewsService, FilterOptions } from '../services/reviewsService';

class ReviewsController {
  // Get all reviews for a tutor with optional filters
  async getTutorReviews(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.params;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      // Build filter options from query parameters
      const options: FilterOptions = {};
      
      if (req.query.rating) {
        options.rating = parseInt(req.query.rating as string);
      }
      
      if (req.query.subject) {
        options.subject = req.query.subject as string;
      }
      
      if (req.query.dateFrom) {
        options.dateFrom = new Date(req.query.dateFrom as string);
      }
      
      if (req.query.dateTo) {
        options.dateTo = new Date(req.query.dateTo as string);
      }
      
      if (req.query.limit) {
        options.limit = parseInt(req.query.limit as string);
      }
      
      if (req.query.offset) {
        options.offset = parseInt(req.query.offset as string);
      }

      const reviews = await reviewsService.getTutorReviews(firebaseUid, options);
      
      res.json({
        success: true,
        data: reviews
      });
    } catch (error: any) {
      console.error('Error getting tutor reviews:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get reviews'
      });
    }
  }

  // Get comprehensive review statistics
  async getReviewStatistics(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.params;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      const statistics = await reviewsService.getReviewStatistics(firebaseUid);
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      console.error('Error getting review statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get review statistics'
      });
    }
  }

  // Get reviews by rating
  async getReviewsByRating(req: Request, res: Response) {
    try {
      const { firebaseUid, rating } = req.params;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      const ratingValue = parseInt(rating);
      if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const reviews = await reviewsService.getReviewsByRating(firebaseUid, ratingValue);
      
      res.json({
        success: true,
        data: reviews
      });
    } catch (error: any) {
      console.error('Error getting reviews by rating:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get reviews by rating'
      });
    }
  }

  // Get reviews by subject
  async getReviewsBySubject(req: Request, res: Response) {
    try {
      const { firebaseUid, subject } = req.params;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      if (!subject) {
        return res.status(400).json({
          success: false,
          message: 'Subject is required'
        });
      }

      const reviews = await reviewsService.getReviewsBySubject(firebaseUid, subject);
      
      res.json({
        success: true,
        data: reviews
      });
    } catch (error: any) {
      console.error('Error getting reviews by subject:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get reviews by subject'
      });
    }
  }

  // Get reviews by date range
  async getReviewsByDateRange(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required'
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }

      const reviews = await reviewsService.getReviewsByDateRange(firebaseUid, start, end);
      
      res.json({
        success: true,
        data: reviews
      });
    } catch (error: any) {
      console.error('Error getting reviews by date range:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get reviews by date range'
      });
    }
  }

  // Get review analytics
  async getReviewAnalytics(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.params;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      const analytics = await reviewsService.getReviewAnalytics(firebaseUid);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      console.error('Error getting review analytics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get review analytics'
      });
    }
  }

  // Get top-rated sessions
  async getTopRatedSessions(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.params;
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      const sessions = await reviewsService.getTopRatedSessions(firebaseUid, limit);
      
      res.json({
        success: true,
        data: sessions
      });
    } catch (error: any) {
      console.error('Error getting top-rated sessions:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get top-rated sessions'
      });
    }
  }

  // Get reviews dashboard summary
  async getReviewsDashboard(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.params;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      // Get statistics, analytics, and top sessions
      const [statistics, analytics, topSessions] = await Promise.all([
        reviewsService.getReviewStatistics(firebaseUid),
        reviewsService.getReviewAnalytics(firebaseUid),
        reviewsService.getTopRatedSessions(firebaseUid, 5)
      ]);

      res.json({
        success: true,
        data: {
          statistics,
          analytics,
          topSessions
        }
      });
    } catch (error: any) {
      console.error('Error getting reviews dashboard:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get reviews dashboard'
      });
    }
  }
}

export const reviewsController = new ReviewsController();