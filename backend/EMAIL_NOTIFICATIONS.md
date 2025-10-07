# Email Notifications for Mass Classes

## Overview
The system now sends automated email notifications for mass class-related events using SendGrid.

## New Email Templates

### 1. Admin Notifications
- **`createNewMassClassNotificationEmail`**: Sent to admin when a mass tutor creates a new class
- Includes class details, tutor information, and link to review in admin dashboard

### 2. Mass Tutor Notifications
- **`createClassApprovedEmail`**: Sent when admin approves a class
- **`createClassRejectedEmail`**: Sent when admin rejects a class with reason
- **`createNewEnrollmentNotificationEmail`**: Sent when a new student enrolls

### 3. Student Notifications
- **`createEnrollmentConfirmationEmail`**: Sent when student successfully enrolls in a class
- **`createClassReminderEmail`**: Sent before class sessions (already existed, now enhanced)

## Environment Variables Required

Add these to your `.env` file:

```env
# Email Configuration (already exists)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@tutorly.com

# Admin Notifications (NEW)
ADMIN_EMAIL=admin@tutorly.com

# Frontend URL for email links (NEW)
FRONTEND_URL=http://localhost:5173
```

## Implementation Details

### When Class is Created
```typescript
// In massTutor.service.ts - createClassService()
// After successfully creating a class:

// 1. Sends notification to admin immediately
await sendNewMassClassNotificationEmail(adminEmail, {
  tutorName: 'John Doe',
  tutorEmail: 'john@example.com',
  className: 'Advanced Mathematics',
  subject: 'Mathematics',
  day: 'Monday',
  time: '18:00',
  description: 'Learn calculus and algebra',
  classId: 'uuid-here',
  dashboardUrl: 'https://tutorly.com/admin/classes/uuid-here'
});

// 2. AUTO-APPROVE: Sends approval email to tutor after 5 seconds
// (Temporary until admin approval system is implemented)
setTimeout(() => {
  sendClassApprovedEmail(tutorEmail, {
    tutorName: 'John Doe',
    className: 'Advanced Mathematics',
    subject: 'Mathematics',
    day: 'Monday',
    time: '18:00',
    dashboardUrl: 'https://tutorly.com/mass-tutor/classes'
  });
}, 5000);
```

### ⚠️ Temporary Auto-Approval
Currently, **all classes are auto-approved** 5 seconds after creation, and the tutor receives an approval email automatically. This is a temporary measure until the admin approval system is fully implemented.

**When admin approval is implemented:**
- Remove the `setTimeout` block from `createClassService`
- Admin will manually approve/reject classes from the admin dashboard
- Approval/rejection emails will be sent based on admin actions

### Email Content Features
- **Responsive HTML templates** with consistent branding
- **Plain text fallback** for email clients that don't support HTML
- **Call-to-action buttons** with proper styling
- **Alert boxes** for important information
- **Detailed information tables** for class/enrollment details

## Testing

To test the email notifications:

1. Ensure SendGrid API key is configured
2. Set `ADMIN_EMAIL` in `.env` to your test email
3. Create a new class as a mass tutor
4. Check the admin email inbox for the notification

## Future Enhancements

- [ ] **Implement admin approval system** (remove auto-approval)
- [ ] Email notification when class is updated
- [ ] Email notification when class is deleted (if students enrolled)
- [ ] Batch enrollment notifications (daily digest)
- [ ] Email preferences/opt-out functionality
- [ ] Email delivery status tracking
- [ ] Admin dashboard to manage class approvals/rejections

## Error Handling

Email sending is **non-blocking** - if email fails to send, the class creation still succeeds. Errors are logged but don't interrupt the user flow:

```typescript
sendNewMassClassNotificationEmail(...).catch((error) => {
  console.error('Failed to send admin notification email:', error);
});
```

## Dependencies

- `@sendgrid/mail`: For sending emails via SendGrid
- Email templates in: `backend/src/templates/emails/`
- Email service in: `backend/src/services/email.service.ts`
