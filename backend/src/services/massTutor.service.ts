import prisma from '../prismaClient';
import { sendNewMassClassNotificationEmail, sendClassApprovedEmail } from './email.service';

/**
 * Get all classes for a specific mass tutor
 */
export const getTutorClassesService = async (tutorId: string) => {
  try {
    const classes = await prisma.class.findMany({
      where: {
        m_tutor_id: tutorId,
      },
      include: {
        Enrolment: {
          where: {
            status: 'valid',
          },
        },
        ClassSlot: {
          orderBy: {
            dateTime: 'desc',
          },
          take: 5, // Last 5 slots
        },
        Rating_N_Review_Class: {
          select: {
            rating: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Calculate average rating and student count for each class
    const classesWithStats = classes.map((classItem) => {
      const studentCount = classItem.Enrolment.length;
      const ratings = classItem.Rating_N_Review_Class.map((r) => r.rating || 0);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : null;

      return {
        class_id: classItem.class_id,
        title: classItem.title,
        subject: classItem.subject,
        day: classItem.day,
        time: classItem.time,
        description: classItem.description,
        product_id: classItem.product_id,
        price_id: classItem.price_id,
        created_at: classItem.created_at,
        studentCount,
        avgRating: avgRating ? parseFloat(avgRating.toFixed(1)) : null,
        upcomingSlots: classItem.ClassSlot.filter((slot) => slot.status === 'upcoming').length,
      };
    });

    return classesWithStats;
  } catch (error) {
    console.error('Error fetching tutor classes:', error);
    throw new Error('Failed to fetch classes');
  }
};

/**
 * Get a single class by ID with detailed information
 */
export const getClassByIdService = async (classId: string, tutorId: string) => {
  try {
    const classItem = await prisma.class.findFirst({
      where: {
        class_id: classId,
        m_tutor_id: tutorId, // Ensure tutor owns this class
      },
      include: {
        Mass_Tutor: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true,
              },
            },
          },
        },
        Enrolment: {
          where: {
            status: 'valid',
          },
          include: {
            Student: {
              include: {
                User: {
                  select: {
                    name: true,
                    email: true,
                    photo_url: true,
                  },
                },
              },
            },
          },
        },
        ClassSlot: {
          orderBy: {
            dateTime: 'desc',
          },
        },
        Rating_N_Review_Class: {
          include: {
            Student: {
              include: {
                User: {
                  select: {
                    name: true,
                    photo_url: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!classItem) {
      throw new Error('Class not found or access denied');
    }

    return classItem;
  } catch (error) {
    console.error('Error fetching class details:', error);
    throw error;
  }
};

/**
 * Create a new class
 */
export const createClassService = async (
  tutorId: string,
  data: {
    title: string;
    subject: string;
    day: string;
    time: string; // Format: "HH:MM:SS"
    description?: string;
    product_id?: string;
    price_id?: string;
  }
) => {
  try {
    console.log('Creating class with data:', { tutorId, data });

    // Verify tutor exists
    const tutor = await prisma.mass_Tutor.findUnique({
      where: { m_tutor_id: tutorId },
    });

    if (!tutor) {
      console.error('Tutor not found:', tutorId);
      throw new Error('Tutor not found');
    }

    console.log('Tutor found:', tutor.m_tutor_id);

    // Convert time string to DateTime object
    // Prisma expects DateTime even for Time fields
    let formattedTime = data.time;
    
    // If time doesn't have seconds, add them
    if (data.time && data.time.split(':').length === 2) {
      formattedTime = `${data.time}:00`;
    }

    // Create a DateTime with today's date but the specified time
    // Format: YYYY-MM-DDTHH:MM:SS (ISO-8601)
    const timeDate = new Date();
    const [hours, minutes, seconds] = formattedTime.split(':').map(Number);
    timeDate.setHours(hours, minutes, seconds, 0);
    
    console.log('Creating class with DateTime object:', timeDate.toISOString());

    // Create the class
    const newClass = await prisma.class.create({
      data: {
        m_tutor_id: tutorId,
        title: data.title,
        subject: data.subject,
        day: data.day,
        time: timeDate,
        description: data.description || null,
        product_id: data.product_id || null,
        price_id: data.price_id || null,
      },
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
    });

    console.log('Class created successfully:', newClass.class_id);

    // Send notification email to admin (async - don't block response)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tutorly.com';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Format time for email (convert Date back to HH:MM format)
    const timeStr = `${timeDate.getHours().toString().padStart(2, '0')}:${timeDate.getMinutes().toString().padStart(2, '0')}`;
    
    sendNewMassClassNotificationEmail(adminEmail, {
      tutorName: newClass.Mass_Tutor?.User?.name || 'Unknown',
      tutorEmail: newClass.Mass_Tutor?.User?.email || '',
      className: newClass.title || '',
      subject: newClass.subject || '',
      day: newClass.day || '',
      time: timeStr,
      description: newClass.description || undefined,
      classId: newClass.class_id,
      dashboardUrl: `${frontendUrl}/admin/classes/${newClass.class_id}`,
    }).catch((error) => {
      // Log error but don't fail the class creation
      console.error('Failed to send admin notification email:', error);
    });

    // AUTO-APPROVE: Send approval email to tutor after 5 seconds
    // TODO: Remove this when admin approval system is implemented
    const tutorEmail = newClass.Mass_Tutor?.User?.email;
    
    if (tutorEmail) {
      console.log(`Auto-approval email scheduled for class: ${newClass.class_id} (will send in 5 seconds)`);
      
      setTimeout(() => {
        sendClassApprovedEmail(tutorEmail, {
          tutorName: newClass.Mass_Tutor?.User?.name || 'Unknown',
          className: newClass.title || '',
          subject: newClass.subject || '',
          day: newClass.day || '',
          time: timeStr,
          dashboardUrl: `${frontendUrl}/mass-tutor/classes`,
        }).catch((error) => {
          console.error('Failed to send class approval email:', error);
        });
        
        console.log(`Auto-approval email sent for class: ${newClass.class_id}`);
      }, 5000); // 5 seconds delay
    }

    return newClass;
  } catch (error) {
    console.error('Error creating class:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to create class');
  }
};

/**
 * Update an existing class
 */
export const updateClassService = async (
  classId: string,
  tutorId: string,
  data: {
    title?: string;
    subject?: string;
    day?: string;
    time?: string;
    description?: string;
    product_id?: string;
    price_id?: string;
  }
) => {
  try {
    // Verify class exists and belongs to tutor
    const existingClass = await prisma.class.findFirst({
      where: {
        class_id: classId,
        m_tutor_id: tutorId,
      },
    });

    if (!existingClass) {
      throw new Error('Class not found or access denied');
    }

    // Convert time to DateTime if provided
    let timeDate: Date | undefined;
    if (data.time) {
      let formattedTime = data.time;
      if (data.time.split(':').length === 2) {
        formattedTime = `${data.time}:00`;
      }
      timeDate = new Date();
      const [hours, minutes, seconds] = formattedTime.split(':').map(Number);
      timeDate.setHours(hours, minutes, seconds, 0);
    }

    // Update the class
    const updatedClass = await prisma.class.update({
      where: { class_id: classId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.subject && { subject: data.subject }),
        ...(data.day && { day: data.day }),
        ...(timeDate && { time: timeDate }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.product_id !== undefined && { product_id: data.product_id }),
        ...(data.price_id !== undefined && { price_id: data.price_id }),
      },
    });

    return updatedClass;
  } catch (error) {
    console.error('Error updating class:', error);
    throw error;
  }
};

/**
 * Delete a class
 */
export const deleteClassService = async (classId: string, tutorId: string) => {
  try {
    // Verify class exists and belongs to tutor
    const existingClass = await prisma.class.findFirst({
      where: {
        class_id: classId,
        m_tutor_id: tutorId,
      },
    });

    if (!existingClass) {
      throw new Error('Class not found or access denied');
    }

    // Check if class has active enrollments
    const activeEnrollments = await prisma.enrolment.count({
      where: {
        class_id: classId,
        status: 'valid',
      },
    });

    if (activeEnrollments > 0) {
      throw new Error('Cannot delete class with active enrollments');
    }

    // Delete the class (cascade will handle related records)
    await prisma.class.delete({
      where: { class_id: classId },
    });

    return { success: true, message: 'Class deleted successfully' };
  } catch (error) {
    console.error('Error deleting class:', error);
    throw error;
  }
};

/**
 * Create a class slot (schedule a class session)
 */
export const createClassSlotService = async (
  classId: string,
  tutorId: string,
  data: {
    dateTime: Date;
    duration: number; // in hours
    meetingURLs?: string[];
    materials?: string[];
    announcement?: string;
  }
) => {
  try {
    // Verify class exists and belongs to tutor
    const existingClass = await prisma.class.findFirst({
      where: {
        class_id: classId,
        m_tutor_id: tutorId,
      },
    });

    if (!existingClass) {
      throw new Error('Class not found or access denied');
    }

    // Create the class slot
    const newSlot = await prisma.classSlot.create({
      data: {
        class_id: classId,
        dateTime: data.dateTime,
        duration: data.duration,
        meetingURLs: data.meetingURLs || [],
        materials: data.materials || [],
        announcement: data.announcement,
        status: 'upcoming',
      },
    });

    return newSlot;
  } catch (error) {
    console.error('Error creating class slot:', error);
    throw new Error('Failed to create class slot');
  }
};

/**
 * Update a class slot
 */
export const updateClassSlotService = async (
  slotId: string,
  tutorId: string,
  data: {
    dateTime?: Date;
    duration?: number;
    meetingURLs?: string[];
    materials?: string[];
    announcement?: string;
    recording?: string;
    status?: 'upcoming' | 'completed';
  }
) => {
  try {
    // Verify slot exists and belongs to tutor
    const slot = await prisma.classSlot.findUnique({
      where: { cslot_id: slotId },
      include: {
        Class: true,
      },
    });

    if (!slot || slot.Class?.m_tutor_id !== tutorId) {
      throw new Error('Class slot not found or access denied');
    }

    // Update the slot
    const updatedSlot = await prisma.classSlot.update({
      where: { cslot_id: slotId },
      data: {
        ...(data.dateTime && { dateTime: data.dateTime }),
        ...(data.duration && { duration: data.duration }),
        ...(data.meetingURLs && { meetingURLs: data.meetingURLs }),
        ...(data.materials && { materials: data.materials }),
        ...(data.announcement !== undefined && { announcement: data.announcement }),
        ...(data.recording !== undefined && { recording: data.recording }),
        ...(data.status && { status: data.status }),
      },
    });

    return updatedSlot;
  } catch (error) {
    console.error('Error updating class slot:', error);
    throw error;
  }
};

/**
 * Delete a class slot
 */
export const deleteClassSlotService = async (slotId: string, tutorId: string) => {
  try {
    // Verify slot exists and belongs to tutor
    const slot = await prisma.classSlot.findUnique({
      where: { cslot_id: slotId },
      include: {
        Class: true,
      },
    });

    if (!slot || slot.Class?.m_tutor_id !== tutorId) {
      throw new Error('Class slot not found or access denied');
    }

    // Delete the slot
    await prisma.classSlot.delete({
      where: { cslot_id: slotId },
    });

    return { success: true, message: 'Class slot deleted successfully' };
  } catch (error) {
    console.error('Error deleting class slot:', error);
    throw error;
  }
};

/**
 * Get class statistics for a tutor
 */
export const getClassStatsService = async (tutorId: string) => {
  try {
    const totalClasses = await prisma.class.count({
      where: { m_tutor_id: tutorId },
    });

    const totalStudents = await prisma.enrolment.count({
      where: {
        Class: {
          m_tutor_id: tutorId,
        },
        status: 'valid',
      },
    });

    const upcomingSlots = await prisma.classSlot.count({
      where: {
        Class: {
          m_tutor_id: tutorId,
        },
        status: 'upcoming',
        dateTime: {
          gte: new Date(),
        },
      },
    });

    const completedSlots = await prisma.classSlot.count({
      where: {
        Class: {
          m_tutor_id: tutorId,
        },
        status: 'completed',
      },
    });

    return {
      totalClasses,
      totalStudents,
      upcomingSlots,
      completedSlots,
    };
  } catch (error) {
    console.error('Error fetching class stats:', error);
    throw new Error('Failed to fetch class statistics');
  }
};

/**
 * Get all slots for a specific class
 */
export const getClassSlotsService = async (classId: string, tutorId: string) => {
  try {
    // Verify class exists and belongs to tutor
    const classItem = await prisma.class.findFirst({
      where: {
        class_id: classId,
        m_tutor_id: tutorId,
      },
    });

    if (!classItem) {
      throw new Error('Class not found or access denied');
    }

    // Get all slots for the class
    const slots = await prisma.classSlot.findMany({
      where: {
        class_id: classId,
      },
      orderBy: {
        dateTime: 'desc',
      },
    });

    return slots;
  } catch (error) {
    console.error('Error fetching class slots:', error);
    throw error;
  }
};

/**
 * Create Zoom meeting and update class slot
 */
export const createZoomMeetingForSlotService = async (
  classId: string,
  slotId: string,
  tutorId: string,
  topic: string,
  startTime: string,
  duration: number
) => {
  try {
    // Verify class exists and belongs to tutor
    const classItem = await prisma.class.findFirst({
      where: {
        class_id: classId,
        m_tutor_id: tutorId,
      },
    });

    if (!classItem) {
      throw new Error('Class not found or access denied');
    }

    // Verify slot exists
    const slot = await prisma.classSlot.findUnique({
      where: { cslot_id: slotId },
    });

    if (!slot || slot.class_id !== classId) {
      throw new Error('Class slot not found');
    }

    // Create Zoom meeting
    const { createZoomMeeting } = await import('./zoom.service');
    const { host_url, join_url } = await createZoomMeeting(topic, startTime, duration);

    // Update slot with meeting URLs
    const updatedSlot = await prisma.classSlot.update({
      where: { cslot_id: slotId },
      data: {
        meetingURLs: [host_url, join_url], // First is host URL, second is join URL
      },
    });

    return {
      message: 'Zoom meeting created successfully',
      slot: updatedSlot,
      host_url,
      join_url,
    };
  } catch (error) {
    console.error('Error creating Zoom meeting for slot:', error);
    throw error;
  }
};

/**
 * Get all enrollments for a specific class
 */
export const getClassEnrollmentsService = async (classId: string, tutorId: string) => {
  try {
    // Verify class exists and belongs to tutor
    const classItem = await prisma.class.findFirst({
      where: {
        class_id: classId,
        m_tutor_id: tutorId,
      },
    });

    if (!classItem) {
      throw new Error('Class not found or access denied');
    }

    // Get all enrollments with student details
    const enrollments = await prisma.enrolment.findMany({
      where: {
        class_id: classId,
      },
      include: {
        Student: {
          include: {
            User: {
              select: {
                name: true,
                email: true,
                photo_url: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Format the response
    const formattedEnrollments = enrollments.map((enrollment) => ({
      enrol_id: enrollment.enrol_id,
      student_id: enrollment.student_id,
      status: enrollment.status,
      subscription_id: enrollment.subscription_id,
      created_at: enrollment.created_at,
      student: {
        name: enrollment.Student?.User?.name || 'Unknown',
        email: enrollment.Student?.User?.email || 'N/A',
        photo_url: enrollment.Student?.User?.photo_url || null,
      },
    }));

    // Calculate stats
    const paidCount = enrollments.filter((e) => e.status === 'valid').length;
    const unpaidCount = enrollments.filter((e) => e.status === 'invalid').length;

    return {
      enrollments: formattedEnrollments,
      stats: {
        total: enrollments.length,
        paid: paidCount,
        unpaid: unpaidCount,
      },
    };
  } catch (error) {
    console.error('Error fetching class enrollments:', error);
    throw error;
  }
};
