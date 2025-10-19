import { Request, Response } from 'express';
import {
  sendBroadcastEmailService,
  getBroadcastHistoryService,
} from '../services/broadcast.service';

/**
 * Send broadcast email to selected audience
 * POST /Admin/broadcast/send
 */
export async function sendBroadcastEmailController(req: Request, res: Response) {
  try {
    const adminName = (req as any).admin.name;
    const adminId = (req as any).admin.adminId;
    
    const { title, content, targetAudience, priority } = req.body;

    // Validation
    if (!title || !content || !targetAudience || !priority) {
      return res.status(400).json({
        error: 'Missing required fields: title, content, targetAudience, priority',
      });
    }

    // Validate targetAudience
    if (!['all', 'students', 'tutors', 'individual_tutors', 'mass_tutors'].includes(targetAudience)) {
      return res.status(400).json({
        error: 'Invalid targetAudience. Must be one of: all, students, tutors, individual_tutors, mass_tutors',
      });
    }

    // Validate priority
    if (!['normal', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        error: 'Invalid priority. Must be one of: normal, high, urgent',
      });
    }

    const result = await sendBroadcastEmailService({
      title,
      content,
      targetAudience,
      priority,
      adminName,
      adminId,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Send broadcast email error:', error);
    res.status(500).json({ error: error.message || 'Failed to send broadcast email' });
  }
}

/**
 * Get broadcast history
 * GET /Admin/broadcast/history
 */
export async function getBroadcastHistoryController(req: Request, res: Response) {
  try {
    const adminId = (req as any).admin.adminId;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const history = await getBroadcastHistoryService(adminId, limit);

    res.json({ broadcasts: history });
  } catch (error: any) {
    console.error('Get broadcast history error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch broadcast history' });
  }
}
