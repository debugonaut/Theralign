import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Lock } from 'lucide-react';
import MediaUploadSection from './MediaUploadSection';
import { uploadAppointmentMedia, deleteAppointmentMedia, getAppointmentMedia } from '../../api/appointmentMedia.api';
import { toast } from 'react-hot-toast';

const BookingConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onBook, 
  onPay, 
  slot, 
  doctorName, 
  consultationFee, 
  loading,
  paymentLoading,
  appointmentId = null,
}) => {
  const [patientNotes, setPatientNotes] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [prevIsOpen, setPrevIsOpen] = useState(false);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setStep(1);
      setPatientNotes('');
      setUploadedMedia([]);
    }
  }

  const [prevAppointmentId, setPrevAppointmentId] = useState(null);
  if (appointmentId !== prevAppointmentId) {
    setPrevAppointmentId(appointmentId);
    if (appointmentId) {
      setStep(2);
    }
  }

  const fetchMedia = useCallback(async () => {
    try {
      const response = await getAppointmentMedia(appointmentId);
      if (response.success && response.data) {
        setUploadedMedia(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch media:', err);
    }
  }, [appointmentId]);

  useEffect(() => {
    if (isOpen && appointmentId) {
      fetchMedia();
    }
  }, [isOpen, appointmentId, fetchMedia]);

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
    } catch {
      return dateStr;
    }
  };

  const handleBook = () => {
    onBook(patientNotes);
  };

  const displayDoctorName = doctorName
    ? doctorName.toLowerCase().replace(/(^\s*dr\.\s*|^\s*)/i, '').replace(/\b\w/g, c => c.toUpperCase())
    : '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 1 ? "Review & Book" : "Upload & Pay"}
      size="md"
    >
      {step === 1 ? (
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

          <div className="flex flex-col gap-2 mt-2">
            <Button
              variant="accent"
              fullWidth
              onClick={handleBook}
              loading={loading}
              className="font-bold h-12"
            >
              {loading ? 'BOOKING...' : 'Book Appointment →'}
            </Button>
            <Button
              variant="ghost"
              fullWidth
              onClick={onClose}
              disabled={loading}
              className="font-bold h-12"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 text-left select-none">
          {/* Compact Summary Card */}
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 flex flex-col gap-2.5 text-ui-sm">
            <div className="flex justify-between items-baseline pb-1.5 border-b border-neutral-200/60">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">DOCTOR</span>
              <span className="text-ui-sm font-bold text-neutral-900">Dr. {displayDoctorName}</span>
            </div>
            <div className="flex justify-between items-baseline pb-1.5 border-b border-neutral-200/60">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">DATE & TIME</span>
              <span className="text-ui-sm font-bold text-neutral-900">{formatHumanDate(slot.date)} at {slot.startTime}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">FEE</span>
              <span className="text-ui-sm font-extrabold text-neutral-900">₹{consultationFee}</span>
            </div>
          </div>

          {/* Helper Text */}
          <p className="text-ui-xs text-neutral-500 font-semibold leading-relaxed -mb-2 bg-blue-50/40 border border-blue-100/60 p-3 rounded-md">
            ℹ️ You can optionally attach X-rays, prescriptions, or any relevant medical documents for your physiotherapist.
          </p>

          {/* MediaUploadSection */}
          <div className="border-t border-neutral-200 pt-2">
            <MediaUploadSection
              appointmentId={appointmentId}
              uploadedMedia={uploadedMedia}
              onMediaUpload={handleMediaUpload}
              onMediaDelete={handleMediaDelete}
              loading={mediaLoading}
              disabled={mediaLoading || paymentLoading}
            />
          </div>

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

          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-center gap-2 py-2 border border-neutral-200 rounded-md bg-white mb-2 shadow-level-1">
              <Lock size={14} className="text-success" />
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">Secured by Razorpay</span>
            </div>

            <Button
              variant="accent"
              fullWidth
              onClick={onPay}
              loading={paymentLoading}
              disabled={mediaLoading}
              className="font-bold h-12 flex items-center justify-center gap-2"
            >
              {!paymentLoading && <Lock size={16} />}
              {paymentLoading ? 'PROCESSING...' : `Confirm & Pay ₹${consultationFee} →`}
            </Button>

            <div className="flex flex-col items-center gap-3 mt-1">
              <button
                type="button"
                onClick={onPay}
                disabled={paymentLoading || mediaLoading}
                className="text-ui-sm font-bold text-neutral-500 hover:text-primary transition-colors focus:outline-none cursor-pointer"
              >
                Skip & Pay →
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={paymentLoading}
                className="text-ui-xs font-semibold text-danger/80 hover:text-danger transition-colors focus:outline-none cursor-pointer mt-1"
              >
                Cancel booking
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BookingConfirmationModal;
