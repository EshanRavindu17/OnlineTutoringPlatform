import prisma from '../prismaClient';
import { getTutorIdByFirebaseUid } from './scheduleService';

export interface ReviewData {
  review_id: string;
  student_name: string;
  student_photo?: string;
  rating: number;
  review: string;
  subject: string;
  date: Date;
  session_id: string;
  isVerified: boolean;
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  recentReviews: ReviewData[];
  subjectRatings: { [subject: string]: { count: number; average: number } };
  monthlyReviews: { [month: string]: number };
  responseRate: number;
}

export interface FilterOptions {
  rating?: number;
  subject?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

class ReviewsService {
  // Get all reviews for a tutor
  async getTutorReviews(userId: string, options: FilterOptions = {}): Promise<ReviewData[]> {
    try {
      const tutorId = await getTutorIdByFirebaseUid(userId);
      
      // Build where clause based on filters
      const whereClause: any = {
        Sessions: {
          i_tutor_id: tutorId,
          status: 'completed' // Only completed sessions can have reviews
        }
      };

      if (options.rating) {
        whereClause.rating = options.rating;
      }

      if (options.dateFrom || options.dateTo) {
        whereClause.Sessions.date = {};
        if (options.dateFrom) {
          whereClause.Sessions.date.gte = options.dateFrom;
        }
        if (options.dateTo) {
          whereClause.Sessions.date.lte = options.dateTo;
        }
      }

      const reviews = await prisma.rating_N_Review_Session.findMany({
        where: whereClause,
        include: {
          Sessions: {
            include: {
              Student: {
                include: {
                  User: true
                }
              }
            }
          }
        },
        orderBy: {
          r_id: 'asc' // Use r_id instead of review_date
        },
        skip: options.offset || 0,
        take: options.limit || 50
      });

      return reviews.map(review => ({
        review_id: review.r_id,
        student_name: review.Sessions?.Student?.User?.name || 'Anonymous Student',
        // student_photo: review.Sessions?.Student?.User?.photo_url || null,
        rating: Number(review.rating || 0),
        review: review.review || '',
        subject: review.Sessions?.title || 'General',
        date: review.Sessions?.date || new Date(),
        session_id: review.session_id || '',
        isVerified: true // All reviews from completed sessions are verified
      }));
    } catch (error) {
      console.error('Error getting tutor reviews:', error);
      throw new Error('Failed to get reviews');
    }
  }

