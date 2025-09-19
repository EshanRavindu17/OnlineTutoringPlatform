import express from 'express';
import { addStudentController, 
         createASessionController,
         createPaymentRecordController, 
         findTimeSlotsController, 
         getAllIndividualTutorsController ,
         getAllSessionsByStudentIdController,
         getIndividualTutorByIdController,
         getSlotsOfIndividualTutorByIdController,
         getStudentIDByUserIDController,
         testZoomController,
         updateAccessTimeinFreeSlotsController,
         updateSlotStatusController} 
from '../controllers/studentController';


const router = express.Router();

router.post('/addStudent', addStudentController);

router.get('/getStudentIDByUserID/:userId', getStudentIDByUserIDController);

//get all individual Tutors
router.get('/getAllIndividualTutors', getAllIndividualTutorsController);

router.get('/getIndividualTutorById/:tutorId', getIndividualTutorByIdController);

router.get('/getSlotsOfIndividualTutorById/:tutorId', getSlotsOfIndividualTutorByIdController);

router.get('/getAllSessionsByStudentId/:studentId', getAllSessionsByStudentIdController);

router.post('/createASession', createASessionController);

router.patch('/updateSlotStatus', updateSlotStatusController);



router.post('/createPaymentRecord', createPaymentRecordController);

router.post('/findTimeSlots', findTimeSlotsController);

router.put('/updateAccessTimeinFreeSlots', updateAccessTimeinFreeSlotsController);


// helper route to test zoom integration
router.post('/test-zoom',  testZoomController);

export default router;  