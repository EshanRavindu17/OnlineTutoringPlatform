import prisma from "../prismaClient";
import { SessionStatus } from "@prisma/client";

// Interface for session response with detailed information
export interface SessionWithDetails {
  session_id: string;
  student_id: string | null;
  status: SessionStatus | null;
  materials: string[];
  created_at: Date | null;
  date: Date | null;
  i_tutor_id: string | null;
  meeting_urls: string[];
  price: number | null;
  slots: Date[];
  title: string | null;
  start_time: Date | null;
  end_time: Date | null;
  Student?: {
    User: {
      name: string;
      email: string;
      photo_url: string | null;
    };
  } | null;
  Rating_N_Review_Session?: Array<{
    r_id: string;
    rating: number | null;
    review: string | null;
  }>;
}

// Helper function to convert Prisma sessions to SessionWithDetails
const convertPrismaSessionToSessionWithDetails = (session: any): SessionWithDetails => {
  return {
    ...session,
    Rating_N_Review_Session: session.Rating_N_Review_Session?.map((review: any) => ({
      ...review,
      rating: review.rating ? Number(review.rating) : null
    })) || []
  };
};

// Interface for session statistics
export interface SessionStatistics {
  totalSessions: number;
  upcomingSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  ongoingSessions: number;
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  averageSessionDuration: number | null;
}

// Get all sessions for a specific tutor
export const getTutorSessions = async (tutorId: string): Promise<SessionWithDetails[]> => {
  try {
    const sessions = await prisma.sessions.findMany({
      where: {
        i_tutor_id: tutorId
      },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true
              }
            }
          }
        },
        Rating_N_Review_Session: {
          select: {
            r_id: true,
            rating: true,
            review: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return sessions.map(convertPrismaSessionToSessionWithDetails);
  } catch (error) {
    console.error('Error fetching tutor sessions:', error);
    throw new Error('Failed to fetch tutor sessions');
  }
};

// Get sessions by status for a specific tutor
export const getTutorSessionsByStatus = async (
  tutorId: string, 
  status: SessionStatus
): Promise<SessionWithDetails[]> => {
  try {
    const sessions = await prisma.sessions.findMany({
      where: {
        i_tutor_id: tutorId,
        status: status
      },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true
              }
            }
          }
        },
        Rating_N_Review_Session: {
          select: {
            r_id: true,
            rating: true,
            review: true
          }
        }
      },
      orderBy: [
        {
          date: status === 'scheduled' ? 'asc' : 'desc'
        },
        {
          start_time: 'asc'
        }
      ]
    });

    return sessions.map(convertPrismaSessionToSessionWithDetails);
  } catch (error) {
    console.error(`Error fetching ${status} sessions:`, error);
    throw new Error(`Failed to fetch ${status} sessions`);
  }
};

// Get upcoming sessions for a tutor
export const getTutorUpcomingSessions = async (tutorId: string): Promise<SessionWithDetails[]> => {
  try {
    const now = new Date();
    
    const sessions = await prisma.sessions.findMany({
      where: {
        i_tutor_id: tutorId,
        status: 'scheduled',
        OR: [
          {
            date: {
              gt: now
            }
          },
          {
            date: {
              gte: new Date(now.getFullYear(), now.getMonth(), now.getDate())
            },
            start_time: {
              gt: now
            }
          }
        ]
      },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true
              }
            }
          }
        },
        Rating_N_Review_Session: {
          select: {
            r_id: true,
            rating: true,
            review: true
          }
        }
      },
      orderBy: [
        {
          date: 'asc'
        },
        {
          start_time: 'asc'
        }
      ]
    });

    return sessions.map(convertPrismaSessionToSessionWithDetails);
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    throw new Error('Failed to fetch upcoming sessions');
  }
};

