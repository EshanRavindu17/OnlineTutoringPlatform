# Session Lifecycle Management System Implementation

## Overview

This implementation introduces a comprehensive session lifecycle management system that handles automatic session state transitions based on time while keeping manual control for tutors.

## Key Features Implemented

### 1. **Approach 2: Simple Time-Based Management**

- **Upcoming Sessions**: Remain in "Upcoming" tab until they expire or are manually started
- **Auto-Expiry**: Sessions automatically move to "Cancelled" tab after end time + 15-minute grace period
- **Manual Controls**: Tutors control when sessions start and complete

### 2. **Session Lifecycle States**

```
┌─────────────┐    Start Session    ┌──────────────┐    Complete Session    ┌───────────────┐
│  scheduled  │ ─────────────────► │   ongoing    │ ────────────────────► │   completed   │
│ (Upcoming)  │                    │  (Ongoing)   │                       │  (Completed)  │
└─────────────┘                    └──────────────┘                       └───────────────┘
       │                                    │
       │ Auto-expire after                  │ Auto-complete after
       │ end time + 15min                   │ 1 hour ongoing
       ▼                                    ▼
┌─────────────┐                    ┌──────────────┐
│  canceled   │                    │   completed  │
│ (Cancelled) │                    │  (Completed) │
└─────────────┘                    └──────────────┘
```

### 3. **Grace Periods**

- **15-minute grace period**: Sessions don't auto-cancel immediately when end time passes
- **1-hour auto-complete**: Ongoing sessions auto-complete after 1 hour to prevent stuck states

### 4. **New API Endpoints**

#### Session Lifecycle Management:

- `POST /api/sessions/:firebaseUid/session/:sessionId/start` - Start a session (scheduled → ongoing)
- `POST /api/sessions/:firebaseUid/session/:sessionId/complete` - Complete a session (ongoing → completed)

#### Admin/Cleanup Functions:

- `POST /api/sessions/admin/auto-expire` - Manually trigger session expiry cleanup
- `POST /api/sessions/admin/auto-complete` - Manually trigger auto-completion of long-running sessions

#### Health Checks:

- `GET /health/session-cleanup` - Check status of automatic cleanup service

### 5. **Frontend UI Changes**

#### Upcoming Sessions Tab:

- **"Start Session & Join Meeting"** button (replaces generic "Join Meeting")
- Clicking this button:
  1. Changes session status from "scheduled" to "ongoing"
  2. Opens Zoom meeting (if URL available)
  3. Moves session to "Ongoing" tab
  4. Shows success notification

#### Ongoing Sessions Tab:

- **"Join Meeting"** button (opens meeting without status change)
- **"Complete Session"** button (replaces "Finish Session")
- Clicking Complete Session:
  1. Changes status from "ongoing" to "completed"
  2. Moves session to "Completed" tab
  3. Shows success notification

### 6. **Backend Service Functions**

#### New Session Service Methods:

```typescript
// Start a session (scheduled → ongoing)
startSession(tutorId: string, sessionId: string): Promise<SessionWithDetails>

// Complete a session (ongoing → completed)
completeSession(tutorId: string, sessionId: string): Promise<SessionWithDetails>

// Auto-expire scheduled sessions past grace period
autoExpireScheduledSessions(): Promise<{expiredCount: number, sessionIds: string[]}>

// Auto-complete sessions ongoing for >1 hour
autoCompleteLongRunningSessions(): Promise<{completedCount: number, sessionIds: string[]}>
```

#### Updated Session Queries:

```typescript
// getTutorUpcomingSessions: Only returns scheduled sessions that haven't expired
// - Filters out sessions past end_time + 15 minutes
// - Uses slots array for time calculations
// - Handles multiple time formats (ISO, direct time strings)
```

### 7. **Automatic Cleanup System**

#### SessionCleanupService:

- **Runs in background**: Automatically checks for expired/stuck sessions
- **Configurable intervals**:
  - Expire check: Every 5 minutes
  - Auto-complete check: Every 10 minutes
- **Graceful shutdown**: Stops cleanly when server shuts down
- **Health monitoring**: Status endpoint for monitoring

#### Cleanup Operations:

