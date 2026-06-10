import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Lock } from 'lucide-react';
import MediaUploadSection from './MediaUploadSection';
import { uploadAppointmentMedia, deleteAppointmentMedia, getAppointmentMedia } from '../../api/appointmentMedia.api';
import { toast } from 'react-hot-toast';

const BookingConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  slot, 
  doctorName, 
  consultationFee, 
  loading,
  appointmentId = null,
}) => {
  const [patientNotes, setPatientNotes] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchMedia();
    }
  }, [isOpen, appointmentId]);

  const fetchMedia = async () => {
    try {
      const response = await getAppointmentMedia(appointmentId);
      if (response.success && response.data) {
        setUploadedMedia(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    }
  };

  const handleMediaUpload = async (file) => {
    if (!appointmentId) {
      toast.error('Appointment ID is required to upload media.');
      return;
    }

    setMediaLoading(true);
    try {
      const response = await uploadAppointmentMedia(appointmentId, file);
      if (response.success && response.data) {
        setUploadedMedia([...uploadedMedia, response.data]);
        toast.success('Media uploaded successfully!');
      } else {
        toast.error(response.message || 'Failed to upload media');
      }
    } catch (err) {
      console.error('Media upload error:', err);
      toast.error(err.response?.data?.message || 'Failed to upload media. Please try again.');
    } finally {
      setMediaLoading(false);
    }
  };

  const handleMediaDelete = async (mediaId) => {
    if (!mediaId) return;

    setMediaLoading(true);
    try {
      const response = await deleteAppointmentMedia(mediaId);
      if (response.success) {
        setUploadedMedia(uploadedMedia.filter(m => m._id !== mediaId));
        toast.success('Media deleted successfully!');
      } else {
        toast.error(response.message || 'Failed to delete media');
      }
    } catch (err) {
      console.error('Media delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete media. Please try again.');
    } finally {
      setMediaLoading(false);
    }
  };

  if (!isOpen || !slot) return null;

  const formatHumanDate = (dateStr) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleConfirm = () => {
    onConfirm(patientNotes);
  };

  const displayDoctorName = doctorName
    ? doctorName.toLowerCase().replace(/(^\s*dr\.\s*|^\s*)/i, '').replace(/\b\w/g, c => c.toUpperCase())
    : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Appointment Booking"
      size="md"
    >
      <div className="flex flex-col gap-6 text-left select-none">
        
        <dl className="grid grid-cols-1 gap-y-4">
          <div className="flex justify-between items-baseline border-b border-neutral-200 pb-2">
            <dt className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              DOCTOR
            </dt>
            <dd className="text-ui-md font-bold text-neutral-900">
              Dr. {displayDoctorName}
            </dd>
          </div>

          <div className="flex justify-between items-baseline border-b border-neutral-200 pb-2">
            <dt className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              SPECIALIZATION
            </dt>
            <dd className="text-[10px] font-black text-accent uppercase tracking-widest">
              CLINICAL PHYSIOTHERAPY
            </dd>
          </div>

          <div className="flex justify-between items-baseline border-b border-neutral-200 pb-2">
            <dt className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              DATE
            </dt>
            <dd className="text-ui-md font-bold text-neutral-900">
              {formatHumanDate(slot.date)}
            </dd>
          </div>

          <div className="flex justify-between items-baseline border-b border-neutral-200 pb-2">
            <dt className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              TIME
            </dt>
            <dd className="text-ui-md font-bold text-neutral-900">
              {slot.startTime} – {slot.endTime}
            </dd>
          </div>

          <div className="flex justify-between items-baseline border-b border-neutral-200 pb-2">
            <dt className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              DURATION
            </dt>
            <dd className="text-ui-md font-bold text-neutral-900">
              30 MINUTES
            </dd>
          </div>

          <div className="flex justify-between items-center pt-2">
            <dt className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              CONSULTATION FEE
            </dt>
            <dd className="text-display-xs font-black text-neutral-900 tracking-tighter">
              ₹{consultationFee}
            </dd>
          </div>
        </dl>

        <p className="text-ui-sm text-neutral-900 leading-relaxed bg-[#FDFDFD] border border-neutral-200 p-4 rounded-md">
          You are booking a 30-minute appointment with <strong>Dr. {displayDoctorName}</strong> on <strong>{formatHumanDate(slot.date)}</strong> at <strong>{slot.startTime}</strong>. A fee of <strong>₹{consultationFee}</strong> will be charged.
        </p>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            Symptoms / Medical Notes (Optional)
          </label>
          <textarea
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            placeholder="e.g. Chronic lower back stiffness, post-running knee inflammation..."
            maxLength={300}
            rows={3}
            className="w-full bg-white border border-neutral-200 px-4 py-3 text-ui-sm text-neutral-900 placeholder-neutral-300 focus:border-primary focus:ring-3 focus:ring-primary/12 transition-all rounded-md resize-none"
          />
        </div>

        {appointmentId && (
          <div className="border-t border-neutral-200 pt-4">
            <MediaUploadSection
              appointmentId={appointmentId}
              uploadedMedia={uploadedMedia}
              onMediaUpload={handleMediaUpload}
              onMediaDelete={handleMediaDelete}
              loading={mediaLoading}
              disabled={loading || mediaLoading}
            />
          </div>
        )}

        <div className="bg-neutral-50 border border-neutral-200 p-5 rounded-lg flex flex-col gap-2 shadow-level-1">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            AMOUNT DUE
          </span>
          <h2 className="text-display-sm font-black text-neutral-900 tracking-tighter leading-none">
            ₹{consultationFee}
          </h2>
          <span className="text-[9px] font-black text-success uppercase tracking-widest mt-1 block">
            Paid via Razorpay Gateway
          </span>
        </div>

        <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
          You will be redirected to complete payment. Your appointment is confirmed immediately upon successful payment.
        </p>

        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center justify-center gap-2 py-2 border border-neutral-200 rounded-md bg-white mb-2 shadow-level-1">
            <Lock size={14} className="text-success" />
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Secured by Razorpay</span>
          </div>
          
          <Button
            variant="accent"
            fullWidth
            onClick={handleConfirm}
            loading={loading || mediaLoading}
            className="font-bold h-12"
          >
            {loading || mediaLoading ? 'PROCESSING...' : `Confirm & Pay ₹${consultationFee} →`}
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={loading || mediaLoading}
            className="font-bold h-12"
          >
            Cancel
          </Button>
        </div>

      </div>
    </Modal>
  );
};

export default BookingConfirmationModal;