  // Get comprehensive review statistics
  async getReviewStatistics(userId: string): Promise<ReviewStatistics> {
    try {
      const tutorId = await getTutorIdByFirebaseUid(userId);
      
      // Get all reviews for the tutor
      const allReviews = await prisma.rating_N_Review_Session.findMany({
        where: {
          Sessions: {
            i_tutor_id: tutorId,
            status: 'completed'
          }
        },
        include: {
          Sessions: {
            include: {
              Student: {
                include: {
                  User: true
                }
              }
            }
          }
        },
        orderBy: {
          r_id: 'desc'
        }
      });

      // Calculate basic statistics
      const totalReviews = allReviews.length;
      const averageRating = totalReviews > 0 
        ? allReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / totalReviews 
        : 0;

      // Calculate rating distribution
      const ratingDistribution = {
        5: allReviews.filter(r => Number(r.rating || 0) === 5).length,
        4: allReviews.filter(r => Number(r.rating || 0) === 4).length,
        3: allReviews.filter(r => Number(r.rating || 0) === 3).length,
        2: allReviews.filter(r => Number(r.rating || 0) === 2).length,
        1: allReviews.filter(r => Number(r.rating || 0) === 1).length
      };

      // Get recent reviews (last 5)
      const recentReviews = allReviews.slice(0, 5).map(review => ({
        review_id: review.r_id,
        student_name: review.Sessions?.Student?.User?.name || 'Anonymous Student',
        student_photo: review.Sessions?.Student?.User?.photo_url || null,
        rating: Number(review.rating || 0),
        review: review.review || '',
        subject: review.Sessions?.title || 'General',
        date: review.Sessions?.date || new Date(),
        session_id: review.session_id || '',
        isVerified: true
      }));

      // Calculate subject ratings
      const subjectRatings: { [subject: string]: { count: number; average: number } } = {};
      
      allReviews.forEach(review => {
        const subject = review.Sessions?.subject;
        if (!subjectRatings[subject]) {
          subjectRatings[subject] = { count: 0, average: 0 };
        }
        subjectRatings[subject].count++;
      });

      // Calculate averages for each subject
      Object.keys(subjectRatings).forEach(subject => {
        const subjectReviews = allReviews.filter(r => (r.Sessions?.subject || 'General') === subject);
        const average = subjectReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / subjectReviews.length;
        subjectRatings[subject].average = Math.round(average * 10) / 10; 
      });

      // Calculate monthly reviews for the last 12 months
      const monthlyReviews: { [month: string]: number } = {};
      const now = new Date();
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        const monthReviews = allReviews.filter(review => {
          const reviewDate = review.Sessions?.date;
          if (!reviewDate) return false;
          const reviewMonth = new Date(reviewDate);
          return reviewMonth.getMonth() === date.getMonth() && 
                 reviewMonth.getFullYear() === date.getFullYear();
        });
        
        monthlyReviews[monthKey] = monthReviews.length;
      }

      // Calculate response rate (assuming tutors should respond to reviews - for now set to high default)
      const responseRate = 95; // This could be calculated based on actual tutor responses

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        recentReviews,
        subjectRatings,
        monthlyReviews,
        responseRate
      };
    } catch (error) {
      console.error('Error getting review statistics:', error);
      throw new Error('Failed to get review statistics');
    }
  }

  // Get reviews by rating
  async getReviewsByRating(userId: string, rating: number): Promise<ReviewData[]> {
    return this.getTutorReviews(userId, { rating });
  }

  // Get reviews by subject
  async getReviewsBySubject(userId: string, subject: string): Promise<ReviewData[]> {
    return this.getTutorReviews(userId, { subject });
  }

  // Get reviews in date range
  async getReviewsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<ReviewData[]> {
    return this.getTutorReviews(userId, { dateFrom: startDate, dateTo: endDate });
  }

  // Get review analytics
  async getReviewAnalytics(userId: string) {
    try {
      const tutorId = await getTutorIdByFirebaseUid(userId);
      
      // Get total sessions and reviewed sessions
      const totalSessions = await prisma.sessions.count({
        where: {
          i_tutor_id: tutorId,
          status: 'completed'
        }
      });

      const reviewedSessions = await prisma.sessions.count({
        where: {
          i_tutor_id: tutorId,
          status: 'completed',
          Rating_N_Review_Session: {
            some: {}
          }
        }
      });

      // Get average ratings over time (last 12 months)
      const monthlyRatings: { [month: string]: number } = {};
      
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        const monthlyReviews = await prisma.rating_N_Review_Session.findMany({
          where: {
            Sessions: {
              i_tutor_id: tutorId,
              status: 'completed',
              date: {
                gte: new Date(date.getFullYear(), date.getMonth(), 1),
                lt: new Date(date.getFullYear(), date.getMonth() + 1, 1)
              }
            }
          }
        });
        
        const average = monthlyReviews.length > 0 
          ? monthlyReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / monthlyReviews.length
          : 0;
        
        monthlyRatings[monthKey] = Math.round(average * 10) / 10;
      }

      return {
        totalSessions,
        reviewedSessions,
        reviewRate: totalSessions > 0 ? (reviewedSessions / totalSessions) * 100 : 0,
        monthlyRatings,
        improvementTrends: this.calculateImprovementTrends(monthlyRatings)
      };
    } catch (error) {
      console.error('Error getting review analytics:', error);
      throw new Error('Failed to get review analytics');
    }
  }

  // Helper method to calculate improvement trends
  private calculateImprovementTrends(monthlyRatings: { [month: string]: number }) {
    const values = Object.values(monthlyRatings).filter(v => v > 0);
    if (values.length < 2) return 'insufficient_data';
    
    const recent = values.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, values.length);
    const earlier = values.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, values.length - 3);
    
    if (recent > earlier + 0.2) return 'improving';
    if (recent < earlier - 0.2) return 'declining';
    return 'stable';
  }

  // Get top-rated sessions
  async getTopRatedSessions(userId: string, limit: number = 10): Promise<ReviewData[]> {
    try {
      const tutorId = await getTutorIdByFirebaseUid(userId);
      
      const topReviews = await prisma.rating_N_Review_Session.findMany({
        where: {
          Sessions: {
            i_tutor_id: tutorId,
            status: 'completed'
          },
          rating: {
            gte: 4 // 4 stars and above
          }
        },
        include: {
          Sessions: {
            include: {
              Student: {
                include: {
                  User: true
                }
              }
            }
          }
        },
        orderBy: [
          { rating: 'desc' },
          { r_id: 'desc' }
        ],
        take: limit
      });

      return topReviews.map(review => ({
        review_id: review.r_id,
        student_name: review.Sessions?.Student?.User?.name || 'Anonymous Student',
        student_photo: review.Sessions?.Student?.User?.photo_url || null,
        rating: Number(review.rating || 0),
        review: review.review || '',
        subject: review.Sessions?.title || 'General',
        date: review.Sessions?.date || new Date(),
        session_id: review.session_id || '',
        isVerified: true
      }));
    } catch (error) {
      console.error('Error getting top-rated sessions:', error);
      throw new Error('Failed to get top-rated sessions');
    }
  }
}

export const reviewsService = new ReviewsService();