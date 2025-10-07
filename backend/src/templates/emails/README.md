# Email Template System

This directory contains a reusable email template system that provides consistent branding and styling across all emails sent from the Tutorly platform.

## Structure

```
templates/emails/
├── index.ts              # Main exports
├── types.ts              # TypeScript interfaces
├── baseTemplate.ts       # Base email layout
├── emailTemplates.ts     # Specific email templates
└── README.md            # This file
```

## Features

- **Consistent Branding**: All emails use the same Tutorly branding and color scheme
- **Responsive Design**: Templates work well on both desktop and mobile devices
- **Customizable**: Easy to customize content, alerts, details, and call-to-action buttons
- **TypeScript Support**: Full type safety with proper interfaces
- **Plain Text Generation**: Automatically generates plain text versions for better deliverability

## Base Template Features

The base template (`baseTemplate.ts`) provides:

- Professional header with Tutorly branding
- Customizable title and content sections
- Alert messages with different types (success, info, warning, error)
- Details section for structured information
- Call-to-action buttons
- Consistent footer

## Available Email Templates

### 1. Session Booking Confirmation
```typescript
import { createSessionBookingEmail } from './templates/emails';

const emailContent = createSessionBookingEmail({
  type: 'student', // or 'tutor'
  studentName: 'John Doe',
  tutorName: 'Jane Smith',
  sessionDate: 'October 15, 2025',
  sessionTime: '10:00 AM',
  sessionSubject: 'Mathematics', // optional
  sessionDuration: '1 hour', // optional
  meetingLink: 'https://meet.tutorly.com/abc123' // optional
});
```

### 2. Session Cancellation
```typescript
import { createSessionCancellationEmail } from './templates/emails';

const emailContent = createSessionCancellationEmail({
  type: 'student',
  studentName: 'John Doe',
  tutorName: 'Jane Smith',
  sessionDate: 'October 15, 2025',
  sessionTime: '10:00 AM',
  reason: 'Tutor unavailable', // optional
  refundAmount: 1500 // optional
});
```

### 3. Session Reminder
```typescript
import { createSessionReminderEmail } from './templates/emails';

const emailContent = createSessionReminderEmail({
  type: 'student',
  studentName: 'John Doe',
  tutorName: 'Jane Smith',
  sessionDate: 'October 15, 2025',
  sessionTime: '10:00 AM',
  reminderTime: '24 hours',
  meetingLink: 'https://meet.tutorly.com/abc123' // optional
});
```

### 4. Payment Confirmation
```typescript
import { createPaymentConfirmationEmail } from './templates/emails';

const emailContent = createPaymentConfirmationEmail({
  studentName: 'John Doe',
  amount: 1500,
  paymentMethod: 'Credit Card',
  transactionId: 'TXN123456',
  sessionDetails: { // optional, for individual sessions
    tutorName: 'Jane Smith',
    date: 'October 15, 2025',
    time: '10:00 AM'
  },
  classDetails: { // optional, for mass classes
    className: 'Advanced Mathematics',
    tutorName: 'Dr. Johnson',
    month: 'October 2025'
  }
});
```

### 5. Welcome Email
```typescript
import { createWelcomeEmail } from './templates/emails';

const emailContent = createWelcomeEmail({
  userName: 'John Doe',
  userRole: 'student', // or 'tutor'
  loginUrl: 'https://tutorly.com/login' // optional
});
```

## Usage in Services

### Updated Email Service Functions

```typescript
// Using the template system
await conformSessionBookingEmail(
  'student@example.com',
  'student',
  'John Doe',
  'Jane Smith',
  'October 15, 2025',
  '10:00 AM',
  'Mathematics', // subject (optional)
  '1 hour',     // duration (optional)
  'https://meet.tutorly.com/abc123' // meeting link (optional)
);

await sendSessionCancellationEmail(
  'student@example.com',
  'student',
  'John Doe',
  'Jane Smith',
  'October 15, 2025',
  '10:00 AM',
  'Emergency cancellation', // reason (optional)
  1500 // refund amount (optional)
);

await sendPaymentConfirmationEmail(
  'student@example.com',
  'John Doe',
  1500,
  'Credit Card',
  'TXN123456',
  { // session details (optional)
    tutorName: 'Jane Smith',
    date: 'October 15, 2025',
    time: '10:00 AM'
  }
);
```

## Customization

### Creating Custom Email Types

1. Add new template functions to `emailTemplates.ts`
2. Export them from `index.ts`
3. Use the base template system for consistency

Example:
```typescript
export const createCustomEmail = (data: CustomEmailData): EmailContent => {
  const templateOptions = {
    title: 'Custom Email Title',
    content: `<p>Custom content here...</p>`,
    alertType: 'info' as const,
    alertMessage: 'Custom alert message',
    details: [
      { label: 'Custom Field', value: data.customValue }
    ],
    ctaButton: {
      text: 'Custom Action',
      url: 'https://example.com',
      color: '#2563eb'
    }
  };

  return {
    subject: 'Custom Subject',
    html: createBaseEmailTemplate(templateOptions),
    text: generatePlainText(templateOptions)
  };
};
```

### Customizing the Base Template

Modify `baseTemplate.ts` to change:
- Color scheme
- Typography
- Layout structure
- Branding elements

## Design Guidelines

- **Colors**: Primary blue (#2563eb), success green (#10b981), warning yellow (#f59e0b), error red (#ef4444)
- **Typography**: Arial font family, responsive font sizes
- **Spacing**: Consistent padding and margins
- **Mobile-First**: Responsive design that works on all devices

## Testing

Test emails using the development environment:

```typescript
// Test in development
if (process.env.NODE_ENV === 'development') {
  const testEmail = createSessionBookingEmail({
    type: 'student',
    studentName: 'Test User',
    tutorName: 'Test Tutor',
    sessionDate: 'Today',
    sessionTime: 'Now'
  });
  
  console.log('HTML:', testEmail.html);
  console.log('Text:', testEmail.text);
}
```

## Migration Notes

- Old hardcoded email templates have been replaced with the reusable system
- All existing email functions now use the template system
- New optional parameters added for enhanced functionality
- Backward compatibility maintained for existing function signatures