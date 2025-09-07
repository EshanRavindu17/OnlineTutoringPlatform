import express from 'express';
import { createASessionController, createPaymentRecordController, getAllIndividualTutorsController , getAllSessionsByStudentIdController, getIndividualTutorByIdController,getSlotsOfIndividualTutorByIdController, getStudentIDByUserIDController, updateSlotStatusController} from '../controllers/studentController';


const router = express.Router();

router.get('/getStudentIDByUserID/:userId', getStudentIDByUserIDController);

//get all individual Tutors
router.get('/getAllIndividualTutors', getAllIndividualTutorsController);

router.get('/getIndividualTutorById/:tutorId', getIndividualTutorByIdController);

router.get('/getSlotsOfIndividualTutorById/:tutorId', getSlotsOfIndividualTutorByIdController);

router.get('/getAllSessionsByStudentId/:studentId', getAllSessionsByStudentIdController);

router.post('/createASession', createASessionController);

router.patch('/updateSlotStatus', updateSlotStatusController);



router.post('/createPaymentRecord', createPaymentRecordController);

export default router;  