import React from 'react';
import { Calendar, Clock, IndianRupee, MessageSquare, AlertTriangle, ShieldCheck, Mail, Phone } from 'lucide-react';

const DoctorAppointmentCard = ({ appointment, onComplete, onCancel }) => {
  const patientName = appointment.patient?.name || 'Patient';
  const patientEmail = appointment.patient?.email || 'N/A';
  const patientPhone = appointment.patient?.phone || 'N/A';
  const patientImage = appointment.patient?.profileImage || 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';

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
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-1.5">
                <IndianRupee size={13} className="text-slate-400" />
                ₹{appointment.consultationFee}
              </span>
              <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded">
                Earnings: ₹{appointment.doctorEarnings} (Comm: ₹{appointment.platformCommission})
              </span>
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
