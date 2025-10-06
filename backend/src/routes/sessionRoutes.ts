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
  getSessionDetailsController,
  addEnhancedSessionMaterialController,
  removeEnhancedSessionMaterialController,
  getEnhancedSessionMaterialsController,
  uploadMaterialFileController,
  batchUploadMaterialsController,
  startSessionController,
  completeSessionController,
  autoExpireSessionsController,
  autoCompleteSessionsController
} from '../controllers/sessionController';
import { sessionMaterialsUpload, batchMaterialsUpload } from '../config/multer';

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

// Session lifecycle management routes
router.post('/:firebaseUid/session/:sessionId/start', startSessionController);
router.post('/:firebaseUid/session/:sessionId/complete', completeSessionController);

// Cleanup/maintenance routes (typically for admin or cron jobs)
router.post('/admin/auto-expire', autoExpireSessionsController);
router.post('/admin/auto-complete', autoCompleteSessionsController);

// Enhanced material management routes
router.post('/:firebaseUid/session/:sessionId/enhanced-material', addEnhancedSessionMaterialController);
router.delete('/:firebaseUid/session/:sessionId/enhanced-material/:materialIndex', removeEnhancedSessionMaterialController);
router.get('/:firebaseUid/session/:sessionId/enhanced-materials', getEnhancedSessionMaterialsController);

// File upload routes for session materials
router.post('/:firebaseUid/session/:sessionId/upload-file', sessionMaterialsUpload.single('file'), uploadMaterialFileController);
router.post('/:firebaseUid/session/:sessionId/batch-upload', batchMaterialsUpload.array('files', 10), batchUploadMaterialsController);

export default router;