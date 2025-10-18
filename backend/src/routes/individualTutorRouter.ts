import express from 'express';
import { getAllSubjectsController, getAllTitlesController,getAllTitlesBySubjectController, createSubjectController, createTitleController, getTutorProfileController, getTutorStatsController, updateUserPhotoController, uploadUserPhotoController, updateTutorQualificationsController, updateTutorHourlyRateController, updateTutorSubjectsAndTitlesController, updateTutorPersonalInfoController } from '../controllers/individualTutorController';
import upload from '../config/multer';
import { verifyFirebaseTokenSimple } from '../middleware/authMiddlewareSimple';
import { verifyRole } from '../middleware/verifyRole';

const router = express.Router();

// router.use(verifyFirebaseTokenSimple,verifyRole('Individual'));

// Define routes
router.get('/subjects', getAllSubjectsController);
router.get('/titles/:sub_id', getAllTitlesBySubjectController);
router.get('/titles', getAllTitlesController);

// Routes for creating new subjects and titles
router.post('/subjects', verifyFirebaseTokenSimple,verifyRole('Individual'), createSubjectController);
router.post('/titles', verifyFirebaseTokenSimple,verifyRole('Individual'), createTitleController);

// Dashboard routes
router.get('/profile/:firebaseUid', verifyFirebaseTokenSimple,verifyRole('Individual'), getTutorProfileController);
router.get('/stats/:tutorId', verifyFirebaseTokenSimple,verifyRole('Individual'), getTutorStatsController);

// Profile update routes
router.put('/photo/:firebaseUid', verifyFirebaseTokenSimple,verifyRole('Individual'), updateUserPhotoController); // Update with URL
router.post('/photo/upload/:firebaseUid', verifyFirebaseTokenSimple,verifyRole('Individual'), upload.single('photo'), uploadUserPhotoController); // Upload file

// Qualifications update route
router.put('/qualifications/:firebaseUid', verifyFirebaseTokenSimple,verifyRole('Individual'), updateTutorQualificationsController);

// Hourly rate update route
router.put('/hourly-rate/:firebaseUid', verifyFirebaseTokenSimple,verifyRole('Individual'), updateTutorHourlyRateController);

// Subjects and titles update route
router.put('/subjects-titles/:firebaseUid', verifyFirebaseTokenSimple,verifyRole('Individual'), updateTutorSubjectsAndTitlesController);

// Personal information update route
router.put('/personal-info/:firebaseUid', verifyFirebaseTokenSimple,verifyRole('Individual'), updateTutorPersonalInfoController);

export default router;