# Students Enrollment Feature

## Overview
This feature allows mass tutors to view and manage student enrollments for their classes. The implementation provides a two-level view:
1. **Class Cards View**: Shows all classes with enrollment statistics
2. **Detailed Enrollment View**: Shows individual students enrolled in a specific class with their payment status

## Database Model
The feature uses the existing `Enrolment` model from Prisma schema:
- `status: 'valid'` = Student has paid for the month
- `status: 'invalid'` = Student hasn't paid yet

## Backend Implementation

### 1. Service Layer (`massTutor.service.ts`)
**New Function**: `getClassEnrollmentsService(classId, tutorId)`
- Verifies class ownership by tutor
- Fetches all enrollments with student details (name, email, photo)
- Returns formatted enrollments and statistics (total, paid, unpaid)

### 2. Controller Layer (`massTutor.controller.ts`)
**New Function**: `getClassEnrollmentsController(req, res)`
- Validates tutor authentication and class ID
- Calls service layer to fetch enrollments
- Returns JSON response with enrollments and stats

### 3. Routes (`massTutor.routes.ts`)
**New Route**: `GET /mass-tutor/classes/:classId/enrollments`
- Protected by Firebase authentication middleware
- Returns enrollment data for a specific class

## Frontend Implementation

### 1. API Layer (`massTutorAPI.ts`)
**New Method**: `getClassEnrollments(classId)`
- Makes authenticated GET request to backend
- Returns enrollment data with statistics

### 2. Students Page (`Students.tsx`)
**Features**:
- **Class Cards Grid**:
  - Displays all classes with title, subject, day, time
  - Shows total student count per class
  - Click to view detailed enrollments
  
- **Detailed Enrollment View**:
  - Back button to return to class cards
  - Stats cards showing Total/Paid/Unpaid counts
  - Professional table with:
    - Student avatar (photo or initials)
    - Student name and email
    - Enrollment date
    - Payment status badge (Paid/Unpaid)
  
- **UI Features**:
  - Loading states for async operations
  - Empty states with helpful messages
  - Responsive design (mobile-friendly)
  - Professional styling consistent with the app
  - Hover effects and smooth transitions

## Data Flow

```
1. Page Load → Fetch all classes
2. Click Class Card → Fetch enrollments for that class
3. Display enrollment table with paid/unpaid status
4. Click Back → Return to class cards view
```

## API Response Format

### Get Class Enrollments
**Endpoint**: `GET /mass-tutor/classes/:classId/enrollments`

**Response**:
```json
{
  "enrollments": [
    {
      "enrol_id": "uuid",
      "student_id": "uuid",
      "status": "valid",
      "subscription_id": "sub_xxx",
      "created_at": "2025-10-06T10:00:00Z",
      "student": {
        "name": "John Doe",
        "email": "john@example.com",
        "photo_url": "https://..."
      }
    }
  ],
  "stats": {
    "total": 10,
    "paid": 8,
    "unpaid": 2
  }
}
```

## Security
- All routes protected by Firebase authentication
- Tutors can only view enrollments for their own classes
- Backend validates class ownership before returning data

## Usage
1. Navigate to the Students page in the mass tutor dashboard
2. View all classes with enrollment counts
3. Click any class card to see detailed student list
4. See paid/unpaid status at a glance
5. Use back button to return to overview

## Future Enhancements
- Search/filter students by name or payment status
- Export enrollment data to CSV
- Send payment reminders to unpaid students
- View enrollment history over time
- Bulk actions (e.g., mark all as paid)
