import express from 'express';
import { getAllIndividualTutorsController } from '../controllers/studentController';


const router = express.Router();

//get all individual Tutors
router.get('/getAllIndividualTutors', getAllIndividualTutorsController);



export default router;  