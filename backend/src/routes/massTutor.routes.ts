import { Router } from 'express';
import * as massTutorController from '../controllers/massTutor.controller';
import * as uploadController from '../controllers/upload.controller';
import { verifyFirebaseTokenSimple } from '../middleware/authMiddlewareSimple';
import { materialsUpload, recordingsUpload } from '../config/multer';

const router = Router();

// All routes require authentication
router.use(verifyFirebaseTokenSimple);

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

// Zoom meeting creation
router.post('/classes/:classId/zoom', massTutorController.createZoomMeetingController);
router.post('/zoom/get-zak', massTutorController.getZoomHostUrlController);

// File upload routes
router.post('/upload/material', materialsUpload.single('file'), uploadController.uploadMaterialController);
router.post('/upload/materials', materialsUpload.array('files', 10), uploadController.uploadMultipleMaterialsController);
router.post('/upload/recording', recordingsUpload.single('file'), uploadController.uploadRecordingController);

export default router;