// Get session statistics for dashboard
export const getTutorSessionStatistics = async (tutorId: string): Promise<SessionStatistics> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - (now.getDay() * 24 * 60 * 60 * 1000));

    // Get total session count
    const totalSessions = await prisma.sessions.count({
      where: { i_tutor_id: tutorId }
    });

    // Get session counts by status
    const sessionCounts = await prisma.sessions.groupBy({
      by: ['status'],
      where: { i_tutor_id: tutorId },
      _count: {
        session_id: true
      }
    });

    // Get upcoming sessions count (scheduled and in future)
    const upcomingSessions = await prisma.sessions.count({
      where: {
        i_tutor_id: tutorId,
        status: 'scheduled',
        OR: [
          { date: { gt: now } },
          { 
            date: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
            start_time: { gt: now }
          }
        ]
      }
    });

    // Get earnings data
    const totalEarningsResult = await prisma.sessions.aggregate({
      where: {
        i_tutor_id: tutorId,
        status: 'completed'
      },
      _sum: {
        price: true
      }
    });

    const monthlyEarningsResult = await prisma.sessions.aggregate({
      where: {
        i_tutor_id: tutorId,
        status: 'completed',
        date: { gte: startOfMonth }
      },
      _sum: {
        price: true
      }
    });

    const weeklyEarningsResult = await prisma.sessions.aggregate({
      where: {
        i_tutor_id: tutorId,
        status: 'completed',
        date: { gte: startOfWeek }
      },
      _sum: {
        price: true
      }
    });

    // Calculate average session duration
    const sessionsWithDuration = await prisma.sessions.findMany({
      where: {
        i_tutor_id: tutorId,
        start_time: { not: null },
        end_time: { not: null }
      },
      select: {
        start_time: true,
        end_time: true
      }
    });

    let averageSessionDuration: number | null = null;
    if (sessionsWithDuration.length > 0) {
      const totalDuration = sessionsWithDuration.reduce((sum, session) => {
        if (session.start_time && session.end_time) {
          const duration = session.end_time.getTime() - session.start_time.getTime();
          return sum + duration;
        }
        return sum;
      }, 0);
      averageSessionDuration = totalDuration / sessionsWithDuration.length / (1000 * 60); // Convert to minutes
    }

    const completedSessions = sessionCounts.find(s => s.status === 'completed')?._count.session_id || 0;
    const cancelledSessions = sessionCounts.find(s => s.status === 'canceled')?._count.session_id || 0;
    const ongoingSessions = sessionCounts.find(s => s.status === 'ongoing')?._count.session_id || 0;

    return {
      totalSessions,
      upcomingSessions,
      completedSessions,
      cancelledSessions,
      ongoingSessions,
      totalEarnings: totalEarningsResult._sum.price || 0,
      monthlyEarnings: monthlyEarningsResult._sum.price || 0,
      weeklyEarnings: weeklyEarningsResult._sum.price || 0,
      averageSessionDuration
    };
  } catch (error) {
    console.error('Error calculating session statistics:', error);
    throw new Error('Failed to calculate session statistics');
  }
};

// Add materials to a session
export const addSessionMaterial = async (sessionId: string, material: string): Promise<SessionWithDetails> => {
  try {
    // First, get the current materials
    const session = await prisma.sessions.findUnique({
      where: { session_id: sessionId },
      select: { materials: true }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Add the new material to the existing materials array
    const updatedMaterials = [...session.materials, material];

    // Update the session with the new materials
    const updatedSession = await prisma.sessions.update({
      where: { session_id: sessionId },
      data: { materials: updatedMaterials },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true
              }
            }
          }
        },
        Rating_N_Review_Session: {
          select: {
            r_id: true,
            rating: true,
            review: true
          }
        }
      }
    });

    return convertPrismaSessionToSessionWithDetails(updatedSession);
  } catch (error) {
    console.error('Error adding session material:', error);
    throw new Error('Failed to add session material');
  }
};

// Remove materials from a session
export const removeSessionMaterial = async (sessionId: string, materialIndex: number): Promise<SessionWithDetails> => {
  try {
    // First, get the current materials
    const session = await prisma.sessions.findUnique({
      where: { session_id: sessionId },
      select: { materials: true }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (materialIndex < 0 || materialIndex >= session.materials.length) {
      throw new Error('Invalid material index');
    }

    // Remove the material at the specified index
    const updatedMaterials = session.materials.filter((_, index) => index !== materialIndex);

    // Update the session with the new materials
    const updatedSession = await prisma.sessions.update({
      where: { session_id: sessionId },
      data: { materials: updatedMaterials },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true
              }
            }
          }
        },
        Rating_N_Review_Session: {
          select: {
            r_id: true,
            rating: true,
            review: true
          }
        }
      }
    });

    return convertPrismaSessionToSessionWithDetails(updatedSession);
  } catch (error) {
    console.error('Error removing session material:', error);
    throw new Error('Failed to remove session material');
  }
};

// Update session status (e.g., start session, complete session, cancel session)
export const updateSessionStatus = async (sessionId: string, status: SessionStatus): Promise<SessionWithDetails> => {
  try {
    const updateData: any = { status };

    // Set timestamps based on status
    if (status === 'ongoing') {
      updateData.start_time = new Date();
    } else if (status === 'completed') {
      updateData.end_time = new Date();
    }

    const updatedSession = await prisma.sessions.update({
      where: { session_id: sessionId },
      data: updateData,
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true
              }
            }
          }
        },
        Rating_N_Review_Session: {
          select: {
            r_id: true,
            rating: true,
            review: true
          }
        }
      }
    });

    return convertPrismaSessionToSessionWithDetails(updatedSession);
  } catch (error) {
    console.error('Error updating session status:', error);
    throw new Error('Failed to update session status');
  }
};

