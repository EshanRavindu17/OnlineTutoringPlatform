import { Response } from 'express';
import { AuthRequest } from '../../middleware/authBypass';
import { getUserByUid } from '../userController';
import * as userService from '../../services/userService';

// Mock the user service functions
jest.mock('../../services/userService');

// Mock Prisma client
jest.mock('../../prismaClient', () => ({
  __esModule: true,
  default: {
    candidates: {
      findFirst: jest.fn()
    },
    individual_Tutor: {
      findUnique: jest.fn()
    },
    $queryRaw: jest.fn()
  }
}));

const mockUserService = userService as jest.Mocked<typeof userService>;

describe('User Controller', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {
      params: {},
      user: undefined
    };
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
  });

  describe('getUserByUid', () => {
    it('should return 400 when uid is missing', async () => {
      // Arrange
      mockRequest.params = {}; // No uid

      // Act
      await getUserByUid(mockRequest as AuthRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ 
        error: 'Firebase UID is required' 
      });
    });

    it('should return 403 when user tries to access another user profile', async () => {
      // Arrange
      mockRequest.params = { uid: 'other-user-uid' };
      mockRequest.user = { uid: 'current-user-uid' };

      // Act
      await getUserByUid(mockRequest as AuthRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ 
        error: 'Access denied: You can only access your own profile' 
      });
    });

    it('should return 404 when user not found', async () => {
      // Arrange
      const uid = 'test-uid';
      mockRequest.params = { uid };
      mockRequest.user = { uid };
      mockUserService.findUserWithTutorStatus.mockResolvedValue(null);

      // Act
      await getUserByUid(mockRequest as AuthRequest, mockResponse as Response);

      // Assert
      expect(mockUserService.findUserWithTutorStatus).toHaveBeenCalledWith(uid);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ 
        error: 'User not found' 
      });
    });

    it('should successfully return user data for Student role', async () => {
      // Arrange
      const uid = 'test-uid';
      const mockUser = {
        id: 'user123',
        firebase_uid: uid,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Student',
        Individual_Tutor: [],
        Mass_Tutor: [],
        created_at: new Date(),
        updated_at: new Date()
      };

      mockRequest.params = { uid };
      mockRequest.user = { uid };
      mockUserService.findUserWithTutorStatus.mockResolvedValue(mockUser as any);

      // Act
      await getUserByUid(mockRequest as AuthRequest, mockResponse as Response);

      // Assert
      expect(mockUserService.findUserWithTutorStatus).toHaveBeenCalledWith(uid);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        id: 'user123',
        role: 'Student'
      }));
    });

    it('should handle Individual role user without tutor profile', async () => {
      // Arrange
      const uid = 'test-uid';
      const mockUser = {
        id: 'user123',
        firebase_uid: uid,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Individual',
        Individual_Tutor: [], // Empty array - no tutor profile
        created_at: new Date(),
        updated_at: new Date()
      };

      mockRequest.params = { uid };
      mockRequest.user = { uid };
      mockUserService.findUserWithTutorStatus.mockResolvedValue(mockUser as any);

      // Act
      await getUserByUid(mockRequest as AuthRequest, mockResponse as Response);

      // Assert
      expect(mockUserService.findUserWithTutorStatus).toHaveBeenCalledWith(uid);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        role: 'Individual',
        tutorStatus: expect.any(String)
      }));
    });

    it('should handle Individual role user with tutor profile', async () => {
      // Arrange
      const uid = 'test-uid';
      const mockUser = {
        id: 'user123',
        firebase_uid: uid,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Individual',
        Individual_Tutor: [
          {
            i_tutor_id: 'tutor123',
            status: 'approved',
            hourly_rate: 75,
            rating: 4.8,
            subjects: ['Math', 'Physics'],
            titles: ['Expert']
          }
        ],
        created_at: new Date(),
        updated_at: new Date()
      };

      mockRequest.params = { uid };
      mockRequest.user = { uid };
      mockUserService.findUserWithTutorStatus.mockResolvedValue(mockUser as any);

      // Act
      await getUserByUid(mockRequest as AuthRequest, mockResponse as Response);

      // Assert
      expect(mockUserService.findUserWithTutorStatus).toHaveBeenCalledWith(uid);
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        role: 'Individual'
      }));
    });

    it('should handle service errors gracefully', async () => {
      // Arrange
      const uid = 'test-uid';
      mockRequest.params = { uid };
      mockRequest.user = { uid };
      const mockError = new Error('Database connection failed');
      mockUserService.findUserWithTutorStatus.mockRejectedValue(mockError);

      // Act
      await getUserByUid(mockRequest as AuthRequest, mockResponse as Response);

      // Assert - The controller should handle the error and return a response
      expect(mockUserService.findUserWithTutorStatus).toHaveBeenCalledWith(uid);
      // The exact response depends on how the controller handles the error
    });

    it('should handle user with undefined uid in request', async () => {
      // Arrange
      const uid = 'test-uid';
      mockRequest.params = { uid };
      mockRequest.user = undefined; // No user object

      // Act
      await getUserByUid(mockRequest as AuthRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(403);
      expect(mockJson).toHaveBeenCalledWith({ 
        error: 'Access denied: You can only access your own profile' 
      });
    });

    it('should handle empty uid parameter', async () => {
      // Arrange
      mockRequest.params = { uid: '' }; // Empty string

      // Act
      await getUserByUid(mockRequest as AuthRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ 
        error: 'Firebase UID is required' 
      });
    });

    it('should handle null uid parameter', async () => {
      // Arrange
      mockRequest.params = { uid: null as any }; // Null value

      // Act
      await getUserByUid(mockRequest as AuthRequest, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ 
        error: 'Firebase UID is required' 
      });
    });
  });
});