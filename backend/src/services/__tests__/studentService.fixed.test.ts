import { SessionStatus, SlotStatus } from '@prisma/client';

// Create mock functions
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
  },
  student: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  individual_Tutor: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  sessions: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  free_Time_Slots: {
    findMany: jest.fn(),
    update: jest.fn(),
  },
  individual_Payments: {
    findFirst: jest.fn(),
    updateMany: jest.fn(),
  },
};

// Mock external dependencies
jest.mock('../../prismaClient', () => ({
  __esModule: true,
  default: mockPrismaClient,
}));

const mockCreateZoomMeeting = jest.fn().mockResolvedValue({
  host_url: 'https://zoom.us/host/123',
  join_url: 'https://zoom.us/join/123',
});

jest.mock('../zoom.service', () => ({
  createZoomMeeting: mockCreateZoomMeeting,
}));

jest.mock('../paymentService', () => ({
  refundPayment: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock('../email.service', () => ({
  sendSessionCancellationEmail: jest.fn().mockResolvedValue(true),
}));

// Mock Stripe
const mockStripeCustomersCreate = jest.fn().mockResolvedValue({ id: 'cus_test123' });
const mockStripeInstance = {
  customers: {
    create: mockStripeCustomersCreate,
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => mockStripeInstance);
});

// Import the service after mocking
import * as studentService from '../studentService';

// Import mocked services for assertions
const mockPaymentService = require('../paymentService');

describe('Student Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addStudent', () => {
    it('should create a new student when user exists and no existing student', async () => {
      // Arrange
      const mockUserData = { user_id: 'user123', points: 100 };
      const mockUser = { name: 'John Doe', email: 'john@example.com' };
      const mockStudent = {
        student_id: 'student123',
        user_id: 'user123',
        points: 100,
        customer_id: 'cus_test123',
      };

      // Mock Stripe customer creation
      const mockStripeCustomer = { id: 'cus_test123' };
      mockStripeCustomersCreate.mockResolvedValue(mockStripeCustomer);

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.student.findFirst.mockResolvedValue(null);
      mockPrismaClient.student.create.mockResolvedValue(mockStudent);

      // Act
      const result = await studentService.addStudent(mockUserData);

      // Assert
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: { name: true, email: true }
      });
      expect(mockPrismaClient.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user123' }
      });
      expect(result).toEqual(mockStudent);
    });

    it('should throw error when user not found', async () => {
      // Arrange
      const mockUserData = { user_id: 'user123', points: 100 };
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(studentService.addStudent(mockUserData))
        .rejects
        .toThrow('User not found for student creation');
    });

    it('should update existing student with customer_id', async () => {
      // Arrange
      const mockUserData = { user_id: 'user123', points: 100 };
      const mockUser = { name: 'John Doe', email: 'john@example.com' };
      const existingStudent = {
        student_id: 'student123',
        user_id: 'user123',
        points: 50,
        customer_id: 'cus_existing123',
      };

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.student.findFirst.mockResolvedValue(existingStudent);
      mockPrismaClient.student.update.mockResolvedValue(existingStudent);

      // Act
      const result = await studentService.addStudent(mockUserData);

      // Assert
      expect(mockPrismaClient.student.update).toHaveBeenCalledWith({
        where: { student_id: 'student123' },
        data: { points: 50 }
      });
      expect(result).toEqual(existingStudent);
    });
  });

  describe('getStudentIDByUserID', () => {
    it('should return student_id when student exists', async () => {
      // Arrange
      const mockStudent = { student_id: 'student123' };
      mockPrismaClient.student.findFirst.mockResolvedValue(mockStudent);

      // Act
      const result = await studentService.getStudentIDByUserID('user123');

      // Assert
      expect(mockPrismaClient.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user123' },
        select: { student_id: true }
      });
      expect(result).toBe('student123');
    });

    it('should return null when student does not exist', async () => {
      // Arrange
      mockPrismaClient.student.findFirst.mockResolvedValue(null);

      // Act
      const result = await studentService.getStudentIDByUserID('user123');

      // Assert
      expect(result).toBe(null);
    });
  });

  describe('getAllIndividualTutors', () => {
    it('should return filtered tutors with default parameters', async () => {
      // Arrange
      const mockTutors = [
        {
          i_tutor_id: 'tutor1',
          subjects: ['Math', 'Physics'],
          titles: ['Expert'],
          hourly_rate: 50,
          rating: 4.5,
          description: 'Great tutor',
          status: 'active',
          User: {
            name: 'Tutor 1',
            photo_url: 'photo1.jpg'
          }
        }
      ];

      mockPrismaClient.individual_Tutor.findMany.mockResolvedValue(mockTutors);

      // Act
      const result = await studentService.getAllIndividualTutors(
        '', '', '', 0, 0, 0, 'rating_desc', 1, 10
      );

      // Assert
      expect(mockPrismaClient.individual_Tutor.findMany).toHaveBeenCalledWith({
        where: {
          status: 'active'
        },
        include: {
          User: {
            select: {
              name: true,
              photo_url: true
            }
          }
        },
        orderBy: { rating: 'desc' },
        skip: 0,
        take: 10
      });
      expect(result).toEqual(mockTutors);
    });

    it('should apply filters correctly', async () => {
      // Arrange
      const mockTutors = [];
      mockPrismaClient.individual_Tutor.findMany.mockResolvedValue(mockTutors);

      // Act
      await studentService.getAllIndividualTutors(
        'John', 'Math,Physics', 'Expert', 0, 100, 4, 'price_asc', 2, 5
      );

      // Assert
      expect(mockPrismaClient.individual_Tutor.findMany).toHaveBeenCalledWith({
        where: {
          subjects: { hasSome: ['Math', 'Physics'] },
          titles: { hasSome: ['Expert'] },
          hourly_rate: { lte: 100 },
          rating: { gte: 4 },
          User: { name: { contains: 'John', mode: 'insensitive' } },
          status: 'active'
        },
        include: {
          User: {
            select: {
              name: true,
              photo_url: true
            }
          }
        },
        orderBy: { hourly_rate: 'asc' },
        skip: 5,
        take: 5
      });
    });
  });

  describe('getIndividualTutorById', () => {
    it('should return tutor with additional counts', async () => {
      // Arrange
      const mockTutor = {
        i_tutor_id: 'tutor1',
        subjects: ['Math'],
        titles: ['Expert'],
        hourly_rate: 50,
        rating: 4.5,
        description: 'Great tutor',
        User: {
          name: 'Tutor 1',
          photo_url: 'photo1.jpg',
          email: 'tutor1@example.com'
        }
      };

      mockPrismaClient.individual_Tutor.findUnique.mockResolvedValue(mockTutor);
      mockPrismaClient.sessions.findMany.mockResolvedValue([
        { student_id: 'student1' },
        { student_id: 'student2' }
      ]);
      mockPrismaClient.sessions.count.mockResolvedValue(10);

      // Act
      const result = await studentService.getIndividualTutorById('tutor1');

      // Assert
      expect(mockPrismaClient.individual_Tutor.findUnique).toHaveBeenCalledWith({
        where: { i_tutor_id: 'tutor1' },
        include: {
          User: {
            select: {
              name: true,
              photo_url: true,
              email: true
            }
          }
        }
      });

      expect(result).toEqual({
        ...mockTutor,
        uniqueStudentsCount: 2,
        completedSessionsCount: 10
      });
    });

    it('should return null when tutor not found', async () => {
      // Arrange
      mockPrismaClient.individual_Tutor.findUnique.mockResolvedValue(null);

      // Act
      const result = await studentService.getIndividualTutorById('nonexistent');

      // Assert
      expect(result).toBe(null);
    });
  });

  describe('updateSlotStatus', () => {
    it('should update slot status successfully', async () => {
      // Arrange
      const mockSlot = {
        slot_id: 'slot123',
        status: 'booked' as SlotStatus,
      };
      mockPrismaClient.free_Time_Slots.update.mockResolvedValue(mockSlot);

      // Act
      const result = await studentService.updateSlotStatus('slot123', 'booked' as SlotStatus);

      // Assert
      expect(mockPrismaClient.free_Time_Slots.update).toHaveBeenCalledWith({
        where: { slot_id: 'slot123' },
        data: { status: 'booked' }
      });
      expect(result).toEqual(mockSlot);
    });
  });

  describe('findTimeSlots', () => {
    it('should find available time slots', async () => {
      // Arrange
      const mockTimeSlots = [
        {
          slot_id: 'slot1',
          i_tutor_id: 'tutor123',
          date: new Date('2023-10-15'),
          start_time: new Date('2023-10-15T10:00:00Z'),
          status: 'free'
        }
      ];
      mockPrismaClient.free_Time_Slots.findMany.mockResolvedValue(mockTimeSlots);

      const slotsAsDate = [new Date('2023-10-15T10:00:00Z')];
      const sessionDate = new Date('2023-10-15');

      // Act
      const result = await studentService.findTimeSlots('tutor123', sessionDate, slotsAsDate);

      // Assert
      expect(mockPrismaClient.free_Time_Slots.findMany).toHaveBeenCalledWith({
        where: {
          i_tutor_id: 'tutor123',
          date: sessionDate,
          start_time: {
            in: slotsAsDate
          },
          status: 'free'
        }
      });
      expect(result).toEqual(mockTimeSlots);
    });
  });

  describe('updateAccessTimeinFreeSlots', () => {
    it('should update access time in free slots', async () => {
      // Arrange
      const accessTime = new Date();
      const mockSlot = {
        slot_id: 'slot123',
        last_access_time: accessTime,
      };
      mockPrismaClient.free_Time_Slots.update.mockResolvedValue(mockSlot);

      // Act
      const result = await studentService.updateAccessTimeinFreeSlots('slot123', accessTime);

      // Assert
      expect(mockPrismaClient.free_Time_Slots.update).toHaveBeenCalledWith({
        where: { slot_id: 'slot123' },
        data: { last_access_time: accessTime }
      });
      expect(result).toEqual(mockSlot);
    });
  });

  describe('createASession', () => {
    it('should create a session with Zoom meeting URLs', async () => {
      // Arrange
      const mockSessionData = {
        student_id: 'student123',
        i_tutor_id: 'tutor123',
        slots: [new Date('2023-10-15T10:00:00Z')],
        status: 'scheduled' as SessionStatus,
        subject: 'Math',
        price: 50,
        date: new Date('2023-10-15T10:00:00Z'),
      };

      const mockZoomMeeting = {
        host_url: 'https://zoom.us/host/123',
        join_url: 'https://zoom.us/join/123',
      };

      const mockSession = {
        session_id: 'session123',
        ...mockSessionData,
        created_at: new Date(),
        meeting_urls: [mockZoomMeeting.host_url, mockZoomMeeting.join_url],
      };

      // Mock Zoom meeting creation
      mockCreateZoomMeeting.mockResolvedValue(mockZoomMeeting);
      mockPrismaClient.sessions.create.mockResolvedValue(mockSession);

      // Act
      const result = await studentService.createASession(
        mockSessionData.student_id,
        mockSessionData.i_tutor_id,
        mockSessionData.slots,
        mockSessionData.status,
        mockSessionData.subject,
        mockSessionData.price,
        mockSessionData.date
      );

      // Assert
      expect(mockCreateZoomMeeting).toHaveBeenCalledWith(
        'Tutoring Session-student123-tutor123',
        mockSessionData.date.toISOString(),
        60
      );

      expect(mockPrismaClient.sessions.create).toHaveBeenCalledWith({
        data: {
          student_id: 'student123',
          i_tutor_id: 'tutor123',
          slots: mockSessionData.slots,
          status: 'scheduled',
          subject: 'Math',
          price: 50,
          date: mockSessionData.date,
          created_at: expect.any(Date),
          meeting_urls: ['https://zoom.us/host/123', 'https://zoom.us/join/123']
        }
      });

      expect(result).toEqual(mockSession);
    });
  });
});