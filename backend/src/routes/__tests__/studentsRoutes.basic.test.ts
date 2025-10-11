import request from 'supertest';
import express from 'express';

// Create specific mocks that we can reference later
const mockTutor = { 
  i_tutor_id: 'tutor123',
  hourly_rate: 50,
  rating: 4.5,
  User: { name: 'Test Tutor' }
};

const mockGetIndividualTutorById = jest.fn();
const mockGetAllIndividualTutors = jest.fn();
const mockAddStudent = jest.fn();

// Mock all external dependencies BEFORE importing the router
jest.mock('../../prismaClient', () => ({
  __esModule: true,
  default: {
    individual_Tutor: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null)
    },
    sessions: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({})
    },
    student: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({})
    },
    user: {
      findUnique: jest.fn().mockResolvedValue(null)
    },
    $disconnect: jest.fn().mockResolvedValue(undefined)
  }
}));

// Mock all services
jest.mock('../../services/studentService', () => ({
  getAllIndividualTutors: mockGetAllIndividualTutors,
  getIndividualTutorById: mockGetIndividualTutorById,
  addStudent: mockAddStudent
}));

// Mock middleware
jest.mock('../../middleware/authMiddlewareSimple', () => ({
  verifyFirebaseTokenSimple: jest.fn((req, res, next) => {
    req.user = { uid: 'test-uid', role: 'student' };
    next();
  })
}));

jest.mock('../../middleware/verifyRole', () => ({
  verifyRole: jest.fn((role) => (req, res, next) => next())
}));

// Mock external services
jest.mock('../../services/zoom.service', () => ({
  createZoomMeeting: jest.fn().mockResolvedValue({
    host_url: 'https://zoom.us/host/test',
    join_url: 'https://zoom.us/join/test'
  })
}));

jest.mock('../../services/paymentService', () => ({
  createPaymentRecord: jest.fn().mockResolvedValue({ payment_id: 'test123' }),
  refundPayment: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../../services/email.service', () => ({
  sendSessionCancellationEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_test123' })
    }
  }));
});

// Now import the router after all mocks are set up
import studentsRouter from '../studentsRoutes';

describe('Students Routes - Basic Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/students', studentsRouter);
  });

  beforeEach(() => {
    // Set up default mock implementations
    mockGetAllIndividualTutors.mockResolvedValue([mockTutor]);
    mockGetIndividualTutorById.mockResolvedValue(mockTutor);
    mockAddStudent.mockResolvedValue({ student_id: 'test123' });
  });

  afterEach(() => {
    // Reset mocks after each test
    jest.clearAllMocks();
  });

  afterAll(async () => {
    // Clean up any open handles
    await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
  });

  it('should respond to getAllIndividualTutors', async () => {
    const response = await request(app)
      .get('/api/students/getAllIndividualTutors')
      .expect(200);
    
    expect(response.body).toBeDefined();
  });

  it('should respond to addStudent', async () => {
    const studentData = {
      user_id: 'user123',
      points: 100
    };

    const response = await request(app)
      .post('/api/students/addStudent')
      .send(studentData)
      .expect(200);
    
    expect(response.body).toBeDefined();
  });

  test('should respond to getIndividualTutorById', async () => {
    const response = await request(app)
      .get('/api/students/getIndividualTutorById/tutor123')
      .expect(200);
    
    expect(response.body).toBeDefined();
    expect(response.body.i_tutor_id).toBeDefined();
  });

  it('should return 404 for non-existent tutor', async () => {
    // Mock the service to return null for this specific test
    const studentService = require('../../services/studentService');
    studentService.getIndividualTutorById.mockResolvedValueOnce(null);

    await request(app)
      .get('/api/students/getIndividualTutorById/nonexistent')
      .expect(404);
  });

  it('should handle 404 for non-existent routes', async () => {
    await request(app)
      .get('/api/students/nonexistent-route')
      .expect(404);
  });
});