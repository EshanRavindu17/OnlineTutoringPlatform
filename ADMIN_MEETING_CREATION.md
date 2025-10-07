# Admin Meeting Creation & Email System

## Overview
This feature allows admins to create Zoom meetings and send invitations via email to any user on the platform (students, individual tutors, or mass tutors).

## Features Implemented

### Backend Services

1. **adminMeeting.service.ts** - Core business logic
   - `getAllUsersService()` - Fetch all users with compressed IDs
   - `createAdminMeetingService()` - Create Zoom meeting and save to database
   - `getAdminSessionsService()` - List all admin-created meetings
   - `updateAdminSessionReceiverService()` - Track email recipients
   - `sendMeetingEmailService()` - Send meeting invitations via email
   - `deleteAdminSessionService()` - Remove meetings
   - `updateAdminSessionStatusService()` - Update meeting status

2. **adminMeeting.controller.ts** - HTTP request handlers
   - `getAllUsersController` - GET all users
   - `createAdminMeetingController` - POST create meeting
   - `getAdminSessionsController` - GET meeting history
   - `sendMeetingEmailController` - POST send email
   - `deleteAdminSessionController` - DELETE meeting
   - `updateAdminSessionStatusController` - PUT update status

3. **Email Integration**
   - Uses existing SendGrid email service
   - New template: `createAdminMeetingInvitationEmail()`
   - Professional styled email with meeting details and join button
   - Tracks who received the invitation

### Backend Routes
All routes are secured with `requireAdminJWT` middleware:

```
GET    /Admin/meetings/users                    - Get all platform users
POST   /Admin/meetings/create                   - Create Zoom meeting
GET    /Admin/meetings/sessions                 - Get meeting history
POST   /Admin/meetings/send-email               - Send meeting invitation
DELETE /Admin/meetings/sessions/:sessionId      - Delete meeting
PUT    /Admin/meetings/sessions/:sessionId/status - Update meeting status
```

### Database Model

The `admin_sessions` table stores created meetings:

```prisma
model admin_sessions {
  id             String         @id @default(uuid)
  name           String         // Meeting name
  urls           String[]       // [host_url, join_url]
  description    String?        // Optional description
  created_by     String         @db.Uuid
  created_at     DateTime       @default(now())
  receiver_email String?        // Email of recipient
  status         SessionStatus? @default(scheduled)
  Admin          Admin          @relation(...)
  User           User?          @relation(...)
}
```

### Frontend Components

1. **Meetings.tsx** - Main UI component with two tabs:
   - **Create Meeting Tab**:
     - Form to create Zoom meeting
     - Meeting name, topic, description, start time, duration
     - Displays created meeting URLs (host and join)
     - User list with search functionality
     - Send email button for each user
   
   - **Meeting History Tab**:
     - List of all created meetings
     - Shows status, creator, recipient
     - Delete functionality
     - Quick access to meeting URLs

2. **Email Composition Modal**
   - Pre-filled with meeting details
   - Editable subject and message
   - Shows meeting URL being sent
   - Send button to deliver invitation

### Frontend API Methods (admin/api.ts)

```typescript
getAllUsers()                           // Get all users
createAdminMeeting(data)                // Create Zoom meeting
getAdminSessions(mineOnly?)             // Get meeting history
sendMeetingEmail(data)                  // Send invitation email
deleteAdminSession(sessionId)           // Delete meeting
updateAdminSessionStatus(sessionId, status) // Update status
```

### Navigation

- **Route**: `/admin/meetings`
- **Menu Item**: "Create Meetings" with video camera icon
- **Description**: "Create and send meeting invitations"
- **Position**: Between "Session Management" and "Analytics"

## Usage Flow

### 1. Create a Meeting
1. Navigate to `/admin/meetings`
2. Fill in the meeting form:
   - Meeting Name (e.g., "Weekly Team Meeting")
   - Zoom Topic (appears in Zoom)
   - Description (optional)
   - Start Time (datetime picker)
   - Duration (15-300 minutes)
3. Click "🎥 Create Zoom Meeting"
4. System creates Zoom meeting and saves to database
5. Host URL and Join URL are displayed

### 2. Send Invitations
1. After creating meeting, user list becomes active
2. Use search to filter users by name, email, or role
3. Each user shows:
   - Avatar with initial
   - Name and role badge (Student/Individual/Mass)
   - Email address
   - Compressed ID
4. Click "📧 Send Email" button
5. Email modal opens with:
   - Pre-filled recipient info
   - Editable subject and message
   - Meeting URL included automatically
6. Customize message if needed
7. Click "📧 Send Email"
8. Email sent via SendGrid with professional template

### 3. View Meeting History
1. Click "Meeting History" tab
2. See all created meetings with:
   - Meeting name and description
   - Status badge (scheduled/ongoing/completed/canceled)
   - Creator name
   - Recipient (if email was sent)
   - Creation date
   - Host URL and Join URL links
3. Delete meetings if needed

## Email Template

The email includes:
- 📅 Meeting invitation header
- Recipient name greeting
- Custom message from admin
- Meeting details card:
  - Subject
  - Organized by (Admin name)
  - Platform: Zoom
