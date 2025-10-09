import { Request, Response } from 'express';
import {
  getCommissionService,
  updateCommissionService,
  getFinanceAnalyticsService,
  getPaymentRatesService,
  createPaymentRateService,
  updatePaymentRateService,
} from '../services/finance.service';

/**
 * Get active payment rates (individual_hourly and mass_monthly)
 */
export async function getPaymentRatesController(req: Request, res: Response) {
  try {
    const rates = await getPaymentRatesService();
    res.json({ rates });
  } catch (e: any) {
    console.error('Get payment rates error:', e);
    res.status(500).json({ message: e?.message || 'Failed to fetch payment rates' });
  }
}

/**
 * Create initial payment rate (when none exists)
 */
export async function createPaymentRateController(req: Request, res: Response) {
  try {
    if (!req.admin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { type } = req.params;
    const { value, description } = req.body;

    if (type !== 'individual_hourly' && type !== 'mass_monthly') {
      return res.status(400).json({ message: 'Invalid payment type. Must be individual_hourly or mass_monthly' });
    }

    if (typeof value !== 'number') {
      return res.status(400).json({ message: 'Value must be a number' });
    }

    const created = await createPaymentRateService(
      type as 'individual_hourly' | 'mass_monthly',
      value,
      req.admin.adminId,
      description
    );

    res.json({ rate: created });
  } catch (e: any) {
    console.error('Create payment rate error:', e);
    res.status(e?.status || 500).json({ message: e?.message || 'Failed to create payment rate' });
  }
}

/**
 * Update payment rate (creates new active record and deactivates old one)
 */
export async function updatePaymentRateController(req: Request, res: Response) {
  try {
    if (!req.admin) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { type } = req.params;
    const { value, description } = req.body;

    if (type !== 'individual_hourly' && type !== 'mass_monthly') {
      return res.status(400).json({ message: 'Invalid payment type. Must be individual_hourly or mass_monthly' });
    }

    if (typeof value !== 'number') {
      return res.status(400).json({ message: 'Value must be a number' });
    }

    const updated = await updatePaymentRateService(
      type as 'individual_hourly' | 'mass_monthly',
      value,
      req.admin.adminId,
      description
    );

    res.json({ rate: updated });
  } catch (e: any) {
    console.error('Update payment rate error:', e);
    res.status(e?.status || 500).json({ message: e?.message || 'Failed to update payment rate' });
  }
}

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
