import prisma from '../prismaClient';
import { createZoomMeeting } from './zoom.service';
import { sendAdminMeetingInvitationEmail } from './email.service';

/**
 * Get all users for admin to select recipients
 */
export async function getAllUsersService() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo_url: true,
      },
      orderBy: [
        { role: 'asc' },
        { name: 'asc' },
      ],
    });

    return users.map((user) => ({
      id: user.id.substring(0, 8), // Compressed ID
      fullId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      photo_url: user.photo_url,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

/**
 * Create a Zoom meeting and save it to admin_sessions
 */
export async function createAdminMeetingService(
  adminId: string,
  data: {
    name: string;
    description?: string;
    topic: string;
    startTime: string;
    duration: number;
  }
) {
  try {
    console.log('Creating admin meeting with adminId:', adminId);
    
    if (!adminId) {
      throw new Error('Admin ID is required to create a meeting');
    }

    // Create Zoom meeting
    const zoomMeeting = await createZoomMeeting(
      data.topic,
      data.startTime,
      data.duration
    );

    console.log('Zoom meeting created:', { host_url: zoomMeeting.host_url, join_url: zoomMeeting.join_url });

    // Save to admin_sessions
    const adminSession = await (prisma as any).admin_sessions.create({
      data: {
        name: data.name,
        description: data.description || null,
        urls: [zoomMeeting.host_url, zoomMeeting.join_url],
        created_by: adminId,
        status: 'scheduled',
      },
    });

    console.log('Admin session created:', adminSession.id);

    return {
      session_id: adminSession.id,
      name: adminSession.name,
      description: adminSession.description,
      host_url: zoomMeeting.host_url,
      join_url: zoomMeeting.join_url,
      created_at: adminSession.created_at,
    };
  } catch (error: any) {
    console.error('Error creating admin meeting:', error);
    console.error('Admin ID was:', adminId);
    console.error('Data was:', data);
    throw new Error(error.message || 'Failed to create admin meeting');
  }
}

/**
 * Get all admin sessions
 */
export async function getAdminSessionsService(adminId?: string) {
  try {
    const where: any = {};
    if (adminId) {
      where.created_by = adminId;
    }

    const sessions = await (prisma as any).admin_sessions.findMany({
      where,
      include: {
        Admin: {
          select: {
            name: true,
            email: true,
          },
        },
        User: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return sessions.map((session: any) => ({
      id: session.id,
      name: session.name,
      description: session.description,
      urls: session.urls,
      host_url: session.urls[0],
      join_url: session.urls[1],
      status: session.status,
      receiver_email: session.receiver_email,
      receiver: session.User
        ? {
            name: session.User.name,
            email: session.User.email,
            role: session.User.role,
          }
        : null,
      created_by: {
        name: session.Admin.name,
        email: session.Admin.email,
      },
      created_at: session.created_at,
    }));
  } catch (error) {
    console.error('Error fetching admin sessions:', error);
    throw new Error('Failed to fetch admin sessions');
  }
}

/**
 * Update admin session with receiver email
 */
export async function updateAdminSessionReceiverService(
  sessionId: string,
  receiverEmail: string
) {
  try {
    const session = await (prisma as any).admin_sessions.update({
      where: { id: sessionId },
      data: { receiver_email: receiverEmail },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return {
      id: session.id,
      receiver_email: session.receiver_email,
      receiver: session.User
        ? {
            name: session.User.name,
            email: session.User.email,
            role: session.User.role,
          }
        : null,
    };
  } catch (error) {
    console.error('Error updating admin session receiver:', error);
    throw new Error('Failed to update session receiver');
  }
}

/**
 * Send meeting email to user
 */
export async function sendMeetingEmailService(data: {
  sessionId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  meetingUrl: string;
  adminName: string;
}) {
  try {
    // Update session with receiver email
    await updateAdminSessionReceiverService(data.sessionId, data.recipientEmail);

    // Send email using template
    await sendAdminMeetingInvitationEmail(data.recipientEmail, {
      recipientName: data.recipientName,
      adminName: data.adminName,
      subject: data.subject,
      message: data.message,
      meetingUrl: data.meetingUrl,
    });

    return {
      success: true,
      message: 'Meeting email sent successfully',
      recipient: data.recipientEmail,
    };
  } catch (error: any) {
    console.error('Error sending meeting email:', error);
    throw new Error(error.message || 'Failed to send meeting email');
  }
}

/**
 * Delete admin session
 */
export async function deleteAdminSessionService(sessionId: string, adminId: string) {
  try {
    // Verify ownership
    const session = await (prisma as any).admin_sessions.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.created_by !== adminId) {
      throw new Error('Unauthorized to delete this session');
    }

    await (prisma as any).admin_sessions.delete({
      where: { id: sessionId },
    });

    return { success: true, message: 'Session deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting admin session:', error);
    throw new Error(error.message || 'Failed to delete session');
  }
}

/**
 * Update admin session status
 */
export async function updateAdminSessionStatusService(
  sessionId: string,
  status: 'scheduled' | 'ongoing' | 'completed' | 'canceled'
) {
  try {
    const session = await (prisma as any).admin_sessions.update({
      where: { id: sessionId },
      data: { status },
    });

    return {
      id: session.id,
      status: session.status,
    };
  } catch (error) {
    console.error('Error updating admin session status:', error);
    throw new Error('Failed to update session status');
  }
}
