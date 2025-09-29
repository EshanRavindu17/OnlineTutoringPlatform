import { Request, Response } from "express";
import {
  getTutorSessions,
  getTutorSessionsByStatus,
  getTutorUpcomingSessions,
  getTutorSessionStatistics,
  addSessionMaterial,
  removeSessionMaterial,
  updateSessionStatus,
  addSessionMeetingUrl,
  requestSessionCancellation,
  getSessionById,
  getTutorSessionsInDateRange,
  getTutorTodaySessions
} from "../services/sessionService";
import { SessionStatus } from "@prisma/client";
import { getTutorIdByFirebaseUid } from "../services/scheduleService";

// Get all sessions for a tutor
export const getTutorSessionsController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params;
    
    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID is required"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    const sessions = await getTutorSessions(tutorId);
    
    return res.status(200).json({
      success: true,
      message: "Sessions retrieved successfully",
      data: sessions
    });
  } catch (error) {
    console.error("Error fetching tutor sessions:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('profile not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sessions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get sessions by status for a tutor
export const getTutorSessionsByStatusController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, status } = req.params;
    
    if (!firebaseUid || !status) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and status are required"
      });
    }

    // Validate status
    const validStatuses: SessionStatus[] = ['scheduled', 'ongoing', 'completed', 'canceled'];
    if (!validStatuses.includes(status as SessionStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session status. Must be one of: scheduled, ongoing, completed, canceled"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    const sessions = await getTutorSessionsByStatus(tutorId, status as SessionStatus);
    
    return res.status(200).json({
      success: true,
      message: `${status} sessions retrieved successfully`,
      data: sessions
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.status} sessions:`, error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('profile not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: `Failed to fetch ${req.params.status} sessions`,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get upcoming sessions for a tutor
export const getTutorUpcomingSessionsController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params;
    
    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID is required"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    const sessions = await getTutorUpcomingSessions(tutorId);
    
    return res.status(200).json({
      success: true,
      message: "Upcoming sessions retrieved successfully",
      data: sessions
    });
  } catch (error) {
    console.error("Error fetching upcoming sessions:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('profile not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming sessions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get today's sessions for a tutor
export const getTutorTodaySessionsController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params;
    
    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID is required"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    const sessions = await getTutorTodaySessions(tutorId);
    
    return res.status(200).json({
      success: true,
      message: "Today's sessions retrieved successfully",
      data: sessions
    });
  } catch (error) {
    console.error("Error fetching today's sessions:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('profile not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch today's sessions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get session statistics for dashboard
export const getTutorSessionStatisticsController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params;
    
    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID is required"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    const stats = await getTutorSessionStatistics(tutorId);
    
    return res.status(200).json({
      success: true,
      message: "Session statistics retrieved successfully",
      data: stats
    });
  } catch (error) {
    console.error("Error fetching session statistics:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('profile not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch session statistics",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get sessions in a date range
export const getTutorSessionsInDateRangeController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!firebaseUid) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID is required"
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required"
      });
    }

    // Validate date format
    const start = new Date(startDate as string);
    const end = new Date(endDate as string);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD format"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    const sessions = await getTutorSessionsInDateRange(tutorId, start, end);
    
    return res.status(200).json({
      success: true,
      message: "Sessions in date range retrieved successfully",
      data: sessions
    });
  } catch (error) {
    console.error("Error fetching sessions in date range:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('profile not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch sessions in date range",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Add material to a session
export const addSessionMaterialController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, sessionId } = req.params;
    const { material } = req.body;
    
    if (!firebaseUid || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and session ID are required"
      });
    }

    if (!material || typeof material !== 'string' || material.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Material is required and must be a non-empty string"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    // Verify that the session belongs to this tutor
    const session = await getSessionById(tutorId, sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or you do not have permission to modify it"
      });
    }
    
    const updatedSession = await addSessionMaterial(sessionId, material.trim());
    
    return res.status(200).json({
      success: true,
      message: "Material added successfully",
      data: updatedSession
    });
  } catch (error) {
    console.error("Error adding session material:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Session not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add session material",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Remove material from a session
export const removeSessionMaterialController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, sessionId } = req.params;
    const { materialIndex } = req.body;
    
    if (!firebaseUid || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and session ID are required"
      });
    }

    if (materialIndex === undefined || typeof materialIndex !== 'number' || materialIndex < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid material index is required (non-negative number)"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    // Verify that the session belongs to this tutor
    const session = await getSessionById(tutorId, sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or you do not have permission to modify it"
      });
    }
    
    const updatedSession = await removeSessionMaterial(sessionId, materialIndex);
    
    return res.status(200).json({
      success: true,
      message: "Material removed successfully",
      data: updatedSession
    });
  } catch (error) {
    console.error("Error removing session material:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Session not found') || error.message.includes('Invalid material index')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to remove session material",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Update session status
export const updateSessionStatusController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, sessionId } = req.params;
    const { status } = req.body;
    
    if (!firebaseUid || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and session ID are required"
      });
    }

    // Validate status
    const validStatuses: SessionStatus[] = ['scheduled', 'ongoing', 'completed', 'canceled'];
    if (!validStatuses.includes(status as SessionStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session status. Must be one of: scheduled, ongoing, completed, canceled"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    // Verify that the session belongs to this tutor
    const session = await getSessionById(tutorId, sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or you do not have permission to modify it"
      });
    }
    
    const updatedSession = await updateSessionStatus(sessionId, status as SessionStatus);
    
    return res.status(200).json({
      success: true,
      message: "Session status updated successfully",
      data: updatedSession
    });
  } catch (error) {
    console.error("Error updating session status:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Session not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update session status",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Add meeting URL to session
export const addSessionMeetingUrlController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, sessionId } = req.params;
    const { meetingUrl } = req.body;
    
    if (!firebaseUid || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and session ID are required"
      });
    }

    if (!meetingUrl || typeof meetingUrl !== 'string' || meetingUrl.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Meeting URL is required and must be a non-empty string"
      });
    }

    // Basic URL validation
    try {
      new URL(meetingUrl.trim());
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid URL format"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    // Verify that the session belongs to this tutor
    const session = await getSessionById(tutorId, sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or you do not have permission to modify it"
      });
    }
    
    const updatedSession = await addSessionMeetingUrl(sessionId, meetingUrl.trim());
    
    return res.status(200).json({
      success: true,
      message: "Meeting URL added successfully",
      data: updatedSession
    });
  } catch (error) {
    console.error("Error adding meeting URL:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Session not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add meeting URL",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Request session cancellation
export const requestSessionCancellationController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, sessionId } = req.params;
    const { reason } = req.body;
    
    if (!firebaseUid || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and session ID are required"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    const result = await requestSessionCancellation(tutorId, sessionId, reason);
    
    return res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error("Error requesting session cancellation:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('Session not found') || 
          error.message.includes('permission to cancel') ||
          error.message.includes('Only scheduled sessions')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to process cancellation request",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Get specific session details
export const getSessionDetailsController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, sessionId } = req.params;
    
    if (!firebaseUid || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and session ID are required"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    const session = await getSessionById(tutorId, sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found or you do not have permission to view it"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Session details retrieved successfully",
      data: session
    });
  } catch (error) {
    console.error("Error fetching session details:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('profile not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch session details",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};