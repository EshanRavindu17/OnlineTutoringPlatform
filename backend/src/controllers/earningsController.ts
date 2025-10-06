import { Request, Response } from 'express';
import { earningsService } from '../services/earningsService';

class EarningsController {
  // Get comprehensive earnings statistics
  async getTutorEarnings(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.params;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      const earnings = await earningsService.getTutorEarnings(firebaseUid);
      
      res.json({
        success: true,
        data: earnings
      });
    } catch (error: any) {
      console.error('Error getting tutor earnings:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get earnings data'
      });
    }
  }

  // Get recent payments
  async getRecentPayments(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.params;
      const limit = parseInt(req.query.limit as string) || 6;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      const payments = await earningsService.getRecentPayments(firebaseUid, limit);
      
      res.json({
        success: true,
        data: payments
      });
    } catch (error: any) {
      console.error('Error getting recent payments:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get recent payments'
      });
    }
  }

  // Get earnings by date range
  async getEarningsByDateRange(req: Request, res: Response) {
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

      const earnings = await earningsService.getEarningsByDateRange(firebaseUid, start, end);
      
      res.json({
        success: true,
        data: earnings
      });
    } catch (error: any) {
      console.error('Error getting earnings by date range:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get earnings by date range'
      });
    }
  }

  // Get payment statistics
  async getPaymentStatistics(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.params;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      const statistics = await earningsService.getPaymentStatistics(firebaseUid);
      
      res.json({
        success: true,
        data: statistics
      });
    } catch (error: any) {
      console.error('Error getting payment statistics:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get payment statistics'
      });
    }
  }

  // Get earnings dashboard summary
  async getEarningsDashboard(req: Request, res: Response) {
    try {
      const { firebaseUid } = req.params;
      
      if (!firebaseUid) {
        return res.status(400).json({
          success: false,
          message: 'Firebase UID is required'
        });
      }

      // Get earnings and statistics
      const [earnings, recentPayments, paymentStats] = await Promise.all([
        earningsService.getTutorEarnings(firebaseUid),
        earningsService.getRecentPayments(firebaseUid, 6),
        earningsService.getPaymentStatistics(firebaseUid)
      ]);

      res.json({
        success: true,
        data: {
          earnings,
          recentPayments,
          paymentStatistics: paymentStats
        }
      });
    } catch (error: any) {
      console.error('Error getting earnings dashboard:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get earnings dashboard'
      });
    }
  }
}

export const earningsController = new EarningsController();