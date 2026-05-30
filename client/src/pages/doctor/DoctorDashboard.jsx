import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDoctorProfileAPI } from '../../api/doctor.api';
import { getDoctorAppointments, completeAppointment } from '../../api/appointment.api';
import { getMySlots } from '../../api/availability.api';
import useAuthStore from '../../store/authStore';
import SectionHeader from '../../components/common/SectionHeader';
import Badge from '../../components/common/Badge';
import Table, { ActionLink } from '../../components/common/Table';
import OnboardingCard from '../../components/doctor/OnboardingCard';
import ProfileCompletionCard from '../../components/doctor/ProfileCompletionCard';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [slotCount, setSlotCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, apptRes, slotsRes] = await Promise.all([
        getDoctorProfileAPI(),
        getDoctorAppointments().catch(() => ({ success: true, data: [] })),
        getMySlots().catch(() => ({ success: true, data: [] })),
      ]);

      if (profileRes.success && profileRes.data?.profile) {
        setProfile(profileRes.data.profile);
      }

      const rawAppts = apptRes.data?.appointments || apptRes.data || apptRes.appointments || [];
      setAppointments(rawAppts);

      let slots = [];
      if (slotsRes) {
        if (Array.isArray(slotsRes.data)) slots = slotsRes.data;
        else if (Array.isArray(slotsRes)) slots = slotsRes;
        else if (slotsRes.success && Array.isArray(slotsRes.data?.slots)) slots = slotsRes.data.slots;
      }
      setSlotCount(slots.length);
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
      toast.error('FAILED TO FETCH PRACTICE STATUS DATA.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'DOCTOR DASHBOARD — KINETIQ';
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-ui-xs font-bold text-swiss-gray-400 uppercase tracking-widest bg-swiss-white">
        LOADING PRACTITIONER LEDGER PANELS...
      </div>
    );
  }

  const status = profile ? profile.verificationStatus : 'pending';

  // Compute surname in uppercase
  const surname = user?.name ? user.name.split(' ').pop().toUpperCase() : 'SPECIALIST';

  // Compute dates and times
  const todayStr = new Date().toISOString().split('T')[0];
  const dayName = new Date().toLocaleDateString('en-IN', { weekday: 'long' }).toUpperCase();
  const dayNum = new Date().toLocaleDateString('en-IN', { day: 'numeric' });
  const monthName = new Date().toLocaleDateString('en-IN', { month: 'long' }).toUpperCase();
  const currentFullDateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  // Metric computations
  const todayAppts = appointments.filter((a) => a.date === todayStr);
  const completedAppts = appointments.filter((a) => a.status === 'completed');
  
  // Total Patients (unique patient IDs)
  const uniquePatients = new Set(appointments.map((a) => a.patient?._id || a.patient)).size;

  // This month's earnings
  const thisMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthEarnings = completedAppts
    .filter((a) => a.date?.startsWith(thisMonthPrefix) && a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.doctorEarnings || 0), 0);

  // Today's schedule sorted chronologically by start time
  const todaySchedule = todayAppts
    .filter((a) => a.status === 'confirmed')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Recent bookings (last 5 bookings sorted by date/time descending)
  const recentBookings = [...appointments]
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
    .slice(0, 5);

  const handleMarkComplete = async (id) => {
    const confirm = window.confirm('ARE YOU SURE YOU WANT TO MARK THIS CONSULTATION COMPLETE?');
    if (!confirm) return;

    try {
      const res = await completeAppointment(id);
      if (res.success) {
        toast.success('CONSULTATION COMPLETED.');
        fetchDashboardData(); // Refresh metrics and lists
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO COMPLETE CONSULTATION.');
    }
  };

  return (
    <div className="flex flex-col gap-12 select-none text-left bg-swiss-white">
      
      {/* ── Page Header ── */}
      <div>
        <h1 className="font-black text-display-sm text-swiss-black uppercase leading-none tracking-tighter">
          GOOD MORNING, DR. {surname}.
        </h1>
        <p className="text-ui-lg text-swiss-gray-400 font-bold uppercase tracking-wider mt-2">
          {currentFullDateStr}
        </p>
        <div className="w-full h-1 bg-swiss-black mt-6" />
      </div>

      {/* ── Verification Warning Banner (If Not Verified) ── */}
      {status !== 'verified' && (
        <div className="w-full p-6 bg-swiss-white border-2 border-swiss-black border-l-4 border-l-swiss-amber rounded-none flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
          <div>
            <span className="text-[10px] font-black text-swiss-amber tracking-widest uppercase block mb-1">
              PENDING VERIFICATION
            </span>
            <p className="text-ui-md text-swiss-black font-bold uppercase tracking-wide">
              Your profile is awaiting admin review. Complete your profile to accelerate the process.
            </p>
          </div>
          <Link
            to="/doctor/profile"
            className="h-10 px-4 border-2 border-swiss-black text-swiss-black hover:bg-swiss-black hover:text-swiss-white font-black text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none shrink-0 rounded-none cursor-pointer"
          >
            COMPLETE PROFILE →
          </Link>
        </div>
      )}

      {/* ── Programmatic Onboarding Checklist Card (For Unverified/New) ── */}
      {status !== 'verified' && (
        <OnboardingCard profile={profile} slotCount={slotCount} />
      )}

      {/* ── Profile Completion Score Card (Redesigned Swiss variant) ── */}
      <ProfileCompletionCard doctorProfile={profile} slotCount={slotCount} />

      {/* ── Metrics Cards Grid (4x1) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Appointments */}
        <div className="p-6 bg-swiss-white border-2 border-swiss-black rounded-none transition-all duration-fast hover:border-4 flex flex-col justify-between h-32 select-none">
          <span className="text-ui-xs font-black text-swiss-gray-400 uppercase tracking-widest block">
            TODAY'S APPOINTMENTS
          </span>
          <span className="text-display-xs font-black text-swiss-black select-none leading-none block">
            {todayAppts.length}
          </span>
        </div>

        {/* This Month's Earnings */}
        <div className="p-6 bg-swiss-white border-2 border-swiss-black rounded-none transition-all duration-fast hover:border-4 flex flex-col justify-between h-32 select-none">
          <span className="text-ui-xs font-black text-swiss-gray-400 uppercase tracking-widest block">
            THIS MONTH'S EARNINGS
          </span>
          <div className="flex items-baseline select-none">
            <span className="text-ui-xl text-swiss-black font-medium mr-1 select-none">₹</span>
            <span className="text-display-xs font-black text-swiss-black select-none leading-none block">
              {thisMonthEarnings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Total Patients */}
        <div className="p-6 bg-swiss-white border-2 border-swiss-black rounded-none transition-all duration-fast hover:border-4 flex flex-col justify-between h-32 select-none">
          <span className="text-ui-xs font-black text-swiss-gray-400 uppercase tracking-widest block">
            TOTAL PATIENTS
          </span>
          <span className="text-display-xs font-black text-swiss-black select-none leading-none block">
            {uniquePatients}
          </span>
        </div>

        {/* Your Rating */}
        <div className="p-6 bg-swiss-white border-2 border-swiss-black rounded-none transition-all duration-fast hover:border-4 flex flex-col justify-between h-32 select-none">
          <span className="text-ui-xs font-black text-swiss-gray-400 uppercase tracking-widest block">
            YOUR RATING
          </span>
          <span className="text-display-xs font-black text-swiss-black select-none leading-none block">
            {profile?.averageRating ? `${parseFloat(profile.averageRating).toFixed(1)}/5` : '0/5'}
          </span>
        </div>
      </div>

      {/* ── Today's Schedule Timeline Section (2:10 Column Split) ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="TODAY'S SCHEDULE" size="sm" ruled={true} className="mb-0" />
        
        <div className="grid grid-cols-12 gap-8 items-start">
          {/* Left 2 Columns: Vertical Date Stack */}
          <div className="col-span-12 md:col-span-2 flex md:flex-col items-baseline md:items-start justify-between md:justify-start gap-1 border-b-2 md:border-b-0 md:border-r-2 border-swiss-black pb-4 md:pb-0 md:pr-4">
            <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block">
              {dayName}
            </span>
            <span className="text-display-lg font-black text-swiss-black select-none leading-none block md:my-1">
              {dayNum}
            </span>
            <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block">
              {monthName}
            </span>
          </div>

          {/* Right 10 Columns: Appointment Timeline */}
          <div className="col-span-12 md:col-span-10 flex flex-col gap-4">
            {todaySchedule.length === 0 ? (
              <div className="py-8 flex flex-col gap-3">
                <p className="text-ui-md text-swiss-gray-400 uppercase font-bold italic">
                  No appointments scheduled for today.
                </p>
                <Link
                  to="/doctor/availability"
                  className="h-10 px-4 border-2 border-swiss-black text-swiss-black hover:bg-swiss-black hover:text-swiss-white font-black text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none shrink-0 w-max rounded-none cursor-pointer"
                >
                  MANAGE AVAILABILITY →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col border border-swiss-black divide-y divide-swiss-black rounded-none bg-swiss-white">
                {todaySchedule.map((appt) => (
                  <div
                    key={appt._id}
                    className="flex items-center justify-between h-14 px-4 bg-swiss-white hover:bg-swiss-gray-50 transition-colors select-none"
                  >
                    {/* Time Column (far left of row) */}
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-ui-xs font-black text-swiss-black uppercase tracking-wider shrink-0 w-28">
                        {appt.startTime} – {appt.endTime}
                      </span>
                      {/* Thin vertical separator line inside the row */}
                      <div className="h-6 w-[1px] bg-swiss-gray-200" />
                      
                      {/* Card Content block */}
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-ui-sm font-black text-swiss-black uppercase truncate">
                          {appt.patient?.name || 'Patient'}
                        </span>
                        <span className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider">
                          (30 MIN)
                        </span>
                        <Badge variant={appt.status} />
                      </div>
                    </div>

                    {/* Actions link on the far right */}
                    <div className="flex items-center gap-3 shrink-0">
                      <ActionLink onClick={() => navigate('/doctor/appointments')}>
                        VIEW
                      </ActionLink>
                      <button
                        onClick={() => handleMarkComplete(appt._id)}
                        className="h-8 px-3 border border-swiss-black text-swiss-black hover:bg-swiss-black hover:text-swiss-white font-black text-[10px] flex items-center uppercase tracking-wider transition-colors select-none rounded-none cursor-pointer"
                      >
                        MARK COMPLETE →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Bookings Table Section ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="RECENT BOOKINGS" size="sm" ruled={true} className="mb-0" />
        
        {recentBookings.length === 0 ? (
          <div className="py-8 flex flex-col gap-3">
            <p className="text-ui-md text-swiss-gray-400 uppercase font-bold italic">
              No recent bookings registered in records.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden border-2 border-swiss-black rounded-none bg-swiss-white">
            <Table>
              <Table.Head>
                <tr>
                  <Table.Header>DATE</Table.Header>
                  <Table.Header>PATIENT</Table.Header>
                  <Table.Header>TIME</Table.Header>
                  <Table.Header>STATUS</Table.Header>
                  <Table.Header actions>ACTIONS</Table.Header>
                </tr>
              </Table.Head>
              <Table.Body>
                {recentBookings.map((appt) => {
                  const dateText = new Date(appt.date + 'T00:00:00')
                    .toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    .toUpperCase();
                  return (
                    <Table.Row key={appt._id} hoverable={true}>
                      <Table.Cell className="font-bold text-swiss-gray-400">
                        {dateText}
                      </Table.Cell>
                      <Table.Cell className="font-black text-swiss-black uppercase">
                        {appt.patient?.name || 'Patient'}
                      </Table.Cell>
                      <Table.Cell className="font-bold">
                        {appt.startTime} – {appt.endTime}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={appt.status} />
                      </Table.Cell>
                      <Table.Cell actions>
                        <ActionLink onClick={() => navigate('/doctor/appointments')}>
                          VIEW →
                        </ActionLink>
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        )}

        <button
          onClick={() => navigate('/doctor/appointments')}
          className="h-10 px-4 border-2 border-swiss-black text-swiss-black hover:bg-swiss-black hover:text-swiss-white font-black text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none shrink-0 w-max rounded-none cursor-pointer"
        >
          VIEW ALL APPOINTMENTS →
        </button>
      </div>

    </div>
  );
};

export default DoctorDashboard;
