import prisma from '../prismaClient';
import { sendNewMassClassNotificationEmail, sendClassApprovedEmail, sendCustomMessageEmail } from './email.service';

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
    
    // Validate the Date object
    if (isNaN(timeDate.getTime())) {
      throw new Error('Invalid time format. Please use HH:MM:SS or HH:MM format.');
    }
    
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
      
      // Validate the Date object
      if (isNaN(timeDate.getTime())) {
        throw new Error('Invalid time format. Please use HH:MM:SS or HH:MM format.');
      }
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

/**
 * Send custom email to student
 */
export const sendStudentEmailService = async (
  tutorId: string,
  data: {
    studentEmail: string;
    subject: string;
    message: string;
    className?: string;
  }
) => {
  try {
    // Get tutor details
    const tutor = await prisma.mass_Tutor.findUnique({
      where: { m_tutor_id: tutorId },
      include: {
        User: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!tutor) {
      const error: any = new Error('Tutor profile not found. Please contact support.');
      error.code = 'TUTOR_NOT_FOUND';
      throw error;
    }

    // Get student details - check if user exists with this email
    const student = await prisma.user.findUnique({
      where: { email: data.studentEmail },
      include: {
        Student: true,
      },
    });

    if (!student) {
      const error: any = new Error(`No student found with email "${data.studentEmail}". The student must be registered on the platform to receive emails.`);
      error.code = 'STUDENT_NOT_FOUND';
      throw error;
    }

    // Check if the user is actually a student
    if (!student.Student || student.Student.length === 0) {
      const error: any = new Error(`The email "${data.studentEmail}" belongs to a registered user, but not as a student. Only students can receive tutor messages.`);
      error.code = 'NOT_A_STUDENT';
      throw error;
    }

    const tutorName = tutor.User?.name || 'Your Tutor';
    const studentName = student.name || 'Student';

    // Send the email
    try {
      await sendCustomMessageEmail(data.studentEmail, {
        tutorName,
        studentName,
        studentEmail: data.studentEmail,
        subject: data.subject,
        message: data.message,
        className: data.className,
      });
    } catch (emailError: any) {
      console.error('Email delivery error:', emailError);
      const error: any = new Error('Failed to send email. Please check your email service configuration or try again later.');
      error.code = 'EMAIL_DELIVERY_FAILED';
      error.originalError = emailError.message;
      throw error;
    }

    return {
      success: true,
      message: `Email sent successfully to ${studentName} (${data.studentEmail})`,
      studentName,
    };
  } catch (error: any) {
    console.error('Error sending student email:', error);
    // Re-throw with code if it has one, otherwise create generic error
    if (error.code) {
      throw error;
    }
    const genericError: any = new Error('An unexpected error occurred while sending the email.');
    genericError.code = 'UNKNOWN_ERROR';
    throw genericError;
  }
};

/**
 * Get tutor profile information
 */
export const getTutorProfileService = async (tutorId: string) => {
  try {
    const tutor = await prisma.mass_Tutor.findUnique({
      where: { m_tutor_id: tutorId },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            dob: true,
            bio: true,
            photo_url: true,
          },
        },
      },
    });

    if (!tutor) {
      throw new Error('Tutor profile not found');
    }

    return {
      tutorId: tutor.m_tutor_id,
      name: tutor.User?.name,
      email: tutor.User?.email,
      dob: tutor.User?.dob,
      bio: tutor.User?.bio,
      photo_url: tutor.User?.photo_url,
      subjects: tutor.subjects,
      qualifications: tutor.qualifications,
      description: tutor.description,
      heading: tutor.heading,
      location: tutor.location,
      phone_number: tutor.phone_number,
      prices: tutor.prices ? parseFloat(tutor.prices.toString()) : null,
      rating: tutor.rating ? parseFloat(tutor.rating.toString()) : null,
      status: tutor.status,
    };
  } catch (error) {
    console.error('Error fetching tutor profile:', error);
    throw error;
  }
};

/**
 * Update tutor profile information
 */
