import request from 'supertest';
import express from 'express';
import studentsRouter from '../studentsRoutes';
import * as studentController from '../../controllers/studentController';
import * as rateAndReviewController from '../../controllers/rateAndReview.controller';
import * as reportController from '../../controllers/report.controller';
import { verifyFirebaseTokenSimple } from '../../middleware/authMiddlewareSimple';
import { verifyRole } from '../../middleware/verifyRole';

// Mock all the controllers
jest.mock('../../controllers/studentController');
jest.mock('../../controllers/rateAndReview.controller');
jest.mock('../../controllers/report.controller');

// Mock Prisma client to prevent database connections
jest.mock('../../prismaClient', () => ({
  __esModule: true,
  default: {
    individual_Tutor: {
      findMany: jest.fn(),
      findUnique: jest.fn()
    },
    sessions: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    student: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    user: {
      findUnique: jest.fn()
    }
  }
}));

// Mock middleware
jest.mock('../../middleware/authMiddlewareSimple', () => ({
  verifyFirebaseTokenSimple: jest.fn((req: any, res: any, next: any) => {
    req.user = { uid: 'test-uid', role: 'student' };
    next();
  })
}));

jest.mock('../../middleware/verifyRole', () => ({
  verifyRole: jest.fn((role: string) => (req: any, res: any, next: any) => {
    if (req.user?.role === role) {
      next();
    } else {
      res.status(403).json({ error: 'Access denied' });
    }
  })
}));

const mockStudentController = studentController as jest.Mocked<typeof studentController>;
const mockRateAndReviewController = rateAndReviewController as jest.Mocked<typeof rateAndReviewController>;
const mockReportController = reportController as jest.Mocked<typeof reportController>;

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/students', studentsRouter);

