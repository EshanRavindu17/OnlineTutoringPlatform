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
         getClassesByStudentIdController,
         getMassTutorsByStudentIdController,
         sendEmailController,
         getMassPaymentsByStudentIdController,
         getClassReviewsByClassIdController,
         rateMassClassesController} 
from '../controllers/studentController';
import { getReviewsByIndividualTutorIdController, rateAndReviewIndividualController } from '../controllers/rateAndReview.controller';
import { generateReportController, getReportsByStudentIdController } from '../controllers/report.controller';
import { verifyFirebaseTokenSimple } from '../middleware/authMiddlewareSimple';
import { verifyRole } from '../middleware/verifyRole';


const router = express.Router();

router.post('/addStudent', addStudentController);

router.get('/getStudentIDByUserID/:userId', getStudentIDByUserIDController);

//get all individual Tutors
router.get('/getAllIndividualTutors', getAllIndividualTutorsController);

router.get('/getIndividualTutorById/:tutorId', getIndividualTutorByIdController);

router.get('/getSlotsOfIndividualTutorById/:tutorId', getSlotsOfIndividualTutorByIdController);

router.get('/getAllSessionsByStudentId/:studentId', verifyFirebaseTokenSimple, verifyRole('student'), getAllSessionsByStudentIdController);

router.post('/createASession', createASessionController);

router.patch('/updateSlotStatus', updateSlotStatusController);



router.post('/createPaymentRecord', createPaymentRecordController);

router.post('/findTimeSlots', findTimeSlotsController);

router.put('/updateAccessTimeinFreeSlots', updateAccessTimeinFreeSlotsController);

// To get tutor name and type by tutor ID
router.get('/getTutorNameAndTypeById/:tutorId', getTutorNameAndTypeByIdController);


// helper route to test zoom integration
router.post('/test-zoom',  testZoomController);

router.post('/cancelSession/:session_id', verifyFirebaseTokenSimple,verifyRole('student'), cancelSessionController);

router.get('/getTutorsByStudentId/:studentId', verifyFirebaseTokenSimple , verifyRole('student'), getTutorsByStudentIdController);

router.get('/getPaymentHistory/:studentId', verifyFirebaseTokenSimple , verifyRole('student'), getPaymentHistoryController);


//Individual Tutor Rating and Review routes will be in rateAndReviewRoutes.ts

router.post('/rate-and-review', verifyFirebaseTokenSimple , verifyRole('student'), rateAndReviewIndividualController ); // to be implemented in rateAndReviewRoutes.ts
router.get('/get-reviews/:tutorId', getReviewsByIndividualTutorIdController);


// Report Tutors route  

router.post('/report-tutor', verifyFirebaseTokenSimple , verifyRole('student'), generateReportController);
router.get('/get-reports/:studentId',  verifyFirebaseTokenSimple , verifyRole('student'), getReportsByStudentIdController);



// Mass Class routes will be in massClassRoutes.ts

router.get('/getAllMassClasses', getAllMassClassesController);
router.get('/getMassTutorById/:tutorId', getMassTutorProfileByIdController);
router.get('/getClassSlotsByClassIdAndStudentId/:classId/:studentId', getClassSlotsByClassIdAndStudentIdController);
router.get('/getClassSlotsByClassID/:classId/:month', getClassSlotsByClassIdController);
router.get('/getClassByStudentId/:student_id', verifyFirebaseTokenSimple , verifyRole('student'), getClassesByStudentIdController);
router.get('/getMassTutorsByStudentId/:studentId', verifyFirebaseTokenSimple , verifyRole('student'), getMassTutorsByStudentIdController);
router.get('/getMassPaymentByStudentId/:studentId', verifyFirebaseTokenSimple , verifyRole('student'), getMassPaymentsByStudentIdController);
router.get('/getClassReviewsByClassId/:class_id',getClassReviewsByClassIdController)
router.post('/rateAreviewMassClass', verifyFirebaseTokenSimple , verifyRole('student'), rateMassClassesController)


router.post('/send-test-email', sendEmailController);


export default router;