export const updateTutorProfileService = async (
  tutorId: string,
  firebaseUid: string,
  data: {
    name?: string;
    dob?: string;
    bio?: string;
    subjects?: string[];
    qualifications?: string[];
    description?: string;
    heading?: string;
    location?: string;
    phone_number?: string;
    prices?: number;
  }
) => {
  try {
    // Verify tutor exists
    const tutor = await prisma.mass_Tutor.findUnique({
      where: { m_tutor_id: tutorId },
      include: {
        User: true,
      },
    });

    if (!tutor) {
      throw new Error('Tutor profile not found');
    }

    // Validate price against admin threshold
    if (data.prices !== undefined) {
      // Fetch the active mass_monthly rate threshold
      const rateThreshold: any = await (prisma as any).paymentrates.findFirst({
        where: {
          type: 'mass_monthly',
          status: 'active',
        },
        select: {
          value: true,
        },
      });

      const maxRate = rateThreshold ? parseFloat(rateThreshold.value.toString()) : 10000;

      if (data.prices < 0 || data.prices > maxRate) {
        throw new Error(`Monthly rate must be between LKR 0 and LKR ${maxRate.toLocaleString()} (capped by admin)`);
      }
    }

    // Update User table if user-related fields are provided
    if (data.name || data.dob || data.bio) {
      await prisma.user.update({
        where: { firebase_uid: firebaseUid },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.dob && { dob: new Date(data.dob) }),
          ...(data.bio && { bio: data.bio }),
        },
      });
    }

    // Update Mass_Tutor table
    const updatedTutor = await prisma.mass_Tutor.update({
      where: { m_tutor_id: tutorId },
      data: {
        ...(data.subjects && { subjects: data.subjects }),
        ...(data.qualifications && { qualifications: data.qualifications }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.heading !== undefined && { heading: data.heading }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.phone_number !== undefined && { phone_number: data.phone_number }),
        ...(data.prices !== undefined && { prices: data.prices }),
      },
      include: {
        User: {
          select: {
            name: true,
            email: true,
            dob: true,
            bio: true,
            photo_url: true,
          },
        },
      },
    });

    return {
      tutorId: updatedTutor.m_tutor_id,
      name: updatedTutor.User?.name,
      email: updatedTutor.User?.email,
      dob: updatedTutor.User?.dob,
      bio: updatedTutor.User?.bio,
      photo_url: updatedTutor.User?.photo_url,
      subjects: updatedTutor.subjects,
      qualifications: updatedTutor.qualifications,
      description: updatedTutor.description,
      heading: updatedTutor.heading,
      location: updatedTutor.location,
      phone_number: updatedTutor.phone_number,
      prices: updatedTutor.prices ? parseFloat(updatedTutor.prices.toString()) : null,
      rating: updatedTutor.rating ? parseFloat(updatedTutor.rating.toString()) : null,
      status: updatedTutor.status,
    };
  } catch (error) {
    console.error('Error updating tutor profile:', error);
    throw error;
  }
};

/**
 * Get earnings data for mass tutor
 */
