import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, DollarSign, Activity, FileText, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getMyAppointments } from '../../api/appointment.api';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

/**
 * AppointmentDetailsPage — Lightweight Single Column Handoff View
 *
 * Dedicated mobile-responsive detail page targeted for email links.
 * Bypasses the heavy multi-column patient dashboard layouts.
 */
const AppointmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatINR = (value) => {
    if (value === undefined || value === null) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(value);
  };

  useEffect(() => {
    document.title = 'Appointment Detail — Theralign';
    
    const fetchAppointment = async () => {
      setLoading(true);
      try {
        const res = await getMyAppointments();
        if (res.success && res.data) {
          const matched = res.data.find((a) => a._id === id);
          if (matched) {
            setAppointment(matched);
          } else {
            toast.error('Appointment not found.');
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load appointment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="text-center font-bold text-neutral-500 uppercase tracking-widest text-ui-xs">
          Loading appointment details...
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <Card className="max-w-[480px] w-full p-6 text-center rounded-[12px] shadow-level-1">
          <ShieldAlert className="w-12 h-12 text-danger mx-auto mb-4" />
          <h2 className="text-display-xs font-black text-neutral-900 tracking-tight">Appointment Not Found</h2>
          <p className="text-neutral-500 mt-2 text-ui-sm font-semibold">
            We couldn't retrieve this booking transaction record.
          </p>
          <div className="mt-6">
            <Link to="/patient/appointments">
              <Button variant="primary" fullWidth>
                View My Appointments
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const docName = appointment.doctor?.user?.name || 'Physiotherapist';
  const specText = Array.isArray(appointment.doctor?.specialization)
    ? appointment.doctor.specialization[0]
    : appointment.doctor?.specialization || 'Clinical Specialist';

  const dateText = new Date(appointment.date + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-neutral-50 py-6 px-6">
      <div className="max-w-[560px] mx-auto flex flex-col gap-6">
        {/* Back Link */}
        <Link 
          to="/patient/appointments" 
          className="inline-flex items-center gap-1 text-ui-sm font-bold text-neutral-500 hover:text-neutral-900 transition-colors self-start"
        >
          <ChevronLeft size={16} />
          <span>My Appointments</span>
        </Link>

        {/* Brand */}
        <div className="text-center mb-2">
          <h1 className="text-[28px] font-black text-neutral-900 tracking-tight font-swiss">Appointment Details</h1>
          <p className="text-neutral-500 mt-1 text-ui-xs font-bold uppercase tracking-wider">
            Booking ID: {appointment._id}
          </p>
        </div>

        {/* Detail Card */}
        <Card className="p-6 sm:p-6 rounded-[12px] shadow-level-1 bg-white border border-neutral-200">
          
          {/* Header Doctor Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-neutral-100">
            <div className="text-left">
              <span className="text-[10px] text-accent font-black tracking-widest uppercase block mb-1">
                {specText}
              </span>
              <h2 className="text-ui-xl font-black text-neutral-900 uppercase">
                Dr. {docName}
              </h2>
              <p className="text-ui-sm font-medium text-neutral-500 mt-0.5">
                {appointment.doctor?.clinicName || 'Theralign Clinic Center'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Badge variant={appointment.status} />
              <Badge variant={appointment.paymentStatus === 'paid' ? 'paid' : 'pending'} />
            </div>
          </div>

          {/* Timing details */}
          <div className="py-6 border-b border-neutral-100 flex flex-col gap-4 text-left">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                  Date
                </span>
                <span className="text-ui-md font-bold text-neutral-900">
                  {dateText}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                  Scheduled Time
                </span>
                <span className="text-ui-md font-bold text-neutral-900">
                  {appointment.startTime} – {appointment.endTime} (30 MIN)
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                  Location
                </span>
                <span className="text-ui-md font-bold text-neutral-900">
                  {appointment.doctor?.clinicAddress || 'Pune Practice Center'}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing and notes */}
          <div className="py-6 border-b border-neutral-100 flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-ui-md font-bold text-neutral-900">Consultation Fee</span>
              </div>
              <span className="text-ui-lg font-black text-neutral-900">
                {formatINR(appointment.consultationFee)} / session
              </span>
            </div>

            {appointment.patientNotes && (
              <div className="flex items-start gap-3 pt-2">
                <Activity className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                    Patient Symptoms & Notes
                  </span>
                  <span className="text-ui-sm font-medium text-neutral-700 block italic leading-relaxed mt-1">
                    "{appointment.patientNotes}"
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Recovery Documents F3 */}
          {appointment.sessionDocument?.url && (
            <div className="py-6 border-b border-neutral-100 text-left flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-success" />
                <span className="text-ui-md font-bold text-success">Clinical Documents Attached</span>
              </div>
              <p className="text-ui-sm text-neutral-500 font-medium leading-relaxed">
                Your therapist uploaded active session logs and recovery programs.
              </p>
              <a
                href={appointment.sessionDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full"
              >
                <Button variant="secondary" fullWidth className="text-success border-success hover:bg-success/5">
                  Download Session Notes →
                </Button>
              </a>
            </div>
          )}

          {/* Cancellation Notice */}
          {appointment.status === 'cancelled' && (
            <div className="p-4 mt-6 bg-[#C0392B]/5 border border-danger/20 rounded-md text-left">
              <span className="text-[10px] font-black text-danger uppercase tracking-widest block mb-1">
                Cancellation Details
              </span>
              <p className="text-ui-sm text-neutral-700 font-semibold leading-relaxed">
                This booking has been cancelled by {appointment.cancelledBy || 'system'}.
                {appointment.cancellationReason && (
                  <> Reason: <i>"{appointment.cancellationReason}"</i></>
                )}
              </p>
            </div>
          )}

          {/* Return CTA */}
          <div className="mt-8">
            <Link to="/patient/appointments">
              <Button variant="primary" fullWidth className="h-[56px] sm:h-12">
                Go to Dashboard
              </Button>
            </Link>
          </div>

        </Card>
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;
