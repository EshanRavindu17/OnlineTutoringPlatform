import { Request, Response } from 'express';
import {
  getCommissionService,
  updateCommissionService,
  getFinanceAnalyticsService,
} from '../services/finance.service';

/**
 * Get current commission rate
 */
export async function getCommissionController(req: Request, res: Response) {
  try {
    const commission = await getCommissionService();
    res.json({ commission });
  } catch (e: any) {
    console.error('Get commission error:', e);
    res.status(500).json({ message: e?.message || 'Failed to fetch commission' });
  }
}

/**
 * Update commission rate
 */
export async function updateCommissionController(req: Request, res: Response) {
  try {
    if (!req.admin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { rate } = req.body;
    if (typeof rate !== 'number') {
      return res.status(400).json({ message: 'Rate must be a number' });
    }

    const updated = await updateCommissionService(rate, req.admin.adminId);
    res.json({ commission: updated });
  } catch (e: any) {
    console.error('Update commission error:', e);
    res.status(e?.status || 500).json({ message: e?.message || 'Failed to update commission' });
  }
}

/**
 * Get comprehensive finance analytics
 */
export async function getFinanceAnalyticsController(req: Request, res: Response) {
  try {
    const analytics = await getFinanceAnalyticsService();
    res.json(analytics);
  } catch (e: any) {
    console.error('Finance analytics error:', e);
    res.status(500).json({ message: e?.message || 'Failed to fetch finance analytics' });
  }
}
