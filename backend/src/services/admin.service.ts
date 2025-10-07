import prisma from '../prismaClient';
import { hashPassword, verifyPassword } from '../utils/password';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} from '../utils/jwt';

export type AdminSafe = {
  admin_id: string;
  name: string | null;
  email: string;
  token_version: number;
  created_at: Date;
  updated_at: Date;
  last_login_at: Date | null;
};

export type Tokens = { accessToken: string; refreshToken: string };

function sanitizeAdmin(a: any): AdminSafe {
  const { password_hash, ...rest } = a;
  return rest as AdminSafe;
}

/**
 * Create admin account (invite-code gated).
 */
export async function adminSignupService(
  name: string,
  email: string,
  password: string,
  inviteCode?: string
): Promise<{ admin: AdminSafe; tokens: Tokens }> {
  if (!name || !email || !password) {
    throw Object.assign(new Error('Missing fields'), { status: 400 });
  }
  if (process.env.ADMIN_INVITE_CODE && inviteCode !== process.env.ADMIN_INVITE_CODE) {
    throw Object.assign(new Error('Invalid invite code'), { status: 403 });
  }

  const exists = await prisma.admin.findUnique({ where: { email } });
  if (exists) {
    throw Object.assign(new Error('Email already registered'), { status: 409 });
  }

  const password_hash = await hashPassword(password);

  const admin = await prisma.admin.create({
    data: { name, email, password_hash },
  });

  const accessToken  = signAccessToken(admin.admin_id, admin.email, admin.token_version);
  const refreshToken = signRefreshToken(admin.admin_id, admin.email, admin.token_version);

  return { admin: sanitizeAdmin(admin), tokens: { accessToken, refreshToken } };
}

/**
 * Login existing admin.
 */
