import prisma from '../prismaClient';

/**
 * Get current commission rate
 */
export async function getCommissionService() {
  try {
    // Get the first (and should be only) commission record
    const commission: any = await (prisma as any).commission.findFirst({
      select: {
        id: true,
        value: true,
        created_at: true,
        updated_by: true,
        Admin: {
          select: { name: true }
        }
      }
    });

    if (!commission) {
      // Return default 10% if no commission record exists
      return {
        commission_id: null,
        rate: 10,
        created_at: null,
        updated_by: null,
        updated_by_name: null,
      };
    }

    return {
      commission_id: commission.id,
      rate: commission.value,
      created_at: commission.created_at,
      updated_by: commission.updated_by,
      updated_by_name: commission.Admin?.name || null,
    };
  } catch (error) {
    console.error('Error fetching commission:', error);
    throw new Error('Failed to fetch commission rate');
  }
}

/**
 * Update commission rate
 */
export async function updateCommissionService(newRate: number, adminId: string) {
  try {
    if (newRate < 0 || newRate > 100) {
      throw Object.assign(new Error('Commission rate must be between 0 and 100'), { status: 400 });
    }

    // Check if commission record exists
    const existing: any = await (prisma as any).commission.findFirst();

    let updated;
    if (existing) {
      // Update existing
      updated = await (prisma as any).commission.update({
        where: { id: existing.id },
        data: {
          value: newRate,
          updated_by: adminId,
        },
      });
    } else {
      // Create new
      updated = await (prisma as any).commission.create({
        data: {
          value: newRate,
          updated_by: adminId,
        },
      });
    }

    return updated;
  } catch (error: any) {
    console.error('Error updating commission:', error);
    if (error.status) throw error;
    throw new Error('Failed to update commission rate');
  }
}

/**
 * Get comprehensive finance analytics
 */