```typescript
// Every 5 minutes: Check for sessions to expire
- Find scheduled sessions past end_time + 15 minutes
- Update status to 'canceled'
- Update related payments to 'refund' status

// Every 10 minutes: Check for long-running sessions
- Find ongoing sessions started >1 hour ago
- Update status to 'completed'
- Set end_time to current timestamp
```

### 8. **Frontend Service Updates**

#### New SessionService Methods:

```typescript
// Start session (for "Start Session" button)
startSession(firebaseUid: string, sessionId: string): Promise<SessionWithDetails>

// Complete session (for "Complete Session" button)
completeSession(firebaseUid: string, sessionId: string): Promise<SessionWithDetails>

// Admin cleanup functions
autoExpireScheduledSessions(): Promise<{expiredCount: number, sessionIds: string[]}>
autoCompleteLongRunningSessions(): Promise<{completedCount: number, sessionIds: string[]}>
```

## Implementation Benefits

### 1. **User Experience**

- **Clear Actions**: Tutors know exactly what each button does
- **Automatic Cleanup**: No orphaned sessions in wrong states
- **Real-time Updates**: UI reflects actual session states
- **Grace Periods**: Flexibility for real-world delays

### 2. **System Reliability**

- **Background Processing**: Automatic state management
- **Consistent Data**: No manual intervention required for basic cleanup
- **Monitoring**: Health check endpoints for system status
- **Error Handling**: Robust error handling and logging

### 3. **Business Logic**

- **Payment Handling**: Auto-refunds for expired sessions
- **Time Slot Management**: Proper cleanup of booking slots
- **Dashboard Accuracy**: Sessions appear in correct tabs based on actual state

## Usage Examples

### 1. **Tutor Starting a Session**

```
1. Session shows in "Upcoming" tab with "Start Session & Join Meeting" button
2. Tutor clicks button at 12:00 PM (scheduled time)
3. Status changes: scheduled → ongoing
4. Session moves to "Ongoing" tab
5. Zoom meeting opens (if URL available)
6. Success notification shows
```

### 2. **Session Auto-Expiry**

```
1. Session scheduled for 12:00-1:00 PM
2. Tutor doesn't start session
3. At 1:15 PM (end + 15min grace): Auto-expired
4. Status changes: scheduled → canceled
5. Payment status: → refund
6. Session moves to "Cancelled" tab
```

### 3. **Session Auto-Completion**

```
1. Session started at 12:00 PM (ongoing)
2. Tutor forgets to complete session manually
3. At 1:00 PM (1 hour later): Auto-completed
4. Status changes: ongoing → completed
5. Session moves to "Completed" tab
```

## Configuration

### Environment Variables (Optional)

```bash
# Session cleanup intervals (default values shown)
SESSION_EXPIRE_CHECK_INTERVAL_MS=300000    # 5 minutes
SESSION_COMPLETE_CHECK_INTERVAL_MS=600000  # 10 minutes

# Grace periods
SESSION_EXPIRE_GRACE_PERIOD_MS=900000      # 15 minutes
SESSION_AUTO_COMPLETE_AFTER_MS=3600000     # 1 hour
```

## Health Monitoring

### Endpoints for System Monitoring:

- `GET /health/session-cleanup` - Check cleanup service status
- `GET /health/reminders` - Check reminder system status
- `GET /health` - Overall system health

### Response Format:

```json
{
  "status": "OK",
  "message": "Session cleanup system status",
  "isRunning": true,
  "expireIntervalActive": true,
  "completeIntervalActive": true
}
```

## Database Schema Considerations

### Current Implementation:

- Uses existing `Sessions` table schema
- No additional fields required
- Compatible with current payment and booking systems

### Future Enhancements (Optional):

```sql
-- Optional: Add cancellation reason field
ALTER TABLE Sessions ADD COLUMN cancellation_reason TEXT;

-- Optional: Add auto-completion tracking
ALTER TABLE Sessions ADD COLUMN auto_completed BOOLEAN DEFAULT FALSE;
```

This implementation provides a robust, user-friendly session management system that handles the complete lifecycle automatically while giving tutors full control over their teaching sessions.
