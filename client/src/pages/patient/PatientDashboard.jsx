import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { getMyAppointments } from '../../api/appointment.api';
import useAuthStore from '../../store/authStore';
import SectionHeader from '../../components/common/SectionHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchData(); // retry on reconnection!
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getMyAppointments();
      setAppointments(res.data || res.appointments || []);
    } catch (err) {
      console.warn('Dashboard appointments load failure:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Dashboard — Theralign';
    fetchData(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute metrics
  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const upcomingCount = appointments.filter((a) => a.status === 'confirmed').length;
  const reviewsGiven = appointments.filter((a) => a.reviewSubmitted).length;
  const doctorsSeen = new Set(
    appointments.filter(a => a.doctor).map(a => a.doctor._id || a.doctor)
  ).size;

  const upcomingAppts = appointments
    .filter((a) => a.status === 'confirmed')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const spotlightAppt = upcomingAppts[0];

  // Get first name in Title Case for greeting
  const firstName = user?.name ? toTitleCase(user.name.split(' ')[0]) : 'Patient';

  // Today's formatted date
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formatSpotlightDate = (dateStr) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatINR = (value) => {
    if (value === undefined || value === null) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(value);
  };

  const handleRowClick = () => {
    navigate('/patient/appointments');
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-5 select-none bg-neutral-50 text-left page-fade-in">
      
      {/* Network Failure Banner */}
      {!isOnline && (
        <div className="w-full bg-white border-2 border-warning rounded-lg p-5 flex items-start gap-4 shadow-level-1 animate-pulse max-w-[1200px]">
          <div className="w-10 h-10 border-2 border-warning flex items-center justify-center text-warning font-bold rounded bg-warning/5 text-ui-lg select-none shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-left flex-grow">
            <h4 className="text-ui-md font-bold text-neutral-900 uppercase">You're currently offline</h4>
            <p className="text-ui-sm text-neutral-500 font-semibold leading-relaxed mt-1">
              Some features may not be available. We'll reconnect automatically when your connection is restored.
            </p>
          </div>
        </div>
      )}

      {/* Page Header Greeting */}
      <div className="flex flex-col gap-3">
        <h1 className="text-display-sm font-black text-neutral-900 tracking-tighter leading-none mb-1 normal-case">
          Good morning, {firstName}.
        </h1>
        <span className="text-ui-lg font-semibold text-neutral-500 tracking-wide block">
          {todayFormatted}
        </span>
        <div className="h-[1px] bg-neutral-200 w-full mt-4 max-w-[1200px]" />
      </div>

      {/* Upcoming Appointment Spotlight */}
      {loading ? (
        <div className="h-40 bg-neutral-100 animate-pulse border border-neutral-200 rounded-lg" />
      ) : spotlightAppt ? (
        <div className="w-full p-6 bg-neutral-100 bg-diagonal border border-neutral-200/50 rounded-lg shadow-level-1 text-left flex flex-col gap-4 relative transition-warm max-w-[1200px]">
          <div>
            <span className="text-ui-xs font-bold text-accent tracking-widest uppercase block mb-2">
              Your Next Appointment
            </span>
            <h3 className="text-display-xs font-black text-neutral-900 tracking-tighter leading-none mb-2 normal-case">
              {spotlightAppt.doctor?.user?.name ? `Dr. ${toTitleCase(spotlightAppt.doctor.user.name)}` : 'Physiotherapist'}
            </h3>
            <p className="text-ui-xl font-bold text-neutral-900 tracking-wide">
              {formatSpotlightDate(spotlightAppt.date)} · {spotlightAppt.startTime} – {spotlightAppt.endTime}
            </p>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-neutral-500 tracking-wide">
            <span className="text-accent">
              {toTitleCase(Array.isArray(spotlightAppt.doctor?.specialization)
                ? spotlightAppt.doctor.specialization[0]
                : spotlightAppt.doctor?.specialization || 'Clinical')}
            </span>
            <span>·</span>
            <span>{toTitleCase(spotlightAppt.doctor?.clinicName || 'Clinic')}</span>
            <span>·</span>
            <span className="text-neutral-900 font-bold">{formatINR(spotlightAppt.consultationFee || spotlightAppt.doctor?.consultationFee)}</span>
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRowClick}
            >
              View Details →
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRowClick}
            >
              Cancel →
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full p-6 border border-neutral-200/50 bg-white text-center flex flex-col items-center gap-3 rounded-lg shadow-level-1 transition-warm max-w-[1200px]">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            No Upcoming Appointments
          </span>
          <p className="text-ui-md text-neutral-500 font-medium max-w-sm">
            You have no clinical appointments scheduled. Book a session with a practitioner near you.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/doctors')}
            className="mt-2"
          >
            Find a Doctor →
          </Button>
        </div>
      )}

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Appointments', val: total },
          { label: 'Completed Sessions', val: completed },
          { label: 'Doctors Seen', val: doctorsSeen },
          { label: 'Reviews Given', val: reviewsGiven },
        ].map((m) => (
          <div
            key={m.label}
            className="group bg-white rounded-lg shadow-level-1 hover:shadow-level-2 border border-neutral-200/40 p-6 transition-warm select-none text-left"
          >
            <span className="text-xs font-semibold text-neutral-500 tracking-wide block mb-2">
              {m.label}
            </span>
            <h2 className="text-display-sm font-black text-neutral-900 tracking-tighter leading-none normal-case">
              {loading ? '—' : m.val}
            </h2>
          </div>
        ))}
      </div>

      {/* Recent Activity Table Rows */}
      <div className="flex flex-col gap-6 mt-4">
        <SectionHeader title="RECENT ACTIVITY" size="sm" ruled={true} className="mb-0" />

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-neutral-100 animate-pulse border border-neutral-200 rounded-md" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="border border-neutral-200 border-dashed p-6 text-center rounded-lg text-ui-xs font-bold text-neutral-400 uppercase tracking-wider">
            No recent system activity recorded.
          </div>
        ) : (
          <div className="flex flex-col w-full bg-white rounded-lg border border-neutral-200/50 shadow-level-1 p-4 max-w-[1200px]">
            {appointments.slice(0, 3).map((appt) => {
              const apptDate = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              });
              const doctorName = toTitleCase(appt.doctor?.user?.name || 'Physiotherapist');
              const formattedDrName = doctorName.toLowerCase().startsWith('dr.') ? doctorName : `Dr. ${doctorName}`;
              const spec = Array.isArray(appt.doctor?.specialization)
                ? appt.doctor.specialization[0]
                : appt.doctor?.specialization || 'Clinical';

              return (
                <div
                  key={appt._id}
                  onClick={handleRowClick}
                  className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-b-0 hover:bg-neutral-50 px-2 rounded-md transition-colors duration-fast cursor-pointer text-ui-sm font-medium tracking-normal"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-neutral-500 w-16 shrink-0 text-left">
                      {apptDate}
                    </span>
                    <span className="text-neutral-900 font-bold w-48 shrink-0 truncate">
                      {formattedDrName}
                    </span>
                    <span className="text-accent text-xs font-semibold tracking-wide hidden sm:inline">
                      {toTitleCase(spec)}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <Badge variant={appt.status} size="sm" />
                    <span className="text-xs font-bold text-primary hover:text-accent hover:underline select-none">
                      View →
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="mt-4 px-2">
              <Button
                variant="secondary"
                onClick={handleRowClick}
              >
                View All Appointments →
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PatientDashboard;
