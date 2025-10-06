import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';
import {
  createSessionBookingEmail,
  createSessionCancellationEmail,
  createSessionReminderEmail,
  createPaymentConfirmationEmail,
  createWelcomeEmail,
  EmailContent,
  createClassReminderEmail,
  createNewMassClassNotificationEmail,
  createClassApprovedEmail,
  createClassRejectedEmail,
  createEnrollmentConfirmationEmail,
  createNewEnrollmentNotificationEmail,
  createCustomMessageEmail
} from '../templates/emails';

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'tutorlya846@gmail.com';





export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    if (!SENDGRID_API_KEY) {
        throw new Error('SendGrid API key is not configured.');
    }
    sgMail.setApiKey(SENDGRID_API_KEY);

    console.log("Sending email to:", to);
    console.log("Subject:", subject);
    console.log("Text:", text);
    console.log("HTML:", html);

    const msg = {
        to,
        from: FROM_EMAIL,
        subject,
        text,
        html,
    };
    try {
        await sgMail.send(msg);
        console.log('Email sent to', to);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};


// Updated session booking email using template system
export const conformSessionBookingEmail = async (
    to: string, 
    type: 'student' | 'tutor', 
    studentName: string, 
    tutorName: string, 
    sessionDate: string, 
    sessionTime: string,
    sessionSubject?: string,
    sessionDuration?: string,
    meetingLink?: string
) => {
    const emailContent = createSessionBookingEmail({
        type,
        studentName,
        tutorName,
        sessionDate,
        sessionTime,
        sessionSubject,
        sessionDuration,
        meetingLink
    });

    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Session cancellation email
export const sendSessionCancellationEmail = async (
    to: string,
    type: 'student' | 'tutor',
    studentName: string,
    tutorName: string,
    sessionDate: string,
    sessionTime: string,
    reason?: string,
    refundAmount?: number
) => {
    const emailContent = createSessionCancellationEmail({
        type,
        studentName,
        tutorName,
        sessionDate,
        sessionTime,
        reason,
        refundAmount
    });

    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Session reminder email
export const sendSessionReminderEmail = async (
    to: string,
    type: 'student' | 'tutor',
    studentName: string,
    tutorName: string,
    sessionDate: string,
    sessionTime: string,
    reminderTime: string,
    meetingLink?: string
) => {
    const emailContent = createSessionReminderEmail({
        type,
        studentName,
        tutorName,
        sessionDate,
        sessionTime,
        meetingLink,
        reminderTime
    });

    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Class reminder email
export const sendClassReminderEmail = async (
    to: string,
    type: 'student' | 'massTutor',
    className: string,
    classDate: string,
    classTime: string,
    reminderTime: string,
    studentName?: string,
    tutorName?: string,
    subject?: string,
    meetingLink?: string
) => {
    const emailContent = createClassReminderEmail({
        type,
        studentName,
        tutorName,
        className,
        classDate,
        classTime,
        subject,
        meetingLink,
        reminderTime
    });

    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Payment confirmation email
export const sendPaymentConfirmationEmail = async (
    to: string,
    studentName: string,
    amount: number,
    paymentMethod: string,
    transactionId: string,
    sessionDetails?: {
        tutorName: string;
        date: string;
        time: string;
    },
    classDetails?: {
        className: string;
        tutorName: string;
        month: string;
    }
) => {
    const emailContent = createPaymentConfirmationEmail({
        studentName,
        amount,
        paymentMethod,
        transactionId,
        sessionDetails,
        classDetails
    });

    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Welcome email for new users
export const sendWelcomeEmail = async (
    to: string,
    userName: string,
    userRole: 'student' | 'tutor',
    loginUrl?: string
) => {
    const emailContent = createWelcomeEmail({
        userName,
        userRole,
        loginUrl
    });

    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Admin notification: New mass class created
export const sendNewMassClassNotificationEmail = async (
    to: string,
    data: {
        tutorName: string;
        tutorEmail: string;
        className: string;
        subject: string;
        day: string;
        time: string;
        description?: string;
        classId: string;
        dashboardUrl?: string;
    }
) => {
    const emailContent = createNewMassClassNotificationEmail(data);
    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Mass tutor: Class approved notification
export const sendClassApprovedEmail = async (
    to: string,
    data: {
        tutorName: string;
        className: string;
        subject: string;
        day: string;
        time: string;
        dashboardUrl?: string;
    }
) => {
    const emailContent = createClassApprovedEmail(data);
    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Mass tutor: Class rejected notification
export const sendClassRejectedEmail = async (
    to: string,
    data: {
        tutorName: string;
        className: string;
        reason: string;
        dashboardUrl?: string;
    }
) => {
    const emailContent = createClassRejectedEmail(data);
    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Student: Enrollment confirmation
export const sendEnrollmentConfirmationEmail = async (
    to: string,
    data: {
        studentName: string;
        className: string;
        tutorName: string;
        subject: string;
        day: string;
        time: string;
        amount: number;
        dashboardUrl?: string;
    }
) => {
    const emailContent = createEnrollmentConfirmationEmail(data);
    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Mass tutor: New student enrolled notification
export const sendNewEnrollmentNotificationEmail = async (
    to: string,
    data: {
        tutorName: string;
        studentName: string;
        studentEmail: string;
        className: string;
        enrollmentDate: string;
        totalStudents: number;
        dashboardUrl?: string;
    }
) => {
    const emailContent = createNewEnrollmentNotificationEmail(data);
    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Custom message from tutor to student
export const sendCustomMessageEmail = async (
    to: string,
    data: {
        tutorName: string;
        studentName: string;
        studentEmail: string;
        subject: string;
        message: string;
        className?: string;
    }
) => {
    const emailContent = createCustomMessageEmail(data);
    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};
