# Media Upload Feature — Quick Start Guide

## What's New?

Patients can now upload media (photos, videos, audio) when confirming an appointment booking, **before payment**. This helps doctors understand the patient's condition better.

## Files Created

### Backend (Server)

```
server/src/models/AppointmentMedia.model.js
├─ New MongoDB model for storing media metadata
├─ Stores: appointment ref, uploader, media type, Cloudinary URL, file info

server/src/controllers/appointmentMedia.controller.js
├─ Upload handler with file validation
├─ Retrieval endpoints
├─ Deletion with Cloudinary cleanup
├─ Authorization checks

server/src/routes/appointmentMedia.routes.js
├─ POST   /upload/:appointmentId       (upload media)
├─ GET    /:appointmentId               (fetch all media)
├─ DELETE /:mediaId                     (delete media)
└─ GET    /count/:appointmentId         (get count)
```

### Frontend (Client)

```
client/src/components/booking/MediaUploadSection.jsx
├─ Drag-and-drop upload interface
├─ Real-time file validation
├─ Preview grid with thumbnails
├─ Delete functionality

client/src/api/appointmentMedia.api.js
├─ uploadAppointmentMedia()
├─ getAppointmentMedia()
├─ deleteAppointmentMedia()
└─ getAppointmentMediaCount()
```

### Updated Files

```
client/src/components/booking/BookingConfirmationModal.jsx
├─ Integrated MediaUploadSection
├─ Fetches media on modal open
├─ Handles upload/delete states

client/src/components/booking/SlotPicker.jsx
├─ Added tempAppointmentId state
└─ Passes appointmentId to modal

server/app.js
└─ Registered appointmentMedia routes
```

## User Flow

```
1. Patient selects date & time slot
                 ↓
2. Patient clicks "CONFIRM & PAY"
                 ↓
3. BookingConfirmationModal opens
   ├─ Shows appointment details
   ├─ Appointment is created (backend)
   ├─ Shows Symptoms Notes field
   └─ Shows Media Upload Section ✨ NEW
                 ↓
4. Patient can optionally upload media
   ├─ Drag-drop or click to select
   ├─ Supports: JPG, PNG, WEBP, MP4, MOV, MP3, M4A
   ├─ Max 5 files, 25MB each
   └─ Delete individual files before payment
                 ↓
5. Patient clicks "Confirm & Pay"
                 ↓
6. Razorpay payment flow
                 ↓
7. Payment success → Media already associated with appointment
```

## Implementation Details

### Media Constraints
- **Max files:** 5 per appointment
- **Max size:** 25MB per file
- **Allowed image types:** JPG, PNG, WEBP
- **Allowed video types:** MP4, MOV
- **Allowed audio types:** MP3, M4A

### Database Design
- **Separate collection:** `AppointmentMedia` (not embedded)
- **Key benefit:** Allows doctor uploads in future (Phase 14)
- **Fields:** appointment ref, uploader, media type, Cloudinary URL, file size, duration

### Authorization
- **Patients:** Upload to own appointments only (during 'pending'/'confirmed')
- **Doctors:** Upload to appointments they own
- **Admins:** View all media
- **File validation:** Backend MIME type + size checks

### Storage
- **Provider:** Cloudinary
- **Benefits:** CDN delivery, automatic optimization, secure deletion

## Testing

### Manual Test Cases

1. **Upload Image**
   - Go to book appointment
   - Select date & time
   - In modal, drag-drop a JPG/PNG
   - Verify: Thumbnail appears, "Ready" badge shows

2. **Upload Video**
   - Same as above, but with MP4 file
   - Verify: Video gradient icon appears instead of thumbnail

3. **Upload Audio**
   - Same as above, but with MP3 file
   - Verify: Audio gradient icon appears

4. **File Validation**
   - Try uploading a PDF
   - Verify: Error toast "Unsupported file type"
   - Try uploading a 30MB file
   - Verify: Error toast "File too large"

5. **Max Files**
   - Upload 5 files successfully
   - Try uploading 6th file
   - Verify: Error toast "Maximum 5 media files"

6. **Delete Media**
   - Hover over thumbnail
   - Click red X button
   - Verify: Thumbnail removed, count decreases

7. **Optional Flow**
   - Don't upload any media
   - Click "Confirm & Pay"
   - Verify: Payment flow works (media optional)

8. **Persistence**
   - Upload media
   - Refresh page
   - Verify: Media still shows in modal (fetched from API)

## API Endpoints

### Upload Media
```
POST /api/appointment-media/upload/:appointmentId
Content-Type: multipart/form-data

Body:
- media (File)
- description (String, optional)

Response: { success, data: { _id, cloudinaryUrl, ... } }
```

### Get All Media
```
GET /api/appointment-media/:appointmentId

Response: { success, data: [ { _id, fileName, fileType, ... }, ... ] }
```

### Delete Media
```
DELETE /api/appointment-media/:mediaId

Response: { success, message }
```

### Get Count
```
GET /api/appointment-media/count/:appointmentId

Response: { success, data: { current: 3, max: 5, canUploadMore: true } }
```

## What's NOT Included

- ❌ Doctor media uploads (Phase 14)
- ❌ Media compression
- ❌ Video thumbnail generation
- ❌ Media gallery view
- ❌ Media tagging/categorization

## Next Steps

1. **Test the feature** with the test cases above
2. **Deploy to staging** for user acceptance testing
3. **Add doctor viewing** in appointment details page
4. **Phase 14:** Implement doctor media uploads during/after session
5. **Future:** Add media compression and optimization

## Support

For issues:
1. Check browser console for errors
2. Check server logs for API errors
3. Verify Cloudinary credentials in `.env`
4. Ensure multer middleware is properly configured

