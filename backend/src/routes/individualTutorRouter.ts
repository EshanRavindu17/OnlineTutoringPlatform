import express from 'express';
import { getAllSubjectsController, getAllTitlesController,getAllTitlesBySubjectController, createSubjectController, createTitleController } from '../controllers/individualTutorController';

const router = express.Router();


// Define routes
router.get('/subjects', getAllSubjectsController);
router.get('/titles/:sub_id', getAllTitlesBySubjectController);
router.get('/titles', getAllTitlesController);

// Routes for creating new subjects and titles
router.post('/subjects', createSubjectController);
router.post('/titles', createTitleController);

export default router;