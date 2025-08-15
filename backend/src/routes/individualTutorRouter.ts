import express from 'express';
import { getAllSubjectsController, getAllTitlesController,getAllTitlesBySubjectController } from '../controllers/individualTutorController';

const router = express.Router();


// Define routes
router.get('/subjects', getAllSubjectsController);
router.get('/titles/:sub_id', getAllTitlesBySubjectController);
router.get('/titles', getAllTitlesController);

export default router;