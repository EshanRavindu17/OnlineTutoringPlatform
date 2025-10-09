# Class Detail & Session Management Implementation

## Overview
Complete implementation of class detail page with session management, material uploads, Zoom integration, and student viewing.

---

## Backend Implementation

### 1. **Multer Configuration** (`backend/src/config/multer.ts`)
Added new storage configurations:
- `materialsStorage`: For PDF, DOC, DOCX, PPT, PPTX, images (50MB limit)
- `recordingsStorage`: For video recordings (500MB limit)
- Both upload to Cloudinary in appropriate folders

### 2. **Upload Controller** (`backend/src/controllers/upload.controller.ts`)
New endpoints:
- `uploadMaterialController`: Single material upload
- `uploadMultipleMaterialsController`: Multiple materials upload
- `uploadRecordingController`: Recording upload
- All use Cloudinary via multer middleware

### 3. **Mass Tutor Service** (`backend/src/services/massTutor.service.ts`)
New services:
- `getClassSlotsService`: Fetch all slots for a class
- `createZoomMeetingForSlotService`: Create Zoom meeting and store URLs in slot

### 4. **Mass Tutor Controller** (`backend/src/controllers/massTutor.controller.ts`)
New controllers:
- `getClassSlotsController`: GET /mass-tutor/classes/:classId/slots
- `createZoomMeetingController`: POST /mass-tutor/classes/:classId/zoom
- `getZoomHostUrlController`: POST /mass-tutor/zoom/get-zak

### 5. **Routes** (`backend/src/routes/massTutor.routes.ts`)
New routes:
```typescript
// Slot management
GET    /mass-tutor/classes/:classId/slots
POST   /mass-tutor/classes/:classId/slots
PUT    /mass-tutor/slots/:slotId
DELETE /mass-tutor/slots/:slotId

// Zoom integration
POST   /mass-tutor/classes/:classId/zoom
POST   /mass-tutor/zoom/get-zak

// File uploads
POST   /mass-tutor/upload/material
POST   /mass-tutor/upload/materials
POST   /mass-tutor/upload/recording
```

---

## Frontend Implementation

### 1. **API Client** (`frontend/src/api/massTutorAPI.ts`)
New methods:
- `getClassSlots(classId)`: Fetch all sessions
- `createZoomMeeting(classId, data)`: Create Zoom meeting
- `uploadMaterial(file)`: Upload single material
- `uploadMaterials(files)`: Upload multiple materials
- `uploadRecording(file)`: Upload recording
- `getZoomHostUrl(oldHostUrl)`: Get fresh ZAK token for joining

### 2. **ClassDetail Component** (`frontend/src/pages/massTutor/ClassDetail.tsx`)

#### **Features:**
✅ **Session Display**
- Upcoming sessions (future dates)
- Past sessions (completed/past dates)
- Shows date, time, duration for each session
- Displays announcements if any

✅ **Material Management**
- View all materials per session
- Upload materials (PDF, DOC, PPT, images)
- Click to open materials in new tab
- Progress indicator during upload

✅ **Recording Management**
- Upload recordings for past sessions
- View recordings with video player link
- Opens in new tab

✅ **Zoom Integration**
- "Join Session" button for upcoming sessions
- Automatically refreshes ZAK token before joining
- Opens Zoom in new tab with valid host URL

✅ **Student List**
- Shows all enrolled students
- Displays enrollment status

✅ **Schedule Session Modal**
- Date/time picker
- Duration selector (in hours)
- Announcement field
- Auto-create Zoom meeting option
- Creates slot and Zoom meeting in one action

#### **Component Structure:**
```typescript
ClassDetailPage
├── Session display (upcoming/past)
├── StudentList
├── ScheduleSessionModal
└── SessionCard
    ├── Material upload
    ├── Recording upload
    └── Zoom join button
```

---

## Data Flow

### **Creating a Session:**
1. Tutor clicks "Schedule Session"
2. Fills form (date, time, duration, announcement)
3. Optionally enables "Create Zoom meeting"
4. Frontend calls `createClassSlot()` → creates ClassSlot
5. If Zoom enabled, calls `createZoomMeeting()` → stores [host_url, join_url] in meetingURLs array

### **Uploading Materials:**
1. Tutor clicks "Upload Material" on a session card
2. Selects file from local system
3. Frontend uploads to `/mass-tutor/upload/material`
4. Multer middleware uploads to Cloudinary
5. Returns Cloudinary URL
6. Frontend calls `updateClassSlot()` to add URL to materials array
7. UI refreshes to show new material

