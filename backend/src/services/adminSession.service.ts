import prisma from '../prismaClient';
import axios from 'axios';

/**
 * Get all individual sessions with filters
 */
export async function getIndividualSessionsService(filters?: {
  status?: 'scheduled' | 'ongoing' | 'completed' | 'canceled';
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  try {
    const where: any = {};

    // Only set status filter if it's a valid SessionStatus
    if (filters?.status && ['scheduled', 'ongoing', 'completed', 'canceled'].includes(filters.status)) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { subject: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const sessions = await prisma.sessions.findMany({
      where,
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        Individual_Tutor: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        Individual_Payments: {
          select: {
            amount: true,
            status: true,
            payment_date_time: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return sessions.map((session) => ({
      session_id: session.session_id,
      title: session.title,
      subject: session.subject,
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
      status: session.status,
      price: session.price,
      meeting_urls: session.meeting_urls,
      materials: session.materials,
      created_at: session.created_at,
      student: session.Student
        ? {
            student_id: session.Student.student_id,
            name: session.Student.User.name,
            email: session.Student.User.email,
          }
        : null,
      tutor: session.Individual_Tutor
        ? {
            i_tutor_id: session.Individual_Tutor.i_tutor_id,
            name: session.Individual_Tutor.User?.name,
            email: session.Individual_Tutor.User?.email,
          }
        : null,
      payment: session.Individual_Payments?.[0]
        ? {
            amount: parseFloat(session.Individual_Payments[0].amount?.toString() || '0'),
            status: session.Individual_Payments[0].status,
            payment_date_time: session.Individual_Payments[0].payment_date_time,
          }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching individual sessions:', error);
    throw new Error('Failed to fetch individual sessions');
  }
}

/**
 * Get all mass class slots with filters
 */
export async function getMassClassSlotsService(filters?: {
  status?: 'upcoming' | 'completed';
  startDate?: string;
  endDate?: string;
  search?: string;
}) {
  try {
    const where: any = {};

    // Only set status filter if it's a valid ClassSlotStatus
    if (filters?.status && ['upcoming', 'completed'].includes(filters.status)) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.dateTime = {};
      if (filters.startDate) {
        where.dateTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.dateTime.lte = new Date(filters.endDate);
      }
    }

    const slots = await prisma.classSlot.findMany({
      where,
      include: {
        Class: {
          include: {
            Mass_Tutor: {
              include: {
                User: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
            Enrolment: {
              select: {
                enrol_id: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        dateTime: 'desc',
      },
    });

    // If search filter exists, filter by class title or subject
    let filteredSlots = slots;
    if (filters?.search) {
      filteredSlots = slots.filter(
        (slot) =>
          slot.Class?.title?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          slot.Class?.subject?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    return filteredSlots.map((slot) => ({
      cslot_id: slot.cslot_id,
      dateTime: slot.dateTime,
      duration: slot.duration,
      status: slot.status,
      meetingURLs: slot.meetingURLs,
      materials: slot.materials,
      recording: slot.recording,
      announcement: slot.announcement,
      created_at: slot.created_at,
      class: slot.Class
        ? {
            class_id: slot.Class.class_id,
            title: slot.Class.title,
            subject: slot.Class.subject,
            day: slot.Class.day,
            time: slot.Class.time,
            enrollmentCount: slot.Class.Enrolment.filter((e) => e.status === 'valid').length,
          }
        : null,
      tutor: slot.Class?.Mass_Tutor
        ? {
            m_tutor_id: slot.Class.Mass_Tutor.m_tutor_id,
            name: slot.Class.Mass_Tutor.User?.name,
            email: slot.Class.Mass_Tutor.User?.email,
          }
        : null,
    }));
  } catch (error) {
    console.error('Error fetching mass class slots:', error);
    throw new Error('Failed to fetch mass class slots');
  }
}

/**
 * Get session statistics for admin dashboard
 */
export async function getSessionStatsService() {
  try {
    const [
      individualStats,
      massStats,
      upcomingIndividual,
      upcomingMass,
      recentCompletedIndividual,
      recentCompletedMass,
    ] = await Promise.all([
      // Individual session stats
      prisma.sessions.groupBy({
        by: ['status'],
        _count: true,
      }),
      // Mass class slot stats
      prisma.classSlot.groupBy({
        by: ['status'],
        _count: true,
      }),
      // Upcoming individual sessions (next 7 days)
      prisma.sessions.count({
        where: {
          status: 'scheduled',
          date: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Upcoming mass slots (next 7 days)
      prisma.classSlot.count({
        where: {
          status: 'upcoming',
          dateTime: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Recently completed individual sessions (last 30 days)
      prisma.sessions.count({
        where: {
          status: 'completed',
          end_time: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Recently completed mass slots (last 30 days)
      prisma.classSlot.count({
        where: {
          status: 'completed',
          dateTime: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const individualByStatus = individualStats.reduce(
      (acc, stat) => {
        acc[stat.status || 'unknown'] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const massByStatus = massStats.reduce(
      (acc, stat) => {
        acc[stat.status || 'unknown'] = stat._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      individual: {
        total: individualStats.reduce((sum, stat) => sum + stat._count, 0),
        byStatus: individualByStatus,
        upcomingWeek: upcomingIndividual,
        completedMonth: recentCompletedIndividual,
      },
      mass: {
        total: massStats.reduce((sum, stat) => sum + stat._count, 0),
        byStatus: massByStatus,
        upcomingWeek: upcomingMass,
        completedMonth: recentCompletedMass,
      },
    };
  } catch (error) {
    console.error('Error fetching session stats:', error);
    throw new Error('Failed to fetch session statistics');
  }
}

/**
 * Update individual session status
 */
export async function updateIndividualSessionStatusService(
  sessionId: string,
  status: 'scheduled' | 'ongoing' | 'completed' | 'canceled'
) {
  try {
    const session = await prisma.sessions.findUnique({
      where: { session_id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const updatedSession: any = await prisma.sessions.update({
      where: { session_id: sessionId },
      data: {
        status,
        ...(status === 'completed' && !session.end_time
          ? { end_time: new Date() }
          : {}),
      },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        Individual_Tutor: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return {
      session_id: updatedSession.session_id,
      title: updatedSession.title,
      status: updatedSession.status,
      date: updatedSession.date,
      start_time: updatedSession.start_time,
      end_time: updatedSession.end_time,
      student: updatedSession.Student
        ? {
            name: updatedSession.Student.User.name,
            email: updatedSession.Student.User.email,
          }
        : null,
      tutor: updatedSession.Individual_Tutor
        ? {
            name: updatedSession.Individual_Tutor.User?.name,
            email: updatedSession.Individual_Tutor.User?.email,
          }
        : null,
    };
  } catch (error: any) {
    console.error('Error updating session status:', error);
    throw new Error(error.message || 'Failed to update session status');
  }
}

/**
 * Update mass class slot status
 */
export async function updateMassSlotStatusService(
  slotId: string,
  status: 'upcoming' | 'completed'
) {
  try {
    const slot = await prisma.classSlot.findUnique({
      where: { cslot_id: slotId },
    });

    if (!slot) {
      throw new Error('Class slot not found');
    }

    const updatedSlot: any = await prisma.classSlot.update({
      where: { cslot_id: slotId },
      data: { status },
      include: {
        Class: {
          include: {
            Mass_Tutor: {
              include: {
                User: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      cslot_id: updatedSlot.cslot_id,
      dateTime: updatedSlot.dateTime,
      status: updatedSlot.status,
      class: updatedSlot.Class
        ? {
            title: updatedSlot.Class.title,
            subject: updatedSlot.Class.subject,
          }
        : null,
      tutor: updatedSlot.Class?.Mass_Tutor
        ? {
            name: updatedSlot.Class.Mass_Tutor.User?.name,
            email: updatedSlot.Class.Mass_Tutor.User?.email,
          }
        : null,
    };
  } catch (error: any) {
    console.error('Error updating class slot status:', error);
    throw new Error(error.message || 'Failed to update class slot status');
  }
}

/**
 * Get Zoom ZAK token for admin to join as host
 * This allows admin to moderate/observe meetings
 */
export async function getZakTokenService() {
  try {
    const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID;
    const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
    const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;

    if (!ZOOM_ACCOUNT_ID || !ZOOM_CLIENT_ID || !ZOOM_CLIENT_SECRET) {
      throw new Error('Zoom credentials not configured');
    }

    // Get Server-to-Server OAuth token
    const tokenResponse = await axios.post(
      `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {},
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')}`,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Get ZAK token from Zoom API
    const zakResponse = await axios.get('https://api.zoom.us/v2/users/me/zak', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      zak: zakResponse.data.token,
      expires_in: 7200, // ZAK token typically expires in 2 hours
    };
  } catch (error: any) {
    console.error('Error getting ZAK token:', error.response?.data || error.message);
    throw new Error('Failed to get Zoom ZAK token for admin access');
  }
}

/**
 * Generate admin host URL for joining a meeting
 */
export async function getAdminHostUrlService(meetingUrl: string) {
  try {
    const zakData = await getZakTokenService();

    // Extract meeting ID from Zoom URL
    const meetingIdMatch = meetingUrl.match(/\/j\/(\d+)/);
    if (!meetingIdMatch) {
      throw new Error('Invalid Zoom meeting URL');
    }

    const meetingId = meetingIdMatch[1];

    // Generate host URL with ZAK token
    const hostUrl = `https://zoom.us/wc/${meetingId}/start?zak=${zakData.zak}&prefer=1`;

    return {
      hostUrl,
      meetingId,
      zak: zakData.zak,
      expiresIn: zakData.expires_in,
    };
  } catch (error: any) {
    console.error('Error generating admin host URL:', error);
    throw new Error(error.message || 'Failed to generate admin host URL');
  }
}

/**
 * Get detailed session info for admin
 */
export async function getSessionDetailsService(sessionId: string) {
  try {
    const session = await prisma.sessions.findUnique({
      where: { session_id: sessionId },
      include: {
        Student: {
          include: {
            User: true,
          },
        },
        Individual_Tutor: {
          include: {
            User: true,
          },
        },
        Individual_Payments: true,
        Rating_N_Review_Session: true,
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    return session;
  } catch (error: any) {
    console.error('Error fetching session details:', error);
    throw new Error(error.message || 'Failed to fetch session details');
  }
}

/**
 * Get detailed class slot info for admin
 */
export async function getClassSlotDetailsService(slotId: string) {
  try {
    const slot = await prisma.classSlot.findUnique({
      where: { cslot_id: slotId },
      include: {
        Class: {
          include: {
            Mass_Tutor: {
              include: {
                User: true,
              },
            },
            Enrolment: {
              include: {
                Student: {
                  include: {
                    User: true,
                  },
                },
              },
            },
            Rating_N_Review_Class: true,
          },
        },
      },
    });

    if (!slot) {
      throw new Error('Class slot not found');
    }

    return slot;
  } catch (error: any) {
    console.error('Error fetching class slot details:', error);
    throw new Error(error.message || 'Failed to fetch class slot details');
  }
}
