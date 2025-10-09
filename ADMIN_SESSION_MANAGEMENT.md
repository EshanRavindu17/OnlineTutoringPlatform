# Admin Session Management Feature

## Overview
Complete session management system for admins to monitor, manage, and join both individual tutoring sessions and mass class slots.

## Features Implemented

### 1. Backend Services (`adminSession.service.ts`)
✅ **Get Individual Sessions** - Fetch all individual sessions with filtering
✅ **Get Mass Class Slots** - Fetch all mass class slots with filtering
✅ **Session Statistics** - Comprehensive stats for dashboard
✅ **Update Session Status** - Change individual session status
✅ **Update Slot Status** - Change mass class slot status
✅ **Zoom Integration** - Get ZAK token and generate admin host URLs
✅ **Session Details** - Get detailed info for individual sessions
✅ **Class Slot Details** - Get detailed info for mass class slots

#### Filtering Options
- **Status Filter**: Filter by session/slot status
- **Date Range**: Start and end date filtering
- **Search**: Search by title or subject
- **Type**: Individual or Mass sessions

### 2. Backend Controllers (`adminSession.controller.ts`)
✅ `getIndividualSessionsController` - GET individual sessions
✅ `getMassClassSlotsController` - GET mass class slots
✅ `getSessionStatsController` - GET statistics
✅ `updateIndividualSessionStatusController` - PUT session status
✅ `updateMassSlotStatusController` - PUT slot status
✅ `getZakTokenController` - GET Zoom ZAK token
✅ `getAdminHostUrlController` - POST to generate host URL
✅ `getSessionDetailsController` - GET session details
✅ `getClassSlotDetailsController` - GET slot details

### 3. API Routes (`admin.routes.ts`)
All routes are secured with `requireAdminJWT` middleware:

```
GET  /Admin/sessions/individual              - List individual sessions
GET  /Admin/sessions/mass                    - List mass class slots
GET  /Admin/sessions/stats                   - Get session statistics
GET  /Admin/sessions/individual/:sessionId   - Get session details
GET  /Admin/sessions/mass/:slotId            - Get slot details
PUT  /Admin/sessions/individual/:sessionId/status - Update session status
PUT  /Admin/sessions/mass/:slotId/status     - Update slot status
GET  /Admin/sessions/zoom/zak                - Get ZAK token
POST /Admin/sessions/zoom/host-url           - Generate admin host URL
```

### 4. Frontend API Client (`admin/api.ts`)
✅ `getIndividualSessions(filters)` - Fetch individual sessions
✅ `getMassClassSlots(filters)` - Fetch mass class slots
✅ `getSessionStats()` - Fetch statistics
✅ `getSessionDetails(sessionId)` - Fetch session details
✅ `getClassSlotDetails(slotId)` - Fetch slot details
✅ `updateSessionStatus(sessionId, status)` - Update session status
✅ `updateClassSlotStatus(slotId, status)` - Update slot status
✅ `getZakToken()` - Get Zoom ZAK token
✅ `getAdminHostUrl(meetingUrl)` - Generate host URL for joining

### 5. Frontend UI Component (`admin/Sessions.tsx`)

#### Dashboard Statistics
- **Total Individual Sessions** - Count with upcoming week preview
- **Total Mass Class Slots** - Count with upcoming week preview
- **Completed Sessions (30 days)** - Recent completion count
- **Active Now** - Currently ongoing sessions

#### Session Management Interface
- **Tab Navigation** - Switch between Individual and Mass sessions
- **Advanced Filters**:
  - Search by title/subject
  - Filter by status
  - Date range selection (start/end)
- **Session Cards** with:
  - Title, subject, date/time
  - Student and tutor information
  - Payment status and amount
  - Meeting URLs
  - Materials
  - Status badges
- **Actions**:
  - **Join Meeting** button (uses ZAK token for host access)
  - **Mark as Completed** button
  - Status updates in real-time

#### UI Features
- 📊 Real-time statistics dashboard
- 🎨 Color-coded status badges
- 🔍 Search and filter capabilities
- 📅 Date range filtering
- 🎥 One-click meeting join (as host)
- ✅ Quick status updates
- 📱 Responsive design
- ⚡ Loading states and error handling

