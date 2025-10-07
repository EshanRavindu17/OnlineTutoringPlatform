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