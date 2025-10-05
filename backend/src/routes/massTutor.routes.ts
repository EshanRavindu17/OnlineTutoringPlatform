import { Router } from 'express';
import * as massTutorController from '../controllers/massTutor.controller';
import { verifyFirebaseTokenSimple } from '../middleware/authMiddlewareSimple';

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
router.post('/classes/:classId/slots', massTutorController.createClassSlotController);
router.put('/slots/:slotId', massTutorController.updateClassSlotController);
router.delete('/slots/:slotId', massTutorController.deleteClassSlotController);

export default router;
