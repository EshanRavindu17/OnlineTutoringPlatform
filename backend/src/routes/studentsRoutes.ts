import express from 'express';
import { addStudentController, 
         cancelSessionController, 
         createASessionController,
         createPaymentRecordController, 
         findTimeSlotsController, 
         getAllIndividualTutorsController ,
         getAllMassClassesController,
         getAllSessionsByStudentIdController,
         getIndividualTutorByIdController,
         getPaymentHistoryController,
         getSlotsOfIndividualTutorByIdController,
         getStudentIDByUserIDController,
         getTutorNameAndTypeByIdController,
         getTutorsByStudentIdController,
         testZoomController,
         updateAccessTimeinFreeSlotsController,
         updateSlotStatusController,
         getMassTutorProfileByIdController,
         getClassSlotsByClassIdAndStudentIdController,
         getClassSlotsByClassIdController,
         getClassesByStudentIdController} 
from '../controllers/studentController';
import { getReviewsByIndividualTutorIdController, rateAndReviewIndividualController } from '../controllers/rateAndReview.controller';
import { generateReportController, getReportsByStudentIdController } from '../controllers/report.controller';


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

// To get tutor name and type by tutor ID
router.get('/getTutorNameAndTypeById/:tutorId', getTutorNameAndTypeByIdController);


// helper route to test zoom integration
router.post('/test-zoom',  testZoomController);

router.post('/cancelSession/:session_id',  cancelSessionController);

router.get('/getTutorsByStudentId/:studentId', getTutorsByStudentIdController);

router.get('/getPaymentHistory/:studentId', getPaymentHistoryController);


//Individual Tutor Rating and Review routes will be in rateAndReviewRoutes.ts

router.post('/rate-and-review', rateAndReviewIndividualController ); // to be implemented in rateAndReviewRoutes.ts
router.get('/get-reviews/:tutorId', getReviewsByIndividualTutorIdController);


// Report Tutors route  

router.post('/report-tutor', generateReportController);
router.get('/get-reports/:studentId', getReportsByStudentIdController);



// Mass Class routes will be in massClassRoutes.ts

router.get('/getAllMassClasses', getAllMassClassesController);
router.get('/getMassTutorById/:tutorId', getMassTutorProfileByIdController);
router.get('/getClassSlotsByClassIdAndStudentId/:classId/:studentId', getClassSlotsByClassIdAndStudentIdController);
router.get('/getClassSlotsByClassID/:classId/:month', getClassSlotsByClassIdController);
router.get('/getClassByStudentId/:student_id', getClassesByStudentIdController);


export default router;
