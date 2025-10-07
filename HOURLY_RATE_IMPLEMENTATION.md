# Backend Implementation for Hourly Rate Update

## Summary

I have successfully implemented the backend functionality to allow tutors to update their hourly rate through the dashboard. Here's what has been added:

## Backend Changes

### 1. Service Layer (`individualTutorService.ts`)

- Added `updateTutorHourlyRate(firebaseUid: string, hourlyRate: number)` function
- Validates hourly rate range (0-300)
- Updates the `hourly_rate` field in the `Individual_Tutor` table
- Returns the updated tutor profile

### 2. Controller Layer (`individualTutorController.ts`)

- Added `updateTutorHourlyRateController` function
- Handles HTTP request validation
- Validates Firebase UID and hourly rate parameters
- Handles error responses and success responses
- Returns structured JSON responses

### 3. Routes Layer (`individualTutorRouter.ts`)

- Added new PUT route: `/hourly-rate/:firebaseUid`
- Maps to the controller function
- Follows REST conventions

### 4. Frontend Service (`TutorService.ts`)

- Added `updateTutorHourlyRate(firebaseUid: string, hourlyRate: number)` method
- Makes API call to the backend endpoint
- Handles success and error responses
- Includes proper logging

### 5. Frontend Dashboard (`tutorDashboard.tsx`)

- Added `handleSaveHourlyRate()` function
- Updated `EditButton` component to handle pricing section save
- Integrated with existing edit/save UI pattern
- Shows success/error messages

## API Endpoint Details

**Endpoint:** `PUT /individual-tutor/hourly-rate/:firebaseUid`

**Request Body:**

```json
{
  "hourlyRate": 75.5
}
```

**Success Response (200):**

```json
{
  "message": "Hourly rate updated successfully",
  "tutor": {
    "i_tutor_id": "uuid",
    "hourly_rate": 75.5,
    "User": {
      "name": "Tutor Name",
      "email": "email@example.com"
    }
    // ... other tutor fields
  }
}
```

**Error Responses:**

- 400: Invalid parameters or hourly rate out of range (0-300)
- 404: User or tutor profile not found
- 500: Internal server error

## Validation Rules

- Hourly rate must be a number
- Must be between $0 and $300 (as per admin limit)
- Firebase UID is required and must exist
- User must have an associated tutor profile

## Database Changes

- Uses existing `hourly_rate` field in `Individual_Tutor` table
- Field type: `Decimal(10, 2)` - suitable for monetary values
- No migration needed as field already exists

## Testing

- Backend server is running on port 5000
- All endpoints are properly registered
- Error handling and validation implemented
- Frontend integration completed

## Usage Flow

1. Tutor clicks "Edit" button in hourly rate section
2. Input field becomes editable
3. Tutor enters new hourly rate (0-300)
4. Tutor clicks "Save" button
5. Frontend calls API with Firebase UID and new rate
6. Backend validates, updates database, returns response
7. Frontend shows success/error message and exits edit mode

## Files Modified

- `backend/src/services/individualTutorService.ts`
- `backend/src/controllers/individualTutorController.ts`
- `backend/src/routes/individualTutorRouter.ts`
- `frontend/src/api/TutorService.ts`
- `frontend/src/pages/individualTutor/tutorDashboard.tsx`

The implementation is complete and ready for testing!
