import { createBaseEmailTemplate, generatePlainText } from './baseTemplate';
import { EmailContent, EmailTemplateData } from './types';

/**
 * Session booking confirmation email template
 */
export const createSessionBookingEmail = (data: {
  type: 'student' | 'tutor';
  studentName: string;
  tutorName: string;
  sessionDate: string;
  sessionTime: string;
  sessionSubject?: string;
  sessionDuration?: string;
  meetingLink?: string;
}): EmailContent => {
  const {
    type,
    studentName,
    tutorName,
    sessionDate,
    sessionTime,
    sessionSubject,
    sessionDuration,
    meetingLink
  } = data;

  const isStudent = type === 'student';
  
  const templateOptions = {
    title: isStudent ? 'Session Confirmed! 🎉' : 'New Session Booked! 📚',
    content: isStudent
      ? `<p>Dear <strong>${studentName}</strong>,</p>
         <p>Your tutoring session with <strong>${tutorName}</strong> has been successfully confirmed. We're excited to help you on your learning journey!</p>`
      : `<p>Dear <strong>${tutorName}</strong>,</p>
         <p>You have a new tutoring session booked with <strong>${studentName}</strong>. Please prepare accordingly and ensure you're ready to provide an excellent learning experience.</p>`,
    
    alertType: isStudent ? 'success' as const : 'info' as const,
    alertMessage: isStudent 
      ? 'Your tutoring session has been confirmed!'
      : 'You have a new tutoring session!',
    
    details: [
      { label: isStudent ? 'Tutor' : 'Student', value: isStudent ? tutorName : studentName },
      { label: 'Date', value: sessionDate },
      { label: 'Time', value: sessionTime },
      ...(sessionSubject ? [{ label: 'Subject', value: sessionSubject }] : []),
      ...(sessionDuration ? [{ label: 'Duration', value: sessionDuration }] : [])
    ],
    
    ctaButton: meetingLink ? {
      text: 'Join Session',
      url: meetingLink,
      color: '#10b981'
    } : undefined,
    
    footerMessage: isStudent 
      ? 'Thank you for choosing Tutorly'
      : 'Thank you for being part of the Tutorly community'
  };

  return {
    subject: 'Session Booking Confirmation',
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Session cancellation email template
 */
export const createSessionCancellationEmail = (data: {
  type: 'student' | 'tutor';
  studentName: string;
  tutorName: string;
  sessionDate: string;
  sessionTime: string;
  reason?: string;
  refundAmount?: number;
}): EmailContent => {
  const { type, studentName, tutorName, sessionDate, sessionTime, reason, refundAmount } = data;
  
  const isStudent = type === 'student';
  
  const templateOptions = {
    title: 'Session Cancelled ⚠️',
    content: isStudent
      ? `<p>Dear <strong>${studentName}</strong>,</p>
         <p>Your tutoring session with <strong>${tutorName}</strong> has been cancelled. We apologize for any inconvenience this may cause.</p>
         ${refundAmount ? `<p>A refund of <strong>Rs. ${refundAmount}</strong> will be processed within 3-5 business days.</p>` : ''}`
      : `<p>Dear <strong>${tutorName}</strong>,</p>
         <p>The tutoring session with <strong>${studentName}</strong> has been cancelled.</p>`,
    
    alertType: 'warning' as const,
    alertMessage: 'Session has been cancelled',
    
    details: [
      { label: isStudent ? 'Tutor' : 'Student', value: isStudent ? tutorName : studentName },
      { label: 'Date', value: sessionDate },
      ...(reason ? [{ label: 'Reason', value: reason }] : []),
      ...(refundAmount ? [{ label: 'Refund Amount', value: `Rs. ${refundAmount}` }] : [])
    ],
    
    footerMessage: 'We hope to serve you better in the future'
  };

  return {
    subject: 'Session Cancellation Notice',
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Session reminder email template
 */
export const createSessionReminderEmail = (data: {
  type: 'student' | 'tutor';
  studentName: string;
  tutorName: string;
  sessionDate: string;
  sessionTime: string;
  meetingLink?: string;
  reminderTime: string; // e.g., "24 hours", "1 hour"
}): EmailContent => {
  const { type, studentName, tutorName, sessionDate, sessionTime, meetingLink, reminderTime } = data;
  
  const isStudent = type === 'student';
  
  const templateOptions = {
    title: `Session Reminder - ${reminderTime} ⏰`,
    content: isStudent
      ? `<p>Dear <strong>${studentName}</strong>,</p>
         <p>This is a friendly reminder that you have a tutoring session with <strong>${tutorName}</strong> coming up in ${reminderTime}.</p>
         <p>Please make sure you're prepared and have a stable internet connection.</p>`
      : `<p>Dear <strong>${tutorName}</strong>,</p>
         <p>This is a reminder that you have a tutoring session with <strong>${studentName}</strong> coming up in ${reminderTime}.</p>
         <p>Please ensure you're prepared with all necessary materials.</p>`,
    
    alertType: 'info' as const,
    alertMessage: `Session starts in ${reminderTime}`,
    
    details: [
      { label: isStudent ? 'Tutor' : 'Student', value: isStudent ? tutorName : studentName },
      { label: 'Date', value: sessionDate },
      { label: 'Time', value: sessionTime }
    ],
    
    ctaButton: meetingLink ? {
      text: 'Join Session',
      url: meetingLink,
      color: '#3b82f6'
    } : undefined
  };

  return {
    subject: `Session Reminder - ${reminderTime}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

export const createClassReminderEmail = (data: {
  type: 'student' | 'massTutor';
  studentName?: string;
  tutorName?: string;
  className: string;
  classDate: string;
  classTime: string;
  subject?: string;
  meetingLink?: string;
  reminderTime: string; // e.g., "24 hours", "1 hour"
}): EmailContent => {
  const { type, studentName, tutorName, className, classDate, classTime, subject, meetingLink, reminderTime } = data;
  
  const isStudent = type === 'student';
  
  const templateOptions = {
    title: `Class Reminder - ${reminderTime} 🎓`,
    content: isStudent
      ? `<p>Dear <strong>${studentName}</strong>,</p>
         <p>This is a friendly reminder that your class <strong>${className}</strong>${tutorName ? ` with ${tutorName}` : ''} is coming up in ${reminderTime}.</p>
         <p>Please make sure you're prepared and have a stable internet connection for the best learning experience.</p>`
      : `<p>Dear <strong>${tutorName}</strong>,</p>
         <p>This is a reminder that your class <strong>${className}</strong> is scheduled to start in ${reminderTime}.</p>
         <p>Please ensure you're prepared with all necessary materials and that your meeting link is ready for your students.</p>`,
    
    alertType: 'info' as const,
    alertMessage: `Class starts in ${reminderTime}`,
    
    details: [
      { label: 'Class', value: className },
      ...(subject ? [{ label: 'Subject', value: subject }] : []),
      { label: 'Date', value: classDate },
      { label: 'Time', value: classTime },
      ...(isStudent && tutorName ? [{ label: 'Tutor', value: tutorName }] : [])
    ],
    
    ctaButton: meetingLink ? {
      text: 'Join Class',
      url: meetingLink,
      color: '#8b5cf6'
    } : undefined,
    
    footerMessage: isStudent 
      ? 'See you in class!'
      : 'Thank you for being part of the Tutorly community'
  };

  return {
    subject: `Class Reminder - ${className}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Payment confirmation email template
 */
export const createPaymentConfirmationEmail = (data: {
  studentName: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  sessionDetails?: {
    tutorName: string;
    date: string;
    time: string;
  };
  classDetails?: {
    className: string;
    tutorName: string;
    month: string;
  };
}): EmailContent => {
  const { studentName, amount, paymentMethod, transactionId, sessionDetails, classDetails } = data;
  
  const isSessionPayment = !!sessionDetails;
  
  const templateOptions = {
    title: 'Payment Confirmation ✅',
    content: `<p>Dear <strong>${studentName}</strong>,</p>
              <p>Your payment has been successfully processed. Thank you for your trust in Tutorly!</p>`,
    
    alertType: 'success' as const,
    alertMessage: 'Payment successful!',
    
    details: [
      { label: 'Amount', value: `Rs. ${amount.toLocaleString()}` },
      { label: 'Payment Method', value: paymentMethod },
      { label: 'Transaction ID', value: transactionId },
      ...(isSessionPayment && sessionDetails ? [
        { label: 'Tutor', value: sessionDetails.tutorName },
        { label: 'Session Date', value: sessionDetails.date },
        { label: 'Session Time', value: sessionDetails.time }
      ] : []),
      ...(classDetails ? [
        { label: 'Class', value: classDetails.className },
        { label: 'Tutor', value: classDetails.tutorName },
        { label: 'Month', value: classDetails.month }
      ] : [])
    ],
    
    footerMessage: 'Thank you for choosing Tutorly for your learning journey'
  };

  return {
    subject: 'Payment Confirmation',
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Session completion email template
 */
export const createSessionCompletionEmail = (data: {
  type: 'student' | 'tutor';
  studentName: string;
  tutorName: string;
  sessionDate: string;
  sessionTime: string;
  sessionSubject?: string;
  sessionDuration?: string;
  amount?: number;
}): EmailContent => {
  const { type, studentName, tutorName, sessionDate, sessionTime, sessionSubject, sessionDuration, amount } = data;
  
  const isStudent = type === 'student';
  
  const templateOptions = {
    title: 'Session Completed! ✅',
    content: isStudent
      ? `<p>Dear <strong>${studentName}</strong>,</p>
         <p>Your tutoring session with <strong>${tutorName}</strong> has been successfully completed. We hope you had a great learning experience!</p>
         <p>Please consider leaving a review to help other students and support your tutor.</p>`
      : `<p>Dear <strong>${tutorName}</strong>,</p>
         <p>Your tutoring session with <strong>${studentName}</strong> has been marked as completed. Thank you for providing quality education!</p>
         <p>Your payment will be processed according to our standard schedule.</p>`,
    
    alertType: 'success' as const,
    alertMessage: 'Session successfully completed!',
    
    details: [
      { label: isStudent ? 'Tutor' : 'Student', value: isStudent ? tutorName : studentName },
      { label: 'Date', value: sessionDate },
      { label: 'Time', value: sessionTime },
      ...(sessionSubject ? [{ label: 'Subject', value: sessionSubject }] : []),
      ...(sessionDuration ? [{ label: 'Duration', value: sessionDuration }] : []),
      ...(amount && isStudent ? [{ label: 'Session Fee', value: `Rs. ${amount}` }] : [])
    ],
    
    footerMessage: isStudent 
      ? 'Thank you for choosing Tutorly for your learning journey'
      : 'Thank you for being part of the Tutorly community'
  };

  return {
    subject: 'Session Completed Successfully',
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Auto-cancellation email template (for sessions not started by tutor)
 */
export const createAutoCancellationEmail = (data: {
  type: 'student' | 'tutor';
  studentName: string;
  tutorName: string;
  sessionDate: string;
  sessionTime: string;
  sessionSubject?: string;
  refundAmount?: number;
}): EmailContent => {
  const { type, studentName, tutorName, sessionDate, sessionTime, sessionSubject, refundAmount } = data;
  
  const isStudent = type === 'student';
  
  const templateOptions = {
    title: 'Session Auto-Cancelled ⚠️',
    content: isStudent
      ? `<p>Dear <strong>${studentName}</strong>,</p>
         <p>Your tutoring session with <strong>${tutorName}</strong> has been automatically cancelled because the tutor did not start the session within the allocated time window.</p>
         <p>We sincerely apologize for this inconvenience. This is not the standard of service we strive to provide.</p>
         ${refundAmount ? `<p>A full refund of <strong>Rs. ${refundAmount}</strong> will be processed automatically within 3-5 business days.</p>` : ''}
         <p>We encourage you to book another session with a different tutor or reschedule with the same tutor if they become available.</p>`
      : `<p>Dear <strong>${tutorName}</strong>,</p>
         <p>Your scheduled tutoring session with <strong>${studentName}</strong> has been automatically cancelled because it was not started within the required time window.</p>
         <p>As per our policy, sessions must be started within 15 minutes of the scheduled end time to ensure a positive experience for students.</p>
         <p>The student has been automatically refunded, and this may affect your tutor rating. Please ensure you're available and ready for your scheduled sessions.</p>`,
    
    alertType: 'error' as const,
    alertMessage: isStudent ? 'Session cancelled due to tutor absence' : 'Session auto-cancelled - action required',
    
    details: [
      { label: isStudent ? 'Tutor' : 'Student', value: isStudent ? tutorName : studentName },
      { label: 'Scheduled Date', value: sessionDate },
      { label: 'Scheduled Time', value: sessionTime },
      ...(sessionSubject ? [{ label: 'Subject', value: sessionSubject }] : []),
      ...(refundAmount ? [{ label: 'Refund Amount', value: `Rs. ${refundAmount}` }] : [])
    ],
    
    footerMessage: isStudent 
      ? 'We are committed to providing you with reliable tutoring services'
      : 'Please ensure punctuality for future sessions to maintain your tutor rating'
  };

  return {
    subject: 'Session Auto-Cancelled - Immediate Action Required',
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Welcome email template for new users
 */
export const createWelcomeEmail = (data: {
  userName: string;
  userRole: 'student' | 'tutor';
  loginUrl?: string;
}): EmailContent => {
  const { userName, userRole, loginUrl } = data;
  
  const templateOptions = {
    title: `Welcome to Tutorly! 🎓`,
    content: `<p>Dear <strong>${userName}</strong>,</p>
              <p>Welcome to the Tutorly community! We're excited to have you as a ${userRole} on our platform.</p>
              <p>Tutorly connects passionate learners with expert tutors, making quality education accessible to everyone.</p>
              ${userRole === 'student' 
                ? '<p>You can now browse our amazing tutors and book your first session!</p>'
                : '<p>You can now start accepting students and sharing your knowledge!</p>'}`,
    
    alertType: 'success' as const,
    alertMessage: `Welcome to Tutorly, ${userName}!`,
    
    ctaButton: loginUrl ? {
      text: userRole === 'student' ? 'Explore Tutors' : 'Start Teaching',
      url: loginUrl,
      color: '#2563eb'
    } : undefined,
    
    footerMessage: 'We\'re here to support your learning journey'
  };

  return {
    subject: 'Welcome to Tutorly!',
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Admin notification: New mass class created
 */
export const createNewMassClassNotificationEmail = (data: {
  tutorName: string;
  tutorEmail: string;
  className: string;
  subject: string;
  day: string;
  time: string;
  description?: string;
  classId: string;
  dashboardUrl?: string;
}): EmailContent => {
  const { tutorName, tutorEmail, className, subject, day, time, description, classId, dashboardUrl } = data;
  
  const templateOptions = {
    title: 'New Mass Class Created 📚',
    content: `<p>Dear Admin,</p>
              <p>A new mass class has been created by tutor <strong>${tutorName}</strong> (${tutorEmail}).</p>
              <p>Please review the class details below and take any necessary moderation actions.</p>`,
    
    alertType: 'info' as const,
    alertMessage: 'New class pending review',
    
    details: [
      { label: 'Class Name', value: className },
      { label: 'Subject', value: subject },
      { label: 'Day', value: day },
      { label: 'Time', value: time },
      { label: 'Tutor', value: tutorName },
      { label: 'Tutor Email', value: tutorEmail },
      { label: 'Class ID', value: classId },
      ...(description ? [{ label: 'Description', value: description }] : [])
    ],
    
    ctaButton: dashboardUrl ? {
      text: 'Review in Dashboard',
      url: dashboardUrl,
      color: '#ef4444'
    } : undefined,
    
    footerMessage: 'This is an automated notification from the Tutorly platform'
  };

  return {
    subject: `New Class Created: ${className}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Mass tutor: Class approved notification
 */
export const createClassApprovedEmail = (data: {
  tutorName: string;
  className: string;
  subject: string;
  day: string;
  time: string;
  dashboardUrl?: string;
}): EmailContent => {
  const { tutorName, className, subject, day, time, dashboardUrl } = data;
  
  const templateOptions = {
    title: 'Class Approved! 🎉',
    content: `<p>Dear <strong>${tutorName}</strong>,</p>
              <p>Great news! Your class <strong>${className}</strong> has been approved by our admin team and is now live on the platform.</p>
              <p>Students can now discover and enroll in your class. Start adding class slots to schedule your sessions!</p>`,
    
    alertType: 'success' as const,
    alertMessage: 'Your class is now live!',
    
    details: [
      { label: 'Class Name', value: className },
      { label: 'Subject', value: subject },
      { label: 'Day', value: day },
      { label: 'Time', value: time }
    ],
    
    ctaButton: dashboardUrl ? {
      text: 'Manage Your Class',
      url: dashboardUrl,
      color: '#10b981'
    } : undefined,
    
    footerMessage: 'Thank you for being part of the Tutorly community'
  };

  return {
    subject: `Class Approved: ${className}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Mass tutor: Class rejected notification
 */
export const createClassRejectedEmail = (data: {
  tutorName: string;
  className: string;
  reason: string;
  dashboardUrl?: string;
}): EmailContent => {
  const { tutorName, className, reason, dashboardUrl } = data;
  
  const templateOptions = {
    title: 'Class Review Update ⚠️',
    content: `<p>Dear <strong>${tutorName}</strong>,</p>
              <p>We've reviewed your class <strong>${className}</strong>, and unfortunately, it does not meet our platform guidelines at this time.</p>
              <p><strong>Reason:</strong> ${reason}</p>
              <p>You can update the class details and resubmit for approval. If you have any questions, please contact our support team.</p>`,
    
    alertType: 'warning' as const,
    alertMessage: 'Class not approved',
    
    details: [
      { label: 'Class Name', value: className },
      { label: 'Reason', value: reason }
    ],
    
    ctaButton: dashboardUrl ? {
      text: 'Update Class Details',
      url: dashboardUrl,
      color: '#f59e0b'
    } : undefined,
    
    footerMessage: 'We\'re here to help you succeed'
  };

  return {
    subject: `Class Review: ${className}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Student: New enrollment confirmation
 */
export const createEnrollmentConfirmationEmail = (data: {
  studentName: string;
  className: string;
  tutorName: string;
  subject: string;
  day: string;
  time: string;
  amount: number;
  dashboardUrl?: string;
}): EmailContent => {
  const { studentName, className, tutorName, subject, day, time, amount, dashboardUrl } = data;
  
  const templateOptions = {
    title: 'Enrollment Confirmed! 🎓',
    content: `<p>Dear <strong>${studentName}</strong>,</p>
              <p>Congratulations! You've successfully enrolled in <strong>${className}</strong> with ${tutorName}.</p>
              <p>Get ready for an exciting learning journey! You'll receive notifications about upcoming class sessions.</p>`,
    
    alertType: 'success' as const,
    alertMessage: 'Successfully enrolled!',
    
    details: [
      { label: 'Class', value: className },
      { label: 'Subject', value: subject },
      { label: 'Tutor', value: tutorName },
      { label: 'Day', value: day },
      { label: 'Time', value: time },
      { label: 'Amount Paid', value: `Rs. ${amount.toLocaleString()}` }
    ],
    
    ctaButton: dashboardUrl ? {
      text: 'View My Classes',
      url: dashboardUrl,
      color: '#8b5cf6'
    } : undefined,
    
    footerMessage: 'Thank you for choosing Tutorly for your learning journey'
  };

  return {
    subject: `Enrollment Confirmed: ${className}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Mass tutor: New student enrolled notification
 */
export const createNewEnrollmentNotificationEmail = (data: {
  tutorName: string;
  studentName: string;
  studentEmail: string;
  className: string;
  enrollmentDate: string;
  totalStudents: number;
  dashboardUrl?: string;
}): EmailContent => {
  const { tutorName, studentName, studentEmail, className, enrollmentDate, totalStudents, dashboardUrl } = data;
  
  const templateOptions = {
    title: 'New Student Enrolled! 🎉',
    content: `<p>Dear <strong>${tutorName}</strong>,</p>
              <p>Great news! <strong>${studentName}</strong> has enrolled in your class <strong>${className}</strong>.</p>
              <p>You now have <strong>${totalStudents}</strong> student${totalStudents !== 1 ? 's' : ''} enrolled in this class.</p>`,
    
    alertType: 'success' as const,
    alertMessage: 'New student enrolled!',
    
    details: [
      { label: 'Student Name', value: studentName },
      { label: 'Student Email', value: studentEmail },
      { label: 'Class', value: className },
      { label: 'Enrollment Date', value: enrollmentDate },
      { label: 'Total Students', value: totalStudents.toString() }
    ],
    
    ctaButton: dashboardUrl ? {
      text: 'View Class Details',
      url: dashboardUrl,
      color: '#3b82f6'
    } : undefined,
    
    footerMessage: 'Thank you for being part of the Tutorly community'
  };

  return {
    subject: `New Enrollment: ${studentName} - ${className}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Custom message from tutor to student
 */
export const createCustomMessageEmail = (data: {
  tutorName: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  message: string;
  className?: string;
}): EmailContent => {
  const { tutorName, studentName, subject: messageSubject, message, className } = data;
  
  const templateOptions = {
    title: messageSubject,
    content: `<p>Dear <strong>${studentName}</strong>,</p>
              <p>You have received a message from your tutor <strong>${tutorName}</strong>${className ? ` regarding <strong>${className}</strong>` : ''}:</p>
              <div style="background: #f9fafb; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; white-space: pre-wrap; color: #374151; line-height: 1.6;">${message}</p>
              </div>
              <p>If you have any questions or need clarification, please reply to this email or contact your tutor directly.</p>`,
    
    alertType: 'info' as const,
    alertMessage: `Message from ${tutorName}`,
    
    details: className ? [
      { label: 'Class', value: className },
      { label: 'From', value: tutorName }
    ] : [
      { label: 'From', value: tutorName }
    ],
    
    footerMessage: 'Keep up the great work!'
  };

  return {
    subject: `Message from ${tutorName}: ${messageSubject}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Admin meeting invitation email template
 */
export const createAdminMeetingInvitationEmail = (data: {
  recipientName: string;
  adminName: string;
  subject: string;
  message: string;
  meetingUrl: string;
}): EmailContent => {
  const { recipientName, adminName, subject: meetingSubject, message, meetingUrl } = data;
  
  const templateOptions = {
    title: '📅 Meeting Invitation',
    content: `<p>Dear <strong>${recipientName}</strong>,</p>
              <p>You've been invited to a meeting by <strong>${adminName}</strong> (Admin).</p>
              <div style="background: #f9fafb; border-left: 4px solid #667eea; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; white-space: pre-wrap; color: #374151; line-height: 1.6;">${message}</p>
              </div>
              <p>Click the button below to join the meeting at the scheduled time.</p>`,
    
    alertType: 'info' as const,
    alertMessage: 'Meeting invitation from Admin',
    
    details: [
      { label: 'Subject', value: meetingSubject },
      { label: 'Organized by', value: `${adminName} (Admin)` },
      { label: 'Platform', value: 'Zoom' }
    ],
    
    ctaButton: {
      text: '🎥 Join Meeting',
      url: meetingUrl,
      color: '#667eea'
    },
    
    footerMessage: 'This is an automated email from SmartTutor Admin Panel'
  };

  return {
    subject: `Meeting Invitation: ${meetingSubject}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Class slot cancellation email for students
 */
export const createClassCancellationEmail = (data: {
  studentName: string;
  className: string;
  tutorName: string;
  classDate: string;
  classTime: string;
  reason?: string;
  refundInfo?: string;
}): EmailContent => {
  const { studentName, className, tutorName, classDate, classTime, reason, refundInfo } = data;
  
  const templateOptions = {
    title: 'Class Session Cancelled ⚠️',
    content: `<p>Dear <strong>${studentName}</strong>,</p>
              <p>We regret to inform you that the class session for <strong>${className}</strong> with <strong>${tutorName}</strong> has been cancelled.</p>
              ${reason ? `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e;"><strong>Cancellation Reason:</strong></p>
                <p style="margin: 8px 0 0 0; color: #92400e;">${reason}</p>
              </div>` : ''}
              <p>We apologize for any inconvenience this may cause. ${refundInfo || 'You will not be charged for this session.'}</p>
              <p>Please check the class schedule for upcoming sessions or contact your tutor for more information.</p>`,
    
    alertType: 'warning' as const,
    alertMessage: 'Class session has been cancelled',
    
    details: [
      { label: 'Class', value: className },
      { label: 'Tutor', value: tutorName },
      { label: 'Cancelled Session Date', value: classDate },
      { label: 'Cancelled Session Time', value: classTime }
    ],
    
    footerMessage: 'Thank you for your understanding'
  };

  return {
    subject: `Class Cancelled - ${className}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};

/**
 * Class slot cancellation notification email for admin
 */
export const createClassCancellationAdminEmail = (data: {
  tutorName: string;
  tutorEmail: string;
  className: string;
  classDate: string;
  classTime: string;
  reason?: string;
  affectedStudentsCount: number;
  classId: string;
}): EmailContent => {
  const { tutorName, tutorEmail, className, classDate, classTime, reason, affectedStudentsCount, classId } = data;
  
  const templateOptions = {
    title: '🚨 Mass Class Session Cancelled',
    content: `<p>Dear Admin,</p>
              <p>A mass tutor has cancelled a class session. Please review the details below:</p>
              ${reason ? `<div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0; color: #92400e;"><strong>Cancellation Reason:</strong></p>
                <p style="margin: 8px 0 0 0; color: #92400e;">${reason}</p>
              </div>` : ''}
              <p style="background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 20px 0; border-radius: 4px; color: #991b1b;">
                <strong>${affectedStudentsCount}</strong> ${affectedStudentsCount === 1 ? 'student has' : 'students have'} been notified about this cancellation.
              </p>`,
    
    alertType: 'error' as const,
    alertMessage: 'Class session cancelled by tutor',
    
    details: [
      { label: 'Tutor', value: `${tutorName} (${tutorEmail})` },
      { label: 'Class', value: className },
      { label: 'Class ID', value: classId },
      { label: 'Cancelled Session Date', value: classDate },
      { label: 'Cancelled Session Time', value: classTime },
      { label: 'Affected Students', value: `${affectedStudentsCount}` }
    ],
    
    footerMessage: 'This is an automated notification from the SmartTutor system'
  };

  return {
    subject: `⚠️ Class Cancelled - ${className} by ${tutorName}`,
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};     