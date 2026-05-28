import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, AlertTriangle, MessageSquare, Clock, X, CheckCircle2 } from 'lucide-react';
import { getDoctorAppointments, cancelAppointment, completeAppointment } from '../../api/appointment.api';
import DoctorAppointmentCard from '../../components/appointments/DoctorAppointmentCard';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null, reason: '' });
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getDoctorAppointments();
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patient appointments pipeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Compute local date string for date-based categorization
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  // Filtering logic
  const upcoming = appointments.filter(
    (a) => a.status === 'confirmed' && a.date >= todayString
  );
  
  const completed = appointments.filter((a) => a.status === 'completed');
  
  const cancelled = appointments.filter((a) => a.status === 'cancelled');

  const activeAppointments = {
    upcoming,
    completed,
    cancelled,
  }[activeTab] || [];

  // Trigger Complete Flow
  const handleMarkComplete = async (id) => {
    const confirmComplete = window.confirm('Are you sure you want to mark this appointment as completed?');
    if (!confirmComplete) return;

    try {
      const res = await completeAppointment(id);
      if (res.success) {
        toast.success('Appointment marked as completed.');
        // Optimistic UI update
        setAppointments(
          appointments.map((a) =>
            a._id === id ? { ...a, status: 'completed' } : a
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to complete appointment.');
    }
  };

  // Trigger Cancel Flow
  const handleOpenCancelModal = (appointmentId) => {
    setCancelModal({ open: true, appointmentId, reason: '' });
  };

  const handleCloseCancelModal = () => {
    setCancelModal({ open: false, appointmentId: null, reason: '' });
  };

  const handleConfirmCancel = async () => {
    const { appointmentId, reason } = cancelModal;
    setCancelling(true);
    try {
      const res = await cancelAppointment(appointmentId, reason);
      if (res.success) {
        toast.success('Appointment cancelled successfully.');
        
        // Optimistic UI update: update local state instantly
        setAppointments(
          appointments.map((a) =>
            a._id === appointmentId
              ? { ...a, status: 'cancelled', cancellationReason: reason, cancelledBy: 'doctor' }
              : a
          )
        );
        handleCloseCancelModal();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="text-primary" size={24} />
          Patient Appointments
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor your patient onboarding flow, complete consultations, and manage cancellations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 cursor-pointer ${
            activeTab === 'upcoming'
              ? 'border-primary text-slate-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 cursor-pointer ${
            activeTab === 'completed'
              ? 'border-primary text-slate-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Completed ({completed.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('cancelled')}
          className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 cursor-pointer ${
            activeTab === 'cancelled'
              ? 'border-primary text-slate-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Cancelled ({cancelled.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-100 rounded-3xl h-48" />
          ))}
        </div>
      ) : activeAppointments.length === 0 ? (
        <div className="bg-white border border-slate-100 border-dashed rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm flex flex-col items-center gap-3">
          <span className="text-4xl text-slate-300">👥</span>
          <p className="text-sm font-bold text-slate-700">
            {activeTab === 'upcoming' && 'No Upcoming Consultations Scheduled'}
            {activeTab === 'completed' && 'No Completed Consultations Yet'}
            {activeTab === 'cancelled' && 'No Cancelled Appointments'}
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            {activeTab === 'upcoming' && 'Patients will appear here once they schedule visits using your public slots. Keep your availability dynamic!'}
            {activeTab === 'completed' && 'You have not marked any consultations completed yet.'}
            {activeTab === 'cancelled' && 'No cancellations recorded in this category.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAppointments.map((appointment) => (
            <DoctorAppointmentCard
              key={appointment._id}
              appointment={appointment}
              onComplete={handleMarkComplete}
              onCancel={handleOpenCancelModal}
            />
          ))}
        </div>
      )}

      {/* Doctor Cancel Modal Overlay */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseCancelModal} />
          
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-scaleIn text-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="text-rose-500" size={16} />
                Cancel Consultation
              </h3>
              <button onClick={handleCloseCancelModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Are you sure you want to cancel this patient visit? If you cancel this appointment, the slot will instantly unlock and become available for other patients to book.
              </p>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare size={12} />
                  Cancellation Feedback for Patient (Optional)
                </label>
                <textarea
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                  placeholder="e.g. Doctor is unavailable, emergency clinic closure, schedule conflicts..."
                  rows={3}
                  maxLength={200}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseCancelModal}
                disabled={cancelling}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer disabled:opacity-50"
              >
                No, Keep Booking
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 py-2.5 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {cancelling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel Booking'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