export async function adminLoginService(
  email: string,
  password: string
): Promise<{ admin: AdminSafe; tokens: Tokens }> {
  if (!email || !password) {
    throw Object.assign(new Error('Missing fields'), { status: 400 });
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const ok = await verifyPassword(password, admin.password_hash);
  if (!ok) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  await prisma.admin.update({
    where: { admin_id: admin.admin_id },
    data: { last_login_at: new Date() },
  });

  const accessToken  = signAccessToken(admin.admin_id, admin.email, admin.token_version);
  const refreshToken = signRefreshToken(admin.admin_id, admin.email, admin.token_version);

  return { admin: sanitizeAdmin(admin), tokens: { accessToken, refreshToken } };
}

/**
 * Rotate tokens using a refresh token.
 */
export async function adminRefreshService(refreshToken: string): Promise<Tokens> {
  if (!refreshToken) {
    throw Object.assign(new Error('refreshToken required'), { status: 400 });
  }

  const decoded = verifyRefresh(refreshToken);
  if (decoded.typ !== 'refresh') {
    throw Object.assign(new Error('Invalid token type'), { status: 401 });
  }

  const admin = await prisma.admin.findUnique({ where: { admin_id: decoded.sub } });
  if (!admin) {
    throw Object.assign(new Error('Admin not found'), { status: 401 });
  }
  if (admin.token_version !== decoded.tv) {
    throw Object.assign(new Error('Token revoked'), { status: 401 });
  }

  const accessToken  = signAccessToken(admin.admin_id, admin.email, admin.token_version);
  const newRefresh   = signRefreshToken(admin.admin_id, admin.email, admin.token_version);

  return { accessToken, refreshToken: newRefresh };
}

/**
 * Logout (revoke refresh tokens by bumping token_version).
 */
export async function adminLogoutService(adminId: string): Promise<void> {
  await prisma.admin.update({
    where: { admin_id: adminId },
    data: { token_version: { increment: 1 } },
  });
}

/**
 * Me (current admin object).
 */
export async function adminMeService(adminId: string): Promise<AdminSafe> {
  const admin = await prisma.admin.findUnique({ where: { admin_id: adminId } });
  if (!admin) {
    throw Object.assign(new Error('Not found'), { status: 404 });
  }
  return sanitizeAdmin(admin);
}

/**
 * Dashboard metrics with comprehensive data
 */
export async function adminMetricsService() {
  try {
    // Get basic counts
    const [students, indTutors, massTutors, candidates, sessions, totalUsers] = await Promise.all([
      prisma.user.count({ where: { role: 'student' } }).catch(() => 0),
      prisma.individual_Tutor.count().catch(() => 0),
      prisma.mass_Tutor.count().catch(() => 0),
      prisma.candidates.count().catch(() => 0),
      prisma.sessions.count().catch(() => 0),
      prisma.user.count().catch(() => 0),
    ]);

    // Get recent activity data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentSessions, recentUsers, pendingCandidates] = await Promise.all([
      prisma.sessions.count({
        where: {
          created_at: {
            gte: thirtyDaysAgo
          }
        }
      }).catch(() => 0),
      prisma.user.count({
        where: {
          created_at: {
            gte: thirtyDaysAgo
          }
        }
      }).catch(() => 0),
      prisma.candidates.count({
        where: {
          status: 'pending'
        }
      }).catch(() => 0),
    ]);

    // Calculate revenue (mock calculation - adjust based on your payment structure)
    const revenue = sessions * 50; // Assuming average session fee of LKR 50

    // Get weekly activity data for chart
    const weeklyActivity = await getWeeklyActivity();

    return {
      students,
      individualTutors: indTutors,
      massTutors: massTutors,
      candidates,
      sessions,
      revenue,
      totalUsers,
      recentActivity: {
        sessions: recentSessions,
        users: recentUsers,
        pendingReviews: pendingCandidates,
      },
      weeklyActivity,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    // Return fallback data
    return {
      students: 0,
      individualTutors: 0,
      massTutors: 0,
      candidates: 0,
      sessions: 0,
      revenue: 0,
      totalUsers: 0,
      recentActivity: {
        sessions: 0,
        users: 0,
        pendingReviews: 0,
      },
      weeklyActivity: [],
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * Get weekly activity data for dashboard chart
 */
async function getWeeklyActivity() {
  try {
    const weeklyData = [];
    const today = new Date();
    
    // Get data for last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const daySessionCount = await prisma.sessions.count({
        where: {
          created_at: {
            gte: date,
            lt: nextDate,
          }
        }
      }).catch(() => 0);
      
      weeklyData.push({
        date: date.toISOString().split('T')[0],
        sessions: daySessionCount,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      });
    }

    // console.log('Weekly activity data:', weeklyData);
    
    return weeklyData;
  } catch (error) {
    console.error('Error fetching weekly activity:', error);
    console.log('Returning mock weekly activity data.');
    // Return mock data for 7 days
    const mockData = [];
    const today = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        sessions: Math.floor(Math.random() * 20) + 10, // Random sessions between 10-30
        day: days[date.getDay()],
      });
    }
    
    return mockData;
  }
}

/**
 * Get admin profile information
 */
export async function getAdminProfileService(adminId: string): Promise<AdminSafe> {
  const admin = await prisma.admin.findUnique({ 
    where: { admin_id: adminId },
    select: {
      admin_id: true,
      name: true,
      email: true,
      token_version: true,
      created_at: true,
      updated_at: true,
      last_login_at: true,
    }
  });
  
  if (!admin) {
    throw Object.assign(new Error('Admin not found'), { status: 404 });
  }
  
  return admin as AdminSafe;
}

/**
 * Update admin profile information
 */
