import express from 'express';
import { 
  triggerReminderController, 
  getReminderStatusController,
  restartReminderJobsController,
  getUpcomingIndividualSessionsController
} from '../controllers/reminderController';

const router = express.Router();

// Get reminder system status
router.get('/status', getReminderStatusController);

// Manually trigger reminder (for testing)
// POST /api/reminders/trigger
// Body: { "hoursAhead": 24 } or { "hoursAhead": 1 }
router.post('/trigger', triggerReminderController);

// Restart reminder jobs (for maintenance)
router.post('/restart', restartReminderJobsController);


router.get('/upcoming-individual-sessions', getUpcomingIndividualSessionsController);

export default router;