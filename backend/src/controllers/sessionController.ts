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
  getTutorTodaySessions,
  getSessionMaterials,
  startSession,
  completeSession,
  autoExpireScheduledSessions,
  autoCompleteLongRunningSessions
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
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    const sessions = await getTutorUpcomingSessions(tutorId);
    
    return res.status(200).json({
      success: true,
      message: "Upcoming sessions retrieved successfully",
      data: sessions,
      meta: {
        count: sessions.length,
        tutorId: tutorId
      }
    });
  } catch (error) {
    
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

// Enhanced Material Management Controllers

// Add enhanced material to session
export const addEnhancedSessionMaterialController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, sessionId } = req.params;
    const { name, type, url, content, description, isPublic, size, mimeType } = req.body;

    if (!firebaseUid || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and session ID are required"
      });
    }

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        message: 'Material name and type are required'
      });
    }

    // Validate material type
    const validTypes = ['document', 'video', 'link', 'image', 'text', 'presentation'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid material type'
      });
    }

    // Validate required fields based on type
    if (type === 'link' && !url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required for link materials'
      });
    }

    if (type === 'text' && !content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required for text materials'
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    // Verify session ownership
    const session = await getSessionById(tutorId, sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or unauthorized'
      });
    }

    // Prepare material data
    const materialData = {
      name: name.trim(),
      type,
      url: url?.trim(),
      content: content?.trim(),
      description: description?.trim(),
      isPublic: Boolean(isPublic),
      size: size ? Number(size) : undefined,
      mimeType: mimeType?.trim()
    };

    // Add the material using enhanced service
    const updatedSession = await addSessionMaterial(sessionId, materialData);

    res.status(200).json({
      success: true,
      message: 'Enhanced material added successfully',
      data: updatedSession
    });

  } catch (error) {
    console.error('Error in addEnhancedSessionMaterialController:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('unauthorized')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

// Remove enhanced material from session  
export const removeEnhancedSessionMaterialController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, sessionId, materialIndex } = req.params;

    if (!firebaseUid || !sessionId || materialIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID, session ID, and material index are required"
      });
    }

    // Validate material index
    const index = parseInt(materialIndex);
    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid material index'
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    // Verify session ownership
    const session = await getSessionById(tutorId, sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or unauthorized'
      });
    }

    // Remove the material using enhanced service
    const updatedSession = await removeSessionMaterial(sessionId, index);

    res.status(200).json({
      success: true,
      message: 'Enhanced material removed successfully',
      data: updatedSession
    });

  } catch (error) {
    console.error('Error in removeEnhancedSessionMaterialController:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('unauthorized') ||
          error.message.includes('Invalid material index')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

// Get enhanced session materials
export const getEnhancedSessionMaterialsController = async (req: Request, res: Response) => {
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
    
    // Verify session ownership
    const session = await getSessionById(tutorId, sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or unauthorized'
      });
    }

    // Get materials using the enhanced service function
    const materials = await getSessionMaterials(sessionId);

    res.status(200).json({
      success: true,
      message: 'Enhanced materials retrieved successfully',
      data: materials
    });

  } catch (error) {
    console.error('Error in getEnhancedSessionMaterialsController:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not an individual tutor') || 
          error.message.includes('unauthorized')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
};

// File Upload Controller for Materials
export const uploadMaterialFileController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, sessionId } = req.params;
    
    if (!firebaseUid || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and session ID are required"
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    // Verify session ownership
    const session = await getSessionById(tutorId, sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or unauthorized'
      });
    }

    // File is already uploaded to Cloudinary via multer middleware
    // The URL is available in req.file.path for Cloudinary
    const fileUrl = req.file.path || req.file.filename;
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: fileUrl,
        fileId: fileId,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in uploadMaterialFileController:', error);
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'File upload failed'
    });
  }
};

// Batch Upload Materials Controller
export const batchUploadMaterialsController = async (req: Request, res: Response) => {
  try {
    const { firebaseUid, sessionId } = req.params;
    const { materials } = req.body;

    if (!firebaseUid || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "Firebase UID and session ID are required"
      });
    }

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Materials array is required and cannot be empty"
      });
    }

    // Get tutor ID from firebase UID
    const tutorId = await getTutorIdByFirebaseUid(firebaseUid);
    
    // Verify session ownership
    const session = await getSessionById(tutorId, sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or unauthorized'
      });
    }

    // Process each material in the batch
    const results = [];
    const errors = [];

    for (let i = 0; i < materials.length; i++) {
      try {
        const material = materials[i];
        
        // Validate required fields
        if (!material.name || !material.type) {
          errors.push({
            index: i,
            error: 'Material name and type are required',
            material: material
          });
          continue;
        }

        // Add the material using the existing service
        const updatedSession = await addSessionMaterial(sessionId, material);
        results.push({
          index: i,
          success: true,
          material: material
        });
      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          material: materials[i]
        });
      }
    }

    // Get the final session state
    const finalSession = await getSessionById(tutorId, sessionId);

    res.status(200).json({
      success: errors.length === 0,
      message: `Batch upload completed: ${results.length} successful, ${errors.length} failed`,
      data: {
        session: finalSession,
        results: results,
        errors: errors,
        summary: {
          total: materials.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Error in batchUploadMaterialsController:', error);
    
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Batch upload failed'
    });
  }
};

// Start Session Controller (for Zoom button functionality)
export const startSessionController = async (req: Request, res: Response) => {
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
    
    const updatedSession = await startSession(tutorId, sessionId);
    
    return res.status(200).json({
      success: true,
      message: "Session started successfully",
      data: updatedSession
    });
  } catch (error) {
    console.error("Error starting session:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not in scheduled status')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('not an individual tutor') || 
          error.message.includes('profile not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to start session",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Complete Session Controller 
export const completeSessionController = async (req: Request, res: Response) => {
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
    
    const updatedSession = await completeSession(tutorId, sessionId);
    
    return res.status(200).json({
      success: true,
      message: "Session completed successfully",
      data: updatedSession
    });
  } catch (error) {
    console.error("Error completing session:", error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found') || 
          error.message.includes('not in ongoing status')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      if (error.message.includes('not an individual tutor') || 
          error.message.includes('profile not found')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to complete session",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Auto-expire sessions controller (for cleanup jobs)
export const autoExpireSessionsController = async (req: Request, res: Response) => {
  try {
    const result = await autoExpireScheduledSessions();
    
    return res.status(200).json({
      success: true,
      message: `Auto-expired ${result.expiredCount} sessions`,
      data: result
    });
  } catch (error) {
    console.error("Error auto-expiring sessions:", error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to auto-expire sessions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

// Auto-complete long running sessions controller
export const autoCompleteSessionsController = async (req: Request, res: Response) => {
  try {
    const result = await autoCompleteLongRunningSessions();
    
    return res.status(200).json({
      success: true,
      message: `Auto-completed ${result.completedCount} sessions`,
      data: result
    });
  } catch (error) {
    console.error("Error auto-completing sessions:", error);
    
    return res.status(500).json({
      success: false,
      message: "Failed to auto-complete sessions",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
};

