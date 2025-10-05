# Email Reminder System

This document describes the automated email reminder system for the Tutorly platform that sends notifications before scheduled sessions.

## Overview

The reminder system automatically sends email notifications to students and tutors:
- **24 hours** before a scheduled session
- **1 hour** before a scheduled session

The system handles both:
- Individual tutoring sessions
- Mass class sessions

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cron Jobs     │───→│  Reminder Service │───→│  Email Service  │
│                 │    │                  │    │                 │
│ • 24h: Hourly   │    │ • Query DB       │    │ • Send emails   │
│ • 1h: 10min     │    │ • Process data   │    │ • Use templates │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Cron Job Schedules

### 24-Hour Reminders
- **Schedule**: `0 * * * *` (Every hour)
- **Purpose**: Send reminders for sessions starting in 24 hours
- **Buffer**: 10-minute window for accuracy

### 1-Hour Reminders
- **Schedule**: `*/10 * * * *` (Every 10 minutes)
- **Purpose**: Send reminders for sessions starting in 1 hour
- **Buffer**: 10-minute window for accuracy

## Features

### Individual Sessions
- Queries `Sessions` table for upcoming scheduled sessions
- Sends reminders to both student and tutor
- Includes session details and meeting links
- Handles session cancellations and rescheduling

### Mass Classes
- Queries `ClassSlot` table for upcoming class sessions
- Sends reminders to all enrolled students
- Sends summary reminder to tutor
- Includes class details and meeting links

### Email Content
- Professional email templates with Tutorly branding
- Personalized content for students vs tutors
- Session/class details (date, time, tutor/student names)
- Direct links to join meetings when available
- Clear call-to-action buttons

## API Endpoints

### Health Check
```
GET /health/reminders
```
Check if the reminder system is running properly.

**Response:**
```json
{
  "status": "OK",
  "message": "Email reminder system is active",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "jobs": [
    {
      "name": "24-hour reminders",
      "schedule": "0 * * * *",
      "description": "Runs every hour"
    },
    {
      "name": "1-hour reminders", 
      "schedule": "*/10 * * * *",
      "description": "Runs every 10 minutes"
    }
  ]
}
```

### Manual Trigger (Testing)
```
POST /api/reminders/trigger
Content-Type: application/json

{
  "hoursAhead": 24
}
```

Manually trigger reminder emails for testing purposes.

**Parameters:**
- `hoursAhead`: `24` or `1`

**Response:**
```json
{
  "success": true,
  "message": "24-hour reminder job completed successfully",
  "timestamp": "2025-10-03T10:30:00.000Z"
}
```

### Get Status
```
GET /api/reminders/status
```

Get detailed status of the reminder system.

### Restart Jobs
```
POST /api/reminders/restart
```

Restart the cron jobs (useful for maintenance).

## Database Queries

### Individual Sessions
```sql
SELECT * FROM Sessions 
WHERE status = 'scheduled' 
  AND start_time BETWEEN @reminderTime AND @timeBuffer
```

### Mass Class Slots
```sql
SELECT * FROM ClassSlot 
WHERE status = 'upcoming' 
  AND dateTime BETWEEN @reminderTime AND @timeBuffer
```

## Configuration

### Timezone
The system uses `Asia/Colombo` timezone by default. Update this in the cron job configuration:

```typescript
{
  timezone: "Asia/Colombo" // Change to your timezone
}
```

### Email Rate Limiting
- 1 second delay between individual session emails
- 500ms delay between mass class emails to same students
- Prevents overwhelming email service

## Error Handling

### Graceful Degradation
- Individual email failures don't stop the batch
- Detailed error logging for troubleshooting
- Continues processing remaining reminders

### Logging
```
🔔 Found 5 individual sessions needing 24-hour reminders
✅ Sent 24-hour reminder for session abc-123
❌ Failed to send reminder for session def-456: Email address invalid
✅ Completed 24-hour reminder job at 2025-10-03T10:30:00.000Z
```

## Usage Examples

### Starting the System
The reminder system starts automatically when the server starts:

```typescript
// In index.ts
import { startReminderJobs } from './services/remider.service';

app.listen(PORT, () => {
  // ... other startup code
  startReminderJobs();
});
```

### Manual Testing
For development and testing:

```bash
# Test 24-hour reminders
curl -X POST http://localhost:5000/api/reminders/trigger \
  -H "Content-Type: application/json" \
  -d '{"hoursAhead": 24}'

# Test 1-hour reminders  
curl -X POST http://localhost:5000/api/reminders/trigger \
  -H "Content-Type: application/json" \
  -d '{"hoursAhead": 1}'

# Check system status
curl http://localhost:5000/health/reminders
```

### Email Preview
```typescript
// In development, preview emails
if (process.env.NODE_ENV === 'development') {
  const preview = createSessionReminderEmail({
    type: 'student',
    studentName: 'Test Student',
    tutorName: 'Test Tutor', 
    sessionDate: 'October 15, 2025',
    sessionTime: '2:00 PM',
    reminderTime: '24 hours'
  });
  
  console.log('Email HTML:', preview.html);
}
```

## Monitoring

### Key Metrics
- Number of reminders sent per job run
- Email delivery success rate
- Job execution duration
- Error rates and types

### Health Checks
- Cron job status verification
- Database connectivity
- Email service availability
- Recent job execution logs

## Troubleshooting

### Common Issues

1. **No reminders sent**
   - Check cron job status: `GET /health/reminders`
   - Verify database sessions exist
   - Check email service configuration

2. **Emails not delivered**
   - Verify SendGrid API key
   - Check email addresses are valid
   - Review email service logs

3. **Wrong timing**
   - Verify server timezone settings
   - Check cron expression syntax
   - Validate session date/time data

### Debug Mode
Enable detailed logging for development:

```typescript
// Add to reminder service
if (process.env.NODE_ENV === 'development') {
  console.log('Debug: Session data:', sessions);
  console.log('Debug: Reminder time:', reminderTime);
}
```

## Performance Considerations

### Database Optimization
- Index on `Sessions.start_time` and `Sessions.status`
- Index on `ClassSlot.dateTime` and `ClassSlot.status`
- Limit query results with time buffers

### Email Batching
- Process reminders in batches
- Rate limit to prevent service overload
- Retry failed emails with exponential backoff

## Security

### Access Control
- Reminder endpoints require admin authentication (recommended)
- Input validation for manual triggers
- Sanitize email content and recipient data

### Data Protection
- No sensitive data in logs
- Secure email template rendering
- Validate email addresses before sending

## Future Enhancements

### Planned Features
- Custom reminder timing per user preference
- SMS reminders via Twilio
- Push notifications for mobile app
- Reminder statistics dashboard
- A/B testing for email content

### Configuration Options
- User-configurable reminder preferences
- Different timing for different session types
- Escalation reminders for no-shows
- Reminder frequency limits