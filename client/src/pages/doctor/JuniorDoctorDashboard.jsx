import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Calendar, Info, User } from 'lucide-react';
import { completeAppointment } from '../../api/appointment.api';
import useAuthStore from '../../store/authStore';
import SectionHeader from '../../components/common/SectionHeader';
import Badge from '../../components/common/Badge';

const JuniorDoctorDashboard = ({ profile, appointments, fetchDashboardData }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('theralign_junior_restrictions_dismissed');
    if (!dismissed) {
      setShowNotice(true);
    }
  }, []);

  const handleDismissNotice = () => {
    localStorage.setItem('theralign_junior_restrictions_dismissed', 'true');
    setShowNotice(false);
  };

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

  const currentFullDateStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).toUpperCase();

  // Affiliation details
  const practiceName = profile?.practiceName || (profile?.seniorDoctor?.practiceName);
  const seniorName = profile?.seniorDoctor?.user?.name || 'Senior Clinician';
  const seniorAvatar = profile?.seniorDoctor?.user?.profileImage;

  // Metric computations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.date === todayStr);
  const pendingNotesCount = appointments.filter((a) => a.status === 'completed' && !a.hasSessionRecord).length;
  
  // This week appointments
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday
  startOfWeek.setHours(0,0,0,0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6); // Saturday
  endOfWeek.setHours(23,59,59,999);

  const thisWeekApptsCount = appointments.filter((a) => {
    const apptDate = new Date(a.date);
    return apptDate >= startOfWeek && apptDate <= endOfWeek;
  }).length;

  // Today's schedule sorted chronologically by start time
  const todaySchedule = todayAppts
    .filter((a) => a.status === 'confirmed')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex flex-col gap-5 select-none text-left bg-[#F7F9FB] font-sans min-h-screen">
      
      {/* ── Page Header ── */}
      <div>
        <h1 className="font-bold text-[22px] text-neutral-900 tracking-tight leading-none">
          Good Morning, Dr. {user?.name || 'Specialist'}
        </h1>
        <p className="text-[12px] text-neutral-500 font-bold uppercase tracking-wider mt-2.5">
          {currentFullDateStr}
        </p>
      </div>

      {/* Affiliation Band */}
      <div className="bg-[#E8F4F8] border border-[#0B4F6C]/10 rounded-lg p-3 px-4 flex items-center flex-wrap gap-x-4 gap-y-2 select-none max-w-max">
        <div className="flex items-center gap-2 text-[#0B4F6C] font-semibold text-[13px]">
          <Building2 className="w-4 h-4" />
          <span>Part of {practiceName || `Dr. ${seniorName}'s Practice`}</span>
        </div>
        <div className="hidden sm:block w-[1px] h-4 bg-neutral-300" />
        <div className="flex items-center gap-2 text-neutral-500 text-[12px]">
          <div className="w-7 h-7 rounded-full bg-neutral-200 border border-neutral-300 overflow-hidden flex items-center justify-center">
            {seniorAvatar ? (
              <img src={seniorAvatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-neutral-600 text-[10px] uppercase">
                {seniorName.split(' ').pop()?.[0] || 'S'}
              </span>
            )}
          </div>
          <span>Supervised by Dr. {seniorName}</span>
        </div>
      </div>

      {/* ── Metrics Cards Grid (3x1) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        {/* Today's Appointments */}
        <div className="p-5 bg-white rounded-xl shadow-level-1 flex flex-col justify-between h-[110px] select-none">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Today's Appointments
          </span>
          <span className="text-[28px] font-bold text-[#0B4F6C] tracking-tight leading-none mt-2">
            {todayAppts.length}
          </span>
          <span className="text-[11px] text-neutral-500 font-medium mt-auto">
            Scheduled slots for today
          </span>
        </div>

        {/* Pending Session Notes */}
        <div className="p-5 bg-white rounded-xl shadow-level-1 flex flex-col justify-between h-[110px] select-none">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Pending Session Notes
          </span>
          <span className="text-[28px] font-bold text-[#B45309] tracking-tight leading-none mt-2">
            {pendingNotesCount}
          </span>
          <span className="text-[11px] text-neutral-500 font-medium mt-auto">
            Requires clinical documentation
          </span>
        </div>

        {/* This Week */}
        <div className="p-5 bg-white rounded-xl shadow-level-1 flex flex-col justify-between h-[110px] select-none">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            This Week
          </span>
          <span className="text-[28px] font-bold text-neutral-900 tracking-tight leading-none mt-2">
            {thisWeekApptsCount}
          </span>
          <span className="text-[11px] text-neutral-500 font-medium mt-auto">
            Total appointments this week
          </span>
        </div>
      </div>

      {/* ── Today's Schedule Card ── */}
      <div className="bg-white rounded-xl shadow-level-1 overflow-hidden mt-4 flex flex-col">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-neutral-900">
            Today's Schedule
          </h2>
        </div>

        <div className="flex flex-col">
          {todaySchedule.length === 0 ? (
            <div className="py-12 text-center bg-white flex flex-col items-center justify-center gap-2">
              <span className="text-[14px] text-neutral-900 font-bold">No appointments today</span>
              <span className="text-[12px] text-neutral-500">Your schedule is currently clear.</span>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {todaySchedule.map((appt) => (
                <div
                  key={appt._id}
                  className="flex items-center justify-between py-3.5 px-6 hover:bg-neutral-50/50 transition-colors select-none"
                >
                  {/* Time and Patient info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-[13px] font-bold text-[#0B4F6C] tracking-wide shrink-0 w-28 text-left">
                      {appt.startTime} – {appt.endTime}
                    </span>
                    <div className="w-[1px] h-6 bg-neutral-200" />
                    
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-full bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center shrink-0">
                        {appt.patient?.user?.profileImage || appt.patient?.profileImage ? (
                          <img src={appt.patient?.user?.profileImage || appt.patient?.profileImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-neutral-400" />
                        )}
                      </div>
                      <span className="text-[13px] font-bold text-neutral-900 truncate">
                        {appt.patient?.name || 'Patient'}
                      </span>
                      <Badge variant={appt.status} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 shrink-0">
                    <Link 
                      to="/doctor/appointments" 
                      className="text-[#0B4F6C] hover:underline font-bold text-[12px]"
                    >
                      View →
                    </Link>
                    <button
                      onClick={() => handleMarkComplete(appt._id)}
                      className="h-8 px-3 border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 font-bold text-[10px] flex items-center uppercase tracking-wider transition-all duration-150 select-none rounded-md cursor-pointer bg-white"
                    >
                      Mark Complete →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Restrictions notice */}
      {showNotice && (
        <div className="bg-[#F0F4F7] border border-neutral-200 rounded-lg p-3.5 px-4 flex items-start gap-3 mt-4 text-left animate-fade-in">
          <Info className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-[12px] text-neutral-600 font-medium leading-relaxed">
            As a junior doctor, your availability and fees are managed by Dr. {seniorName}. Contact them to update your schedule.
          </div>
          <button
            onClick={handleDismissNotice}
            className="text-neutral-400 hover:text-neutral-700 border-0 bg-transparent p-0 cursor-pointer select-none font-bold text-[16px] leading-none shrink-0"
          >
            ×
          </button>
        </div>
      )}

    </div>
  );
};

export default JuniorDoctorDashboard;
