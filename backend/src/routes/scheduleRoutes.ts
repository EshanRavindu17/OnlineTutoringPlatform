import express from 'express';
import {
  getTutorIdController,
  getTutorTimeSlotsController,
  createTimeSlotController,
  updateTimeSlotController,
  deleteTimeSlotController,
  getAvailableTimeSlotsController
} from '../controllers/scheduleController';

const router = express.Router();

// Route to get tutor ID by Firebase UID
router.get('/tutor-id/:firebaseUid', getTutorIdController);

// Routes for tutors to manage their time slots
router.get('/tutor/:tutorId/slots', getTutorTimeSlotsController);
router.post('/tutor/:tutorId/slots', createTimeSlotController);
router.put('/slots/:slotId', updateTimeSlotController);
router.delete('/slots/:slotId', deleteTimeSlotController);

// Routes for getting available slots (for students to view)
router.get('/available-slots', getAvailableTimeSlotsController);

export default router;
