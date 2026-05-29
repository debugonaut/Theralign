import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyAppointments } from '../../api/appointment.api';
import useAuthStore from '../../store/authStore';
import SectionHeader from '../../components/common/SectionHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'PATIENT DASHBOARD — KINETIQ';
    const fetchData = async () => {
      try {
        const res = await getMyAppointments();
        setAppointments(res.data || res.appointments || []);
      } catch (err) {
        console.warn('Dashboard appointments load failure:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute metrics
  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const upcomingCount = appointments.filter((a) => a.status === 'confirmed').length;
  const reviewsGiven = appointments.filter((a) => a.reviewSubmitted).length;
  const doctorsSeen = new Set(
    appointments.filter(a => a.doctor).map(a => a.doctor._id || a.doctor)
  ).size;

  // Find next upcoming appointment within next 7 days
  const now = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(now.getDate() + 7);

  const upcomingAppts = appointments
    .filter((a) => a.status === 'confirmed')
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const spotlightAppt = upcomingAppts[0]; // Next immediate appointment

  // Get first name for greeting
  const firstName = user?.name ? user.name.split(' ')[0].toUpperCase() : 'PATIENT';

  // Today's formatted date
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase();

  // Handle Spotlight Date formatting
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

  const handleRowClick = () => {
    navigate('/patient/appointments');
  };

  return (
    <div className="flex flex-col gap-10 select-none bg-swiss-white text-left">
      
      {/* ── Page Header Greeting ── */}
      <div className="flex flex-col gap-3">
        <h1 className="text-display-sm font-black text-swiss-black uppercase tracking-tighter leading-none mb-1">
          GOOD MORNING, {firstName}.
        </h1>
        <span className="text-ui-lg font-bold text-swiss-gray-400 uppercase tracking-widest block">
          {todayFormatted}
        </span>
        <div className="h-[4px] bg-swiss-black w-full mt-4" />
      </div>

      {/* ── Upcoming Appointment Spotlight ── */}
      {loading ? (
        <div className="h-40 bg-swiss-gray-100 animate-pulse border-2 border-swiss-black rounded-none" />
      ) : spotlightAppt ? (
        <div className="w-full p-6 bg-swiss-gray-100 border-2 border-swiss-black rounded-none shadow-none text-left flex flex-col gap-4 relative swiss-diagonal">
          <div>
            <span className="text-ui-xs font-black text-swiss-red uppercase tracking-widest block mb-2">
              YOUR NEXT APPOINTMENT
            </span>
            <h3 className="text-display-xs font-black text-swiss-black uppercase tracking-tighter leading-none mb-2">
              DR. {(spotlightAppt.doctor?.user?.name || 'Physiotherapist').toUpperCase()}
            </h3>
            <p className="text-ui-xl font-black text-swiss-black uppercase tracking-wide">
              {formatSpotlightDate(spotlightAppt.date)} · {spotlightAppt.startTime} – {spotlightAppt.endTime}
            </p>
          </div>

          <div className="flex items-center gap-6 text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            <span className="text-swiss-red">
              {Array.isArray(spotlightAppt.doctor?.specialization)
                ? spotlightAppt.doctor.specialization[0]
                : spotlightAppt.doctor?.specialization || 'CLINICAL'}
            </span>
            <span>·</span>
            <span>{spotlightAppt.doctor?.clinicName || 'Clinic'}</span>
            <span>·</span>
            <span className="text-swiss-black">₹{spotlightAppt.consultationFee || spotlightAppt.doctor?.consultationFee}</span>
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRowClick}
            >
              VIEW DETAILS →
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRowClick}
            >
              CANCEL →
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full p-8 border-2 border-swiss-black bg-swiss-white text-center flex flex-col items-center gap-4 rounded-none">
          <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            NO UPCOMING APPOINTMENTS
          </span>
          <p className="text-ui-md text-swiss-gray-600 font-bold max-w-sm">
            You have no clinical appointments scheduled. Book a session with a practitioner near you.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/doctors')}
            className="mt-2"
          >
            FIND A DOCTOR →
          </Button>
        </div>
      )}

      {/* ── Metric Cards Row (4x1) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL APPOINTMENTS', val: total },
          { label: 'COMPLETED SESSIONS', val: completed },
          { label: 'DOCTORS SEEN', val: doctorsSeen },
          { label: 'REVIEWS GIVEN', val: reviewsGiven },
        ].map((m) => (
          <div
            key={m.label}
            className="group bg-swiss-white border-2 border-swiss-black hover:border-4 p-6 transition-all duration-fast select-none rounded-none text-left"
          >
            <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block mb-2">
              {m.label}
            </span>
            <h2 className="text-display-sm font-black text-swiss-black uppercase tracking-tighter leading-none">
              {loading ? '—' : m.val}
            </h2>
          </div>
        ))}
      </div>

      {/* ── Recent Activity Table Rows ── */}
      <div className="flex flex-col gap-6 mt-4">
        <SectionHeader title="RECENT ACTIVITY" size="sm" ruled={true} className="mb-0" />

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-swiss-gray-100 animate-pulse border border-swiss-gray-200" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="border-2 border-swiss-black border-dashed p-10 text-center rounded-none text-ui-xs font-bold text-swiss-gray-400 uppercase tracking-widest">
            NO RECENT SYSTEM ACTIVITY RECORDED.
          </div>
        ) : (
          <div className="flex flex-col w-full">
            {appointments.slice(0, 3).map((appt) => {
              const apptDate = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              }).toUpperCase();
              const doctorName = appt.doctor?.user?.name || 'Physiotherapist';
              const spec = Array.isArray(appt.doctor?.specialization)
                ? appt.doctor.specialization[0]
                : appt.doctor?.specialization || 'Clinical';

              return (
                <div
                  key={appt._id}
                  onClick={handleRowClick}
                  className="flex items-center justify-between py-4 border-b border-swiss-gray-200 hover:bg-swiss-gray-50 transition-colors duration-fast cursor-pointer text-ui-sm font-bold uppercase tracking-wider"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-swiss-gray-400 w-16 shrink-0 text-left">
                      {apptDate}
                    </span>
                    <span className="text-swiss-black font-black w-48 shrink-0 truncate">
                      DR. {doctorName.toUpperCase()}
                    </span>
                    <span className="text-swiss-red text-ui-xs font-black tracking-widest hidden sm:inline">
                      {spec.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <Badge variant={appt.status} size="sm" />
                    <span className="text-ui-xs font-black text-swiss-black hover:text-swiss-red hover:underline select-none">
                      VIEW →
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="mt-4">
              <Button
                variant="secondary"
                onClick={handleRowClick}
              >
                VIEW ALL APPOINTMENTS →
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PatientDashboard;