### **Joining Zoom (As Host):**
1. Tutor clicks "Join Session"
2. Frontend extracts old host URL from `meetingURLs[0]`
3. Calls `getZoomHostUrl(oldHostUrl)` → backend calls `getZak()` → returns new URL with fresh token
4. Opens new URL in browser tab
5. Tutor enters Zoom meeting room

### **Viewing Materials/Recordings:**
1. Students/Tutors see list of materials/recordings
2. Click on link → opens Cloudinary URL in new tab
3. Can view/download directly

---

## Database Schema

### **ClassSlot Model:**
```prisma
model ClassSlot {
  cslot_id     String          @id @default(uuid())
  class_id     String          @db.Uuid
  dateTime     DateTime        @db.Timestamp(6)
  duration     Float           @db.Real         // in hours
  materials    String[]                          // Array of Cloudinary URLs
  meetingURLs  String[]                          // [host_url, join_url]
  announcement String?
  recording    String?                           // Cloudinary URL
  status       ClassSlotStatus @default(upcoming) // upcoming | completed
  Class        Class           @relation(...)
}
```

---

## Environment Variables Required

### **Backend (.env):**
```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Zoom
YOUR_CLIENT_ID=zoom_client_id
YOUR_CLIENT_SECRET=zoom_client_secret
YOUR_ACCOUNT_ID=zoom_account_id
```

---

## Usage Guide

### **For Mass Tutors:**

1. **View Class Details:**
   - Click "Open" on any class from Classes page
   - See upcoming and past sessions
   - View enrolled students

2. **Schedule a Session:**
   - Click "Schedule Session" button
   - Select date/time and duration
   - Add announcement (optional)
   - Enable "Create Zoom meeting" to auto-generate meeting links
   - Click "Schedule"

3. **Upload Materials:**
   - Click "Upload Material" on any session card
   - Select PDF, DOC, PPT, or image file
   - File uploads to Cloudinary
   - Material appears in session card

4. **Upload Recording:**
   - For past sessions, click "Upload Recording"
   - Select video file (MP4, MOV, etc.)
   - Recording uploads to Cloudinary
   - Recording link appears in session card

5. **Join Zoom Session:**
   - For upcoming sessions with Zoom links
   - Click "Join Session"
   - System refreshes ZAK token automatically
   - Opens Zoom in new tab

### **For Students:**
- View materials: Click on material links to download
- View recordings: Click "View Recording" to watch
- Join Zoom: Click join link (uses `meetingURLs[1]`)

---

## Key Features

✅ **Session Management:** Create, view, edit, delete sessions
✅ **Material Uploads:** PDF, DOC, PPT, images up to 50MB
✅ **Recording Uploads:** Video files up to 500MB
✅ **Zoom Integration:** Auto-create meetings, join with fresh tokens
✅ **Student Tracking:** View all enrolled students
✅ **Announcements:** Add special instructions per session
✅ **Status Tracking:** Auto-detect upcoming vs past sessions
✅ **Cloud Storage:** All files stored on Cloudinary
✅ **Responsive UI:** Works on desktop and mobile
✅ **Real-time Updates:** Auto-refresh after uploads

---

## Testing Checklist

- [ ] Schedule a session without Zoom
- [ ] Schedule a session with Zoom
- [ ] Upload material to a session
- [ ] Upload recording to past session
- [ ] Join Zoom meeting as host
- [ ] View materials in new tab
- [ ] View recording in new tab
- [ ] Delete a session
- [ ] Update session details
- [ ] Check student list displays correctly

---

## Future Enhancements

- [ ] Bulk material upload
- [ ] Material organization by category
- [ ] In-app video player for recordings
- [ ] Student attendance tracking
- [ ] Session reminders via email
- [ ] Material download statistics
- [ ] Search/filter sessions by date range
- [ ] Export session reports

---

## Troubleshooting

**Issue:** Materials not uploading
- Check Cloudinary credentials in backend `.env`
- Verify file size under 50MB
- Check network connection

**Issue:** Zoom meeting fails to create
- Verify Zoom credentials in `.env`
- Check Zoom API quotas
- Ensure start time is valid ISO format

**Issue:** Cannot join Zoom meeting
- ZAK token may be expired (system auto-refreshes)
- Check Zoom account status
- Verify meeting URLs exist in database

**Issue:** Students not showing
- Check Enrolment table has records
- Verify status is 'valid'
- Check User relation exists

---

## Architecture Notes

- **File Storage:** Cloudinary (not local filesystem)
- **Meeting URLs:** First index = host, second = join
- **Time Format:** ISO-8601 for dateTime fields
- **Authentication:** Firebase tokens via authMiddleware
- **File Size Limits:** Materials 50MB, Recordings 500MB
- **Multer:** Handles multipart/form-data uploads
- **CloudinaryStorage:** Direct upload to Cloudinary

