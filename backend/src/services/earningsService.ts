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
      
      // Get all completed sessions for the tutor
      const completedSessions = await prisma.sessions.findMany({
        where: {
          i_tutor_id: tutorId,
          status: 'completed'
        },
        include: {
          Student: {
            include: {
              User: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      // Calculate date ranges
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Calculate basic statistics
      const totalSessions = completedSessions.length;
      const totalGross = completedSessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
      const commissionRate = 0.10; // 10% commission
      const totalCommission = totalGross * commissionRate;
      const totalNet = totalGross - totalCommission;

      // Calculate time-based earnings
      const thisMonthSessions = completedSessions.filter(s => s.date && new Date(s.date) >= startOfMonth);
      const thisMonthEarnings = thisMonthSessions.reduce((sum, session) => sum + Number(session.price || 0), 0);

      const thisWeekSessions = completedSessions.filter(s => s.date && new Date(s.date) >= startOfWeek);
      const thisWeekEarnings = thisWeekSessions.reduce((sum, session) => sum + Number(session.price || 0), 0);

      const todaySessions = completedSessions.filter(s => s.date && new Date(s.date) >= startOfToday);
      const todayEarnings = todaySessions.reduce((sum, session) => sum + Number(session.price || 0), 0);

      // Get all sessions (including pending) for payment status
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
        const monthSessions = completedSessions.filter(s => {
          if (!s.date) return false;
          const sessionDate = new Date(s.date);
          return sessionDate.getFullYear() === currentYear && sessionDate.getMonth() === month;
        });
        yearlyEarnings[monthName] = monthSessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
      }

      // Calculate monthly breakdown for last 12 months
      const monthlyBreakdown: EarningsBreakdown[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'long' });
        const year = date.getFullYear();
        
        const monthSessions = completedSessions.filter(s => {
          if (!s.date) return false;
          const sessionDate = new Date(s.date);
          return sessionDate.getFullYear() === year && sessionDate.getMonth() === date.getMonth();
        });
        
        const grossEarnings = monthSessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
        const commission = grossEarnings * commissionRate;
        
        monthlyBreakdown.push({
          month,
          year,
          sessions: monthSessions.length,
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
        averageSessionValue: totalSessions > 0 ? totalGross / totalSessions : 0,
        thisMonthEarnings: thisMonthEarnings - (thisMonthEarnings * commissionRate),
        thisWeekEarnings: thisWeekEarnings - (thisWeekEarnings * commissionRate),
        todayEarnings: todayEarnings - (todayEarnings * commissionRate),
        pendingPayments: pendingSessionsCount,
        paidPayments: completedSessionsCount,
        yearlyEarnings,
        monthlyBreakdown
      };
    } catch (error) {
      console.error('Error getting tutor earnings:', error);
      throw new Error('Failed to get earnings data');
    }
  }

  // Get recent payments for a tutor
  async getRecentPayments(userId: string, limit: number = 10): Promise<RecentPayment[]> {
    try {
      const tutorId = await getTutorIdByFirebaseUid(userId);
      
      const payments = await prisma.sessions.findMany({
        where: {
          i_tutor_id: tutorId,
          status: 'completed'
        },
        include: {
          Student: {
            include: {
              User: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        take: limit
      });

      const commissionRate = 0.10;

      return payments.map(session => ({
        session_id: session.session_id,
        student_name: session.Student?.User?.name || 'Unknown Student',
        subject: session.title || 'No Subject',
        amount: Number(session.price || 0),
        commission: Number(session.price || 0) * commissionRate,
        net_amount: Number(session.price || 0) * (1 - commissionRate),
        date: session.date || new Date(),
        payment_status: 'completed'
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
      
      const sessions = await prisma.sessions.findMany({
        where: {
          i_tutor_id: tutorId,
          status: 'completed',
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          Student: {
            include: {
              User: true
            }
          }
        }
      });

      const totalGross = sessions.reduce((sum, session) => sum + Number(session.price || 0), 0);
      const commissionRate = 0.10;
      const totalCommission = totalGross * commissionRate;
      const totalNet = totalGross - totalCommission;

      return {
        totalEarnings: totalGross,
        adminCommission: totalCommission,
        netEarnings: totalNet,
        totalSessions: sessions.length,
        completedSessions: sessions.length,
        averageSessionValue: sessions.length > 0 ? totalGross / sessions.length : 0,
        thisMonthEarnings: 0,
        thisWeekEarnings: 0,
        todayEarnings: 0,
        pendingPayments: 0,
        paidPayments: sessions.length,
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