export async function getFinanceAnalyticsService() {
  try {
    // Get commission rate
    const commissionData = await getCommissionService();
    const commissionRate = commissionData.rate / 100;

    // Fetch all payments in parallel
    const [individualPayments, massPayments] = await Promise.all([
      prisma.individual_Payments.findMany({
        where: { status: 'success' },
        select: {
          i_payment_id: true,
          amount: true,
          payment_date_time: true,
          method: true,
          student_id: true,
          session_id: true,
        },
        orderBy: { payment_date_time: 'desc' },
        take: 100, // Limit for recent transactions
      }),
      prisma.mass_Payments.findMany({
        where: { status: 'success' },
        select: {
          m_payment_id: true,
          amount: true,
          payment_time: true,
          student_id: true,
          class_id: true,
        },
        orderBy: { payment_time: 'desc' },
        take: 100,
      }),
    ]);

    // Fetch related data for individual payments
    const sessionIds = individualPayments.map(p => p.session_id).filter(Boolean);
    const sessions = await prisma.sessions.findMany({
      where: { session_id: { in: sessionIds as string[] } },
      select: {
        session_id: true,
        subject: true,
        i_tutor_id: true,
      }
    });
    const sessionMap = new Map(sessions.map(s => [s.session_id, s]));

    const iTutorIds = sessions.map(s => s.i_tutor_id).filter(Boolean);
    const iTutors = await prisma.individual_Tutor.findMany({
      where: { i_tutor_id: { in: iTutorIds as string[] } },
      select: { i_tutor_id: true, User: { select: { name: true } } }
    });
    const iTutorMap = new Map(iTutors.map(t => [t.i_tutor_id, t.User.name]));

    // Fetch related data for mass payments
    const classIds = massPayments.map(p => p.class_id).filter(Boolean);
    const classes = await prisma.class.findMany({
      where: { class_id: { in: classIds as string[] } },
      select: { class_id: true, title: true, subject: true, m_tutor_id: true }
    });
    const classMap = new Map(classes.map(c => [c.class_id, c]));

    const mTutorIds = classes.map(c => c.m_tutor_id).filter(Boolean);
    const mTutors = await prisma.mass_Tutor.findMany({
      where: { m_tutor_id: { in: mTutorIds as string[] } },
      select: { m_tutor_id: true, User: { select: { name: true } } }
    });
    const mTutorMap = new Map(mTutors.map(t => [t.m_tutor_id, t.User.name]));

    // Fetch students
    const allStudentIds = [
      ...individualPayments.map(p => p.student_id),
      ...massPayments.map(p => p.student_id)
    ].filter(Boolean);
    const students = await prisma.student.findMany({
      where: { student_id: { in: allStudentIds as string[] } },
      select: { student_id: true, User: { select: { name: true } } }
    });
    const studentMap = new Map(students.map(s => [s.student_id, s.User.name]));

    // Calculate totals
    const individualTotal = individualPayments.reduce(
      (sum, p) => sum + parseFloat(p.amount?.toString() || '0'),
      0
    );
    const massTotal = massPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const totalRevenue = individualTotal + massTotal;
    const platformRevenue = totalRevenue * commissionRate;

    // Payment method breakdown (from individual payments)
    const paymentMethods = individualPayments.reduce((acc: any, p) => {
      const method = p.method || 'Unknown';
      acc[method] = (acc[method] || 0) + parseFloat(p.amount?.toString() || '0');
      return acc;
    }, {});

    // Monthly revenue (last 6 months)
    const now = new Date();
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const individualMonth = individualPayments
        .filter(p => {
          const date = p.payment_date_time ? new Date(p.payment_date_time) : null;
          return date && date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, p) => sum + parseFloat(p.amount?.toString() || '0'), 0);

        const massMonth = massPayments
        .filter(p => {
          const date = p.payment_time ? new Date(p.payment_time) : null;
          return date && date >= monthStart && date <= monthEnd;
        })
        .reduce((sum, p) => sum + (p.amount || 0), 0);      monthlyRevenue.push({
        month: monthStart.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        individual: individualMonth,
        mass: massMonth,
        total: individualMonth + massMonth,
        commission: (individualMonth + massMonth) * commissionRate,
      });
    }

    // Recent transactions (combined and sorted)
    const recentTransactions = [
      ...individualPayments.slice(0, 20).map((p: any) => {
        const session = p.session_id ? sessionMap.get(p.session_id) : null;
        const tutorName = session?.i_tutor_id ? iTutorMap.get(session.i_tutor_id) : null;
        return {
          id: p.i_payment_id,
          type: 'individual' as const,
          amount: parseFloat(p.amount?.toString() || '0'),
          date: p.payment_date_time,
          method: p.method || 'N/A',
          student: p.student_id ? studentMap.get(p.student_id) || 'Unknown' : 'Unknown',
          tutor: tutorName || 'Unknown',
          subject: session?.subject || 'N/A',
        };
      }),
      ...massPayments.slice(0, 20).map((p: any) => {
        const classData = p.class_id ? classMap.get(p.class_id) : null;
        const tutorName = classData?.m_tutor_id ? mTutorMap.get(classData.m_tutor_id) : null;
        return {
          id: p.m_payment_id,
          type: 'mass' as const,
          amount: p.amount || 0,
          date: p.payment_time,
          method: 'N/A',
          student: p.student_id ? studentMap.get(p.student_id) || 'Unknown' : 'Unknown',
          tutor: tutorName || 'Unknown',
          subject: classData?.title || classData?.subject || 'N/A',
        };
      }),
    ]
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, 20);

    return {
      commission: {
        rate: commissionData.rate,
        created_at: commissionData.created_at,
        updated_by_name: commissionData.updated_by_name,
      },
      summary: {
        totalRevenue,
        platformRevenue,
        individualRevenue: individualTotal,
        massRevenue: massTotal,
        totalTransactions: individualPayments.length + massPayments.length,
        individualTransactions: individualPayments.length,
        massTransactions: massPayments.length,
      },
      paymentMethods,
      monthlyRevenue,
      recentTransactions,
    };
  } catch (error) {
    console.error('Error fetching finance analytics:', error);
    throw new Error('Failed to fetch finance analytics');
  }
}
