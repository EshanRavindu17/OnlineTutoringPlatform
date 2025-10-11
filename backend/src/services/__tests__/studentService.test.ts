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

// Import after mocks are set up
import * as studentService from '../studentService';

// Import mocked services
const mockZoomService = require('../zoom.service');
const mockPaymentService = require('../paymentService');
const mockEmailService = require('../email.service');

// Create mock references
const mockPrisma = {
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

// Get the actual mocked prisma instance
const prisma = require('../../prismaClient').default;
Object.assign(prisma, mockPrisma);

describe('StudentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addStudent', () => {
    const mockUserData = {
      user_id: 'user123',
      points: 100,
    };

    const mockUser = {
      name: 'John Doe',
      email: 'john@example.com',
    };

    const mockStudent = {
      student_id: 'student123',
      user_id: 'user123',
      points: 100,
      customer_id: 'cus_test123',
    };

    it('should create a new student when user exists and no existing student', async () => {
      // Mock user exists
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      
      // Mock no existing student
      mockPrisma.student.findFirst.mockResolvedValue(null);
      
      // Mock Stripe customer creation
      const mockStripeCustomer = { id: 'cus_test123' };
      mockStripeCustomersCreate.mockResolvedValue(mockStripeCustomer);
      
      // Mock student creation
      mockPrisma.student.create.mockResolvedValue(mockStudent as any);

      const result = await studentService.addStudent(mockUserData);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user123' },
        select: { name: true, email: true }
      });
      
      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user123' }
      });
      
      expect(mockPrisma.student.create).toHaveBeenCalledWith({
        data: {
          user_id: 'user123',
          points: 100,
          customer_id: 'cus_test123'
        }
      });

      expect(result).toEqual(mockStudent);
    });

    it('should throw error when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(studentService.addStudent(mockUserData))
        .rejects
        .toThrow('User not found for student creation');

      expect(mockPrisma.student.findFirst).not.toHaveBeenCalled();
    });

    it('should update existing student without customer_id', async () => {
      const existingStudent = {
        student_id: 'student123',
        user_id: 'user123',
        points: 50,
        customer_id: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockPrisma.student.findFirst.mockResolvedValue(existingStudent as any);
      
      // Mock Stripe customer creation
      const mockStripeCustomer = { id: 'cus_test123' };
      mockStripeCustomersCreate.mockResolvedValue(mockStripeCustomer);
      
      mockPrisma.student.update.mockResolvedValue({ ...existingStudent, customer_id: 'cus_test123' } as any);

      const result = await studentService.addStudent(mockUserData);

      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { student_id: 'student123' },
        data: {
          points: 50,
          customer_id: 'cus_test123'
        }
      });
    });

    it('should update existing student with customer_id', async () => {
      const existingStudent = {
        student_id: 'student123',
        user_id: 'user123',
        points: 50,
        customer_id: 'cus_existing123',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
      mockPrisma.student.findFirst.mockResolvedValue(existingStudent as any);
      mockPrisma.student.update.mockResolvedValue(existingStudent as any);

      const result = await studentService.addStudent(mockUserData);

      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { student_id: 'student123' },
        data: { points: 50 }
      });
    });
  });

  describe('getStudentIDByUserID', () => {
    it('should return student_id when student exists', async () => {
      const mockStudent = { student_id: 'student123' };
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent as any);

      const result = await studentService.getStudentIDByUserID('user123');

      expect(mockPrisma.student.findFirst).toHaveBeenCalledWith({
        where: { user_id: 'user123' },
        select: { student_id: true }
      });
      expect(result).toBe('student123');
    });

    it('should return null when student does not exist', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);

      const result = await studentService.getStudentIDByUserID('user123');

      expect(result).toBe(null);
    });
  });

  describe('getAllIndividualTutors', () => {
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

    it('should return filtered tutors with default parameters', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(mockTutors as any);

      const result = await studentService.getAllIndividualTutors(
        '', '', '', 0, 0, 0, 'rating_desc', 1, 10
      );

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith({
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
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(mockTutors as any);

      const result = await studentService.getAllIndividualTutors(
        'John', 'Math,Physics', 'Expert', 20, 100, 4, 'price_asc', 2, 5
      );

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith({
        where: {
          subjects: { hasSome: ['Math', 'Physics'] },
          titles: { hasSome: ['Expert'] },
          hourly_rate: { gte: 20, lte: 100 },
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

    it('should return tutor with additional counts', async () => {
      mockPrisma.individual_Tutor.findUnique.mockResolvedValue(mockTutor as any);
      mockPrisma.sessions.findMany.mockResolvedValue([
        { student_id: 'student1' },
        { student_id: 'student2' }
      ] as any);
      mockPrisma.sessions.count.mockResolvedValue(10);

      const result = await studentService.getIndividualTutorById('tutor1');

      expect(mockPrisma.individual_Tutor.findUnique).toHaveBeenCalledWith({
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

      expect(mockPrisma.sessions.findMany).toHaveBeenCalledWith({
        where: { i_tutor_id: 'tutor1' },
        distinct: ['student_id'],
        select: { student_id: true }
      });

      expect(mockPrisma.sessions.count).toHaveBeenCalledWith({
        where: {
          i_tutor_id: 'tutor1',
          status: 'completed'
        }
      });

      expect(result).toEqual({
        ...mockTutor,
        uniqueStudentsCount: 2,
        completedSessionsCount: 10
      });
    });

    it('should return null when tutor not found', async () => {
      mockPrisma.individual_Tutor.findUnique.mockResolvedValue(null);

      const result = await studentService.getIndividualTutorById('nonexistent');

      expect(result).toBe(null);
    });
  });

  describe('createASession', () => {
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

    it('should create a session with Zoom meeting URLs', async () => {
      mockCreateZoomMeeting.mockResolvedValue(mockZoomMeeting as any);
      mockPrisma.sessions.create.mockResolvedValue(mockSession as any);

      const result = await studentService.createASession(
        mockSessionData.student_id,
        mockSessionData.i_tutor_id,
        mockSessionData.slots,
        mockSessionData.status,
        mockSessionData.subject,
        mockSessionData.price,
        mockSessionData.date
      );

      expect(mockCreateZoomMeeting).toHaveBeenCalledWith(
        'Tutoring Session-student123-tutor123',
        mockSessionData.date.toISOString(),
        60 // 1 slot * 60 minutes
      );

      expect(mockPrisma.sessions.create).toHaveBeenCalledWith({
        data: {
          student_id: 'student123',
          i_tutor_id: 'tutor123',
          slots: mockSessionData.slots,
          status: 'scheduled',
          subject: 'Math',
          price: 50,
          date: mockSessionData.date,
          created_at: expect.any(Date),
          meeting_urls: [mockZoomMeeting.host_url, mockZoomMeeting.join_url]
        }
      });

      expect(result).toEqual(mockSession);
    });
  });

  describe('updateSlotStatus', () => {
    const mockSlot = {
      slot_id: 'slot123',
      status: 'booked' as SlotStatus,
    };

    it('should update slot status successfully', async () => {
      mockPrisma.free_Time_Slots.update.mockResolvedValue(mockSlot as any);

      const result = await studentService.updateSlotStatus('slot123', 'booked' as SlotStatus);

      expect(mockPrisma.free_Time_Slots.update).toHaveBeenCalledWith({
        where: { slot_id: 'slot123' },
        data: { status: 'booked' }
      });

      expect(result).toEqual(mockSlot);
    });
  });

  describe('findTimeSlots', () => {
    const mockTimeSlots = [
      {
        slot_id: 'slot1',
        i_tutor_id: 'tutor123',
        date: new Date('2023-10-15'),
        start_time: new Date('2023-10-15T10:00:00Z'),
        status: 'free'
      }
    ];

    it('should find available time slots', async () => {
      mockPrisma.free_Time_Slots.findMany.mockResolvedValue(mockTimeSlots as any);

      const slotsAsDate = [new Date('2023-10-15T10:00:00Z')];
      const sessionDate = new Date('2023-10-15');

      const result = await studentService.findTimeSlots('tutor123', sessionDate, slotsAsDate);

      expect(mockPrisma.free_Time_Slots.findMany).toHaveBeenCalledWith({
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
    const mockSlot = {
      slot_id: 'slot123',
      last_access_time: new Date(),
    };

    it('should update access time in free slots', async () => {
      const accessTime = new Date();
      mockPrisma.free_Time_Slots.update.mockResolvedValue(mockSlot as any);

      const result = await studentService.updateAccessTimeinFreeSlots('slot123', accessTime);

      expect(mockPrisma.free_Time_Slots.update).toHaveBeenCalledWith({
        where: { slot_id: 'slot123' },
        data: { last_access_time: accessTime }
      });

      expect(result).toEqual(mockSlot);
    });
  });

  describe('cancelSession', () => {
    const mockSession = {
      session_id: 'session123',
      student_id: 'student123',
      i_tutor_id: 'tutor123',
      slots: [new Date('2023-10-15T10:00:00Z')],
      date: new Date('2023-10-15'),
      price: 50,
      status: 'scheduled'
    };

    const mockTimeSlots = [
      {
        slot_id: 'slot1',
        i_tutor_id: 'tutor123',
        date: new Date('2023-10-15'),
        start_time: new Date('2023-10-15T10:00:00Z'),
        status: 'booked'
      }
    ];

    const mockPayment = {
      payment_intent_id: 'pi_test123',
      session_id: 'session123'
    };

    beforeEach(() => {
      mockPrisma.sessions.findUnique.mockResolvedValue(mockSession as any);
      mockPrisma.free_Time_Slots.findMany.mockResolvedValue(mockTimeSlots as any);
      mockPrisma.individual_Payments.findFirst.mockResolvedValue(mockPayment as any);
      mockPaymentService.refundPayment.mockResolvedValue({ success: true } as any);
      mockPrisma.free_Time_Slots.update.mockResolvedValue(mockTimeSlots[0] as any);
      mockPrisma.sessions.update.mockResolvedValue({ ...mockSession, status: 'canceled' } as any);
      mockPrisma.individual_Payments.updateMany.mockResolvedValue({ count: 1 } as any);
      mockPrisma.student.findUnique.mockResolvedValue({
        User: { name: 'Student Name', email: 'student@example.com' }
      } as any);
      mockPrisma.individual_Tutor.findUnique.mockResolvedValue({
        User: { name: 'Tutor Name', email: 'tutor@example.com' }
      } as any);
    });

    it('should successfully cancel a session', async () => {
      const result = await studentService.cancelSession('session123');

      expect(mockPrisma.sessions.findUnique).toHaveBeenCalledWith({
        where: { session_id: 'session123' }
      });

      expect(mockPrisma.free_Time_Slots.findMany).toHaveBeenCalledWith({
        where: {
          i_tutor_id: 'tutor123',
          date: mockSession.date,
          start_time: {
            in: mockSession.slots
          },
          status: 'booked'
        }
      });

      expect(mockPaymentService.refundPayment).toHaveBeenCalledWith(
        'pi_test123',
        Math.round(50 / 300)
      );

      expect(mockPrisma.sessions.update).toHaveBeenCalledWith({
        where: { session_id: 'session123' },
        data: { status: 'canceled' }
      });
    });

    it('should throw error when session not found', async () => {
      mockPrisma.sessions.findUnique.mockResolvedValue(null);

      await expect(studentService.cancelSession('nonexistent'))
        .rejects
        .toThrow('Session not found');
    });

    it('should throw error when session is already canceled', async () => {
      mockPrisma.sessions.findUnique.mockResolvedValue({
        ...mockSession,
        status: 'canceled'
      } as any);

      await expect(studentService.cancelSession('session123'))
        .rejects
        .toThrow('Session is already canceled');
    });

    it('should throw error when no booked slots found', async () => {
      mockPrisma.free_Time_Slots.findMany.mockResolvedValue([]);

      await expect(studentService.cancelSession('session123'))
        .rejects
        .toThrow('No booked slots found for this session');
    });

    it('should throw error when payment intent ID not found', async () => {
      mockPrisma.individual_Payments.findFirst.mockResolvedValue(null);

      await expect(studentService.cancelSession('session123'))
        .rejects
        .toThrow('Payment intent ID not found for this session');
    });
  });

  describe('getAllSessionByStudentId', () => {
    const mockSessions = [
      {
        session_id: 'session1',
        student_id: 'student123',
        i_tutor_id: 'tutor123',
        status: 'completed',
        Individual_Tutor: {
          User: { name: 'Tutor 1' }
        },
        Rating_N_Review_Session: [
          { r_id: 'rating1' }
        ]
      },
      {
        session_id: 'session2',
        student_id: 'student123',
        i_tutor_id: 'tutor456',
        status: 'scheduled',
        Individual_Tutor: {
          User: { name: 'Tutor 2' }
        },
        Rating_N_Review_Session: []
      }
    ];

    it('should return all sessions for a student', async () => {
      mockPrisma.sessions.findMany.mockResolvedValue(mockSessions as any);

      const result = await studentService.getAllSessionByStudentId('student123');

      expect(mockPrisma.sessions.findMany).toHaveBeenCalledWith({
        where: { student_id: 'student123' },
        select: {
          session_id: true,
          start_time: true,
          end_time: true,
          status: true,
          materials: true,
          slots: true,
          meeting_urls: true,
          date: true,
          created_at: true,
          title: true,
          Individual_Tutor: {
            select: {
              User: {
                select: {
                  name: true,
                }
              }
            }
          },
          Rating_N_Review_Session: {
            where: { student_id: 'student123' },
            select: {
              r_id: true,
            }
          }
        },
        orderBy: {
          date: 'desc',
        }
      });

      expect(result).toEqual([
        {
          ...mockSessions[0],
          reviewed: true
        },
        {
          ...mockSessions[1],
          reviewed: false
        }
      ]);
    });
  });

  describe('getSlotsOfIndividualTutorById', () => {
    const mockSlots = [
      {
        slot_id: 'slot1',
        i_tutor_id: 'tutor123',
        date: new Date('2023-10-15'),
        start_time: new Date('2023-10-15T10:00:00Z'),
        end_time: new Date('2023-10-15T11:00:00Z'),
        status: 'free'
      }
    ];

    it('should return slots for a tutor', async () => {
      mockPrisma.free_Time_Slots.findMany.mockResolvedValue(mockSlots as any);

      const result = await studentService.getSlotsOfIndividualTutorById('tutor123');

      // Verify the call was made with the expected structure
      expect(mockPrisma.free_Time_Slots.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            i_tutor_id: 'tutor123',
            status: 'free',
            OR: expect.any(Array)
          })
        })
      );

      expect(result).toEqual(mockSlots);
    });
  });
});