import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert, ShieldCheck, Clock, UserCheck, Calendar,
  IndianRupee, Users, Sparkles, ArrowRight, Star,
} from 'lucide-react';
import { getDoctorProfileAPI } from '../../api/doctor.api';
import { getDoctorAppointments } from '../../api/appointment.api';
import { getMySlots } from '../../api/availability.api';
import useAuthStore from '../../store/authStore';
import ProfileCompletionCard from '../../components/doctor/ProfileCompletionCard';

const DoctorDashboard = () => {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [slotCount, setSlotCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, apptRes, slotsRes] = await Promise.all([
          getDoctorProfileAPI(),
          getDoctorAppointments().catch(() => ({ data: { appointments: [] } })),
          getMySlots().catch(() => ({ success: true, data: [] })),
        ]);
        
        if (profileRes.success && profileRes.data.profile) {
          setProfile(profileRes.data.profile);
        }
        setAppointments(apptRes.data?.appointments || apptRes.appointments || []);
        
        let slots = [];
        if (slotsRes) {
          if (Array.isArray(slotsRes.data)) slots = slotsRes.data;
          else if (Array.isArray(slotsRes)) slots = slotsRes;
          else if (slotsRes.success && Array.isArray(slotsRes.data?.slots)) slots = slotsRes.data.slots;
        }
        setSlotCount(slots.length);
      } catch (err) {
        console.error('Failed to load doctor dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="mt-4 text-slate-500 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  const status = profile ? profile.verificationStatus : 'unsubmitted';

  // Compute stats
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.date === today);
  const completedAppts = appointments.filter((a) => a.status === 'completed');
  const uniquePatients = new Set(completedAppts.map((a) => a.patient?._id || a.patient)).size;

  // This month earnings
  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthEarnings = completedAppts
    .filter((a) => a.date?.startsWith(thisMonth) && a.paymentStatus === 'paid')
    .reduce((sum, a) => sum + (a.doctorEarnings || 0), 0);

  const metrics = [
    {
      label: "Today's Bookings",
      value: todayAppts.length,
      icon: <Calendar size={22} />,
      bg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Patients',
      value: uniquePatients,
      icon: <Users size={22} />,
      bg: 'bg-teal-50 text-teal-600',
    },
    {
      label: 'Profile Status',
      value: null,
      statusBadge: status,
      icon: <UserCheck size={22} />,
      bg: status === 'verified' ? 'bg-emerald-50 text-emerald-600'
        : status === 'pending' ? 'bg-amber-50 text-amber-600'
        : status === 'rejected' ? 'bg-rose-50 text-rose-600'
        : 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Total Earnings',
      value: `₹${(profile?.totalEarnings || 0).toLocaleString('en-IN')}`,
      icon: <IndianRupee size={22} />,
      bg: 'bg-emerald-50 text-emerald-600',
    },
  ];

  const STATUS_BADGE = {
    verified:    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold border border-emerald-200"><ShieldCheck size={12} /> Verified</span>,
    pending:     <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200"><Clock size={12} /> Pending</span>,
    rejected:    <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold border border-rose-200"><ShieldAlert size={12} /> Rejected</span>,
    unsubmitted: <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold border border-blue-200">Unsubmitted</span>,
  };

  const APPT_STATUS_COLOR = {
    confirmed: 'text-blue-600 bg-blue-50',
    completed: 'text-green-600 bg-green-50',
    cancelled: 'text-red-600 bg-red-50',
    pending:   'text-amber-600 bg-amber-50',
  };

  return (
    <div className="space-y-8 p-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, Dr. {user?.name || 'Physiotherapist'}!
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here is what's happening with your practice today.
        </p>
      </div>

      {/* Verification Status Banners */}
      {status === 'unsubmitted' && (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shrink-0"><Sparkles size={24} /></div>
            <div>
              <h2 className="font-bold text-slate-800 text-lg">Complete Your Professional Onboarding</h2>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                To start appearing in patient search listings, receiving bookings, and accepting payments, complete your professional profile.
              </p>
            </div>
          </div>
          <Link to="/doctor/profile" className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shrink-0 self-start md:self-center">
            Onboard Now <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {status === 'pending' && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-amber-500 text-white rounded-xl shadow-md shrink-0"><Clock size={24} /></div>
          <div>
            <h2 className="font-bold text-amber-900 text-lg">Profile Verification Under Review</h2>
            <p className="text-sm text-amber-800/90 mt-1">Your documents are being reviewed. This typically takes 24–48 hours.</p>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-600 text-white rounded-xl shadow-md shrink-0"><ShieldAlert size={24} /></div>
            <div>
              <h2 className="font-bold text-rose-900 text-lg">Verification Failed</h2>
              <p className="text-sm text-rose-800 mt-1 font-medium">Reason: {profile?.rejectionReason || 'Documents were not legible or expired.'}</p>
            </div>
          </div>
          <Link to="/doctor/profile" className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shrink-0">
            Edit & Resubmit <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {status === 'verified' && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-4 shadow-sm">
          <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md shrink-0"><ShieldCheck size={24} /></div>
          <div>
            <h2 className="font-bold text-emerald-950 text-lg">Profile Verified & Active</h2>
            <p className="text-sm text-emerald-800 mt-1">You are live on Theralign. Patients can book appointments with you.</p>
          </div>
        </div>
      )}

      {/* Profile Completion Score Card */}
      <ProfileCompletionCard
        doctorProfile={profile}
        user={user}
        slotCount={slotCount}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{m.label}</span>
              <div className="mt-2">
                {m.statusBadge ? STATUS_BADGE[status] : (
                  <span className="text-2xl font-extrabold text-slate-800">{m.value}</span>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-xl ${m.bg} shrink-0`}>{m.icon}</div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">Today's Schedule</h2>
          <Link to="/doctor/appointments" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            All Appointments <ArrowRight size={12} />
          </Link>
        </div>
        {todayAppts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No appointments scheduled for today.</p>
        ) : (
          <div className="space-y-3">
            {todayAppts.map((appt) => (
              <div key={appt._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 rounded-full" style={{ backgroundColor: appt.status === 'confirmed' ? '#3B82F6' : '#10B981' }} />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{appt.patient?.name || 'Patient'}</p>
                    <p className="text-xs text-slate-500">{appt.startTime} – {appt.endTime}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full ${APPT_STATUS_COLOR[appt.status] || 'bg-slate-100 text-slate-500'}`}>
                  {appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Earnings Snapshot */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800">Earnings Snapshot</h2>
          <Link to="/doctor/earnings" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            View Earnings <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">This Month</p>
            <p className="text-2xl font-extrabold text-emerald-800 mt-1">
              ₹{thisMonthEarnings.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Average Rating</p>
            <p className="text-2xl font-extrabold text-blue-800 mt-1">
              {profile?.averageRating ? `${parseFloat(profile.averageRating).toFixed(1)}★` : 'No reviews'}
            </p>
          </div>
        </div>
      </div>

      {/* Provider Guidelines */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Theralign Provider Guidelines</h3>
        <div className="space-y-4">
          {[
            { n: 1, title: 'Provide accurate geo-coordinates', body: 'Our discovery algorithm is location-driven. Accurate coordinates ensure local patients find you first.' },
            { n: 2, title: 'Keep documents up to date', body: 'Ensure your degree and license are high-resolution PDFs. Admin reviews verify registration numbers directly.' },
            { n: 3, title: 'Keep availability slots dynamic', body: 'Setting accurate, consistent hours prevents booking cancellations and drives positive ratings.' },
          ].map(({ n, title, body }) => (
            <div key={n} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</div>
              <div>
                <p className="font-semibold text-slate-700 text-sm">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
