import { Request, Response } from 'express';
import * as massTutorService from '../services/massTutor.service';
import prisma from '../prismaClient';

/**
 * Helper function to get mass tutor ID from firebase UID
 */
const getTutorIdFromRequest = async (req: Request): Promise<string | null> => {
  const firebaseUid = (req as any).user?.uid;
  if (!firebaseUid) return null;

  const user = await prisma.user.findUnique({
    where: { firebase_uid: firebaseUid },
    include: { Mass_Tutor: true },
  });

  return user?.Mass_Tutor?.[0]?.m_tutor_id || null;
};

/**
 * Get all classes for the authenticated mass tutor
 */
export const getTutorClassesController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    const classes = await massTutorService.getTutorClassesService(tutorId);
    return res.status(200).json(classes);
  } catch (error: any) {
    console.error('Error in getTutorClassesController:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch classes' });
  }
};

/**
 * Get a single class by ID
 */
export const getClassByIdController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { classId } = req.params;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    const classData = await massTutorService.getClassByIdService(classId, tutorId);
    return res.status(200).json(classData);
  } catch (error: any) {
    console.error('Error in getClassByIdController:', error);
    return res.status(error.message === 'Class not found or access denied' ? 404 : 500).json({
      error: error.message || 'Failed to fetch class details',
    });
  }
};

/**
 * Create a new class
 */
export const createClassController = async (req: Request, res: Response) => {
  try {
    console.log('Create class request body:', req.body);
    console.log('User from request:', (req as any).user);

    const tutorId = await getTutorIdFromRequest(req);
    console.log('Tutor ID retrieved:', tutorId);

    const { title, subject, day, time, description, product_id, price_id } = req.body;

    if (!tutorId) {
      console.error('No tutor ID found for user');
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    // Validation
    if (!title || !subject || !day || !time) {
      console.error('Missing required fields:', { title, subject, day, time });
      return res.status(400).json({
        error: 'Title, subject, day, and time are required',
      });
    }

    const newClass = await massTutorService.createClassService(tutorId, {
      title,
      subject,
      day,
      time,
      description,
      product_id,
      price_id,
    });

    console.log('Class created successfully in controller');
    return res.status(201).json({
      message: 'Class created successfully',
      class: newClass,
    });
  } catch (error: any) {
    console.error('Error in createClassController:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: error.message || 'Failed to create class',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Update an existing class
 */
export const updateClassController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { classId } = req.params;
    const { title, subject, day, time, description, product_id, price_id } = req.body;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    const updatedClass = await massTutorService.updateClassService(classId, tutorId, {
      title,
      subject,
      day,
      time,
      description,
      product_id,
      price_id,
    });

    return res.status(200).json({
      message: 'Class updated successfully',
      class: updatedClass,
    });
  } catch (error: any) {
    console.error('Error in updateClassController:', error);
    return res.status(error.message === 'Class not found or access denied' ? 404 : 500).json({
      error: error.message || 'Failed to update class',
    });
  }
};

/**
 * Delete a class
 */
export const deleteClassController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { classId } = req.params;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    const result = await massTutorService.deleteClassService(classId, tutorId);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in deleteClassController:', error);
    const status = error.message.includes('not found') ? 404 : 
                   error.message.includes('active enrollments') ? 400 : 500;
    return res.status(status).json({
      error: error.message || 'Failed to delete class',
    });
  }
};

/**
 * Create a class slot
 */
export const createClassSlotController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { classId } = req.params;
    const { dateTime, duration, meetingURLs, materials, announcement } = req.body;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    if (!classId || !dateTime || !duration) {
      return res.status(400).json({
        error: 'Class ID, dateTime, and duration are required',
      });
    }

    const newSlot = await massTutorService.createClassSlotService(classId, tutorId, {
      dateTime: new Date(dateTime),
      duration,
      meetingURLs,
      materials,
      announcement,
    });

    return res.status(201).json({
      message: 'Class slot created successfully',
      slot: newSlot,
    });
  } catch (error: any) {
    console.error('Error in createClassSlotController:', error);
    return res.status(error.message === 'Class not found or access denied' ? 404 : 500).json({
      error: error.message || 'Failed to create class slot',
    });
  }
};

/**
 * Update a class slot
 */
