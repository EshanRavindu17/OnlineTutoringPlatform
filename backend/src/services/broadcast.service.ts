import prisma from '../prismaClient';
import { sendEmail } from './email.service';
import { createBroadcastEmail } from '../templates/emails/emailTemplates';

interface BroadcastEmailData {
  title: string;
  content: string;
  targetAudience: 'all' | 'students' | 'tutors' | 'individual_tutors' | 'mass_tutors';
  priority: 'normal' | 'high' | 'urgent';
  adminName: string;
  adminId: string;
}

/**
 * Send broadcast email to selected audience
 */
export async function sendBroadcastEmailService(data: BroadcastEmailData) {
  const { title, content, targetAudience, priority, adminName, adminId } = data;

  try {
    // Determine which users to send to
    let users: Array<{ email: string; name: string }> = [];

    if (targetAudience === 'all') {
      // Get all users (students + tutors)
      const allUsers = await prisma.user.findMany({
        where: {
          OR: [
            { Student: { some: {} } },
            { Individual_Tutor: { some: {} } },
            { Mass_Tutor: { some: {} } },
          ],
        },
        select: {
          email: true,
          name: true,
        },
      });
      users = allUsers;
    } else if (targetAudience === 'students') {
      // Get all students
      const students = await prisma.user.findMany({
        where: {
          Student: { some: {} },
        },
        select: {
          email: true,
          name: true,
        },
      });
      users = students;
    } else if (targetAudience === 'tutors') {
      // Get all tutors (both individual and mass)
      const tutors = await prisma.user.findMany({
        where: {
          OR: [
            { Individual_Tutor: { some: {} } },
            { Mass_Tutor: { some: {} } },
          ],
        },
        select: {
          email: true,
          name: true,
        },
      });
      users = tutors;
    } else if (targetAudience === 'individual_tutors') {
      // Get only individual tutors
      const individualTutors = await prisma.user.findMany({
        where: {
          Individual_Tutor: { some: {} },
        },
        select: {
          email: true,
          name: true,
        },
      });
      users = individualTutors;
    } else if (targetAudience === 'mass_tutors') {
      // Get only mass tutors
      const massTutors = await prisma.user.findMany({
        where: {
          Mass_Tutor: { some: {} },
        },
        select: {
          email: true,
          name: true,
        },
      });
      users = massTutors;
    }

    if (users.length === 0) {
      throw new Error('No recipients found for the selected audience');
    }

    // Create email content
    const emailContent = createBroadcastEmail({
      recipientName: '', // Will be filled individually
      adminName,
      title,
      content,
      priority,
    });

    // Send emails to all recipients
    const emailPromises = users.map(async (user) => {
      const personalizedContent = createBroadcastEmail({
        recipientName: user.name,
        adminName,
        title,
        content,
        priority,
      });

      try {
        await sendEmail(
          user.email,
          personalizedContent.subject,
          personalizedContent.text,
          personalizedContent.html
        );
        return { email: user.email, status: 'sent', error: null };
      } catch (error: any) {
        console.error(`Failed to send email to ${user.email}:`, error);
        return { email: user.email, status: 'failed', error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.status === 'sent').length;
    const failedCount = results.filter((r) => r.status === 'failed').length;

    // Store broadcast record in database (optional - create a Broadcast table if needed)
    // For now, we'll just return the results

    return {
      success: true,
      message: `Broadcast sent successfully`,
      stats: {
        total: users.length,
        sent: successCount,
        failed: failedCount,
      },
      results,
    };
  } catch (error: any) {
    console.error('Broadcast email service error:', error);
    throw error;
  }
}

/**
 * Get broadcast history
 * Note: This requires a Broadcast table in the database
 * For now, returning empty array as placeholder
 */
export async function getBroadcastHistoryService(adminId: string, limit: number = 50) {
  // TODO: Implement broadcast history storage
  // This would require creating a Broadcast model in Prisma schema
  // For now, returning empty array
  return [];
}
