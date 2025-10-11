import { Request, Response } from 'express';
import { Decimal } from '@prisma/client/runtime/library';
import { 
  rateAndReviewIndividualController, 
  getReviewsByIndividualTutorIdController 
} from '../rateAndReview.controller';
import * as rateAndReviewService from '../../services/rateAndReview.service';

// Mock the service functions
jest.mock('../../services/rateAndReview.service');

const mockRateAndReviewService = rateAndReviewService as jest.Mocked<typeof rateAndReviewService>;

describe('Rate and Review Controllers', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockRequest = {};
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    jest.clearAllMocks();
  });

  describe('rateAndReviewIndividualController', () => {
    it('should successfully create a rating and review', async () => {
      // Arrange
      const mockReviewData = {
        student_id: 'student123',
        session_id: 'session123',
        rating: 5,
        review: 'Excellent tutor!'
      };

      const mockResult = {
        r_id: 'review123',
        student_id: 'student123',
        session_id: 'session123',
        rating: 5,
        review: 'Excellent tutor!',
        created_at: new Date()
      };

      mockRequest.body = mockReviewData;
      mockRateAndReviewService.rateAndReviewIndividualTutor.mockResolvedValue(mockResult);

      // Act
      await rateAndReviewIndividualController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRateAndReviewService.rateAndReviewIndividualTutor).toHaveBeenCalledWith(
        'student123',
        'session123',
        5,
        'Excellent tutor!'
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
    });

    it('should handle missing required fields', async () => {
      // Arrange
      mockRequest.body = {
        student_id: 'student123',
        session_id: 'session123',
        // missing rating and review
      };

      const mockError = new Error('Rating is required');
      mockRateAndReviewService.rateAndReviewIndividualTutor.mockRejectedValue(mockError);

      // Act
      await rateAndReviewIndividualController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRateAndReviewService.rateAndReviewIndividualTutor).toHaveBeenCalledWith(
        'student123',
        'session123',
        undefined,
        undefined
      );
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ 
        message: 'Rating is required' 
      });
    });

    it('should handle service errors with custom status', async () => {
      // Arrange
      const mockReviewData = {
        student_id: 'student123',
        session_id: 'session123',
        rating: 5,
        review: 'Great session!'
      };

      mockRequest.body = mockReviewData;

      const mockError = {
        status: 404,
        message: 'Session not found or does not belong to the student'
      };
      mockRateAndReviewService.rateAndReviewIndividualTutor.mockRejectedValue(mockError);

      // Act
      await rateAndReviewIndividualController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ 
        message: 'Session not found or does not belong to the student' 
      });
    });

    it('should handle service errors without custom status', async () => {
      // Arrange
      const mockReviewData = {
        student_id: 'student123',
        session_id: 'session123',
        rating: 5,
        review: 'Great session!'
      };

      mockRequest.body = mockReviewData;

      const mockError = new Error('Database connection failed');
      mockRateAndReviewService.rateAndReviewIndividualTutor.mockRejectedValue(mockError);

      // Act
      await rateAndReviewIndividualController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ 
        message: 'Database connection failed' 
      });
    });

    it('should handle unknown errors with default message', async () => {
      // Arrange
      const mockReviewData = {
        student_id: 'student123',
        session_id: 'session123',
        rating: 5,
        review: 'Great session!'
      };

      mockRequest.body = mockReviewData;

      // Mock an error without a message property
      const mockError = { someProperty: 'unknown error' };
      mockRateAndReviewService.rateAndReviewIndividualTutor.mockRejectedValue(mockError);

      // Act
      await rateAndReviewIndividualController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ 
        message: 'Rating and review failed' 
      });
    });

    it('should handle update of existing review', async () => {
      // Arrange
      const mockReviewData = {
        student_id: 'student123',
        session_id: 'session123',
        rating: 4,
        review: 'Updated review - Good session!'
      };

      const mockUpdatedResult = {
        r_id: 'review123',
        student_id: 'student123',
        session_id: 'session123',
        rating: 4,
        review: 'Updated review - Good session!',
        updated_at: new Date()
      };

      mockRequest.body = mockReviewData;
      mockRateAndReviewService.rateAndReviewIndividualTutor.mockResolvedValue(mockUpdatedResult);

      // Act
      await rateAndReviewIndividualController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRateAndReviewService.rateAndReviewIndividualTutor).toHaveBeenCalledWith(
        'student123',
        'session123',
        4,
        'Updated review - Good session!'
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith(mockUpdatedResult);
    });
  });

  describe('getReviewsByIndividualTutorIdController', () => {
    it('should successfully get reviews for a tutor', async () => {
      // Arrange
      const tutorId = 'tutor123';
      const mockReviews = [
        {
          r_id: 'review1',
          student_id: 'student1',
          session_id: 'session1',
          rating: new Decimal(5),
          review: 'Excellent tutor!',
          Student: {
            User: {
              name: 'John Doe',
              email: 'john@example.com',
              photo_url: 'https://example.com/photo1.jpg'
            }
          }
        },
        {
          r_id: 'review2',
          student_id: 'student2',
          session_id: 'session2',
          rating: new Decimal(4),
          review: 'Good session',
          Student: {
            User: {
              name: 'Jane Smith',
              email: 'jane@example.com',
              photo_url: 'https://example.com/photo2.jpg'
            }
          }
        }
      ];

      mockRequest.params = { tutorId };
      mockRateAndReviewService.getReviewsByIndividualTutorId.mockResolvedValue(mockReviews);

      // Act
      await getReviewsByIndividualTutorIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRateAndReviewService.getReviewsByIndividualTutorId).toHaveBeenCalledWith('tutor123');
      expect(mockJson).toHaveBeenCalledWith(mockReviews);
      expect(mockStatus).not.toHaveBeenCalled(); // Should not set status for successful response
    });

    it('should return empty array when no reviews found', async () => {
      // Arrange
      const tutorId = 'tutor456';
      const mockEmptyReviews: any[] = [];

      mockRequest.params = { tutorId };
      mockRateAndReviewService.getReviewsByIndividualTutorId.mockResolvedValue(mockEmptyReviews);

      // Act
      await getReviewsByIndividualTutorIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRateAndReviewService.getReviewsByIndividualTutorId).toHaveBeenCalledWith('tutor456');
      expect(mockJson).toHaveBeenCalledWith([]);
    });

    it('should handle service errors with custom status', async () => {
      // Arrange
      const tutorId = 'tutor123';
      mockRequest.params = { tutorId };

      const mockError = {
        status: 404,
        message: 'Tutor not found'
      };
      mockRateAndReviewService.getReviewsByIndividualTutorId.mockRejectedValue(mockError);

      // Act
      await getReviewsByIndividualTutorIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ 
        message: 'Tutor not found' 
      });
    });

    it('should handle service errors without custom status', async () => {
      // Arrange
      const tutorId = 'tutor123';
      mockRequest.params = { tutorId };

      const mockError = new Error('Database connection failed');
      mockRateAndReviewService.getReviewsByIndividualTutorId.mockRejectedValue(mockError);

      // Act
      await getReviewsByIndividualTutorIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ 
        message: 'Database connection failed' 
      });
    });

    it('should handle unknown errors with default message', async () => {
      // Arrange
      const tutorId = 'tutor123';
      mockRequest.params = { tutorId };

      // Mock an error without a message property
      const mockError = { someProperty: 'unknown error' };
      mockRateAndReviewService.getReviewsByIndividualTutorId.mockRejectedValue(mockError);

      // Act
      await getReviewsByIndividualTutorIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ 
        message: 'Failed to get reviews' 
      });
    });

    it('should handle missing tutorId parameter', async () => {
      // Arrange
      mockRequest.params = {}; // No tutorId

      const mockError = new Error('Tutor ID is required');
      mockRateAndReviewService.getReviewsByIndividualTutorId.mockRejectedValue(mockError);

      // Act
      await getReviewsByIndividualTutorIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRateAndReviewService.getReviewsByIndividualTutorId).toHaveBeenCalledWith(undefined);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ 
        message: 'Tutor ID is required' 
      });
    });

    it('should handle reviews with different rating values', async () => {
      // Arrange
      const tutorId = 'tutor789';
      const mockReviewsWithVariousRatings = [
        {
          r_id: 'review1',
          student_id: 'student1',
          session_id: 'session1',
          rating: new Decimal(1),
          review: 'Poor experience',
          Student: {
            User: {
              name: 'Student One',
              email: 'student1@example.com',
              photo_url: null
            }
          }
        },
        {
          r_id: 'review2',
          student_id: 'student2',
          session_id: 'session2',
          rating: new Decimal(3),
          review: 'Average session',
          Student: {
            User: {
              name: 'Student Two',
              email: 'student2@example.com',
              photo_url: 'https://example.com/photo.jpg'
            }
          }
        },
        {
          r_id: 'review3',
          student_id: 'student3',
          session_id: 'session3',
          rating: new Decimal(5),
          review: 'Outstanding tutor!',
          Student: {
            User: {
              name: 'Student Three',
              email: 'student3@example.com',
              photo_url: 'https://example.com/photo3.jpg'
            }
          }
        }
      ];

      mockRequest.params = { tutorId };
      mockRateAndReviewService.getReviewsByIndividualTutorId.mockResolvedValue(mockReviewsWithVariousRatings);

      // Act
      await getReviewsByIndividualTutorIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockRateAndReviewService.getReviewsByIndividualTutorId).toHaveBeenCalledWith('tutor789');
      expect(mockJson).toHaveBeenCalledWith(mockReviewsWithVariousRatings);
    });
  });
});