- 🎥 Join Meeting button (blue/purple gradient)
- Meeting URL in plain text
- Professional footer with SmartTutor branding

## Environment Variables Required

```env
# Zoom API (for creating meetings)
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
ZOOM_ACCOUNT_ID=your_zoom_account_id

# SendGrid (for sending emails)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_sender_email@domain.com
```

## Security

- All routes protected by `requireAdminJWT` middleware
- Only authenticated admins can:
  - Create meetings
  - View user list
  - Send emails
  - Access meeting history
- Admins can only delete their own created meetings

## Technical Details

### Zoom Integration
- Uses `createZoomMeeting()` from existing zoom.service.ts
- Creates scheduled Zoom meetings
- Returns host URL (for admin) and join URL (for participants)
- Meeting settings:
  - Type: Scheduled meeting (type 2)
  - Host video: Enabled
  - Participant video: Enabled
  - Waiting room: Enabled
  - Auto-recording: Local
  - Mute on entry: Enabled

### Email Service Integration
- Reuses existing SendGrid setup
- New template function: `createAdminMeetingInvitationEmail()`
- Uses base template system for consistent styling
- Includes both HTML and plain text versions

### User List Display
- Shows all users from User table
- Compressed ID: First 8 characters of UUID
- Role-based color coding:
  - Student: Blue badge
  - Individual: Green badge
  - Mass: Purple badge
- Search filters: name, email, role
- Sorted by role, then name

## Testing

### Test Creating a Meeting
1. Go to `/admin/meetings`
2. Fill form with test data
3. Set start time in future
4. Submit form
5. Verify meeting created in Zoom
6. Check URLs are valid

### Test Sending Email
1. Create a meeting
2. Select a test user
3. Customize message
4. Send email
5. Check recipient's inbox
6. Verify email formatting
7. Test join URL works

### Test Meeting History
1. Create multiple meetings
2. Send to different users
3. Check all appear in history
4. Verify status badges
5. Test delete functionality

## Future Enhancements

Potential improvements:
- Bulk email sending (select multiple users)
- Scheduled email sending (send later)
- Meeting templates (reuse common settings)
- Calendar integration
- Meeting reminders
- Attendance tracking
- Meeting analytics
- Export meeting history to CSV
- Meeting recording management
- Custom email templates
- Rich text editor for messages

## Troubleshooting

### Meeting Creation Fails
- Check Zoom API credentials in .env
- Verify Zoom account has meeting creation permissions
- Check start time format (ISO 8601)
- Ensure duration is between 15-300 minutes

### Email Not Sending
- Verify SendGrid API key is valid
- Check FROM_EMAIL is verified in SendGrid
- Review SendGrid dashboard for delivery status
- Check recipient email is valid
- Verify email service is not rate limited

### User List Empty
- Check database has users
- Verify admin JWT token is valid
- Check backend route is responding
- Review browser console for errors

## API Response Examples

### Create Meeting Response
```json
{
  "success": true,
  "meeting": {
    "session_id": "uuid-here",
    "name": "Weekly Team Meeting",
    "description": "Discussion of weekly progress",
    "host_url": "https://zoom.us/s/...",
    "join_url": "https://zoom.us/j/...",
    "created_at": "2025-01-07T10:30:00Z"
  }
}
```

### Get Users Response
```json
{
  "success": true,
  "count": 150,
  "users": [
    {
      "id": "abc12345",
      "fullId": "abc12345-6789-...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Student",
      "photo_url": null
    }
  ]
}
```

### Send Email Response
```json
{
  "success": true,
  "message": "Meeting email sent successfully",
  "recipient": "john@example.com"
}
```

## Files Modified/Created

### Backend
- ✅ `backend/src/services/adminMeeting.service.ts` (NEW)
- ✅ `backend/src/controllers/adminMeeting.controller.ts` (NEW)
- ✅ `backend/src/routes/admin.routes.ts` (MODIFIED - added 6 routes)
- ✅ `backend/src/services/email.service.ts` (MODIFIED - added export)
- ✅ `backend/src/templates/emails/emailTemplates.ts` (MODIFIED - added template)

### Frontend
- ✅ `frontend/src/admin/Meetings.tsx` (NEW)
- ✅ `frontend/src/admin/api.ts` (MODIFIED - added 6 methods)
- ✅ `frontend/src/admin/AdminLayout.tsx` (MODIFIED - added nav item & icon)
- ✅ `frontend/src/App.tsx` (MODIFIED - added route & import)

### Documentation
- ✅ `ADMIN_MEETING_CREATION.md` (THIS FILE)

## Summary

This feature provides a complete workflow for admins to:
1. ✅ Create Zoom meetings programmatically
2. ✅ Browse all platform users with search
3. ✅ Send professional email invitations
4. ✅ Track meeting history
5. ✅ Manage meeting lifecycle

The implementation integrates seamlessly with existing:
- Zoom API for meeting creation
- SendGrid email service for delivery
- Admin authentication system
- Database schema (admin_sessions table)
- UI design patterns and styling
