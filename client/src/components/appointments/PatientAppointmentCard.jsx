import React, { useState } from 'react';
import { Calendar, Clock, IndianRupee, MessageSquare, AlertTriangle, ShieldCheck, Star, Check, Loader2, FileText, RotateCcw } from 'lucide-react';
import ReviewForm from '../reviews/ReviewForm';

const PatientAppointmentCard = ({ appointment, onCancel, onReschedule }) => {
  const doctorName = appointment.doctor?.user?.name || 'Physiotherapist';
  const specialization = appointment.doctor?.specialization?.join(', ') || 'General Physiotherapy';
  const profileImage = appointment.doctor?.user?.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';

  // ─── Review state ────────────────────────────────────────────────────────
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewDone, setReviewDone] = useState(appointment.reviewSubmitted);

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    setReviewDone(true);
  };

  // Eligibility for review prompt
  const canReview =
    appointment.status === 'completed' &&
    appointment.paymentStatus === 'paid' &&
    !reviewDone;

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

  // Check if eligible for patient cancellation: status is 'confirmed' AND appointment date is in the future
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;
  
  const canCancel = appointment.status === 'confirmed' && appointment.date > todayString;

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'completed':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-200 transition-all select-none text-left flex flex-col justify-between">
      <div className="flex items-start gap-4">
        {/* Doctor Avatar */}
        <img
          src={profileImage}
          alt={doctorName}
          className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
          onError={(e) => {
            e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
          }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-medium text-slate-800 truncate">Dr. {doctorName}</h4>
            <span className={`text-sm font-semibold px-2.5 py-0.5 rounded-full border ${getStatusStyle(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
          <p className="text-sm text-slate-400 font-medium truncate mt-0.5">{specialization}</p>

          <div className="mt-3.5 space-y-2">
            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              {formatHumanDate(appointment.date)}
            </p>
            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" />
              {appointment.startTime} – {appointment.endTime}
            </p>
            <p className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
              <IndianRupee size={13} className="text-slate-400" />
              ₹{appointment.consultationFee}
            </p>
            {appointment.status === 'cancelled' && appointment.paymentStatus === 'paid' ? (
              <span className="text-blue-500 text-sm font-semibold flex items-center gap-1 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full w-max uppercase tracking-wider">
                <RotateCcw size={10} className="shrink-0" /> Refund eligible
              </span>
            ) : appointment.paymentStatus === 'paid' ? (
              <span className="text-emerald-600 text-sm font-semibold flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full w-max uppercase tracking-wider">
                <Check size={10} className="shrink-0" /> Payment confirmed
              </span>
            ) : (
              <span className="text-amber-600 text-sm font-semibold flex items-center gap-1 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full w-max uppercase tracking-wider">
                <Loader2 size={10} className="animate-spin shrink-0" /> Payment pending
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Patient notes if exists */}
      {appointment.patientNotes && (
        <div className="p-3 bg-slate-50 border border-slate-100/50 rounded-xl flex items-start gap-2">
          <MessageSquare size={13} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
            " {appointment.patientNotes} "
          </p>
        </div>
      )}

      {/* Cancellation info if cancelled */}
      {appointment.status === 'cancelled' && (
        <div className="p-3 bg-rose-50/50 border border-rose-100/50 rounded-xl space-y-1">
          <p className="text-sm font-medium text-rose-700 uppercase tracking-wide flex items-center gap-1">
            <AlertTriangle size={10} /> Cancelled By {appointment.cancelledBy || 'Platform'}
          </p>
          {appointment.cancellationReason && (
            <p className="text-sm text-rose-600 font-medium italic leading-relaxed">
              Reason: "{appointment.cancellationReason}"
            </p>
          )}
        </div>
      )}

      {/* Session document download (Feature F3) */}
      {appointment.status === 'completed' && appointment.sessionDocument?.url && (
        <div className="p-3.5 bg-blue-50/50 border border-blue-100/60 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-700 uppercase tracking-wide flex items-center gap-1">
              <FileText size={11} className="text-blue-500 shrink-0" /> Clinical Session Notes
            </p>
            <p className="text-sm text-slate-500 font-medium truncate mt-0.5">
              {appointment.sessionDocument.fileName || 'prescription.pdf'}
            </p>
          </div>
          <a
            href={appointment.sessionDocument.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary-dark text-white rounded-lg px-3 py-1.5 font-medium text-sm shadow-sm transition-all shrink-0 cursor-pointer text-center"
          >
            Download Notes
          </a>
        </div>
      )}

      {/* Action button — Cancel & Reschedule */}
      {canCancel && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            onClick={() => onCancel(appointment._id)}
            className="bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-rose-600 rounded-xl py-2 text-sm font-medium transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onReschedule(appointment)}
            className="bg-white hover:bg-primary/5 border border-primary hover:border-primary-dark text-primary rounded-xl py-2 text-sm font-medium transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1"
          >
            Reschedule
          </button>
        </div>
      )}

      {/* ─── Review Section ────────────────────────────────────────────── */}

      {/* State 3: Review already submitted */}
      {reviewDone && (
        <div className="flex items-center gap-2 p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl">
          <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">
            Review submitted. Thank you!
          </p>
        </div>
      )}

      {/* State 1: Eligible but no review yet */}
      {canReview && !showReviewForm && (
        <button
          type="button"
          onClick={() => setShowReviewForm(true)}
          className="w-full bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-300 text-amber-600 rounded-xl py-2 text-sm font-medium transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Star size={13} />
          Leave a Review
        </button>
      )}

      {/* State 2: Review form open */}
      {canReview && showReviewForm && (
        <ReviewForm
          appointmentId={appointment._id}
          doctorName={doctorName}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default PatientAppointmentCard;
