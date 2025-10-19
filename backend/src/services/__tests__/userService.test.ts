import { findUserByFirebaseUid, createOrUpdateUser } from '../userService';

// Mock Prisma client
jest.mock('../../prismaClient', () => ({
  default: {
    user: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    individual_Tutor: {
      upsert: jest.fn(),
    },
    student: {
      upsert: jest.fn(),
    },
  },
}));

describe('User Service - Critical User Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findUserByFirebaseUid', () => {
    it('should be defined', () => {
      expect(findUserByFirebaseUid).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof findUserByFirebaseUid).toBe('function');
    });
  });

  describe('createOrUpdateUser', () => {
    it('should be defined', () => {
      expect(createOrUpdateUser).toBeDefined();
    });

    it('should be a function', () => {
      expect(typeof createOrUpdateUser).toBe('function');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        firebase_uid: '',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
      };

      await expect(createOrUpdateUser(invalidData)).rejects.toThrow();
    });

    it('should validate role field', async () => {
      const invalidData = {
        firebase_uid: 'firebase-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'invalid-role',
      };

      await expect(createOrUpdateUser(invalidData)).rejects.toThrow();
    });
  });
});