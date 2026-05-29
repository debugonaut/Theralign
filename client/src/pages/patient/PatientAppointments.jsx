import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Calendar, ChevronRight, AlertTriangle, ArrowRight, MessageSquare, Clock, X } from 'lucide-react';
import { getMyAppointments, cancelAppointment } from '../../api/appointment.api';
import PatientAppointmentCard from '../../components/appointments/PatientAppointmentCard';
import RescheduleModal from '../../components/booking/RescheduleModal';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null, reason: '' });
  const [cancelling, setCancelling] = useState(false);

  // Rescheduling states
  const [rescheduleModal, setRescheduleModal] = useState({ open: false, appointment: null });

  const handleOpenRescheduleModal = (appointment) => {
    setRescheduleModal({ open: true, appointment });
  };

  const handleCloseRescheduleModal = () => {
    setRescheduleModal({ open: false, appointment: null });
  };

  const handleRescheduleSuccess = (updatedAppt) => {
    setAppointments(
      appointments.map((a) => (a._id === updatedAppt._id ? updatedAppt : a))
    );
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getMyAppointments();
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your appointments history.');
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

  // Grouping logic
  const upcoming = appointments.filter(
    (a) => a.status === 'confirmed' && a.date >= todayString
  );
  
  const past = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled' || a.date < todayString
  );

  const activeAppointments = activeTab === 'upcoming' ? upcoming : past;

  // Trigger cancel modal
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
        
        // Optimistic UI update: update only the cancelled appointment in local state
        setAppointments(
          appointments.map((a) =>
            a._id === appointmentId
              ? { ...a, status: 'cancelled', cancellationReason: reason, cancelledBy: 'patient' }
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
          My Appointments
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review your upcoming clinical consultations and keep track of your past recovery visits.
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
          Upcoming Visits ({upcoming.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`pb-3 font-bold text-sm tracking-wide transition-all border-b-2 cursor-pointer ${
            activeTab === 'past'
              ? 'border-primary text-slate-800'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Past History ({past.length})
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
          <span className="text-4xl text-slate-300">🏥</span>
          <p className="text-sm font-bold text-slate-700">
            {activeTab === 'upcoming' ? 'No Upcoming Consultations' : 'No Past Visits Recorded'}
          </p>
          <p className="text-xs text-slate-400 max-w-sm">
            {activeTab === 'upcoming'
              ? 'You do not have any clinical appointments scheduled at this moment. Find specialized physiotherapists near you and book a slot.'
              : 'You do not have any past medical history recorded on our system yet.'}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-2.5 font-bold text-xs shadow-md transition-all cursor-pointer mt-3"
            >
              Browse Physiotherapists
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAppointments.map((appointment) => (
            <PatientAppointmentCard
              key={appointment._id}
              appointment={appointment}
              onCancel={handleOpenCancelModal}
              onReschedule={handleOpenRescheduleModal}
            />
          ))}
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleCloseCancelModal} />
          
          <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 animate-scaleIn text-left">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="text-rose-500" size={16} />
                Cancel Appointment
              </h3>
              <button onClick={handleCloseCancelModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Are you sure you want to cancel your clinical consultation slot? Unlocked slots will immediately become available for other patients to book.
              </p>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare size={12} />
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                  placeholder="e.g. Schedule conflict, feeling better, booked another doctor..."
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
                No, Keep It
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

      {/* Reschedule Modal Overlay */}
      {rescheduleModal.open && (
        <RescheduleModal
          isOpen={rescheduleModal.open}
          onClose={handleCloseRescheduleModal}
          appointment={rescheduleModal.appointment}
          onSuccess={handleRescheduleSuccess}
        />
      )}
    </div>
  );
};

export default PatientAppointments;