export const updateClassSlotController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { slotId } = req.params;
    const { dateTime, duration, meetingURLs, materials, announcement, recording, status } = req.body;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    if (!slotId) {
      return res.status(400).json({ error: 'Slot ID is required' });
    }

    const updatedSlot = await massTutorService.updateClassSlotService(slotId, tutorId, {
      ...(dateTime && { dateTime: new Date(dateTime) }),
      duration,
      meetingURLs,
      materials,
      announcement,
      recording,
      status,
    });

    return res.status(200).json({
      message: 'Class slot updated successfully',
      slot: updatedSlot,
    });
  } catch (error: any) {
    console.error('Error in updateClassSlotController:', error);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      error: error.message || 'Failed to update class slot',
    });
  }
};

/**
 * Delete a class slot
 */
export const deleteClassSlotController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { slotId } = req.params;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    if (!slotId) {
      return res.status(400).json({ error: 'Slot ID is required' });
    }

    const result = await massTutorService.deleteClassSlotService(slotId, tutorId);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in deleteClassSlotController:', error);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      error: error.message || 'Failed to delete class slot',
    });
  }
};

/**
 * Get class statistics for the authenticated tutor
 */
export const getClassStatsController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    const stats = await massTutorService.getClassStatsService(tutorId);
    return res.status(200).json(stats);
  } catch (error: any) {
    console.error('Error in getClassStatsController:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch class statistics' });
  }
};

/**
 * Get all slots for a specific class
 */
export const getClassSlotsController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { classId } = req.params;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    const slots = await massTutorService.getClassSlotsService(classId, tutorId);
    return res.status(200).json(slots);
  } catch (error: any) {
    console.error('Error in getClassSlotsController:', error);
    return res.status(error.message === 'Class not found or access denied' ? 404 : 500).json({
      error: error.message || 'Failed to fetch class slots',
    });
  }
};

/**
 * Create Zoom meeting for a class slot
 */
export const createZoomMeetingController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { classId } = req.params;
    const { slotId, topic, startTime, duration } = req.body;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    if (!classId || !slotId || !startTime || !duration) {
      return res.status(400).json({ error: 'Class ID, slot ID, start time, and duration are required' });
    }

    const result = await massTutorService.createZoomMeetingForSlotService(
      classId,
      slotId,
      tutorId,
      topic || 'Class Session',
      startTime,
      duration
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in createZoomMeetingController:', error);
    return res.status(500).json({ error: error.message || 'Failed to create Zoom meeting' });
  }
};

/**
 * Get updated Zoom host URL using getZak
 */
export const getZoomHostUrlController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { oldHostUrl } = req.body;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    if (!oldHostUrl) {
      return res.status(400).json({ error: 'Old host URL is required' });
    }

    const { getZak } = await import('../services/zoom.service');
    const newHostUrl = await getZak(oldHostUrl);

    return res.status(200).json({ newHostUrl });
  } catch (error: any) {
    console.error('Error in getZoomHostUrlController:', error);
    return res.status(500).json({ error: error.message || 'Failed to get Zoom host URL' });
  }
};

/**
 * Get all enrollments for a specific class
 */
export const getClassEnrollmentsController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { classId } = req.params;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    if (!classId) {
      return res.status(400).json({ error: 'Class ID is required' });
    }

    const result = await massTutorService.getClassEnrollmentsService(classId, tutorId);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in getClassEnrollmentsController:', error);
    return res.status(error.message === 'Class not found or access denied' ? 404 : 500).json({
      error: error.message || 'Failed to fetch class enrollments',
    });
  }
};

/**
 * Send custom email to student
 */
