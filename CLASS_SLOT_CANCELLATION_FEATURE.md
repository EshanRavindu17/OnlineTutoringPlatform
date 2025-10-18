# Class Slot Cancellation & Live Status Feature

## Overview
This feature allows mass tutors to cancel class slots and automatically updates the class status to "live" when they join a session. Email notifications are sent to all enrolled students and the admin when a class is cancelled.

## Features Implemented

### 1. **Class Slot Cancellation**
- Mass tutors can cancel upcoming class sessions
- Sends email notifications to:
  - All enrolled students in the class
  - Admin (configurable via `ADMIN_EMAIL` environment variable)
- Updates slot status to `cancelled`
- Prevents cancelled classes from being joined

### 2. **Live Status Update**
- When tutor clicks "Join Session", the status automatically changes to `live`
- Live sessions display with a pulsing green badge
- Join button changes to "Join Live Session" when class is live

### 3. **Email Notifications**

#### Student Email
- Includes class name, tutor name, date, and time
- Shows cancellation reason (if provided)
- Provides refund information
- Professional template with warning styling

#### Admin Email
- Notifies about tutor cancellation
- Includes tutor details (name, email)
- Shows class information and affected student count
- Provides class ID for quick lookup
- Displays cancellation reason (if provided)

## Technical Implementation

### Backend Changes

#### 1. **Email Templates** (`backend/src/templates/emails/emailTemplates.ts`)
- `createClassCancellationEmail`: Email for students
- `createClassCancellationAdminEmail`: Email for admin

#### 2. **Email Service** (`backend/src/services/email.service.ts`)
- `sendClassCancellationEmail`: Sends email to students
- `sendClassCancellationAdminEmail`: Sends email to admin

#### 3. **Mass Tutor Service** (`backend/src/services/massTutor.service.ts`)
- `cancelClassSlotService(slotId, tutorId, reason?)`: Cancels a slot and sends all emails
- `setClassSlotLiveService(slotId, tutorId)`: Updates slot status to 'live'
- Updated `updateClassSlotService` to support new statuses: `cancelled` and `live`

#### 4. **Controllers** (`backend/src/controllers/massTutor.controller.ts`)
- `cancelClassSlotController`: POST endpoint for cancellation
- `setClassSlotLiveController`: POST endpoint to set live status

#### 5. **Routes** (`backend/src/routes/massTutor.routes.ts`)
```typescript
POST /mass-tutor/slots/:slotId/cancel
POST /mass-tutor/slots/:slotId/set-live
```

### Frontend Changes

#### 1. **API Methods** (`frontend/src/api/massTutorAPI.ts`)
```typescript
cancelClassSlot(slotId: string, reason?: string)
setClassSlotLive(slotId: string)
```

#### 2. **ClassDetail Component** (`frontend/src/pages/massTutor/ClassDetail.tsx`)

**Updated Interface:**
```typescript
interface ClassSlot {
  status: 'upcoming' | 'completed' | 'cancelled' | 'live';
  // ... other fields
}
```

**New Functions:**
- `handleCancelSlot(slotId)`: Prompts for reason and confirms cancellation
- `handleJoinZoom(slotId, meetingURLs)`: Sets status to live before joining

**UI Enhancements:**
- Cancel button appears for upcoming sessions
- Status badge shows cancelled/live/completed/upcoming
- Live sessions have pulsing green badge (🔴)
- Cancelled sessions show red badge (🚫)
- Join button adapts text based on status
- Cancel button with red styling

## Database Schema

The `ClassSlot` table already supports the new statuses via the `ClassSlotStatus` enum:
```prisma
enum ClassSlotStatus {
  upcoming
  completed
  cancelled
  live
}
```

## Usage

### For Mass Tutors:

1. **Cancel a Class:**
   - Navigate to class details
   - Find the upcoming session
   - Click "Cancel Class" button
   - Optionally provide a cancellation reason
   - Confirm the action
   - All students and admin receive email notifications

2. **Join a Class:**
   - Click "Join Session" button
   - Status automatically updates to "live"
   - Zoom meeting opens in new tab
   - Students see the class is now live

### Email Configuration

Set the admin email in your `.env` file:
```env
ADMIN_EMAIL=admin@tutorly.com
```

## API Endpoints

### Cancel Class Slot
```http
POST /mass-tutor/slots/:slotId/cancel
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "reason": "Emergency - need to reschedule" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Class slot cancelled and notifications sent",
  "updatedSlot": { ... },
  "notifiedStudents": 5
}
```

### Set Class Live
```http
POST /mass-tutor/slots/:slotId/set-live
Authorization: Bearer <firebase-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Class is now live",
  "updatedSlot": { ... }
}
```

## Error Handling

- **Unauthorized**: Returns 401 if tutor is not authenticated
- **Access Denied**: Returns error if slot doesn't belong to tutor
- **Invalid Status**: Cannot set to live if status is not 'upcoming'
- **Email Failures**: Logged but doesn't block the cancellation process

## Future Enhancements

1. **Rescheduling**: Allow tutors to reschedule instead of just cancel
2. **Automatic Refunds**: Integrate with payment system for automatic refunds
3. **Push Notifications**: Add real-time notifications via WebSocket
4. **Cancellation History**: Track cancellation patterns for analytics
5. **Student Confirmation**: Require students to acknowledge cancellation
6. **Bulk Cancellation**: Cancel multiple sessions at once
7. **Auto-complete**: Automatically mark sessions as completed after end time

## Testing Checklist

- [ ] Cancel upcoming class slot
- [ ] Verify students receive cancellation emails
- [ ] Verify admin receives notification email
- [ ] Check status updates to 'cancelled'
- [ ] Try to join cancelled session (should be blocked)
- [ ] Join upcoming session and verify status changes to 'live'
- [ ] Check live badge appears with animation
- [ ] Verify cancelled classes don't show join button
- [ ] Test with/without cancellation reason
- [ ] Test with multiple enrolled students
- [ ] Verify admin email configuration works

## Notes

- Cancelled sessions remain in the database for record-keeping
- Students are not automatically refunded (part of monthly subscription)
- Admin email can be configured via environment variable
- Email templates use professional HTML styling with responsive design
- All timestamps are properly formatted for user's locale
