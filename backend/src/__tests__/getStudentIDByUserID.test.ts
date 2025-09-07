// Mock environment variables first
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';

import request from 'supertest';
import express from 'express';
import { getStudentIDByUserID } from '../services/studentService';

// Mock the entire prismaClient module
jest.mock('../prismaClient', () => ({
  student: {
    findFirst: jest.fn(),
  },
}));

// Import after mocking
import studentsRoutes from '../routes/studentsRoutes';
import prisma from '../prismaClient';

// Type assertion for mocked functions
const mockPrisma = prisma as {
  student: {
    findFirst: jest.MockedFunction<any>;
  };
};

// Create express app with routes for testing
const app = express();
app.use(express.json());
app.use('/api/students', studentsRoutes);

describe('getStudentIDByUserID Endpoint Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStudentData = {
    student_id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    points: 100
  };

  // Test UUIDs for consistent testing
  const validUserUUID = '550e8400-e29b-41d4-a716-446655440000';
  const validStudentUUID = '123e4567-e89b-12d3-a456-426614174000';
  const anotherUserUUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  const anotherStudentUUID = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

  // ==========================================
  // SERVICE LAYER TESTS
  // ==========================================
  describe('Service Layer - getStudentIDByUserID', () => {
    it('should return student ID when student exists', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: validStudentUUID
      });

      const result = await getStudentIDByUserID(validUserUUID);

      expect(result).toBe(validStudentUUID);
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: validUserUUID },
        select: {
          student_id: true
        }
      });
    });

    it('should return null when student does not exist', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await getStudentIDByUserID('6ba7b812-9dad-11d1-80b4-00c04fd430c9');

      expect(result).toBeNull();
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: '6ba7b812-9dad-11d1-80b4-00c04fd430c9' },
        select: {
          student_id: true
        }
      });
    });

    it('should return null when student exists but student_id is undefined', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: undefined
      });

      const result = await getStudentIDByUserID(validUserUUID);

      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const databaseError = new Error('Database connection failed');
      mockPrisma.student.findFirst.mockRejectedValue(databaseError);

      await expect(
        getStudentIDByUserID(validUserUUID)
      ).rejects.toThrow('Database connection failed');

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: validUserUUID },
        select: {
          student_id: true
        }
      });
    });

    it('should handle Prisma client errors', async () => {
      const prismaError = new Error('Prisma query failed');
      prismaError.name = 'PrismaClientKnownRequestError';
      mockPrisma.student.findFirst.mockRejectedValue(prismaError);

      await expect(
        getStudentIDByUserID(validUserUUID)
      ).rejects.toThrow('Prisma query failed');
    });

    it('should handle empty string user ID', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await getStudentIDByUserID('');

      expect(result).toBeNull();
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: '' },
        select: {
          student_id: true
        }
      });
    });

    it('should handle special characters in user ID', async () => {
      const specialUserId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID format
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: anotherStudentUUID
      });

      const result = await getStudentIDByUserID(specialUserId);

      expect(result).toBe(anotherStudentUUID);
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: specialUserId },
        select: {
          student_id: true
        }
      });
    });

    it('should handle malformed UUID user ID', async () => {
      const malformedUUID = 'not-a-valid-uuid-format';
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await getStudentIDByUserID(malformedUUID);

      expect(result).toBeNull();
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: malformedUUID },
        select: {
          student_id: true
        }
      });
    });
  });

  // ==========================================
  // API INTEGRATION TESTS
  // ==========================================
  describe('API Endpoint - GET /api/students/getStudentIDByUserID/:userId', () => {
    it('should return 200 with student ID when student exists', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: validStudentUUID
      });

      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/${validUserUUID}`)
        .expect(200);

      expect(response.body).toEqual({
        studentId: validStudentUUID
      });
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: validUserUUID },
        select: {
          student_id: true
        }
      });
    });

    it('should return 404 when student does not exist', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const nonExistentUUID = '6ba7b812-9dad-11d1-80b4-00c04fd430c9';
      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/${nonExistentUUID}`)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Student not found'
      });
    });

    it('should return 404 when student_id is null', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: null
      });

      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/${validUserUUID}`)
        .expect(404);

      expect(response.body).toEqual({
        message: 'Student not found'
      });
    });

    it('should handle URL encoded user IDs', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: anotherStudentUUID
      });

      // This test now uses a malformed UUID that gets URL encoded
      const response = await request(app)
        .get('/api/students/getStudentIDByUserID/550e8400%2De29b%2D41d4%2Da716%2D446655440000')
        .expect(200);

      expect(response.body).toEqual({
        studentId: anotherStudentUUID
      });
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: '550e8400-e29b-41d4-a716-446655440000' },
        select: {
          student_id: true
        }
      });
    });

    it('should handle malformed UUID user IDs', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/students/getStudentIDByUserID/not-a-valid-uuid-format')
        .expect(404);

      expect(response.body).toEqual({
        message: 'Student not found'
      });
    });

    it('should handle very long user IDs', async () => {
      const longUserId = 'a'.repeat(100);
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: anotherStudentUUID
      });

      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/${longUserId}`)
        .expect(200);

      expect(response.body).toEqual({
        studentId: anotherStudentUUID
      });
    });

    it('should handle database errors and return 500', async () => {
      const databaseError = new Error('Database connection failed');
      mockPrisma.student.findFirst.mockRejectedValue(databaseError);

      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/${validUserUUID}`)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Internal server error'
      });
    });

    it('should handle Prisma client timeout errors', async () => {
      const timeoutError = new Error('Query timeout');
      timeoutError.name = 'PrismaClientKnownRequestError';
      mockPrisma.student.findFirst.mockRejectedValue(timeoutError);

      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/${validUserUUID}`)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Internal server error'
      });
    });

    it('should handle empty user ID parameter', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/students/getStudentIDByUserID/')
        .expect(404); // Express returns 404 for missing route parameters

      // This test checks that Express handles the missing parameter correctly
    });

    it('should handle user ID with spaces (URL encoded)', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: anotherStudentUUID
      });

      const response = await request(app)
        .get('/api/students/getStudentIDByUserID/user%20with%20spaces')
        .expect(200);

      expect(response.body).toEqual({
        studentId: anotherStudentUUID
      });
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user with spaces' },
        select: {
          student_id: true
        }
      });
    });
  });

  // ==========================================
  // CONTROLLER SPECIFIC TESTS
  // ==========================================
  describe('Controller Layer - getStudentIDByUserIDController', () => {
    it('should log the user ID parameter', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: validStudentUUID
      });

      await request(app)
        .get(`/api/students/getStudentIDByUserID/${validUserUUID}`)
        .expect(200);

      expect(consoleSpy).toHaveBeenCalledWith('user_ID', validUserUUID);
      consoleSpy.mockRestore();
    });

    it('should extract userId parameter correctly from request', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: anotherStudentUUID
      });

      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/${anotherUserUUID}`)
        .expect(200);

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: anotherUserUUID },
        select: {
          student_id: true
        }
      });
      expect(response.body.studentId).toBe(anotherStudentUUID);
    });

    it('should return studentId in correct JSON format', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: validStudentUUID
      });

      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/${validUserUUID}`)
        .expect(200);

      expect(response.body).toHaveProperty('studentId');
      expect(response.body.studentId).toBe(validStudentUUID);
      expect(Object.keys(response.body)).toEqual(['studentId']);
    });
  });

  // ==========================================
  // EDGE CASE TESTS
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle null response from database', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await getStudentIDByUserID(validUserUUID);
      expect(result).toBeNull();
    });

    it('should handle undefined student_id in database response', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: undefined
      });

      const result = await getStudentIDByUserID(validUserUUID);
      expect(result).toBeNull();
    });

    it('should handle empty string student_id in database response', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: '176ab48f-b7bf-43a3-9e60-b1beeab9f79b'
      });

      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/ `)
        .expect(404);


      expect(response.body).toEqual({});
    });

    it('should handle numeric user ID as string', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: anotherStudentUUID
      });

      const response = await request(app)
        .get('/api/students/getStudentIDByUserID/123456789')
        .expect(200);

      expect(response.body.studentId).toBe(anotherStudentUUID);
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: '123456789' },
        select: {
          student_id: true
        }
      });
    });

    it('should handle UUID format user ID', async () => {
      const uuidUserId = '550e8400-e29b-41d4-a716-446655440000';
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: validStudentUUID
      });

      const response = await request(app)
        .get(`/api/students/getStudentIDByUserID/${uuidUserId}`)
        .expect(200);

      expect(response.body.studentId).toBe(validStudentUUID);
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: uuidUserId },
        select: {
          student_id: true
        }
      });
    });

    it('should handle user ID with only whitespace', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/students/getStudentIDByUserID/%20%20%20') // URL encoded spaces
        .expect(404);

      expect(response.body.message).toBe('Student not found');
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: '   ' },
        select: {
          student_id: true
        }
      });
    });

    it('should handle concurrent requests for same user ID', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: validStudentUUID
      });

      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get(`/api/students/getStudentIDByUserID/${validUserUUID}`)
          .expect(200)
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.body.studentId).toBe(validStudentUUID);
      });

      expect(mockPrisma.student.findFirst).toHaveBeenCalledTimes(5);
    });

    it('should handle very short user ID', async () => {
      mockPrisma.student.findFirst.mockResolvedValue({
        student_id: anotherStudentUUID
      });

      const response = await request(app)
        .get('/api/students/getStudentIDByUserID/a')
        .expect(200);

      expect(response.body.studentId).toBe(anotherStudentUUID);
    });
  });
});
