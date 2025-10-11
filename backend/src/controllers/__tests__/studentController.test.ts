import { Request, Response } from 'express';
import {
  addStudentController,
  getAllIndividualTutorsController,
  getIndividualTutorByIdController,
  getSlotsOfIndividualTutorByIdController,
  getAllSessionsByStudentIdController
} from '../studentController';
import * as studentService from '../../services/studentService';

// Mock the student service functions
jest.mock('../../services/studentService');

const mockStudentService = studentService as jest.Mocked<typeof studentService>;

describe('Student Controllers', () => {
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

  describe('addStudentController', () => {
    it('should successfully add a new student', async () => {
      // Arrange
      const mockStudentData = {
        user_id: 'user123',
        points: 100
      };

      const mockResult = {
        student_id: 'student123',
        user_id: 'user123',
        points: 100,
        customer_id: 'cus_test123',
        created_at: new Date()
      };

      mockRequest.body = mockStudentData;
      mockStudentService.addStudent.mockResolvedValue(mockResult as any);

      // Act
      await addStudentController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.addStudent).toHaveBeenCalledWith(mockStudentData);
      expect(mockJson).toHaveBeenCalledWith(mockResult);
      expect(mockStatus).not.toHaveBeenCalled(); // Success response doesn't set status
    });

    it('should handle service errors', async () => {
      // Arrange
      const mockStudentData = {
        user_id: 'user123',
        points: 100
      };

      mockRequest.body = mockStudentData;
      const mockError = new Error('User not found');
      mockStudentService.addStudent.mockRejectedValue(mockError);

      // Act & Assert
      await expect(addStudentController(mockRequest as Request, mockResponse as Response))
        .rejects.toThrow('User not found');
      
      expect(mockStudentService.addStudent).toHaveBeenCalledWith(mockStudentData);
    });
  });

  describe('getAllIndividualTutorsController', () => {
    it('should successfully get all tutors with query parameters', async () => {
      // Arrange
      const mockTutors = [
        {
          i_tutor_id: 'tutor1',
          hourly_rate: 50,
          rating: 4.5,
          subjects: ['Math', 'Physics'],
          titles: ['Expert'],
          User: {
            name: 'John Tutor',
            photo_url: 'https://example.com/photo1.jpg'
          }
        },
        {
          i_tutor_id: 'tutor2',
          hourly_rate: 60,
          rating: 4.8,
          subjects: ['Chemistry'],
          titles: ['Professional'],
          User: {
            name: 'Jane Tutor',
            photo_url: 'https://example.com/photo2.jpg'
          }
        }
      ];

      mockRequest.query = {
        name: 'John',
        subjects: 'Math,Physics',
        titles: 'Expert',
        min_hourly_rate: '20',
        max_hourly_rate: '100',
        rating: '4',
        sort: 'rating_desc',
        page: '1',
        limit: '10'
      };

      mockStudentService.getAllIndividualTutors.mockResolvedValue(mockTutors as any);

      // Act
      await getAllIndividualTutorsController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.getAllIndividualTutors).toHaveBeenCalledWith(
        'John',
        'Math,Physics',
        'Expert',
        20,
        100,
        4,
        'rating_desc',
        1,
        10
      );
      expect(mockJson).toHaveBeenCalledWith(mockTutors);
    });

    it('should successfully get all tutors without query parameters', async () => {
      // Arrange
      const mockTutors = [
        {
          i_tutor_id: 'tutor1',
          hourly_rate: 50,
          rating: 4.5,
          subjects: ['Math'],
          titles: ['Expert'],
          User: {
            name: 'Default Tutor',
            photo_url: null
          }
        }
      ];

      mockRequest.query = {};
      mockStudentService.getAllIndividualTutors.mockResolvedValue(mockTutors as any);

      // Act
      await getAllIndividualTutorsController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.getAllIndividualTutors).toHaveBeenCalledWith(
        undefined,
        undefined,
        undefined,
        NaN,
        NaN,
        NaN,
        undefined,
        NaN,
        NaN
      );
      expect(mockJson).toHaveBeenCalledWith(mockTutors);
    });

    it('should handle service errors', async () => {
      // Arrange
      mockRequest.query = {
        name: 'John'
      };

      const mockError = new Error('Database connection failed');
      mockStudentService.getAllIndividualTutors.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getAllIndividualTutorsController(mockRequest as Request, mockResponse as Response))
        .rejects.toThrow('Database connection failed');
    });
  });

  describe('getIndividualTutorByIdController', () => {
    it('should successfully get tutor by ID', async () => {
      // Arrange
      const mockTutor = {
        i_tutor_id: 'tutor123',
        hourly_rate: 75,
        rating: 4.9,
        subjects: ['Mathematics', 'Physics'],
        titles: ['Expert', 'PhD'],
        heading: 'Experienced Math Tutor',
        description: 'I have 10 years of experience teaching mathematics.',
        User: {
          name: 'Dr. Smith',
          photo_url: 'https://example.com/dr-smith.jpg',
          email: 'dr.smith@example.com'
        },
        sessionCount: 150,
        reviewCount: 120
      };

      mockRequest.params = { tutorId: 'tutor123' };
      mockStudentService.getIndividualTutorById.mockResolvedValue(mockTutor as any);

      // Act
      await getIndividualTutorByIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.getIndividualTutorById).toHaveBeenCalledWith('tutor123');
      expect(mockJson).toHaveBeenCalledWith(mockTutor);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return 404 when tutor not found', async () => {
      // Arrange
      mockRequest.params = { tutorId: 'nonexistent123' };
      mockStudentService.getIndividualTutorById.mockResolvedValue(null);

      // Act
      await getIndividualTutorByIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.getIndividualTutorById).toHaveBeenCalledWith('nonexistent123');
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: "Tutor not found" });
    });

    it('should handle service errors', async () => {
      // Arrange
      mockRequest.params = { tutorId: 'tutor123' };
      const mockError = new Error('Database error');
      mockStudentService.getIndividualTutorById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getIndividualTutorByIdController(mockRequest as Request, mockResponse as Response))
        .rejects.toThrow('Database error');
    });
  });

  describe('getSlotsOfIndividualTutorByIdController', () => {
    it('should successfully get tutor slots', async () => {
      // Arrange
      const mockSlots = [
        {
          slot_id: 'slot1',
          i_tutor_id: 'tutor123',
          date: new Date('2023-10-15'),
          start_time: new Date('2023-10-15T10:00:00Z'),
          end_time: new Date('2023-10-15T11:00:00Z'),
          status: 'free'
        },
        {
          slot_id: 'slot2',
          i_tutor_id: 'tutor123',
          date: new Date('2023-10-15'),
          start_time: new Date('2023-10-15T14:00:00Z'),
          end_time: new Date('2023-10-15T15:00:00Z'),
          status: 'free'
        }
      ];

      mockRequest.params = { tutorId: 'tutor123' };
      mockStudentService.getSlotsOfIndividualTutorById.mockResolvedValue(mockSlots as any);

      // Act
      await getSlotsOfIndividualTutorByIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.getSlotsOfIndividualTutorById).toHaveBeenCalledWith('tutor123');
      expect(mockJson).toHaveBeenCalledWith(mockSlots);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return 404 when slots not found', async () => {
      // Arrange
      mockRequest.params = { tutorId: 'tutor123' };
      mockStudentService.getSlotsOfIndividualTutorById.mockResolvedValue(null);

      // Act
      await getSlotsOfIndividualTutorByIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.getSlotsOfIndividualTutorById).toHaveBeenCalledWith('tutor123');
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: "Slots not found" });
    });

    it('should return empty array when slots is empty array', async () => {
      // Arrange
      const emptySlots: any[] = [];
      mockRequest.params = { tutorId: 'tutor123' };
      mockStudentService.getSlotsOfIndividualTutorById.mockResolvedValue(emptySlots);

      // Act
      await getSlotsOfIndividualTutorByIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.getSlotsOfIndividualTutorById).toHaveBeenCalledWith('tutor123');
      expect(mockJson).toHaveBeenCalledWith(emptySlots);
      expect(mockStatus).not.toHaveBeenCalled(); // Empty array is truthy, so no 404
    });

    it('should handle service errors', async () => {
      // Arrange
      mockRequest.params = { tutorId: 'tutor123' };
      const mockError = new Error('Service unavailable');
      mockStudentService.getSlotsOfIndividualTutorById.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getSlotsOfIndividualTutorByIdController(mockRequest as Request, mockResponse as Response))
        .rejects.toThrow('Service unavailable');
    });
  });

  describe('getAllSessionsByStudentIdController', () => {
    it('should successfully get all sessions for a student', async () => {
      // Arrange
      const mockSessions = [
        {
          session_id: 'session1',
          student_id: 'student123',
          i_tutor_id: 'tutor123',
          status: 'completed',
          start_time: new Date('2023-10-15T10:00:00Z'),
          end_time: new Date('2023-10-15T11:00:00Z'),
          date: new Date('2023-10-15'),
          subject: 'Mathematics',
          Individual_Tutor: {
            User: { name: 'John Tutor' }
          },
          reviewed: true
        },
        {
          session_id: 'session2',
          student_id: 'student123',
          i_tutor_id: 'tutor456',
          status: 'scheduled',
          start_time: new Date('2023-10-20T14:00:00Z'),
          end_time: new Date('2023-10-20T15:00:00Z'),
          date: new Date('2023-10-20'),
          subject: 'Physics',
          Individual_Tutor: {
            User: { name: 'Jane Tutor' }
          },
          reviewed: false
        }
      ];

      mockRequest.params = { studentId: 'student123' };
      mockStudentService.getAllSessionByStudentId.mockResolvedValue(mockSessions as any);

      // Act
      await getAllSessionsByStudentIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.getAllSessionByStudentId).toHaveBeenCalledWith('student123');
      expect(mockJson).toHaveBeenCalledWith(mockSessions);
      expect(mockStatus).not.toHaveBeenCalled();
    });

    it('should return 404 when sessions not found', async () => {
      // Arrange
      mockRequest.params = { studentId: 'student123' };
      mockStudentService.getAllSessionByStudentId.mockResolvedValue(null);

      // Act
      await getAllSessionsByStudentIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.getAllSessionByStudentId).toHaveBeenCalledWith('student123');
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ message: "Sessions not found" });
    });

    it('should return empty array when sessions is empty array', async () => {
      // Arrange
      const emptySessions: any[] = [];
      mockRequest.params = { studentId: 'student123' };
      mockStudentService.getAllSessionByStudentId.mockResolvedValue(emptySessions);

      // Act
      await getAllSessionsByStudentIdController(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockStudentService.getAllSessionByStudentId).toHaveBeenCalledWith('student123');
      expect(mockJson).toHaveBeenCalledWith(emptySessions);
      expect(mockStatus).not.toHaveBeenCalled(); // Empty array is truthy, so no 404
    });

    it('should handle service errors', async () => {
      // Arrange
      mockRequest.params = { studentId: 'student123' };
      const mockError = new Error('Database connection failed');
      mockStudentService.getAllSessionByStudentId.mockRejectedValue(mockError);

      // Act & Assert
      await expect(getAllSessionsByStudentIdController(mockRequest as Request, mockResponse as Response))
        .rejects.toThrow('Database connection failed');
    });
  });
});