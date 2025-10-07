import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';
import {
  createSessionBookingEmail,
  createSessionCancellationEmail,
  createSessionReminderEmail,
  createPaymentConfirmationEmail,
  createWelcomeEmail,
  createSessionCompletionEmail,
  createAutoCancellationEmail,
  EmailContent
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

// Session completion email
export const sendSessionCompletionEmail = async (
    to: string,
    type: 'student' | 'tutor',
    studentName: string,
    tutorName: string,
    sessionDate: string,
    sessionTime: string,
    sessionSubject?: string,
    sessionDuration?: string,
    amount?: number
) => {
    const emailContent = createSessionCompletionEmail({
        type,
        studentName,
        tutorName,
        sessionDate,
        sessionTime,
        sessionSubject,
        sessionDuration,
        amount
    });

    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};

// Auto-cancellation email (for sessions not started by tutor)
export const sendAutoCancellationEmail = async (
    to: string,
    type: 'student' | 'tutor',
    studentName: string,
    tutorName: string,
    sessionDate: string,
    sessionTime: string,
    sessionSubject?: string,
    refundAmount?: number
) => {
    const emailContent = createAutoCancellationEmail({
        type,
        studentName,
        tutorName,
        sessionDate,
        sessionTime,
        sessionSubject,
        refundAmount
    });

    await sendEmail(to, emailContent.subject, emailContent.text, emailContent.html);
};