## Session Status Flow

### Individual Sessions (SessionStatus enum)
```
scheduled → ongoing → completed
         ↓
       canceled
```

### Mass Class Slots (ClassSlotStatus enum)
```
upcoming → completed
```

## Join Meeting Flow

1. Admin clicks "Join Meeting" button
2. Frontend calls `getAdminHostUrl(meetingUrl)`
3. Backend:
   - Gets Zoom ZAK token using Server-to-Server OAuth
   - Extracts meeting ID from Zoom URL
   - Generates host URL with ZAK token
4. Frontend opens host URL in new tab
5. Admin joins as meeting host/moderator

## Environment Variables Required

```env
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
```

## Database Models Used

### Sessions (Individual)
- `session_id` - UUID primary key
- `student_id` - Reference to Student
- `i_tutor_id` - Reference to Individual_Tutor
- `status` - SessionStatus enum (scheduled, ongoing, completed, canceled)
- `title`, `subject`, `date`, `start_time`, `end_time`
- `meeting_urls` - Array of Zoom URLs
- `materials` - Array of material URLs
- `price` - Session price

### ClassSlot (Mass)
- `cslot_id` - UUID primary key
- `class_id` - Reference to Class
- `status` - ClassSlotStatus enum (upcoming, completed)
- `dateTime` - Scheduled date and time
- `duration` - Duration in minutes
- `meetingURLs` - Array of Zoom URLs
- `materials` - Array of material URLs
- `recording` - Recording URL
- `announcement` - Slot announcement

## Security

- ✅ All routes protected with JWT authentication
- ✅ Admin role verification
- ✅ Input validation on all endpoints
- ✅ Zoom ZAK token secured with Server-to-Server OAuth
- ✅ Meeting access restricted to admins only

## Usage Examples

### Filtering Sessions
```typescript
// Get scheduled individual sessions from this month
const sessions = await adminApi.getIndividualSessions({
  status: 'scheduled',
  startDate: '2025-10-01',
  endDate: '2025-10-31'
});
```

### Joining a Meeting
```typescript
// Generate admin host URL and join
const hostUrl = await adminApi.getAdminHostUrl(meetingUrl);
window.open(hostUrl, '_blank');
```

### Updating Status
```typescript
// Mark session as completed
await adminApi.updateSessionStatus(sessionId, 'completed');

// Mark class slot as completed
await adminApi.updateClassSlotStatus(slotId, 'completed');
```

## Future Enhancements (Optional)

- 📧 Email notifications when admin joins/leaves meetings
- 📊 Session duration analytics
- 📝 Admin notes on sessions
- 🎥 Recording management from admin panel
- 📈 Session quality ratings
- 🔔 Real-time notifications for ongoing sessions
- 📱 Mobile responsive improvements
- 🔍 Advanced search with more filters
- 📊 Export session data to CSV/Excel
- 📅 Calendar view for sessions

## Testing

To test the feature:

1. **Login as Admin** at `/admin/login`
2. **Navigate to Sessions** page
3. **View Statistics** - Check dashboard cards
4. **Filter Sessions** - Try different status and date filters
5. **Search** - Search by title or subject
6. **Join Meeting** - Click join button (requires active Zoom meeting)
7. **Update Status** - Mark sessions as completed

## Error Handling

- ❌ Invalid session/slot ID → 404 Not Found
- ❌ Missing meeting URL → 400 Bad Request
- ❌ Zoom API failure → 500 with detailed error message
- ❌ Invalid status transition → 400 with validation error
- ❌ Authentication failure → 401 Unauthorized

## Performance Considerations

- Uses pagination-ready structure (can add limit/offset)
- Efficient database queries with proper indexing
- Includes only necessary relations
- Caches Zoom ZAK tokens (valid for 2 hours)
- Optimistic UI updates for better UX

## Complete! 🎉

All features are implemented, tested, and ready for use. The admin can now effectively manage all tutoring sessions and class slots from a centralized dashboard.
