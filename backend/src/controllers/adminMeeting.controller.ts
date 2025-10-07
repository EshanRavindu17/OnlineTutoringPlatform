import { Request, Response } from 'express';
import {
  getAllUsersService,
  createAdminMeetingService,
  getAdminSessionsService,
  sendMeetingEmailService,
  deleteAdminSessionService,
  updateAdminSessionStatusService,
} from '../services/adminMeeting.service';

/**
 * Get all users for email recipient selection
 */
export async function getAllUsersController(req: Request, res: Response) {
  try {
    const users = await getAllUsersService();
    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
}

/**
 * Create a new admin meeting (Zoom)
 */
export async function createAdminMeetingController(req: Request, res: Response) {
  try {
    // Check if admin object exists
    if (!(req as any).admin) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    // The middleware sets adminId (camelCase), not admin_id (snake_case)
    const adminId = (req as any).admin.adminId;
    
    // Verify adminId exists
    if (!adminId) {
      console.error('Admin ID is missing from request:', (req as any).admin);
      return res.status(401).json({ error: 'Admin ID not found in authentication' });
    }

    const { name, description, topic, startTime, duration } = req.body;

    // Validation
    if (!name || !topic || !startTime || !duration) {
      return res.status(400).json({
        error: 'Missing required fields: name, topic, startTime, duration',
      });
    }

    if (duration < 15 || duration > 300) {
      return res.status(400).json({
        error: 'Duration must be between 15 and 300 minutes',
      });
    }

    console.log('Creating meeting for admin:', adminId);

    const meeting = await createAdminMeetingService(adminId, {
      name,
      description,
      topic,
      startTime,
      duration,
    });

    res.status(201).json({ success: true, meeting });
  } catch (error: any) {
    console.error('Create admin meeting error:', error);
    res.status(500).json({ error: error.message || 'Failed to create meeting' });
  }
}

/**
 * Get all admin sessions
 */
export async function getAdminSessionsController(req: Request, res: Response) {
  try {
    const adminId = req.query.mine === 'true' ? (req as any).admin.adminId : undefined;
    const sessions = await getAdminSessionsService(adminId);
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error: any) {
    console.error('Get admin sessions error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch sessions' });
  }
}

/**
 * Send meeting email to selected user
 */
export async function sendMeetingEmailController(req: Request, res: Response) {
  try {
    const adminName = (req as any).admin.name;
    const { sessionId, recipientEmail, recipientName, subject, message, meetingUrl } = req.body;

    // Validation
    if (!sessionId || !recipientEmail || !recipientName || !subject || !message || !meetingUrl) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    const result = await sendMeetingEmailService({
      sessionId,
      recipientEmail,
      recipientName,
      subject,
      message,
      meetingUrl,
      adminName,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Send meeting email error:', error);
    res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}

/**
 * Delete admin session
 */
export async function deleteAdminSessionController(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const adminId = (req as any).admin.adminId;

    const result = await deleteAdminSessionService(sessionId, adminId);
    res.json(result);
  } catch (error: any) {
    console.error('Delete admin session error:', error);
    res.status(500).json({ error: error.message || 'Failed to delete session' });
  }
}

/**
 * Update admin session status
 */
export async function updateAdminSessionStatusController(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    if (!status || !['scheduled', 'ongoing', 'completed', 'canceled'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status. Must be: scheduled, ongoing, completed, or canceled',
      });
    }

    const result = await updateAdminSessionStatusService(sessionId, status);
    res.json({ success: true, session: result });
  } catch (error: any) {
    console.error('Update admin session status error:', error);
    res.status(500).json({ error: error.message || 'Failed to update status' });
  }
}
