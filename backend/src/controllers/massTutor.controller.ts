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