export const sendStudentEmailController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { studentEmail, subject, message, className } = req.body;

    if (!tutorId) {
      return res.status(401).json({ 
        error: 'Unauthorized or tutor profile not found',
        code: 'UNAUTHORIZED'
      });
    }

    if (!studentEmail || !subject || !message) {
      return res.status(400).json({ 
        error: 'Student email, subject, and message are required',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await massTutorService.sendStudentEmailService(tutorId, {
      studentEmail,
      subject,
      message,
      className,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in sendStudentEmailController:', error);
    
    // Determine status code based on error code
    let status = 500;
    if (error.code === 'STUDENT_NOT_FOUND' || error.code === 'NOT_A_STUDENT') {
      status = 404;
    } else if (error.code === 'TUTOR_NOT_FOUND') {
      status = 401;
    } else if (error.code === 'EMAIL_DELIVERY_FAILED') {
      status = 503; // Service Unavailable
    }

    return res.status(status).json({
      error: error.message || 'Failed to send email',
      code: error.code || 'UNKNOWN_ERROR',
      details: error.originalError || undefined,
    });
  }
};

/**
 * Get tutor profile
 */
export const getTutorProfileController = async (req: Request, res: Response) => {
  try {
    console.log('🔍 Getting tutor profile...');
    const tutorId = await getTutorIdFromRequest(req);
    console.log('📋 Tutor ID:', tutorId);

    if (!tutorId) {
      console.log('❌ No tutor ID found - user may not be a mass tutor');
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found. You may not be registered as a mass tutor.' });
    }

    const profile = await massTutorService.getTutorProfileService(tutorId);
    console.log('✅ Profile fetched successfully');
    return res.status(200).json({ profile });
  } catch (error: any) {
    console.error('❌ Error in getTutorProfileController:', error);
    return res.status(error.message.includes('not found') ? 404 : 500).json({
      error: error.message || 'Failed to fetch profile',
    });
  }
};

/**
 * Update tutor profile
 */
export const updateTutorProfileController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const firebaseUid = (req as any).user?.uid;

    if (!tutorId || !firebaseUid) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    const { name, dob, bio, subjects, qualifications, description, heading, location, phone_number, prices } = req.body;

    const updatedProfile = await massTutorService.updateTutorProfileService(tutorId, firebaseUid, {
      name,
      dob,
      bio,
      subjects,
      qualifications,
      description,
      heading,
      location,
      phone_number,
      prices,
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error: any) {
    console.error('Error in updateTutorProfileController:', error);
    const status = error.message.includes('not found') ? 404 :
                   error.message.includes('capped by admin') ? 400 : 500;
    return res.status(status).json({
      error: error.message || 'Failed to update profile',
    });
  }
};

/**
 * Get all subjects from database
 */
export const getAllSubjectsController = async (req: Request, res: Response) => {
  try {
    const subjects = await prisma.subjects.findMany({
      select: {
        sub_id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return res.status(200).json({ subjects });
  } catch (error: any) {
    console.error('Error in getAllSubjectsController:', error);
    return res.status(500).json({
      error: 'Failed to fetch subjects',
    });
  }
};

/**
 * Get tutor earnings data
 */
export const getTutorEarningsController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    const earningsData = await massTutorService.getTutorEarningsService(tutorId);
    return res.status(200).json(earningsData);
  } catch (error: any) {
    console.error('Error in getTutorEarningsController:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch earnings data',
    });
  }
};

/**
 * Get dashboard analytics
 */
export const getDashboardAnalyticsController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    const analyticsData = await massTutorService.getDashboardAnalyticsService(tutorId);
    return res.status(200).json(analyticsData);
  } catch (error: any) {
    console.error('Error in getDashboardAnalyticsController:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch dashboard analytics',
    });
  }
};

/**
 * Get tutor reviews and ratings
 */
export const getTutorReviewsController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    const reviewsData = await massTutorService.getTutorReviewsService(tutorId);
    return res.status(200).json(reviewsData);
  } catch (error: any) {
    console.error('Error in getTutorReviewsController:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch reviews data',
    });
  }
};

/**
 * Get mass monthly payment rate threshold set by admin
 */
export const getMonthlyRateThresholdController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    // Get the active mass_monthly rate from payment rates
    const rate: any = await (prisma as any).paymentrates.findFirst({
      where: {
        type: 'mass_monthly',
        status: 'active',
      },
      select: {
        value: true,
        description: true,
        created_at: true,
      },
    });

    if (!rate) {
      return res.status(200).json({
        threshold: null,
        message: 'No monthly rate threshold set by admin',
      });
    }

    return res.status(200).json({
      threshold: parseFloat(rate.value.toString()),
      description: rate.description,
      updated_at: rate.created_at,
    });
  } catch (error: any) {
    console.error('Error in getMonthlyRateThresholdController:', error);
    return res.status(500).json({
      error: error.message || 'Failed to fetch monthly rate threshold',
    });
  }
};

/**
 * Cancel a class slot - sends emails to students and admin
 */
export const cancelClassSlotController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { slotId } = req.params;
    const { reason } = req.body;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    const result = await massTutorService.cancelClassSlotService(slotId, tutorId, reason);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in cancelClassSlotController:', error);
    return res.status(500).json({
      error: error.message || 'Failed to cancel class slot',
    });
  }
};

/**
 * Set class slot status to 'live' when tutor joins
 */
export const setClassSlotLiveController = async (req: Request, res: Response) => {
  try {
    const tutorId = await getTutorIdFromRequest(req);
    const { slotId } = req.params;

    if (!tutorId) {
      return res.status(401).json({ error: 'Unauthorized or tutor profile not found' });
    }

    const result = await massTutorService.setClassSlotLiveService(slotId, tutorId);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error in setClassSlotLiveController:', error);
    return res.status(500).json({
      error: error.message || 'Failed to set class slot to live',
    });
  }
};