export async function updateAdminProfileService(
  adminId: string, 
  data: { name?: string; email?: string; phone?: string }
): Promise<AdminSafe> {
  const { name, email, phone } = data;
  
  // Basic validation
  if (name !== undefined && !name.trim()) {
    throw Object.assign(new Error('Name cannot be empty'), { status: 400 });
  }
  
  if (email !== undefined && (!email.trim() || !email.includes('@'))) {
    throw Object.assign(new Error('Valid email is required'), { status: 400 });
  }
  
  // Check if email is already taken by another admin
  if (email) {
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        email: email.trim(),
        NOT: { admin_id: adminId }
      }
    });
    
    if (existingAdmin) {
      throw Object.assign(new Error('Email is already in use'), { status: 409 });
    }
  }
  
  // Prepare update data
  const updateData: any = { updated_at: new Date() };
  if (name !== undefined) updateData.name = name.trim();
  if (email !== undefined) updateData.email = email.trim();
  
  const updatedAdmin = await prisma.admin.update({
    where: { admin_id: adminId },
    data: updateData,
    select: {
      admin_id: true,
      name: true,
      email: true,
      token_version: true,
      created_at: true,
      updated_at: true,
      last_login_at: true,
    }
  });
  
  return updatedAdmin as AdminSafe;
}

/**
 * Change admin password
 */
export async function changeAdminPasswordService(
  adminId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (!currentPassword || !newPassword) {
    throw Object.assign(new Error('Current and new password are required'), { status: 400 });
  }
  
  if (newPassword.length < 8) {
    throw Object.assign(new Error('New password must be at least 8 characters'), { status: 400 });
  }
  
  // Get current admin with password
  const admin = await prisma.admin.findUnique({
    where: { admin_id: adminId },
    select: { password_hash: true }
  });
  
  if (!admin) {
    throw Object.assign(new Error('Admin not found'), { status: 404 });
  }
  
  // Verify current password
  const isValidPassword = await verifyPassword(currentPassword, admin.password_hash);
  if (!isValidPassword) {
    throw Object.assign(new Error('Current password is incorrect'), { status: 400 });
  }
  
  // Hash and update new password
  const newPasswordHash = await hashPassword(newPassword);
  await prisma.admin.update({
    where: { admin_id: adminId },
    data: { 
      password_hash: newPasswordHash,
      // Increment token version to invalidate all existing tokens
      token_version: { increment: 1 },
      updated_at: new Date()
    }
  });
}

/**
 * Comprehensive analytics service for admin dashboard
 */