describe('Students Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup default mock implementations
    Object.values(mockStudentController).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockImplementation(async (req, res) => res.status(200).json({ success: true }));
      }
    });
    Object.values(mockRateAndReviewController).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockImplementation(async (req, res) => res.status(200).json({ success: true }));
      }
    });
    Object.values(mockReportController).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockImplementation(async (req, res) => res.status(200).json({ success: true }));
      }
    });
  });

  describe('POST /addStudent', () => {
    it('should call addStudentController', async () => {
      const studentData = { user_id: 'user123', points: 100 };

      const response = await request(app)
        .post('/api/students/addStudent')
        .send(studentData)
        .expect(200);

      expect(mockStudentController.addStudentController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getStudentIDByUserID/:userId', () => {
    it('should call getStudentIDByUserIDController with correct parameter', async () => {
      const userId = 'user123';

      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/${userId}`)
        .expect(200);

      expect(mockStudentController.getStudentIDByUserIDController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getAllIndividualTutors', () => {
    it('should call getAllIndividualTutorsController', async () => {
      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .expect(200);

      expect(mockStudentController.getAllIndividualTutorsController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });

    it('should handle query parameters', async () => {
      const queryParams = {
        name: 'John',
        subjects: 'Math,Physics',
        rating: '4',
        page: '1',
        limit: '10'
      };

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query(queryParams)
        .expect(200);

      expect(mockStudentController.getAllIndividualTutorsController).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /getIndividualTutorById/:tutorId', () => {
    it('should call getIndividualTutorByIdController with correct parameter', async () => {
      const tutorId = 'tutor123';

      const response = await request(app)
        .get(`/api/students/getIndividualTutorById/${tutorId}`)
        .expect(200);

      expect(mockStudentController.getIndividualTutorByIdController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getSlotsOfIndividualTutorById/:tutorId', () => {
    it('should call getSlotsOfIndividualTutorByIdController with correct parameter', async () => {
      const tutorId = 'tutor123';

      const response = await request(app)
        .get(`/api/students/getSlotsOfIndividualTutorById/${tutorId}`)
        .expect(200);

      expect(mockStudentController.getSlotsOfIndividualTutorByIdController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getAllSessionsByStudentId/:studentId', () => {
    it('should call getAllSessionsByStudentIdController with authentication middleware', async () => {
      const studentId = 'student123';

      const response = await request(app)
        .get(`/api/students/getAllSessionsByStudentId/${studentId}`)
        .expect(200);

      expect(mockStudentController.getAllSessionsByStudentIdController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalledTimes(1);
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('POST /createASession', () => {
    it('should call createASessionController', async () => {
      const sessionData = {
        student_id: 'student123',
        i_tutor_id: 'tutor123',
        date: '2023-10-15',
        slots: ['10:00', '11:00']
      };

      const response = await request(app)
        .post('/api/students/createASession')
        .send(sessionData)
        .expect(200);

      expect(mockStudentController.createASessionController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('PATCH /updateSlotStatus', () => {
    it('should call updateSlotStatusController', async () => {
      const updateData = {
        slot_id: 'slot123',
        status: 'booked'
      };

      const response = await request(app)
        .patch('/api/students/updateSlotStatus')
        .send(updateData)
        .expect(200);

      expect(mockStudentController.updateSlotStatusController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('POST /createPaymentRecord', () => {
    it('should call createPaymentRecordController', async () => {
      const paymentData = {
        student_id: 'student123',
        amount: 50,
        session_id: 'session123'
      };

      const response = await request(app)
        .post('/api/students/createPaymentRecord')
        .send(paymentData)
        .expect(200);

      expect(mockStudentController.createPaymentRecordController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('POST /findTimeSlots', () => {
    it('should call findTimeSlotsController', async () => {
      const findSlotsData = {
        tutor_id: 'tutor123',
        date: '2023-10-15'
      };

      const response = await request(app)
        .post('/api/students/findTimeSlots')
        .send(findSlotsData)
        .expect(200);

      expect(mockStudentController.findTimeSlotsController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('PUT /updateAccessTimeinFreeSlots', () => {
    it('should call updateAccessTimeinFreeSlotsController', async () => {
      const updateData = {
        slot_id: 'slot123',
        access_time: new Date().toISOString()
      };

      const response = await request(app)
        .put('/api/students/updateAccessTimeinFreeSlots')
        .send(updateData)
        .expect(200);

      expect(mockStudentController.updateAccessTimeinFreeSlotsController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getTutorNameAndTypeById/:tutorId', () => {
    it('should call getTutorNameAndTypeByIdController', async () => {
      const tutorId = 'tutor123';

      const response = await request(app)
        .get(`/api/students/getTutorNameAndTypeById/${tutorId}`)
        .expect(200);

      expect(mockStudentController.getTutorNameAndTypeByIdController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('POST /test-zoom', () => {
    it('should call testZoomController', async () => {
      const zoomData = {
        meeting_title: 'Test Meeting',
        start_time: '2023-10-15T10:00:00Z'
      };

      const response = await request(app)
        .post('/api/students/test-zoom')
        .send(zoomData)
        .expect(200);

      expect(mockStudentController.testZoomController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('POST /cancelSession/:session_id', () => {
    it('should call cancelSessionController with authentication middleware', async () => {
      const sessionId = 'session123';

      const response = await request(app)
        .post(`/api/students/cancelSession/${sessionId}`)
        .expect(200);

      expect(mockStudentController.cancelSessionController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalled();
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getTutorsByStudentId/:studentId', () => {
    it('should call getTutorsByStudentIdController with authentication middleware', async () => {
      const studentId = 'student123';

      const response = await request(app)
        .get(`/api/students/getTutorsByStudentId/${studentId}`)
        .expect(200);

      expect(mockStudentController.getTutorsByStudentIdController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalled();
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getPaymentHistory/:studentId', () => {
    it('should call getPaymentHistoryController with authentication middleware', async () => {
      const studentId = 'student123';

      const response = await request(app)
        .get(`/api/students/getPaymentHistory/${studentId}`)
        .expect(200);

      expect(mockStudentController.getPaymentHistoryController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalled();
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  // Rate and Review Routes
  describe('POST /rate-and-review', () => {
    it('should call rateAndReviewIndividualController with authentication middleware', async () => {
      const reviewData = {
        student_id: 'student123',
        session_id: 'session123',
        rating: 5,
        review: 'Excellent tutor!'
      };

      const response = await request(app)
        .post('/api/students/rate-and-review')
        .send(reviewData)
        .expect(200);

      expect(mockRateAndReviewController.rateAndReviewIndividualController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalled();
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /get-reviews/:tutorId', () => {
    it('should call getReviewsByIndividualTutorIdController', async () => {
      const tutorId = 'tutor123';

      const response = await request(app)
        .get(`/api/students/get-reviews/${tutorId}`)
        .expect(200);

      expect(mockRateAndReviewController.getReviewsByIndividualTutorIdController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  // Report Routes
  describe('POST /report-tutor', () => {
    it('should call generateReportController with authentication middleware', async () => {
      const reportData = {
        student_id: 'student123',
        tutor_id: 'tutor123',
        reason: 'Inappropriate behavior',
        description: 'Detailed description of the issue'
      };

      const response = await request(app)
        .post('/api/students/report-tutor')
        .send(reportData)
        .expect(200);

      expect(mockReportController.generateReportController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalled();
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /get-reports/:studentId', () => {
    it('should call getReportsByStudentIdController with authentication middleware', async () => {
      const studentId = 'student123';

      const response = await request(app)
        .get(`/api/students/get-reports/${studentId}`)
        .expect(200);

      expect(mockReportController.getReportsByStudentIdController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalled();
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  // Mass Class Routes
  describe('GET /getAllMassClasses', () => {
    it('should call getAllMassClassesController', async () => {
      const response = await request(app)
        .get('/api/students/getAllMassClasses')
        .expect(200);

      expect(mockStudentController.getAllMassClassesController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getMassTutorById/:tutorId', () => {
    it('should call getMassTutorProfileByIdController', async () => {
      const tutorId = 'masstutor123';

      const response = await request(app)
        .get(`/api/students/getMassTutorById/${tutorId}`)
        .expect(200);

      expect(mockStudentController.getMassTutorProfileByIdController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getClassSlotsByClassIdAndStudentId/:classId/:studentId', () => {
    it('should call getClassSlotsByClassIdAndStudentIdController', async () => {
      const classId = 'class123';
      const studentId = 'student123';

      const response = await request(app)
        .get(`/api/students/getClassSlotsByClassIdAndStudentId/${classId}/${studentId}`)
        .expect(200);

      expect(mockStudentController.getClassSlotsByClassIdAndStudentIdController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getClassSlotsByClassID/:classId/:month', () => {
    it('should call getClassSlotsByClassIdController', async () => {
      const classId = 'class123';
      const month = '2023-10';

      const response = await request(app)
        .get(`/api/students/getClassSlotsByClassID/${classId}/${month}`)
        .expect(200);

      expect(mockStudentController.getClassSlotsByClassIdController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getClassByStudentId/:student_id', () => {
    it('should call getClassesByStudentIdController with authentication middleware', async () => {
      const studentId = 'student123';

      const response = await request(app)
        .get(`/api/students/getClassByStudentId/${studentId}`)
        .expect(200);

      expect(mockStudentController.getClassesByStudentIdController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalled();
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getMassTutorsByStudentId/:studentId', () => {
    it('should call getMassTutorsByStudentIdController with authentication middleware', async () => {
      const studentId = 'student123';

      const response = await request(app)
        .get(`/api/students/getMassTutorsByStudentId/${studentId}`)
        .expect(200);

      expect(mockStudentController.getMassTutorsByStudentIdController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalled();
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getMassPaymentByStudentId/:studentId', () => {
    it('should call getMassPaymentsByStudentIdController with authentication middleware', async () => {
      const studentId = 'student123';

      const response = await request(app)
        .get(`/api/students/getMassPaymentByStudentId/${studentId}`)
        .expect(200);

      expect(mockStudentController.getMassPaymentsByStudentIdController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalled();
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('GET /getClassReviewsByClassId/:class_id', () => {
    it('should call getClassReviewsByClassIdController', async () => {
      const classId = 'class123';

      const response = await request(app)
        .get(`/api/students/getClassReviewsByClassId/${classId}`)
        .expect(200);

      expect(mockStudentController.getClassReviewsByClassIdController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('POST /rateAreviewMassClass', () => {
    it('should call rateMassClassesController with authentication middleware', async () => {
      const ratingData = {
        student_id: 'student123',
        class_id: 'class123',
        rating: 4,
        review: 'Good class'
      };

      const response = await request(app)
        .post('/api/students/rateAreviewMassClass')
        .send(ratingData)
        .expect(200);

      expect(mockStudentController.rateMassClassesController).toHaveBeenCalledTimes(1);
      expect(verifyFirebaseTokenSimple).toHaveBeenCalled();
      expect(verifyRole).toHaveBeenCalledWith('student');
      expect(response.body).toEqual({ success: true });
    });
  });

  describe('POST /send-test-email', () => {
    it('should call sendEmailController', async () => {
      const emailData = {
        to: 'test@example.com',
        subject: 'Test Email',
        body: 'This is a test email'
      };

      const response = await request(app)
        .post('/api/students/send-test-email')
        .send(emailData)
        .expect(200);

      expect(mockStudentController.sendEmailController).toHaveBeenCalledTimes(1);
      expect(response.body).toEqual({ success: true });
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle controller errors gracefully', async () => {
      mockStudentController.addStudentController.mockImplementation(async (req, res) => {
        return res.status(500).json({ error: 'Internal server error' });
      });

      const response = await request(app)
        .post('/api/students/addStudent')
        .send({ user_id: 'user123' })
        .expect(500);

      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    it('should handle invalid routes', async () => {
      const response = await request(app)
        .get('/api/students/invalid-route')
        .expect(404);
    });
  });

  // Middleware integration tests
  describe('Middleware Integration', () => {
    it('should require authentication for protected routes', async () => {
      // Mock middleware to simulate authentication failure
      const mockVerifyFirebaseTokenSimple = verifyFirebaseTokenSimple as jest.MockedFunction<typeof verifyFirebaseTokenSimple>;
      mockVerifyFirebaseTokenSimple.mockImplementationOnce(async (req, res, next) => {
        return res.status(401).json({ error: 'Unauthorized' });
      });

      const response = await request(app)
        .get('/api/students/getAllSessionsByStudentId/student123')
        .expect(401);

      expect(response.body).toEqual({ error: 'Unauthorized' });
    });

    it('should verify role for role-protected routes', async () => {
      // Mock role verification to fail
      const mockVerifyRole = verifyRole as jest.MockedFunction<typeof verifyRole>;
      mockVerifyRole.mockImplementationOnce((role: string) => (req, res, next) => {
        return res.status(403).json({ error: 'Access denied' });
      });

      const response = await request(app)
        .get('/api/students/getAllSessionsByStudentId/student123')
        .expect(403);

      expect(response.body).toEqual({ error: 'Access denied' });
    });
  });
});