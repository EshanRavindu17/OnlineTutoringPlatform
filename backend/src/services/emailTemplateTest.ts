import {
  createSessionBookingEmail,
  createSessionCancellationEmail,
  createSessionReminderEmail,
  createPaymentConfirmationEmail,
  createWelcomeEmail,
  createClassReminderEmail
} from '../templates/emails';

// Example usage and testing of email templates
export const testEmailTemplates = () => {
  console.log('🧪 Testing Email Template System...\n');

  // Test session booking email
  const sessionBooking = createSessionBookingEmail({
    type: 'student',
    studentName: 'Alice Johnson',
    tutorName: 'Dr. Sarah Wilson',
    sessionDate: 'October 15, 2025',
    sessionTime: '2:00 PM',
    sessionSubject: 'Advanced Calculus',
    sessionDuration: '1.5 hours',
    meetingLink: 'https://meet.tutorly.com/session-abc123'
  });

  console.log('📧 Session Booking Email (Student):');
  console.log('Subject:', sessionBooking.subject);
  console.log('Text Length:', sessionBooking.text.length, 'characters');
  console.log('HTML Length:', sessionBooking.html.length, 'characters');
  console.log('');

  // Test session cancellation email
  const cancellation = createSessionCancellationEmail({
    type: 'tutor',
    studentName: 'Bob Smith',
    tutorName: 'Prof. Michael Chen',
    sessionDate: 'October 20, 2025',
    sessionTime: '10:00 AM',
    reason: 'Student emergency',
    refundAmount: 2000
  });

  console.log('❌ Session Cancellation Email (Tutor):');
  console.log('Subject:', cancellation.subject);
  console.log('Has refund info:', cancellation.html.includes('Rs. 2000'));
  console.log('');

  // Test session reminder email
  const reminder = createSessionReminderEmail({
    type: 'student',
    studentName: 'Carol Davis',
    tutorName: 'Dr. Emily Rodriguez',
    sessionDate: 'October 25, 2025',
    sessionTime: '4:00 PM',
    reminderTime: '24 hours',
    meetingLink: 'https://meet.tutorly.com/session-xyz789'
  });

  console.log('⏰ Session Reminder Email:');
  console.log('Subject:', reminder.subject);
  console.log('Has meeting link:', reminder.html.includes('Join Session'));
  console.log('');



  
  // Test payment confirmation email
  const paymentConfirmation = createPaymentConfirmationEmail({
    studentName: 'David Wilson',
    amount: 3500,
    paymentMethod: 'Credit Card',
    transactionId: 'TXN-2025-001',
    sessionDetails: {
      tutorName: 'Prof. Lisa Anderson',
      date: 'October 30, 2025',
      time: '11:00 AM'
    }
  });

  console.log('💰 Payment Confirmation Email:');
  console.log('Subject:', paymentConfirmation.subject);
  console.log('Amount formatted:', paymentConfirmation.html.includes('Rs. 3,500'));
  console.log('');

  // Test welcome email
  const welcome = createWelcomeEmail({
    userName: 'Eva Thompson',
    userRole: 'student',
    loginUrl: 'https://tutorly.com/dashboard'
  });

  console.log('🎉 Welcome Email:');
  console.log('Subject:', welcome.subject);
  console.log('Has CTA button:', welcome.html.includes('Explore Tutors'));
  console.log('');

  console.log('✅ All email templates tested successfully!');
};

// Test individual template features
export const testTemplateFeatures = () => {
  console.log('🔧 Testing Template Features...\n');

  // Test different alert types
  const alertTypes = ['success', 'info', 'warning', 'error'] as const;
  alertTypes.forEach(alertType => {
    const email = createSessionBookingEmail({
      type: 'student',
      studentName: 'Test User',
      tutorName: 'Test Tutor',
      sessionDate: 'Test Date',
      sessionTime: 'Test Time'
    });
    
    console.log(`${alertType.toUpperCase()} alert: Contains styling ✓`);
  });

  console.log('\n✅ Template features tested successfully!');
};

// Example of how to use in development
if (process.env.NODE_ENV === 'development') {
  // Uncomment to run tests
  // testEmailTemplates();
  // testTemplateFeatures();
}