// Add meeting URL to a session
export const addSessionMeetingUrl = async (sessionId: string, meetingUrl: string): Promise<SessionWithDetails> => {
  try {
    // First, get the current meeting URLs
    const session = await prisma.sessions.findUnique({
      where: { session_id: sessionId },
      select: { meeting_urls: true }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    // Add the new URL to the existing URLs array
    const updatedUrls = [...session.meeting_urls, meetingUrl];

    // Update the session with the new URLs
    const updatedSession = await prisma.sessions.update({
      where: { session_id: sessionId },
      data: { meeting_urls: updatedUrls },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true
              }
            }
          }
        },
        Rating_N_Review_Session: {
          select: {
            r_id: true,
            rating: true,
            review: true
          }
        }
      }
    });

    return convertPrismaSessionToSessionWithDetails(updatedSession);
  } catch (error) {
    console.error('Error adding meeting URL:', error);
    throw new Error('Failed to add meeting URL');
  }
};

// Request session cancellation (updates status and sends notification)
export const requestSessionCancellation = async (
  tutorId: string, 
  sessionId: string, 
  reason?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Verify that the session belongs to the tutor
    const session = await prisma.sessions.findFirst({
      where: {
        session_id: sessionId,
        i_tutor_id: tutorId
      },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!session) {
      throw new Error('Session not found or you do not have permission to cancel it');
    }

    if (session.status !== 'scheduled') {
      throw new Error('Only scheduled sessions can be cancelled');
    }

    // Update session status to cancelled
    await prisma.sessions.update({
      where: { session_id: sessionId },
      data: { status: 'canceled' }
    });

    // Create notification for the student
    if (session.Student?.User) {
      await prisma.notifications.create({
        data: {
          user_id: session.Student.User.email, // This might need to be adjusted based on your notification system
          message: `Your tutoring session scheduled for ${session.date?.toISOString().split('T')[0]} has been cancelled by the tutor. ${reason ? `Reason: ${reason}` : ''}`,
          type: 'student',
          date_time_sent: new Date(),
          status: 'success'
        }
      });
    }

    // Update corresponding time slots back to free
    if (session.date && session.slots.length > 0) {
      await prisma.free_Time_Slots.updateMany({
        where: {
          i_tutor_id: tutorId,
          date: session.date,
          start_time: {
            in: session.slots
          }
        },
        data: {
          status: 'free'
        }
      });
    }

    return {
      success: true,
      message: 'Session cancellation request has been processed successfully'
    };
  } catch (error) {
    console.error('Error requesting session cancellation:', error);
    throw new Error('Failed to process cancellation request');
  }
};

// Get session details by ID (for tutor verification)
export const getSessionById = async (tutorId: string, sessionId: string): Promise<SessionWithDetails | null> => {
  try {
    const session = await prisma.sessions.findFirst({
      where: {
        session_id: sessionId,
        i_tutor_id: tutorId
      },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true
              }
            }
          }
        },
        Rating_N_Review_Session: {
          select: {
            r_id: true,
            rating: true,
            review: true
          }
        }
      }
    });

    return session ? convertPrismaSessionToSessionWithDetails(session) : null;
  } catch (error) {
    console.error('Error fetching session by ID:', error);
    throw new Error('Failed to fetch session details');
  }
};

// Get sessions in a date range for calendar view
export const getTutorSessionsInDateRange = async (
  tutorId: string, 
  startDate: Date, 
  endDate: Date
): Promise<SessionWithDetails[]> => {
  try {
    const sessions = await prisma.sessions.findMany({
      where: {
        i_tutor_id: tutorId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true
              }
            }
          }
        },
        Rating_N_Review_Session: {
          select: {
            r_id: true,
            rating: true,
            review: true
          }
        }
      },
      orderBy: [
        {
          date: 'asc'
        },
        {
          start_time: 'asc'
        }
      ]
    });

    return sessions.map(convertPrismaSessionToSessionWithDetails);
  } catch (error) {
    console.error('Error fetching sessions in date range:', error);
    throw new Error('Failed to fetch sessions in date range');
  }
};

// Get today's sessions for quick overview
export const getTutorTodaySessions = async (tutorId: string): Promise<SessionWithDetails[]> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const sessions = await prisma.sessions.findMany({
      where: {
        i_tutor_id: tutorId,
        date: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true
              }
            }
          }
        },
        Rating_N_Review_Session: {
          select: {
            r_id: true,
            rating: true,
            review: true
          }
        }
      },
      orderBy: {
        start_time: 'asc'
      }
    });

    return sessions.map(convertPrismaSessionToSessionWithDetails);
  } catch (error) {
    console.error('Error fetching today\'s sessions:', error);
    throw new Error('Failed to fetch today\'s sessions');
  }
};