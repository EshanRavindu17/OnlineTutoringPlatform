import prisma from '../prismaClient';
import { getTutorIdByFirebaseUid } from './scheduleService';

export interface EarningsStatistics {
  totalEarnings: number;
  adminCommission: number;
  netEarnings: number;
  totalSessions: number;
  completedSessions: number;
  averageSessionValue: number;
  thisMonthEarnings: number;
  thisWeekEarnings: number;
  todayEarnings: number;
  pendingPayments: number;
  paidPayments: number;
  yearlyEarnings: { [month: string]: number };
  monthlyBreakdown: EarningsBreakdown[];
}

export interface EarningsBreakdown {
  month: string;
  year: number;
  sessions: number;
  grossEarnings: number;
  commission: number;
  netEarnings: number;
}

export interface RecentPayment {
  session_id: string;
  student_name: string;
  subject: string;
  amount: number;
  commission: number;
  net_amount: number;
  date: Date;
  payment_status: string;
}

class EarningsService {
  // Get comprehensive earnings statistics for a tutor
  async getTutorEarnings(userId: string): Promise<EarningsStatistics> {
    try {
      // Get tutor ID first
      const tutorId = await getTutorIdByFirebaseUid(userId);
      
      // Get all successful payments for the tutor's sessions
      const successfulPayments = await prisma.individual_Payments.findMany({
        where: {
          status: 'success',
          Sessions: {
            i_tutor_id: tutorId
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
          payment_date_time: 'desc'
        }
      });

      // Calculate date ranges
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Calculate basic statistics
      const totalPayments = successfulPayments.length;
      const totalGross = successfulPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const commissionRate = 0.10; // 10% commission
      const totalCommission = totalGross * commissionRate;
      const totalNet = totalGross - totalCommission;

      // Calculate time-based earnings
      const thisMonthPayments = successfulPayments.filter(p => p.payment_date_time && new Date(p.payment_date_time) >= startOfMonth);
      const thisMonthEarnings = thisMonthPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      const thisWeekPayments = successfulPayments.filter(p => p.payment_date_time && new Date(p.payment_date_time) >= startOfWeek);
      const thisWeekEarnings = thisWeekPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      const todayPayments = successfulPayments.filter(p => p.payment_date_time && new Date(p.payment_date_time) >= startOfToday);
      const todayEarnings = todayPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

      // Get all sessions (including pending) for session status
      const allSessions = await prisma.sessions.findMany({
        where: {
          i_tutor_id: tutorId,
          status: { in: ['completed', 'scheduled'] }
        }
      });

      const completedSessionsCount = allSessions.filter(s => s.status === 'completed').length;
      const pendingSessionsCount = allSessions.filter(s => s.status === 'scheduled').length;

      // Calculate yearly breakdown
      const yearlyEarnings: { [month: string]: number } = {};
      const currentYear = now.getFullYear();
      
      for (let month = 0; month < 12; month++) {
        const monthName = new Date(currentYear, month).toLocaleString('default', { month: 'short' });
        const monthPayments = successfulPayments.filter(p => {
          if (!p.payment_date_time) return false;
          const paymentDate = new Date(p.payment_date_time);
          return paymentDate.getFullYear() === currentYear && paymentDate.getMonth() === month;
        });
        yearlyEarnings[monthName] = monthPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      }

      // Calculate monthly breakdown for last 12 months
      const monthlyBreakdown: EarningsBreakdown[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        
        const monthPayments = successfulPayments.filter(p => {
          if (!p.payment_date_time) return false;
          const paymentDate = new Date(p.payment_date_time);
          return paymentDate.getFullYear() === year && paymentDate.getMonth() === date.getMonth();
        });
        
        const grossEarnings = monthPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
        const commission = grossEarnings * commissionRate;
        
        monthlyBreakdown.push({
          month,
          year,
          sessions: monthPayments.length,
          grossEarnings,
          commission,
          netEarnings: grossEarnings - commission
        });
      }

      return {
        totalEarnings: totalGross,
        adminCommission: totalCommission,
        netEarnings: totalNet,
        totalSessions: allSessions.length,
        completedSessions: completedSessionsCount,
        averageSessionValue: totalPayments > 0 ? totalGross / totalPayments : 0,
        thisMonthEarnings: thisMonthEarnings - (thisMonthEarnings * commissionRate),
        thisWeekEarnings: thisWeekEarnings - (thisWeekEarnings * commissionRate),
        todayEarnings: todayEarnings - (todayEarnings * commissionRate),
        pendingPayments: pendingSessionsCount,
        paidPayments: totalPayments, // Use successful payments count instead of completed sessions
        yearlyEarnings,
        monthlyBreakdown
      };
    } catch (error) {
      console.error('Error getting tutor earnings:', error);
      throw new Error('Failed to get earnings data');
    }
  }

  // Get recent payments for a tutor
  async getRecentPayments(userId: string, limit: number = 6): Promise<RecentPayment[]> {
    try {
      const tutorId = await getTutorIdByFirebaseUid(userId);
      
      const payments = await prisma.individual_Payments.findMany({
        where: {
          status: 'success',
          Sessions: {
            i_tutor_id: tutorId
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
          payment_date_time: 'desc'
        },
        take: limit
      });

      const commissionRate = 0.10;

      return payments.map(payment => ({
        session_id: payment.session_id || 'N/A',
        student_name: payment.Sessions?.Student?.User?.name || 'Unknown Student',
        subject: payment.Sessions?.title || 'No Subject',
        amount: Number(payment.amount || 0),
        commission: Number(payment.amount || 0) * commissionRate,
        net_amount: Number(payment.amount || 0) * (1 - commissionRate),
        date: payment.payment_date_time || new Date(),
        payment_status: payment.status || 'success'
      }));
    } catch (error) {
      console.error('Error getting recent payments:', error);
      throw new Error('Failed to get recent payments');
    }
  }

  // Get earnings by date range
  async getEarningsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<EarningsStatistics> {
    try {
      const tutorId = await getTutorIdByFirebaseUid(userId);
      
      const payments = await prisma.individual_Payments.findMany({
        where: {
          status: 'success',
          Sessions: {
            i_tutor_id: tutorId
          },
          payment_date_time: {
            gte: startDate,
            lte: endDate
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
        }
      });

      const totalGross = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
      const commissionRate = 0.10;
      const totalCommission = totalGross * commissionRate;
      const totalNet = totalGross - totalCommission;

      return {
        totalEarnings: totalGross,
        adminCommission: totalCommission,
        netEarnings: totalNet,
        totalSessions: payments.length,
        completedSessions: payments.length,
        averageSessionValue: payments.length > 0 ? totalGross / payments.length : 0,
        thisMonthEarnings: 0,
        thisWeekEarnings: 0,
        todayEarnings: 0,
        pendingPayments: 0,
        paidPayments: payments.length,
        yearlyEarnings: {},
        monthlyBreakdown: []
      };
    } catch (error) {
      console.error('Error getting earnings by date range:', error);
      throw new Error('Failed to get earnings by date range');
    }
  }

  // Get payment statistics
  async getPaymentStatistics(userId: string) {
    try {
      const tutorId = await getTutorIdByFirebaseUid(userId);
      
      const [totalSessions, completedSessions, pendingSessions] = await Promise.all([
        prisma.sessions.count({
          where: { i_tutor_id: tutorId }
        }),
        prisma.sessions.count({
          where: { i_tutor_id: tutorId, status: 'completed' }
        }),
        prisma.sessions.count({
          where: { i_tutor_id: tutorId, status: 'scheduled' }
        })
      ]);

      return {
        totalSessions,
        completedSessions,
        pendingSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
      };
    } catch (error) {
      console.error('Error getting payment statistics:', error);
      throw new Error('Failed to get payment statistics');
    }
  }
}

export const earningsService = new EarningsService();