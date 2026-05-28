import React, { useState } from 'react';
import { Calendar, Clock, IndianRupee, MessageSquare, AlertCircle, X, ShieldCheck } from 'lucide-react';

const BookingConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  slot, 
  doctorName, 
  consultationFee, 
  loading 
}) => {
  const [patientNotes, setPatientNotes] = useState('');

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 select-none animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-primary" size={18} />
            Confirm Appointment
          </h3>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-left">
          {/* Summary Card */}
          <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Physiotherapist</p>
              <p className="text-sm font-extrabold text-slate-800">Dr. {doctorName}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <Calendar size={10} /> Date
                </p>
                <p className="text-xs font-bold text-slate-700 mt-1">{formatHumanDate(slot.date)}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                  <Clock size={10} /> Timing
                </p>
                <p className="text-xs font-bold text-slate-700 mt-1">{slot.startTime} – {slot.endTime}</p>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-200/50 flex justify-between items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                <IndianRupee size={10} /> Consultation Fee
              </p>
              <p className="text-sm font-extrabold text-slate-800">₹{consultationFee}</p>
            </div>
          </div>

          {/* Patient Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare size={13} className="text-slate-400" />
              Symptoms / Medical Notes (Optional)
            </label>
            <textarea
              value={patientNotes}
              onChange={(e) => setPatientNotes(e.target.value)}
              placeholder="e.g. Chronic back pain, recovery from ankle sprain, post-surgery rehab notes..."
              maxLength={500}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
            />
            <div className="text-[10px] text-slate-400 text-right font-medium">
              {patientNotes.length}/500 characters
            </div>
          </div>

          {/* Informational banner */}
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-2">
            <AlertCircle className="text-primary mt-0.5 shrink-0" size={14} />
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
              Payment will be collected at the time of your clinic visit. You can reschedule or cancel this booking without any penalty up to 24 hours prior.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-2.5 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Booking Slot...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationModal;