export async function adminAnalyticsService() {
  try {
    // Core metrics
    const [
      totalUsers,
      totalSessions,
      completedSessions,
      candidates,
      individualTutors,
      massTutors,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.sessions.count(),
      prisma.sessions.count({ where: { status: 'completed' } }),
      prisma.candidates.findMany({ select: { status: true } }),
      prisma.individual_Tutor.findMany({ 
        select: { 
          status: true
        } 
      }),
      prisma.mass_Tutor.findMany({ 
        select: { 
          status: true
        } 
      }),
    ]);

    // Calculate tutors and students from user counts
    const totalTutors = individualTutors.length + massTutors.length;
    const totalStudents = totalUsers - totalTutors;

    // Calculate active users (users created within last 30 days as proxy for active)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await prisma.user.count({
      where: {
        created_at: { gte: thirtyDaysAgo }
      }
    });

    // Platform Health Metrics
    const platformHealth = {
      uptime: 99.9, // This could be calculated from monitoring service
      avgResponseTime: 120, // milliseconds - from monitoring
      errorRate: 0.5, // percentage - from error logs
    };

    // Engagement Metrics
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const newUsersThisMonth = await prisma.user.count({
      where: { created_at: { gte: firstDayOfMonth } }
    });

    const returningUsers = await prisma.user.count({
      where: {
        created_at: { lt: thirtyDaysAgo }
      }
    });

    const retentionRate = totalUsers > 0 ? (returningUsers / totalUsers) * 100 : 0;
    const avgSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0;

    const engagement = {
      newUsersThisMonth,
      returningUsers,
      retentionRate: parseFloat(retentionRate.toFixed(2)),
      avgSessionsPerUser: parseFloat(avgSessionsPerUser.toFixed(2)),
    };

    // Financial Metrics (actual data from payment models)
    // Get commission rate from the Commission table
    // TODO: Uncomment when Prisma client is fully regenerated with Commission model
    // const commissionRecord = await prisma.commission.findFirst({ orderBy: { created_at: 'asc' } });
    // const commissionRate = commissionRecord ? commissionRecord.value / 100 : 0.10;
    
    // Temporary: Use default commission rate of 10% until Prisma client includes Commission model
    const commissionRate = 0.10; // 10% commission

    const firstDayOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

    // Fetch payments for this month and last month (status: 'success' means completed payment)
    const [
      individualPaymentsThisMonth,
      massPaymentsThisMonth,
      individualPaymentsLastMonth,
      massPaymentsLastMonth
    ] = await Promise.all([
      // Individual payments this month
      prisma.individual_Payments.findMany({
        where: {
          status: 'success',
          payment_date_time: { gte: firstDayOfMonth }
        },
        select: { amount: true }
      }),
      // Mass payments this month
      prisma.mass_Payments.findMany({
        where: {
          status: 'success',
          payment_time: { gte: firstDayOfMonth }
        },
        select: { amount: true }
      }),
      // Individual payments last month
      prisma.individual_Payments.findMany({
        where: {
          status: 'success',
          payment_date_time: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth }
        },
        select: { amount: true }
      }),
      // Mass payments last month
      prisma.mass_Payments.findMany({
        where: {
          status: 'success',
          payment_time: { gte: firstDayOfLastMonth, lte: lastDayOfLastMonth }
        },
        select: { amount: true }
      })
    ]);

    // Calculate total payment amounts
    const individualPaymentSumThisMonth = individualPaymentsThisMonth.reduce(
      (sum, p) => sum + (p.amount ? parseFloat(p.amount.toString()) : 0), 
      0
    );
    const massPaymentSumThisMonth = massPaymentsThisMonth.reduce(
      (sum, p) => sum + (p.amount || 0), 
      0
    );

    const individualPaymentSumLastMonth = individualPaymentsLastMonth.reduce(
      (sum, p) => sum + (p.amount ? parseFloat(p.amount.toString()) : 0), 
      0
    );
    const massPaymentSumLastMonth = massPaymentsLastMonth.reduce(
      (sum, p) => sum + (p.amount || 0), 
      0
    );

    // Calculate revenue (our commission from payments)
    const individualTutorRevenue = individualPaymentSumThisMonth * commissionRate;
    const massTutorRevenue = massPaymentSumThisMonth * commissionRate;
    const revenueThisMonth = individualTutorRevenue + massTutorRevenue;

    const revenueLastMonth = (individualPaymentSumLastMonth + massPaymentSumLastMonth) * commissionRate;

    const revenueGrowth = revenueLastMonth > 0 
      ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 
      : 0;

    const financial = {
      revenueThisMonth: parseFloat(revenueThisMonth.toFixed(2)),
      revenueLastMonth: parseFloat(revenueLastMonth.toFixed(2)),
      revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      individualTutorRevenue: parseFloat(individualTutorRevenue.toFixed(2)),
      massTutorRevenue: parseFloat(massTutorRevenue.toFixed(2)),
    };

    // Moderation Metrics
    const pendingApplications = candidates.filter(c => c.status === 'pending').length;
    const suspendedTutors = [...individualTutors, ...massTutors].filter(
      t => t.status === 'suspended'
    ).length;

    const reports = await prisma.reports.findMany({
      select: { status: true }
    });

    const moderation = {
      pendingApplications,
      suspendedTutors,
      activeReports: reports.filter(r => r.status === 'under_review').length,
      resolvedReports: reports.filter(r => r.status === 'solve').length,
    };

    // Chart Data - User Growth (last 30 days)
    const userGrowth = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const users = await prisma.user.count({
        where: {
          created_at: {
            gte: date,
            lt: nextDate
          }
        }
      });
      
      userGrowth.push({
        date: date.toISOString().split('T')[0],
        users
      });
    }

    // Chart Data - Sessions by Subject (actual data from database)
    const sessionsBySubjectRaw = await prisma.sessions.groupBy({
      by: ['subject'],
      _count: {
        session_id: true
      },
      orderBy: {
        _count: {
          session_id: 'desc'
        }
      }
    });

    const sessionsBySubject = sessionsBySubjectRaw
      .filter(s => s.subject) // Filter out null subjects
      .map(s => ({
        subject: s.subject as string,
        sessions: s._count.session_id
      }));

    // Chart Data - Revenue by Month (last 6 months) - actual payment data
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      // Fetch actual payments for this month
      const [individualPaymentsMonth, massPaymentsMonth] = await Promise.all([
        prisma.individual_Payments.findMany({
          where: {
            status: 'success',
            payment_date_time: { gte: firstDay, lte: lastDay }
          },
          select: { amount: true }
        }),
        prisma.mass_Payments.findMany({
          where: {
            status: 'success',
            payment_time: { gte: firstDay, lte: lastDay }
          },
          select: { amount: true }
        })
      ]);

      // Calculate total payments for the month
      const individualSum = individualPaymentsMonth.reduce(
        (sum, p) => sum + (p.amount ? parseFloat(p.amount.toString()) : 0), 
        0
      );
      const massSum = massPaymentsMonth.reduce(
        (sum, p) => sum + (p.amount || 0), 
        0
      );

      // Calculate revenue (our commission)
      const monthRevenue = (individualSum + massSum) * commissionRate;
      
      revenueByMonth.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        amount: parseFloat(monthRevenue.toFixed(2))
      });
    }

    // Chart Data - Tutor Ratings Distribution (actual data from database)
    // Fetch all ratings from both session and class reviews
    const [sessionRatings, classRatings] = await Promise.all([
      prisma.rating_N_Review_Session.findMany({
        where: { rating: { not: null } },
        select: { rating: true }
      }),
      prisma.rating_N_Review_Class.findMany({
        where: { rating: { not: null } },
        select: { rating: true }
      })
    ]);

    // Combine and count ratings by star value
    const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    // Process session ratings (Decimal type)
    sessionRatings.forEach(r => {
      if (r.rating) {
        const ratingValue = Math.round(parseFloat(r.rating.toString()));
        if (ratingValue >= 1 && ratingValue <= 5) {
          ratingCounts[ratingValue]++;
        }
      }
    });

    // Process class ratings (Float type)
    classRatings.forEach(r => {
      if (r.rating) {
        const ratingValue = Math.round(r.rating);
        if (ratingValue >= 1 && ratingValue <= 5) {
          ratingCounts[ratingValue]++;
        }
      }
    });

    const tutorRatings = [
      { rating: 5, count: ratingCounts[5] },
      { rating: 4, count: ratingCounts[4] },
      { rating: 3, count: ratingCounts[3] },
      { rating: 2, count: ratingCounts[2] },
      { rating: 1, count: ratingCounts[1] },
    ];

    // Chart Data - Sessions by Day (last 7 days)
    const sessionsByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const sessions = await prisma.sessions.count({
        where: {
          created_at: {
            gte: date,
            lt: nextDate
          }
        }
      });
      
      sessionsByDay.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sessions
      });
    }

    // Calculate total revenue from all successful payments (lifetime)
    const [allIndividualPayments, allMassPayments] = await Promise.all([
      prisma.individual_Payments.findMany({
        where: { status: 'success' },
        select: { amount: true }
      }),
      prisma.mass_Payments.findMany({
        where: { status: 'success' },
        select: { amount: true }
      })
    ]);

    const totalIndividualPayments = allIndividualPayments.reduce(
      (sum, p) => sum + (p.amount ? parseFloat(p.amount.toString()) : 0), 
      0
    );
    const totalMassPayments = allMassPayments.reduce(
      (sum, p) => sum + (p.amount || 0), 
      0
    );

    const totalRevenue = (totalIndividualPayments + totalMassPayments) * commissionRate;

    return {
      totalUsers,
      activeUsers,
      totalTutors,
      totalStudents,
      totalSessions,
      completedSessions,
      revenue: totalRevenue,
      platformHealth,
      engagement,
      financial,
      moderation,
      userGrowth,
      sessionsBySubject,
      revenueByMonth,
      tutorRatings,
      sessionsByDay,
    };
  } catch (error) {
    console.error('Error in adminAnalyticsService:', error);
    throw error;
  }
}