export const getTutorEarningsService = async (tutorId: string) => {
  try {
    // Get the latest commission rate
    const latestCommission = await prisma.commission.findFirst({
      orderBy: {
        created_at: 'desc',
      },
    });

    const commissionRate = latestCommission?.value || 20; // Default 20% if not found

    // Get all classes for this tutor
    const tutorClasses = await prisma.class.findMany({
      where: {
        m_tutor_id: tutorId,
      },
      select: {
        class_id: true,
      },
    });

    const classIds = tutorClasses.map((c) => c.class_id);

    if (classIds.length === 0) {
      return {
        commissionRate,
        earnings: [],
      };
    }

    // Get all payments for tutor's classes, grouped by month
    const payments = await prisma.mass_Payments.findMany({
      where: {
        class_id: {
          in: classIds,
        },
        status: 'success',
      },
      select: {
        amount: true,
        paidMonth: true,
        payment_time: true,
      },
      orderBy: {
        payment_time: 'desc',
      },
    });

    // Group payments by month
    const earningsByMonth = new Map<string, number>();

    payments.forEach((payment) => {
      const month = payment.paidMonth || 
                   (payment.payment_time 
                     ? new Date(payment.payment_time).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                     : 'Unknown');
      
      const currentTotal = earningsByMonth.get(month) || 0;
      earningsByMonth.set(month, currentTotal + (payment.amount || 0));
    });

    // Convert to array and calculate commission/payout
    const earnings = Array.from(earningsByMonth.entries()).map(([month, gross]) => {
      const commissionAmount = (gross * commissionRate) / 100;
      const payout = gross - commissionAmount;

      return {
        month,
        gross: parseFloat(gross.toFixed(2)),
        commission: commissionRate,
        commissionAmount: parseFloat(commissionAmount.toFixed(2)),
        payout: parseFloat(payout.toFixed(2)),
      };
    });

    // Sort by date (most recent first)
    earnings.sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateB.getTime() - dateA.getTime();
    });

    return {
      commissionRate,
      earnings,
    };
  } catch (error) {
    console.error('Error fetching tutor earnings:', error);
    throw error;
  }
};

/**
 * Get comprehensive dashboard analytics for mass tutor
 */
