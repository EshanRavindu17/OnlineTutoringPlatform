import express from 'express';
import { getAllSubjectsController, getAllTitlesController,getAllTitlesBySubjectController, createSubjectController, createTitleController, getTutorProfileController, getTutorStatsController, updateUserPhotoController, uploadUserPhotoController, updateTutorQualificationsController, updateTutorHourlyRateController, updateTutorSubjectsAndTitlesController, updateTutorPersonalInfoController } from '../controllers/individualTutorController';
import upload from '../config/multer';

const router = express.Router();


// Define routes
router.get('/subjects', getAllSubjectsController);
router.get('/titles/:sub_id', getAllTitlesBySubjectController);
router.get('/titles', getAllTitlesController);

// Routes for creating new subjects and titles
router.post('/subjects', createSubjectController);
router.post('/titles', createTitleController);

// Dashboard routes
router.get('/profile/:firebaseUid', getTutorProfileController);
router.get('/stats/:tutorId', getTutorStatsController);

// Profile update routes
router.put('/photo/:firebaseUid', updateUserPhotoController); // Update with URL
router.post('/photo/upload/:firebaseUid', upload.single('photo'), uploadUserPhotoController); // Upload file

// Qualifications update route
router.put('/qualifications/:firebaseUid', updateTutorQualificationsController);

// Hourly rate update route
router.put('/hourly-rate/:firebaseUid', updateTutorHourlyRateController);

// Subjects and titles update route
router.put('/subjects-titles/:firebaseUid', updateTutorSubjectsAndTitlesController);

// Personal information update route
router.put('/personal-info/:firebaseUid', updateTutorPersonalInfoController);

export default router;