import express from 'express';
import {
  getTutorSessionsController,
  getTutorSessionsByStatusController,
  getTutorUpcomingSessionsController,
  getTutorTodaySessionsController,
  getTutorSessionStatisticsController,
  getTutorSessionsInDateRangeController,
  addSessionMaterialController,
  removeSessionMaterialController,
  updateSessionStatusController,
  addSessionMeetingUrlController,
  requestSessionCancellationController,
  getSessionDetailsController
} from '../controllers/sessionController';

const router = express.Router();

// Session retrieval routes
router.get('/:firebaseUid/all', getTutorSessionsController);
router.get('/:firebaseUid/status/:status', getTutorSessionsByStatusController);
router.get('/:firebaseUid/upcoming', getTutorUpcomingSessionsController);
router.get('/:firebaseUid/today', getTutorTodaySessionsController);
router.get('/:firebaseUid/statistics', getTutorSessionStatisticsController);
router.get('/:firebaseUid/date-range', getTutorSessionsInDateRangeController);
router.get('/:firebaseUid/session/:sessionId', getSessionDetailsController);

// Session management routes
router.post('/:firebaseUid/session/:sessionId/material', addSessionMaterialController);
router.delete('/:firebaseUid/session/:sessionId/material', removeSessionMaterialController);
router.put('/:firebaseUid/session/:sessionId/status', updateSessionStatusController);
router.post('/:firebaseUid/session/:sessionId/meeting-url', addSessionMeetingUrlController);
router.post('/:firebaseUid/session/:sessionId/cancel', requestSessionCancellationController);

export default router;