export const getDashboardAnalyticsService = async (tutorId: string) => {
  try {
    // Get all classes for this tutor with enrollments and slots
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
          select: {
            cslot_id: true,
            dateTime: true,
            status: true,
          },
        },
        Rating_N_Review_Class: {
          select: {
            rating: true,
          },
        },
      },
    });

    const classIds = classes.map((c) => c.class_id);

    // Get payment data for revenue analysis
    const payments = await prisma.mass_Payments.findMany({
      where: {
        class_id: {
          in: classIds,
        },
        status: 'success',
      },
      select: {
        amount: true,
        paidMonth: true,
        payment_time: true,
        class_id: true,
      },
    });

    // Get commission rate
    const latestCommission = await prisma.commission.findFirst({
      orderBy: {
        created_at: 'desc',
      },
    });
    const commissionRate = latestCommission?.value || 20;

    // 1. Revenue per class
    const revenueByClass = new Map<string, number>();
    payments.forEach((payment) => {
      if (payment.class_id) {
        const current = revenueByClass.get(payment.class_id) || 0;
        const netRevenue = payment.amount * (1 - commissionRate / 100);
        revenueByClass.set(payment.class_id, current + netRevenue);
      }
    });

    const revenuePerClass = classes.map((c) => ({
      className: c.title,
      subject: c.subject,
      revenue: parseFloat((revenueByClass.get(c.class_id) || 0).toFixed(2)),
    })).sort((a, b) => b.revenue - a.revenue);

    // 2. Students per class
    const studentsPerClass = classes.map((c) => ({
      className: c.title,
      subject: c.subject,
      students: c.Enrolment.length,
    })).sort((a, b) => b.students - a.students);

    // 3. Average rating per class
    const ratingsPerClass = classes.map((c) => {
      const ratings = c.Rating_N_Review_Class
        .filter((r) => r.rating !== null)
        .map((r) => r.rating as number);
      const avgRating = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : 0;
      
      return {
        className: c.title,
        subject: c.subject,
        rating: parseFloat(avgRating.toFixed(1)),
        reviewCount: c.Rating_N_Review_Class.length,
      };
    }).sort((a, b) => b.rating - a.rating);

    // 4. Revenue by month
    const revenueByMonth = new Map<string, number>();
    payments.forEach((payment) => {
      const month = payment.paidMonth || 
                   (payment.payment_time 
                     ? new Date(payment.payment_time).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                     : 'Unknown');
      
      const netRevenue = payment.amount * (1 - commissionRate / 100);
      const current = revenueByMonth.get(month) || 0;
      revenueByMonth.set(month, current + netRevenue);
    });

    const revenueByMonthArray = Array.from(revenueByMonth.entries())
      .map(([month, revenue]) => ({
        month,
        revenue: parseFloat(revenue.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // 5. Sessions per class (upcoming and completed)
    const sessionsPerClass = classes.map((c) => ({
      className: c.title,
      subject: c.subject,
      upcoming: c.ClassSlot.filter((s) => s.status === 'upcoming' && new Date(s.dateTime) > new Date()).length,
      completed: c.ClassSlot.filter((s) => s.status === 'completed').length,
      total: c.ClassSlot.length,
    })).sort((a, b) => b.total - a.total);

    // 6. Overall statistics
    const totalStudents = classes.reduce((sum, c) => sum + c.Enrolment.length, 0);
    const totalRevenue = Array.from(revenueByClass.values()).reduce((sum, r) => sum + r, 0);
    const totalSessions = classes.reduce((sum, c) => sum + c.ClassSlot.length, 0);
    const upcomingSessions = classes.reduce((sum, c) => 
      sum + c.ClassSlot.filter((s) => s.status === 'upcoming' && new Date(s.dateTime) > new Date()).length, 0
    );
    const avgRating = ratingsPerClass.filter((r) => r.rating > 0).reduce((sum, r, _, arr) => 
      sum + r.rating / arr.length, 0
    );

    return {
      overview: {
        totalClasses: classes.length,
        totalStudents,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalSessions,
        upcomingSessions,
        averageRating: parseFloat(avgRating.toFixed(1)),
        commissionRate,
      },
      revenuePerClass,
      studentsPerClass,
      ratingsPerClass,
      revenueByMonth: revenueByMonthArray,
      sessionsPerClass,
    };
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    throw error;
  }
};

/**
 * Get all reviews and ratings for a mass tutor's classes
 */
export const getTutorReviewsService = async (tutorId: string) => {
  try {
    // Get all classes for this tutor
    const tutorClasses = await prisma.class.findMany({
      where: {
        m_tutor_id: tutorId,
      },
      select: {
        class_id: true,
        title: true,
        subject: true,
      },
    });

    if (tutorClasses.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        classesByRating: [],
      };
    }

    const classIds = tutorClasses.map((c) => c.class_id);

    // Get all reviews for these classes
    const reviews = await prisma.rating_N_Review_Class.findMany({
      where: {
        class_id: {
          in: classIds,
        },
      },
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
        Class: {
          select: {
            class_id: true,
            title: true,
            subject: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Group reviews by class
    const reviewsByClass = new Map<string, any[]>();
    
    reviews.forEach((review) => {
      const classId = review.class_id;
      if (!classId) return;

      if (!reviewsByClass.has(classId)) {
        reviewsByClass.set(classId, []);
      }

      reviewsByClass.get(classId)?.push({
        r_id: review.r_id,
        rating: review.rating,
        review: review.review,
        created_at: review.created_at,
        studentName: review.Student?.User?.name || 'Anonymous',
        studentPhoto: review.Student?.User?.photo_url || null,
      });
    });

    // Calculate statistics for each class
    const classesByRating = Array.from(reviewsByClass.entries()).map(([classId, classReviews]) => {
      const classInfo = tutorClasses.find((c) => c.class_id === classId);
      const ratings = classReviews.filter((r) => r.rating !== null).map((r) => r.rating as number);
      const avgRating = ratings.length > 0 
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length 
        : 0;

      return {
        class_id: classId,
        className: classInfo?.title || 'Unknown Class',
        subject: classInfo?.subject || '',
        reviewCount: classReviews.length,
        averageRating: parseFloat(avgRating.toFixed(1)),
        reviews: classReviews.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      };
    });

    // Sort classes by average rating (highest first)
    classesByRating.sort((a, b) => b.averageRating - a.averageRating);

    // Calculate overall statistics
    const totalReviews = reviews.length;
    const allRatings = reviews.filter((r) => r.rating !== null).map((r) => r.rating as number);
    const averageRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : 0;

    return {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      classesByRating,
    };
  } catch (error) {
    console.error('Error fetching tutor reviews:', error);
    throw error;
  }
};
