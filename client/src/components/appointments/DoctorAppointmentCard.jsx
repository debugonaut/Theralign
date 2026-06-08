import React, { useState } from 'react';
import { Calendar, Clock, IndianRupee, MessageSquare, AlertTriangle, ShieldCheck, Mail, Phone, FileText, Paperclip } from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

const DoctorAppointmentCard = ({ appointment, onComplete, onCancel, onUpdate }) => {
  const patientName = appointment.patient?.name || 'Patient';
  const patientEmail = appointment.patient?.email || 'N/A';
  const patientPhone = appointment.patient?.phone || 'N/A';
  const patientImage = appointment.patient?.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';

  const [actionLoading, setActionLoading] = useState(false);

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

  const isConfirmed = appointment.status === 'confirmed';

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
        {/* Patient Avatar */}
        <img
          src={patientImage}
          alt={patientName}
          className="w-12 h-12 rounded-full object-cover border border-slate-100 shrink-0"
          onError={(e) => {
            e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
          }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-extrabold text-slate-800 truncate">{patientName}</h4>
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusStyle(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>

          <div className="mt-2 space-y-1 text-slate-400">
            <p className="text-[10px] font-bold flex items-center gap-1.5 truncate">
              <Mail size={12} className="text-slate-300" />
              {patientEmail}
            </p>
            {patientPhone && patientPhone !== 'N/A' && (
              <p className="text-[10px] font-bold flex items-center gap-1.5 truncate">
                <Phone size={12} className="text-slate-300" />
                {patientPhone}
              </p>
            )}
          </div>

          <div className="mt-3.5 space-y-2">
            <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Calendar size={13} className="text-slate-400" />
              {formatHumanDate(appointment.date)}
            </p>
            <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Clock size={13} className="text-slate-400" />
              {appointment.startTime} – {appointment.endTime}
            </p>
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 gap-2">
              <span className="flex items-center gap-1.5">
                <IndianRupee size={13} className="text-slate-400" />
                ₹{appointment.consultationFee}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[9px] px-2 py-0.5 font-extrabold uppercase rounded-full border ${
                  appointment.paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {appointment.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                  Earnings: ₹{appointment.doctorEarnings}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient notes if exists */}
      {appointment.patientNotes && (
        <div className="p-3 bg-slate-50 border border-slate-100/50 rounded-xl flex items-start gap-2">
          <MessageSquare size={13} className="text-slate-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
            Patient Notes: " {appointment.patientNotes} "
          </p>
        </div>
      )}

      {/* Cancellation info if cancelled */}
      {appointment.status === 'cancelled' && (
        <div className="p-3 bg-rose-50/50 border border-rose-100/50 rounded-xl space-y-1">
          <p className="text-[9px] font-bold text-rose-700 uppercase tracking-wide flex items-center gap-1">
            <AlertTriangle size={10} /> Cancelled By {appointment.cancelledBy || 'Platform'}
          </p>
          {appointment.cancellationReason && (
            <p className="text-[10px] text-rose-600 font-medium italic leading-relaxed">
              Reason: "{appointment.cancellationReason}"
            </p>
          )}
        </div>
      )}

      {/* Clinical Notes/Prescription Upload (Feature F3) */}
      {appointment.status === 'completed' && (
        <div className="p-4 bg-slate-50/70 border border-slate-200/50 rounded-2xl space-y-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={13} className="text-slate-400 shrink-0" /> Clinical Session Notes
          </p>

          {appointment.sessionDocument?.url ? (
            <div className="flex items-center justify-between gap-3 bg-white border border-slate-200/60 rounded-xl p-2.5 shadow-sm">
              <a
                href={appointment.sessionDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-primary hover:text-primary-dark truncate flex items-center gap-1.5"
              >
                <FileText size={13} className="shrink-0" />
                <span className="truncate">{appointment.sessionDocument.fileName || 'View Notes PDF'}</span>
              </a>
              <button
                type="button"
                onClick={async () => {
                  const confirmDelete = window.confirm('Are you sure you want to remove this session document?');
                  if (!confirmDelete) return;

                  setActionLoading(true);
                  try {
                    const res = await axiosInstance.delete(`/documents/${appointment._id}`);
                    if (res.data?.success && res.data?.data) {
                      toast.success('Clinical document removed.');
                      if (onUpdate) onUpdate(res.data.data);
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error(err.response?.data?.message || 'Failed to delete session notes.');
                  } finally {
                    setActionLoading(false);
                  }
                }}
                disabled={actionLoading}
                className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl p-4 bg-white/60">
              <label className="flex flex-col items-center justify-center gap-1 cursor-pointer w-full text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;

                    if (file.type !== 'application/pdf') {
                      toast.error('Only PDF documents are accepted.');
                      return;
                    }

                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('PDF file size must not exceed 5MB.');
                      return;
                    }

                    const formData = new FormData();
                    formData.append('document', file);

                    setActionLoading(true);
                    try {
                      const res = await axiosInstance.post(`/documents/upload/${appointment._id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      if (res.data?.success && res.data?.data) {
                        toast.success('Clinical document attached successfully!');
                        if (onUpdate) onUpdate(res.data.data);
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error(err.response?.data?.message || 'Failed to upload session notes.');
                    } finally {
                      setActionLoading(false);
                    }
                  }}
                  disabled={actionLoading}
                  className="hidden"
                />
                {actionLoading ? (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                    <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    Uploading PDF...
                  </div>
                ) : (
                  <>
                    <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="text-xs text-primary hover:text-primary-dark font-bold">
                      Upload Session PDF
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold mt-0.5">
                      Max 5MB (PDF only)
                    </span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {isConfirmed && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            type="button"
            onClick={() => onCancel(appointment._id)}
            className="bg-white hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-rose-600 rounded-xl py-2 text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onComplete(appointment._id)}
            className="bg-primary hover:bg-primary-dark text-white rounded-xl py-2 text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
          >
            <ShieldCheck size={13} />
            Mark Complete
          </button>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentCard;
