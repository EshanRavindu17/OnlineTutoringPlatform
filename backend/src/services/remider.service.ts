import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendSessionReminderEmail } from './email.service';
import { DateTime } from 'luxon';
import { start } from 'repl';
import { getZak } from './zoom.service';

const prisma = new PrismaClient();

interface SessionWithDetails {
  session_id: string;
  date: Date | null;
  start_time: Date | null;
  title: string | null;
  meeting_urls: string[];
  slots: Date[];
  Student: {
    User: {
      name: string;
      email: string;
    };
  } | null;
  Individual_Tutor: {
    User: {
      name: string;
      email: string;
    };
  } | null;
}

interface ClassSlotWithDetails {
  cslot_id: string;
  dateTime: Date | null;
  meetingURLs: string[];
  Class: {
    title: string | null;
    Mass_Tutor: {
      User: {
        name: string;
        email: string;
      };
    } | null;
  } | null;
  // Get all students enrolled in this class
  enrolledStudents?: {
    Student: {
      User: {
        name: string;
        email: string;
      };
    };
  }[];
}

// Get upcoming individual sessions that need reminders
export const getUpcomingIndividualSessions = async (hoursAhead: number): Promise<SessionWithDetails[]> => {
  const now = new Date();
  console.log('Current time:', now.toISOString());
  const reminderTime = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000)+(5*60*60*1000)+(30*60*1000)); // Adjust for GMT+5:30
  console.log('Reminder time window:', reminderTime);
  const timeBuffer = new Date(reminderTime.getTime() + (10 * 60 * 1000)); // 10-minute buffer

  const timeBufferDate = new Date(`1970-01-01T${timeBuffer.toISOString().split('T')[1].split('.')[0]}.000Z`);
  console.log('Time buffer date:', timeBufferDate);

  const date = DateTime.fromJSDate(reminderTime).toFormat('yyyy-MM-dd');
  const time = DateTime.fromJSDate(reminderTime).toFormat('HH:mm:ss');


  const startTime = reminderTime.toISOString().split('T')[1].split('.')[0];
  // console.log('startTime',startTime)
  const startDate = new Date(`1970-01-01T${startTime}.000Z`);
  console.log('startDate',startDate);
  // console.log('Checking for sessions on date:', startDate.toISOString());
  // console.log(`Fetching sessions between ${reminderTime.toISOString()} and ${timeBuffer.toISOString()} (Date: ${date}, Time: ${time})`);
  const todate = new Date().toISOString().split('T')[0]+'T00:00:00.000Z';
  console.log('Today date:', todate);
  
  try {
    const sessions = await prisma.sessions.findMany({
      where: {
        status: 'scheduled',
        date: { equals: todate },
        // start_time: {
        //   gte: startTime,
        // }
        
      },
      include: {
        Student: {
          select: {
            User: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        Individual_Tutor: {
          select: {
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

    console.log(sessions);

    const filtered = sessions.filter(s=>
      s.slots.length > 0 && startDate <= s.slots[0] && s.slots[0] <= timeBufferDate
    )

    // return sessions;
    return filtered;
  } catch (error) {
    console.error('Error fetching upcoming individual sessions:', error);
    return [];
  }
};

// Get upcoming mass class slots that need reminders
export const getUpcomingClassSlots = async (hoursAhead: number): Promise<ClassSlotWithDetails[]> => {
  const now = new Date();
  console.log(now);
  const reminderTime = new Date(now.getTime() + (hoursAhead * 60 * 60 * 1000)+5*60*60*1000+30*60*1000);
  console.log('Reminder:', reminderTime);
  const timeBuffer = new Date(reminderTime.getTime() + (10 * 60 * 1000)); // 10-minute buffer
  console.log('timeBuffer:', timeBuffer);
  
  try {
    const classSlots = await prisma.classSlot.findMany({
      where: {
        status: 'upcoming',
        dateTime: {
          gte: reminderTime,
          lte: timeBuffer
        }
      },
      include: {
        Class: {
          select: {
            title: true,
            Mass_Tutor: {
              select: {
                User: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            Enrolment: {
              where: {
                status: 'valid'
              },
              select: {
                Student: {
                  select: {
                    User: {
                      select: {
                        name: true,
                        email: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Transform the data to match our interface
    return classSlots.map(slot => ({
      ...slot,
      enrolledStudents: slot.Class?.Enrolment.map(enrolment => ({
        Student: enrolment.Student
      })) || []
    }));
  } catch (error) {
    console.error('Error fetching upcoming class slots:', error);
    return [];
  }
};

// Send reminder emails for individual sessions
const sendIndividualSessionReminders = async (hoursAhead: number) => {
  const sessions = await getUpcomingIndividualSessions(hoursAhead);
  const reminderText = hoursAhead === 24 ? '24 hours' : '1 hour';
  
  console.log(`🔔 Found ${sessions.length} individual sessions needing ${reminderText} reminders`);

  for (const session of sessions) {
    try {
      if (!session.Student?.User || !session.Individual_Tutor?.User) {
        console.warn(`Skipping session ${session.session_id} - missing user data`);
        continue;
      }

      const sessionDateTime =  session.date;
      if (!sessionDateTime) {
        console.warn(`Skipping session ${session.session_id} - missing date/time`);
        continue;
      }

      const formattedDate = DateTime.fromJSDate(sessionDateTime).toFormat('MMMM dd, yyyy');
      const formattedTime = DateTime.fromJSDate(new Date(session.slots[0].toISOString().split('.')[0])).toFormat('h:mm a');
      const I_Tutor_meetingLink = session.meeting_urls?.[0] || undefined;
      // get's updated url
      try {
        var updatedIndividualTutorMeetingLink = await getZak(I_Tutor_meetingLink);
        console.log('Updated Individual Tutor Meeting Link:', updatedIndividualTutorMeetingLink);
      } catch (error) {
        console.error(`❌ Failed to update Individual Tutor Meeting Link for session ${session.session_id}:`, error);
        var updatedIndividualTutorMeetingLink = I_Tutor_meetingLink;
      }

      const student_meetingLink = session.meeting_urls?.[1] || undefined; // Fallback to tutor link if student link missing

      // Send reminder to student
      await sendSessionReminderEmail(
        session.Student.User.email,
        'student',
        session.Student.User.name,
        session.Individual_Tutor.User.name,
        formattedDate,
        formattedTime,
        reminderText,
        student_meetingLink
      );

      // Send reminder to tutor
      await sendSessionReminderEmail(
        session.Individual_Tutor.User.email,
        'tutor',
        session.Student.User.name,
        session.Individual_Tutor.User.name,
        formattedDate,
        formattedTime,
        reminderText,
        updatedIndividualTutorMeetingLink
      );

      console.log(`✅ Sent ${reminderText} reminder for session ${session.session_id}`);
      
      // Add small delay to avoid overwhelming email service
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to send reminder for session ${session.session_id}:`, error);
    }
  }
};

// Send reminder emails for mass class slots
const sendMassClassReminders = async (hoursAhead: number) => {
  const classSlots = await getUpcomingClassSlots(hoursAhead);
  const reminderText = hoursAhead === 24 ? '24 hours' : '1 hour';
  
  console.log(`🔔 Found ${classSlots.length} mass class slots needing ${reminderText} reminders`);

  for (const slot of classSlots) {
    try {
      if (!slot.Class?.Mass_Tutor?.User || !slot.dateTime) {
        console.warn(`Skipping class slot ${slot.cslot_id} - missing data`);
        continue;
      }

      const formattedDate = DateTime.fromJSDate(slot.dateTime).toFormat('MMMM dd, yyyy');
      const formattedTime = DateTime.fromJSDate(slot.dateTime).toFormat('h:mm a');
      const tutorMeetingLink = slot.meetingURLs?.[0] || undefined;
      const studentMeetingLink = slot.meetingURLs?.[1] || undefined; // Fallback to tutor link if student link missing
      const className = slot.Class.title || 'Class Session';
      const tutorName = slot.Class.Mass_Tutor.User.name;

      try {
        var newTutorMeetingLink = await getZak(tutorMeetingLink);
        console.log('Updated Mass Class Tutor Meeting Link:', newTutorMeetingLink);
      } catch (error) {
        console.error(`❌ Failed to update Mass Class Tutor Meeting Link for slot ${slot.cslot_id}:`, error);
        var newTutorMeetingLink = tutorMeetingLink;
      }

      // Send reminders to all enrolled students
      const students = slot.enrolledStudents || [];
      console.log(`📧 Sending ${reminderText} reminders to ${students.length} students for class: ${className}`);

      for (const enrollment of students) {
        try {
          await sendSessionReminderEmail(
            enrollment.Student.User.email,
            'student',
            enrollment.Student.User.name,
            tutorName,
            formattedDate,
            formattedTime,
            reminderText,
            studentMeetingLink
          );

          // Add small delay between emails
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${enrollment.Student.User.email}:`, error);
        }
      }

      // Send reminder to tutor
      await sendSessionReminderEmail(
        slot.Class.Mass_Tutor.User.email,
        'tutor',
        `${students.length} students`,
        tutorName,
        formattedDate,
        formattedTime,
        reminderText,
        newTutorMeetingLink
      );

      console.log(`✅ Sent ${reminderText} reminders for class slot ${slot.cslot_id}`);
      
    } catch (error) {
      console.error(`❌ Failed to send reminders for class slot ${slot.cslot_id}:`, error);
    }
  }
};

// Combined reminder function
const sendAllReminders = async (hoursAhead: number) => {
  const reminderText = hoursAhead === 24 ? '24-hour' : '1-hour';
  console.log(`\n🚀 Starting ${reminderText} reminder job at ${new Date().toISOString()}`);
  
  try {
    // Send reminders for individual sessions
    await sendIndividualSessionReminders(hoursAhead);
    
    // Send reminders for mass class slots
    await sendMassClassReminders(hoursAhead);
    
    console.log(`✅ Completed ${reminderText} reminder job at ${new Date().toISOString()}\n`);
  } catch (error) {
    console.error(`❌ Error in ${reminderText} reminder job:`, error);
  }
};


const setPaymentStatus = async () => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const updatedEnrollments = await prisma.enrolment.updateMany({
      where: {
        created_at: {
          lt: oneMonthAgo
        },
        status: {
          not: 'invalid'
        }
      },
      data: {
        status: 'invalid'
      }
    });
    
    console.log(`✅ Updated ${updatedEnrollments.count} enrollments to invalid status`);
    return updatedEnrollments.count;
  } catch (error) {
    console.error('❌ Error updating enrollment status:', error);
    return 0;
  }
};

// Cron job to update payment status daily at midnight
const startPaymentStatusJob = () => {
  return cron.schedule('0 0 * * *', async () => { 
    await setPaymentStatus();
  }
  , {
    timezone: "Asia/Colombo" // Adjust to your timezone
  });
};

// Cron job for 24-hour reminders (runs every hour)
const start24HourReminderJob = () => {
  return cron.schedule('0 * * * *', async () => {
    await sendAllReminders(24);
  }, {
    timezone: "Asia/Colombo" // Adjust to your timezone
  });
};

// Cron job for 1-hour reminders (runs every 10 minutes for accuracy)
const start1HourReminderJob = () => {
  return cron.schedule('*/10 * * * *', async () => {
    await sendAllReminders(1);
  }, {
    timezone: "Asia/Colombo" // Adjust to your timezone
  });
};

// Initialize and start all reminder cron jobs
export const startReminderJobs = () => {
  console.log('🕒 Starting email reminder cron jobs...');
  
  const job24h = start24HourReminderJob();
  const job1h = start1HourReminderJob();
  
  // Jobs are automatically started when created with node-cron
  
  console.log('✅ Email reminder cron jobs started successfully!');
  console.log('📅 24-hour reminders: Every hour (0 * * * *)');
  console.log('⏰ 1-hour reminders: Every 10 minutes (*/10 * * * *)');
  
  return { job24h, job1h };
};

// Stop all reminder jobs
export const stopReminderJobs = (jobs: { job24h: any, job1h: any }) => {
  console.log('🛑 Stopping email reminder cron jobs...');
  jobs.job24h.stop();
  jobs.job1h.stop();
  console.log('✅ Email reminder cron jobs stopped.');
};

// Manual trigger for testing
export const triggerManualReminder = async (hoursAhead: 24 | 1) => {
  console.log(`🧪 Manually triggering ${hoursAhead}-hour reminder job...`);
  await sendAllReminders(hoursAhead);
};

// Health check function
export const getReminderJobStatus = () => {
  return {
    timestamp: new Date().toISOString(),
    status: 'active',
    jobs: [
      { name: '24-hour reminders', schedule: '0 * * * *', description: 'Runs every hour' },
      { name: '1-hour reminders', schedule: '*/10 * * * *', description: 'Runs every 10 minutes' }
    ]
  };
};

