import { Request, Response } from 'express';
import * as adminSessionService from '../services/adminSession.service';

/**
 * Get all individual sessions with optional filters
 */
export const getIndividualSessionsController = async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate, search } = req.query;

    const sessions = await adminSessionService.getIndividualSessionsService({
      status: status as any,
      startDate: startDate as string,
      endDate: endDate as string,
      search: search as string,
    });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error: any) {
    console.error('Error in getIndividualSessionsController:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch individual sessions',
    });
  }
};

/**
 * Get all mass class slots with optional filters
 */
export const getMassClassSlotsController = async (req: Request, res: Response) => {
  try {
    const { status, startDate, endDate, search } = req.query;

    const slots = await adminSessionService.getMassClassSlotsService({
      status: status as any,
      startDate: startDate as string,
      endDate: endDate as string,
      search: search as string,
    });

    return res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error: any) {
    console.error('Error in getMassClassSlotsController:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch mass class slots',
    });
  }
};

/**
 * Get session statistics
 */
export const getSessionStatsController = async (req: Request, res: Response) => {
  try {
    const stats = await adminSessionService.getSessionStatsService();

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error: any) {
    console.error('Error in getSessionStatsController:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch session statistics',
    });
  }
};

/**
 * Update individual session status
 */
export const updateIndividualSessionStatusController = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    if (!status || !['scheduled', 'ongoing', 'completed', 'canceled'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required (scheduled, ongoing, completed, canceled)',
      });
    }

    const updatedSession = await adminSessionService.updateIndividualSessionStatusService(
      sessionId,
      status
    );

    return res.status(200).json({
      success: true,
      message: `Session status updated to ${status}`,
      session: updatedSession,
    });
  } catch (error: any) {
    console.error('Error in updateIndividualSessionStatusController:', error);
    return res.status(error.message === 'Session not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to update session status',
    });
  }
};

/**
 * Update mass class slot status
 */
export const updateMassSlotStatusController = async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;
    const { status } = req.body;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        error: 'Slot ID is required',
      });
    }

    if (!status || !['upcoming', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Valid status is required (upcoming, completed)',
      });
    }

    const updatedSlot = await adminSessionService.updateMassSlotStatusService(slotId, status);

    return res.status(200).json({
      success: true,
      message: `Class slot status updated to ${status}`,
      slot: updatedSlot,
    });
  } catch (error: any) {
    console.error('Error in updateMassSlotStatusController:', error);
    return res.status(error.message === 'Class slot not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to update class slot status',
    });
  }
};

/**
 * Get Zoom ZAK token for admin
 */
export const getZakTokenController = async (req: Request, res: Response) => {
  try {
    const zakData = await adminSessionService.getZakTokenService();

    return res.status(200).json({
      success: true,
      zak: zakData.zak,
      expiresIn: zakData.expires_in,
    });
  } catch (error: any) {
    console.error('Error in getZakTokenController:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to get ZAK token',
    });
  }
};

/**
 * Generate admin host URL for joining a meeting
 */
export const getAdminHostUrlController = async (req: Request, res: Response) => {
  try {
    const { meetingUrl } = req.body;

    if (!meetingUrl) {
      return res.status(400).json({
        success: false,
        error: 'Meeting URL is required',
      });
    }

    const hostUrlData = await adminSessionService.getAdminHostUrlService(meetingUrl);

    return res.status(200).json({
      success: true,
      ...hostUrlData,
    });
  } catch (error: any) {
    console.error('Error in getAdminHostUrlController:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate admin host URL',
    });
  }
};

/**
 * Get detailed session info
 */
export const getSessionDetailsController = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required',
      });
    }

    const session = await adminSessionService.getSessionDetailsService(sessionId);

    return res.status(200).json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error('Error in getSessionDetailsController:', error);
    return res.status(error.message === 'Session not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to fetch session details',
    });
  }
};

/**
 * Get detailed class slot info
 */
export const getClassSlotDetailsController = async (req: Request, res: Response) => {
  try {
    const { slotId } = req.params;

    if (!slotId) {
      return res.status(400).json({
        success: false,
        error: 'Slot ID is required',
      });
    }

    const slot = await adminSessionService.getClassSlotDetailsService(slotId);

    return res.status(200).json({
      success: true,
      slot,
    });
  } catch (error: any) {
    console.error('Error in getClassSlotDetailsController:', error);
    return res.status(error.message === 'Class slot not found' ? 404 : 500).json({
      success: false,
      error: error.message || 'Failed to fetch class slot details',
    });
  }
};
