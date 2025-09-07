// Mock environment variables first
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';

import request from 'supertest';
import express from 'express';
import { getAllIndividualTutors } from '../services/studentService';

// Mock the entire prismaClient module
jest.mock('../prismaClient', () => ({
  individual_Tutor: {
    findMany: jest.fn(),
  },
}));

// Import after mocking
import studentsRoutes from '../routes/studentsRoutes';
import prisma from '../prismaClient';

// Type assertion for mocked functions
const mockPrisma = prisma as {
  individual_Tutor: {
    findMany: jest.MockedFunction<any>;
  };
};

// Create express app with routes for testing
const app = express();
app.use(express.json());
app.use('/api/students', studentsRoutes);

describe('getAllIndividualTutors Endpoint Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTutors = [
    {
      i_tutor_id: 'tutor1',
      subjects: ['Math', 'Science'],
      titles: ['PhD', 'MSc'],
      hourly_rate: 50,
      rating: 4.5,
      description: 'Experienced math tutor',
      heading: 'Math Expert',
      User: {
        name: 'John Doe',
        photo_url: 'https://example.com/photo1.jpg'
      }
    },
    {
      i_tutor_id: 'tutor2',
      subjects: ['English', 'Literature'],
      titles: ['MA', 'BA'],
      hourly_rate: 40,
      rating: 4.2,
      description: 'English language specialist',
      heading: 'Language Expert',
      User: {
        name: 'Jane Smith',
        photo_url: 'https://example.com/photo2.jpg'
      }
    }
  ];

  // ==========================================
  // SERVICE LAYER TESTS
  // ==========================================
  describe('Service Layer - getAllIndividualTutors', () => {
    it('should return all tutors with no filters', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(mockTutors);

      const result = await getAllIndividualTutors('', '', 0, 0, 0, '', 1, 10);

      expect(result).toEqual(mockTutors);
      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith({
        where: {},
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
    });

    it('should filter tutors by subjects', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[0]]);

      await getAllIndividualTutors('Math,Science', '', 0, 0, 0, '', 1, 10);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith({
        where: {
          subjects: { hasSome: ['Math', 'Science'] }
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
    });

    it('should filter tutors by titles', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[0]]);

      await getAllIndividualTutors('', 'PhD,MSc', 0, 0, 0, '', 1, 10);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith({
        where: {
          titles: { hasSome: ['PhD', 'MSc'] }
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
    });

    it('should filter by minimum hourly rate', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[0]]);

      await getAllIndividualTutors('', '', 45, 0, 0, '', 1, 10);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith({
        where: {
          hourly_rate: { gte: 45 }
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
    });

    it('should filter by maximum hourly rate', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[1]]);

      await getAllIndividualTutors('', '', 0, 45, 0, '', 1, 10);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith({
        where: {
          hourly_rate: { lte: 45 }
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
    });

    it('should filter by minimum rating', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[0]]);

      await getAllIndividualTutors('', '', 0, 0, 4.3, '', 1, 10);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith({
        where: {
          rating: { gte: 4.3 }
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
    });

    it('should sort by price ascending', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[1], mockTutors[0]]);

      await getAllIndividualTutors('', '', 0, 0, 0, 'price_asc', 1, 10);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { hourly_rate: 'asc' }
        })
      );
    });

    it('should sort by price descending', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(mockTutors);

      await getAllIndividualTutors('', '', 0, 0, 0, 'price_desc', 1, 10);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { hourly_rate: 'desc' }
        })
      );
    });

    it('should sort by rating ascending', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[1], mockTutors[0]]);

      await getAllIndividualTutors('', '', 0, 0, 0, 'rating_asc', 1, 10);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rating: 'asc' }
        })
      );
    });

    it('should handle pagination correctly', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[0]]);

      await getAllIndividualTutors('', '', 0, 0, 0, '', 3, 5);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, // (3 - 1) * 5
          take: 5
        })
      );
    });

    it('should handle combined filters', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[0]]);

      await getAllIndividualTutors('Math', 'PhD', 0, 80, 4.0, 'price_asc', 2, 5);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith({
        where: {
          subjects: { hasSome: ['Math'] },
          titles: { hasSome: ['PhD'] },
          hourly_rate: { lte: 80 },
          rating: { gte: 4.0 }
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

    it('should handle subjects with spaces correctly', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[0]]);

      await getAllIndividualTutors('Computer Science, Data Analytics', '', 0, 0, 0, '', 1, 10);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            subjects: { hasSome: ['Computer Science', 'Data Analytics'] }
          }
        })
      );
    });

    it('should handle empty results', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([]);

      const result = await getAllIndividualTutors('', '', 0, 0, 0, '', 1, 10);

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should propagate database errors', async () => {
      const databaseError = new Error('Database connection failed');
      mockPrisma.individual_Tutor.findMany.mockRejectedValue(databaseError);

      await expect(
        getAllIndividualTutors('', '', 0, 0, 0, '', 1, 10)
      ).rejects.toThrow('Database connection failed');
    });

    it('should use default sorting for unknown sort parameter', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(mockTutors);

      await getAllIndividualTutors('', '', 0, 0, 0, 'invalid_sort', 1, 10);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rating: 'desc' } // Should default to rating desc
        })
      );
    });
  });

  // ==========================================
  // API INTEGRATION TESTS
  // ==========================================
  describe('API Endpoint - GET /api/students/getAllIndividualTutors', () => {
    it('should return 200 with tutors data', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(mockTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .expect(200);

      expect(response.body).toEqual(mockTutors);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle subject filtering via query parameters', async () => {
      const filteredTutors = [mockTutors[0]];
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(filteredTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ subjects: 'Math,Science' })
        .expect(200);

      expect(response.body).toEqual(filteredTutors);
    });

    it('should handle title filtering via query parameters', async () => {
      const filteredTutors = [mockTutors[0]];
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(filteredTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ titles: 'PhD,MSc' })
        .expect(200);

      expect(response.body).toEqual(filteredTutors);
    });

    it('should handle hourly rate range filtering', async () => {
      const filteredTutors = [mockTutors[1]];
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(filteredTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ min_hourly_rate: 30, max_hourly_rate: 45 })
        .expect(200);

      expect(response.body).toEqual(filteredTutors);
    });

    it('should handle rating filtering', async () => {
      const filteredTutors = [mockTutors[0]];
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(filteredTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ rating: 4.3 })
        .expect(200);

      expect(response.body).toEqual(filteredTutors);
    });

    it('should handle sorting by price ascending', async () => {
      const sortedTutors = [mockTutors[1], mockTutors[0]];
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(sortedTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ sort: 'price_asc' })
        .expect(200);

      expect(response.body).toEqual(sortedTutors);
    });

    it('should handle sorting by rating descending', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(mockTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ sort: 'rating_desc' })
        .expect(200);

      expect(response.body).toEqual(mockTutors);
    });

    it('should handle multiple query parameters', async () => {
      const filteredTutors = [mockTutors[0]];
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(filteredTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({
          subjects: 'Math',
          min_hourly_rate: 45,
          rating: 4.0,
          sort: 'price_asc'
        })
        .expect(200);

      expect(response.body).toEqual(filteredTutors);
    });

    it('should return empty array when no tutors found', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const databaseError = new Error('Database connection failed');
      mockPrisma.individual_Tutor.findMany.mockRejectedValue(databaseError);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .expect(500);

      expect(response.body).toEqual({
        message: 'Internal server error'
      });
    });

    it('should handle invalid numeric parameters gracefully', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(mockTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ 
          min_hourly_rate: 'invalid',
          max_hourly_rate: 'also_invalid',
          rating: 'not_a_number'
        })
        .expect(200);

      // Should still return data despite invalid parameters
      expect(response.body).toEqual(mockTutors);
    });

    it('should handle Prisma client timeout errors', async () => {
      const timeoutError = new Error('Query timeout');
      timeoutError.name = 'PrismaClientKnownRequestError';
      mockPrisma.individual_Tutor.findMany.mockRejectedValue(timeoutError);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .expect(500);

      expect(response.body).toEqual({
        message: 'Internal server error'
      });
    });

    it('should handle empty string filters', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(mockTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ subjects: '', titles: '' })
        .expect(200);

      expect(response.body).toEqual(mockTutors);
    });

    it('should handle single subject without comma', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[0]]);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ subjects: 'Math' })
        .expect(200);

      expect(response.body).toEqual([mockTutors[0]]);
    });

    it('should handle subjects with spaces correctly', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([mockTutors[0]]);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ subjects: 'Computer Science, Data Analytics' })
        .expect(200);

      expect(response.body).toEqual([mockTutors[0]]);
    });

    it('should use default sorting when sort parameter is invalid', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(mockTutors);

      const response = await request(app)
        .get('/api/students/getAllIndividualTutors')
        .query({ sort: 'invalid_sort' })
        .expect(200);

      expect(response.body).toEqual(mockTutors);
    });
  });

  // ==========================================
  // EDGE CASE TESTS
  // ==========================================
  describe('Edge Cases', () => {
    it('should handle very large pagination values', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([]);

      await getAllIndividualTutors('', '', 0, 0, 0, '', 1000, 1000);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 999000, // (1000 - 1) * 1000
          take: 1000
        })
      );
    });

    it('should handle zero pagination values', async () => {
      mockPrisma.individual_Tutor.findMany.mockResolvedValue([]);

      await getAllIndividualTutors('', '', 0, 0, 0, '', 0, 0);

      expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: -0, // (0 - 1) * 0 = -0
          take: 0
        })
      );
    });

    it('should handle null User data gracefully', async () => {
      const tutorsWithNullUser = [{
        ...mockTutors[0],
        User: null
      }];
      
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(tutorsWithNullUser);

      const result = await getAllIndividualTutors('', '', 0, 0, 0, '', 1, 10);

      expect(result).toEqual(tutorsWithNullUser);
    });

    it('should handle empty subjects and titles arrays', async () => {
      const tutorsWithEmptyArrays = [{
        ...mockTutors[0],
        subjects: [],
        titles: []
      }];
      
      mockPrisma.individual_Tutor.findMany.mockResolvedValue(tutorsWithEmptyArrays);

      const result = await getAllIndividualTutors('', '', 0, 0, 0, '', 1, 10);

      expect(result).toEqual(tutorsWithEmptyArrays);
    });
  });
});
