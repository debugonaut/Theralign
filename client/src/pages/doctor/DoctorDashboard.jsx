import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDoctorProfileAPI } from '../../api/doctor.api';
import { getDoctorAppointments, completeAppointment } from '../../api/appointment.api';
import { getMySlots, getWeeklyScheduleAPI } from '../../api/availability.api';
import useAuthStore from '../../store/authStore';
import SectionHeader from '../../components/common/SectionHeader';
import Badge from '../../components/common/Badge';
import Table, { ActionLink } from '../../components/common/Table';
import OnboardingCard from '../../components/doctor/OnboardingCard';
import ProfileCompletionCard from '../../components/doctor/ProfileCompletionCard';
import Button from '../../components/common/Button';
import JuniorDoctorDashboard from './JuniorDoctorDashboard';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [slotCount, setSlotCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, apptRes, slotsRes, scheduleRes] = await Promise.all([
        getDoctorProfileAPI().catch(() => ({ success: true, data: { profile: null } })),
        getDoctorAppointments().catch(() => ({ success: true, data: [] })),
        getMySlots().catch(() => ({ success: true, data: [] })),
        getWeeklyScheduleAPI().catch(() => ({ success: true, data: { schedule: null } })),
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
      
      let hasWeekly = false;
      if (scheduleRes?.data?.schedule?.schedule) {
        const schedObj = scheduleRes.data.schedule.schedule;
        hasWeekly = Object.values(schedObj).some(day => day && day.enabled === true);
      }

      setSlotCount(slots.length || (hasWeekly ? 1 : 0));
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
      toast.error('FAILED TO FETCH PRACTICE STATUS DATA.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'DOCTOR DASHBOARD — Theralign';
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="py-24 text-center text-ui-xs font-bold text-neutral-500 uppercase tracking-widest bg-white">
        LOADING PRACTITIONER LEDGER PANELS...
      </div>
    );
  }

  if (profile?.doctorType === 'junior') {
    return (
      <JuniorDoctorDashboard
        profile={profile}
        appointments={appointments}
        fetchDashboardData={fetchDashboardData}
      />
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

  // This month's earnings (including confirmed and completed paid appointments)
  const thisMonthPrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisMonthEarnings = appointments
    .filter(
      (a) =>
        ['confirmed', 'completed'].includes(a.status) &&
        a.paymentStatus === 'paid' &&
        a.date?.startsWith(thisMonthPrefix)
    )
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
    <div className="flex flex-col gap-5 select-none text-left bg-white">
      
      {/* ── Page Header ── */}
      <div>
        <h1 className="font-black text-display-sm text-neutral-900 uppercase leading-none tracking-tighter">
          Good morning, DR. {surname}.
        </h1>
        <p className="text-ui-lg text-neutral-500 font-bold uppercase tracking-wider mt-2">
          {currentFullDateStr}
        </p>
        <div className="w-full h-1 bg-neutral-900 mt-6 max-w-[1200px]" />
      </div>

      {/* ── Verification Warning Banner (If Not Verified) ── */}
      {status !== 'verified' && (
        <div className="w-full p-6 bg-white border border-neutral-200/50 border-l-4 border-l-warning rounded-lg shadow-level-1 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none transition-warm max-w-[1200px]">
          <div>
            <span className="text-[10px] font-black text-warning tracking-widest uppercase block mb-1">
              PENDING VERIFICATION
            </span>
            <p className="text-ui-md text-neutral-900 font-bold uppercase tracking-wide">
              Your profile is awaiting admin review. Complete your profile to accelerate the process.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate('/doctor/profile')}
            size="sm"
          >
            COMPLETE PROFILE →
          </Button>
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
        <div className="p-6 bg-white border border-neutral-200/40 rounded-lg shadow-level-1 hover:shadow-level-2 transition-warm flex flex-col justify-between h-32 select-none">
          <span className="text-ui-xs font-black text-neutral-500 uppercase tracking-widest block">
            TODAY'S APPOINTMENTS
          </span>
          <span className="text-display-xs font-black text-neutral-900 select-none leading-none block">
            {todayAppts.length}
          </span>
        </div>

        {/* This Month's Earnings */}
        <div className="p-6 bg-white border border-neutral-200/40 rounded-lg shadow-level-1 hover:shadow-level-2 transition-warm flex flex-col justify-between h-32 select-none">
          <span className="text-ui-xs font-black text-neutral-500 uppercase tracking-widest block">
            THIS MONTH'S EARNINGS
          </span>
          <div className="flex items-baseline select-none">
            <span className="text-ui-xl text-neutral-900 font-medium mr-1 select-none">₹</span>
            <span className="text-display-xs font-black text-neutral-900 select-none leading-none block">
              {thisMonthEarnings.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Total Patients */}
        <div className="p-6 bg-white border border-neutral-200/40 rounded-lg shadow-level-1 hover:shadow-level-2 transition-warm flex flex-col justify-between h-32 select-none">
          <span className="text-ui-xs font-black text-neutral-500 uppercase tracking-widest block">
            TOTAL PATIENTS
          </span>
          <span className="text-display-xs font-black text-neutral-900 select-none leading-none block">
            {uniquePatients}
          </span>
        </div>

        {/* Your Rating */}
        <div className="p-6 bg-white border border-neutral-200/40 rounded-lg shadow-level-1 hover:shadow-level-2 transition-warm flex flex-col justify-between h-32 select-none">
          <span className="text-ui-xs font-black text-neutral-500 uppercase tracking-widest block">
            YOUR RATING
          </span>
          <span className="text-display-xs font-black text-neutral-900 select-none leading-none block">
            {profile?.averageRating ? `${parseFloat(profile.averageRating).toFixed(1)}/5` : '0/5'}
          </span>
        </div>
      </div>

      {/* ── Today's Schedule Timeline Section (2:10 Column Split) ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="TODAY'S SCHEDULE" size="sm" ruled={true} className="mb-0" />
        
        <div className="grid grid-cols-12 gap-5 items-start">
          {/* Left 2 Columns: Vertical Date Stack */}
          <div className="col-span-12 md:col-span-2 flex md:flex-col items-baseline md:items-start justify-between md:justify-start gap-1 border-b md:border-b-0 md:border-r border-neutral-200 pb-4 md:pb-0 md:pr-4">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
              {dayName}
            </span>
            <span className="text-display-lg font-black text-neutral-900 select-none leading-none block md:my-1">
              {dayNum}
            </span>
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
              {monthName}
            </span>
          </div>

          {/* Right 10 Columns: Appointment Timeline */}
          <div className="col-span-12 md:col-span-10 flex flex-col gap-4">
            {todaySchedule.length === 0 ? (
              <div className="py-6 flex flex-col gap-3">
                <p className="text-ui-md text-neutral-500 uppercase font-bold italic">
                  No appointments scheduled for today.
                </p>
                <Button
                  onClick={() => navigate('/doctor/availability')}
                  variant="secondary"
                  className="w-max"
                >
                  MANAGE AVAILABILITY →
                </Button>
              </div>
            ) : (
              <div className="flex flex-col border border-neutral-200/50 divide-y divide-neutral-100 rounded-lg shadow-level-1 bg-white overflow-hidden">
                {todaySchedule.map((appt) => (
                  <div
                    key={appt._id}
                    className="flex items-center justify-between h-14 px-4 bg-white hover:bg-neutral-50 transition-colors select-none"
                  >
                    {/* Time Column (far left of row) */}
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-ui-xs font-black text-neutral-900 uppercase tracking-wider shrink-0 w-28">
                        {appt.startTime} – {appt.endTime}
                      </span>
                      {/* Thin vertical separator line inside the row */}
                      <div className="h-6 w-[1px] bg-neutral-200" />
                      
                      {/* Card Content block */}
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-ui-sm font-black text-neutral-900 uppercase truncate">
                          {appt.patient?.name || 'Patient'}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
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
                        className="h-8 px-3 border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 font-bold text-[10px] flex items-center uppercase tracking-wider transition-all duration-150 select-none rounded-md cursor-pointer bg-white"
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
          <div className="py-6 flex flex-col gap-3">
            <p className="text-ui-md text-neutral-500 uppercase font-bold italic">
              No recent bookings registered in records.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-hidden border border-neutral-200/50 rounded-lg shadow-level-1 bg-white select-none max-w-[1200px]">
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
                      <Table.Cell className="font-bold text-neutral-500">
                        {dateText}
                      </Table.Cell>
                      <Table.Cell className="font-black text-neutral-900 uppercase">
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

        <Button
          onClick={() => navigate('/doctor/appointments')}
          variant="secondary"
          className="w-max"
        >
          VIEW ALL APPOINTMENTS →
        </Button>
      </div>

    </div>
  );
};

export default DoctorDashboard;
