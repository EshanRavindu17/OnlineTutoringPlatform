import { createPaymentRecord } from '../paymentService';
import prisma from '../../prismaClient';

// Mock Prisma client
jest.mock('../../prismaClient', () => ({
  individual_Payments: {
    create: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Payment Service - Critical Payment Processing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentRecord', () => {
    it('should create payment record successfully', async () => {
      const paymentData = {
        payment_intent_id: 'pi_test_123',
        amount: 5000,
        currency: 'usd',
        status: 'succeeded',
        student_id: 'student_123',
        i_tutor_id: 'tutor_123',
        session_id: 'session_123',
      };

      const mockPaymentRecord = {
        id: 1,
        ...paymentData,
        payment_date_time: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      (mockPrisma.individual_Payments.create as jest.Mock).mockResolvedValue(mockPaymentRecord as any);

      const result = await createPaymentRecord(paymentData);

      expect(mockPrisma.individual_Payments.create).toHaveBeenCalledWith({
        data: {
          ...paymentData,
          payment_date_time: expect.any(Date),
        },
      });
      expect(result).toEqual(mockPaymentRecord);
    });

    it('should handle different payment statuses', async () => {
      const paymentData = {
        payment_intent_id: 'pi_test_456',
        amount: 10000,
        currency: 'eur',
        status: 'requires_payment_method',
        student_id: 'student_456',
        i_tutor_id: 'tutor_456',
        session_id: 'session_456',
      };

      const mockPaymentRecord = {
        id: 2,
        ...paymentData,
        payment_date_time: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      (mockPrisma.individual_Payments.create as jest.Mock).mockResolvedValue(mockPaymentRecord as any);

      const result = await createPaymentRecord(paymentData);

      expect(result).toEqual(mockPaymentRecord);
    });

    it('should handle zero amount payments', async () => {
      const paymentData = {
        payment_intent_id: 'pi_test_zero',
        amount: 0,
        currency: 'usd',
        status: 'succeeded',
        student_id: 'student_zero',
        i_tutor_id: 'tutor_zero',
        session_id: 'session_zero',
      };

      const mockPaymentRecord = {
        id: 3,
        ...paymentData,
        payment_date_time: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      (mockPrisma.individual_Payments.create as jest.Mock).mockResolvedValue(mockPaymentRecord as any);

      const result = await createPaymentRecord(paymentData);

      expect(result).toEqual(mockPaymentRecord);
    });

    it('should handle database errors', async () => {
      const paymentData = {
        payment_intent_id: 'pi_test_error',
        amount: 5000,
        currency: 'usd',
        status: 'succeeded',
        student_id: 'student_error',
        i_tutor_id: 'tutor_error',
        session_id: 'session_error',
      };

      const dbError = new Error('Database connection failed');
      (mockPrisma.individual_Payments.create as jest.Mock).mockRejectedValue(dbError);

      await expect(createPaymentRecord(paymentData)).rejects.toThrow('Database connection failed');
    });

    it('should handle validation errors', async () => {
      const paymentData = {
        payment_intent_id: 'pi_test_validation',
        amount: -1000, // Invalid negative amount
        currency: 'usd',
        status: 'succeeded',
        student_id: 'student_validation',
        i_tutor_id: 'tutor_validation',
        session_id: 'session_validation',
      };

      const validationError = new Error('Invalid payment data');
      (mockPrisma.individual_Payments.create as jest.Mock).mockRejectedValue(validationError);

      await expect(createPaymentRecord(paymentData)).rejects.toThrow('Invalid payment data');
    });

    it('should handle network timeout errors', async () => {
      const paymentData = {
        payment_intent_id: 'pi_test_timeout',
        amount: 5000,
        currency: 'usd',
        status: 'succeeded',
        student_id: 'student_timeout',
        i_tutor_id: 'tutor_timeout',
        session_id: 'session_timeout',
      };

      const timeoutError = new Error('Request timeout');
      (mockPrisma.individual_Payments.create as jest.Mock).mockRejectedValue(timeoutError);

      await expect(createPaymentRecord(paymentData)).rejects.toThrow('Request timeout');
    });
  });
});