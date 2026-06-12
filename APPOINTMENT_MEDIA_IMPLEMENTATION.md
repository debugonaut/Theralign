# Appointment Media Upload Feature — Implementation Summary

**Date:** June 10, 2026  
**Feature:** Allow patients to upload media (images, videos, audio) for appointments before payment

## Overview

Patients can now upload up to 5 media files (images, videos, audio) while confirming their appointment booking. This helps doctors understand the patient's condition better before the session.

## Architecture

### 1. Database Model

**File:** `server/src/models/AppointmentMedia.model.js`

- **Collection:** `AppointmentMedia` (separate, not embedded in Appointment)
- **Key Fields:**
  - `appointment` — Reference to Appointment
  - `uploadedBy` — 'patient' or 'doctor'
  - `uploader` — Reference to User who uploaded
  - `mediaType` — 'image', 'video', or 'audio'
  - `fileType` — MIME type (jpg/png/webp, mp4/mov, mp3/m4a)
  - `cloudinaryUrl` — CDN URL from Cloudinary
  - `cloudinaryPublicId` — For deletion
  - `duration` — For video/audio files (in seconds)

**Constraints:**
- Maximum 5 files per appointment
- Maximum 25MB per file
- Allowed types: JPG, PNG, WEBP (images), MP4, MOV (video), MP3, M4A (audio)

### 2. Backend API

**File:** `server/src/controllers/appointmentMedia.controller.js`

**Endpoints:**

```
POST   /api/appointment-media/upload/:appointmentId
GET    /api/appointment-media/:appointmentId
DELETE /api/appointment-media/:mediaId
GET    /api/appointment-media/count/:appointmentId
```

**Key Features:**
- File validation (type, size, count)
- Cloudinary integration for storage
- Authorization checks (patient can upload to own appointments, doctors to any they own, admins)
- Media only uploadable during 'pending' or 'confirmed' appointment status
- Automatic notifications to doctor/patient

### 3. Routes

**File:** `server/src/routes/appointmentMedia.routes.js`

All routes require authentication via `requireAuth` middleware.

### 4. Frontend Components

#### MediaUploadSection.jsx
- Drag-and-drop file upload interface
- Real-time validation (type, size)
- Preview grid with thumbnails
- Delete individual files
- Optional upload (doesn't block booking)

#### Updated BookingConfirmationModal.jsx
- Integrated MediaUploadSection
- Fetches existing media when modal opens
- Handles upload/delete operations
- Shows upload status to user
- Media upload is optional

#### Updated SlotPicker.jsx
- Tracks `tempAppointmentId` state
- Passes appointmentId to BookingConfirmationModal
- Media upload happens before payment

### 5. API Client

**File:** `client/src/api/appointmentMedia.api.js`

```javascript
uploadAppointmentMedia(appointmentId, file, description)
getAppointmentMedia(appointmentId)
deleteAppointmentMedia(mediaId)
getAppointmentMediaCount(appointmentId)
```

## Data Flow

1. **Patient books appointment** → SlotPicker creates appointment
2. **BookingConfirmationModal opens** → Fetches existing media for appointment
3. **Patient uploads media** → MediaUploadSection handles file upload via API
4. **Media stored in Cloudinary** → Metadata saved in AppointmentMedia collection
5. **Doctor/Admin views media** → Can access through appointment details
6. **Patient proceeds to payment** → Media is already associated with appointment

## Security & Authorization

- **Patients:** Can only upload to their own appointments during booking
- **Doctors:** Can upload to appointments they own (for phase 14 session media)
- **Admins:** Can view media for all appointments
- **File validation:** MIME type, size, count checks on backend
- **Cloudinary integration:** Uses secure public/private ID system

## Database Changes

**File:** `server/src/models/Appointment.model.js`
- No changes needed (AppointmentMedia is separate collection)

**File:** `server/app.js`
- Added route registration: `app.use('/api/appointment-media', appointmentMediaRoutes)`

## Client Changes

### New Files
- `client/src/components/booking/MediaUploadSection.jsx`
- `client/src/api/appointmentMedia.api.js`

### Modified Files
- `client/src/components/booking/BookingConfirmationModal.jsx` — Integrated media upload
- `client/src/components/booking/SlotPicker.jsx` — Pass appointmentId to modal

### Updated Features
- Upload section appears BEFORE payment
- Media associated immediately on upload
- Delete before payment if needed
- Optional flow (doesn't block booking)

## Constraints & Limits

| Parameter | Value |
|-----------|-------|
| Max files per appointment | 5 |
| Max file size | 25MB |
| Max upload time | 60 seconds (timeout) |
| Allowed image types | JPG, PNG, WEBP |
| Allowed video types | MP4, MOV |
| Allowed audio types | MP3, M4A |

## Testing Checklist

- [ ] Patient can upload image to appointment
- [ ] Patient can upload video to appointment
- [ ] Patient can upload audio to appointment
- [ ] File type validation works (rejects unsupported types)
- [ ] File size validation works (rejects files >25MB)
- [ ] Max 5 files enforcement works
- [ ] Drag-and-drop upload works
- [ ] Delete button removes media
- [ ] Media persists after page refresh
- [ ] Doctor can view patient-uploaded media
- [ ] Admin can view media
- [ ] Optional upload doesn't block booking flow
- [ ] Media is associated with correct appointment
- [ ] Cloudinary integration works

## Future Enhancements (Phase 14)

- Doctors can upload media to same collection during/after session
- Media tagging/categorization
- Media compression before upload
- Video thumbnail generation
- Audio duration extraction
- Media gallery view for completed appointments

## Notes

- Separate collection design allows future expansion for doctor-uploaded media
- Cloudinary handles CDN + storage, reducing server load
- Optional flow ensures no disruption to existing booking process
- Automatic notifications keep both parties informed
