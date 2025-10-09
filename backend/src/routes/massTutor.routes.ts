import { Router } from 'express';
import * as massTutorController from '../controllers/massTutor.controller';
import * as uploadController from '../controllers/upload.controller';
import { verifyFirebaseTokenSimple } from '../middleware/authMiddlewareSimple';
import { materialsUpload, recordingsUpload } from '../config/multer';
import { verifyRole } from '../middleware/verifyRole';

const router = Router();

// All routes require authentication
router.use(verifyFirebaseTokenSimple,verifyRole('Mass'));

// Class management routes
router.get('/classes', massTutorController.getTutorClassesController);
router.get('/classes/stats', massTutorController.getClassStatsController);
router.get('/classes/:classId', massTutorController.getClassByIdController);
router.post('/classes', massTutorController.createClassController);
router.put('/classes/:classId', massTutorController.updateClassController);
router.delete('/classes/:classId', massTutorController.deleteClassController);

// Class slot management routes
router.get('/classes/:classId/slots', massTutorController.getClassSlotsController);
router.post('/classes/:classId/slots', massTutorController.createClassSlotController);
router.put('/slots/:slotId', massTutorController.updateClassSlotController);
router.delete('/slots/:slotId', massTutorController.deleteClassSlotController);

// Class enrollment routes
router.get('/classes/:classId/enrollments', massTutorController.getClassEnrollmentsController);

// Email routes
router.post('/send-student-email', massTutorController.sendStudentEmailController);

// Profile routes
router.get('/profile', massTutorController.getTutorProfileController);
router.put('/profile', massTutorController.updateTutorProfileController);

// Subjects route
router.get('/subjects', massTutorController.getAllSubjectsController);

// Earnings route
router.get('/earnings', massTutorController.getTutorEarningsController);

// Reviews and ratings route
router.get('/reviews', massTutorController.getTutorReviewsController);

// Dashboard analytics route
router.get('/analytics', massTutorController.getDashboardAnalyticsController);

// Monthly rate threshold route
router.get('/monthly-rate-threshold', massTutorController.getMonthlyRateThresholdController);

// Zoom meeting creation
router.post('/classes/:classId/zoom', massTutorController.createZoomMeetingController);
router.post('/zoom/get-zak', massTutorController.getZoomHostUrlController);

// File upload routes
router.post('/upload/material', materialsUpload.single('file'), uploadController.uploadMaterialController);
router.post('/upload/materials', materialsUpload.array('files', 10), uploadController.uploadMultipleMaterialsController);
router.post('/upload/recording', recordingsUpload.single('file'), uploadController.uploadRecordingController);

export default router;
