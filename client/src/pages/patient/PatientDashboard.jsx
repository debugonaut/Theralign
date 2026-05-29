import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, Clock, Star, ArrowRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { getMyAppointments } from '../../api/appointment.api';

const PatientDashboard = () => {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMyAppointments();
        setAppointments(res.data?.appointments || res.appointments || []);
      } catch {
        // No toast — graceful empty state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats
  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const upcoming = appointments.filter((a) => a.status === 'confirmed').length;
  const reviewsGiven = appointments.filter((a) => a.reviewSubmitted).length;

  // Next 2 upcoming appointments
  const upcomingAppts = appointments
    .filter((a) => a.status === 'confirmed')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 2);

  const STATUS_COLORS = {
    confirmed:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
    completed:  'bg-green-500/10 text-green-400 border-green-500/20',
    cancelled:  'bg-red-500/10 text-red-400 border-red-500/20',
    pending:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const metrics = [
    {
      label: 'Total Appointments',
      value: loading ? '—' : total,
      icon: <Calendar size={20} />,
      bg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Upcoming',
      value: loading ? '—' : upcoming,
      icon: <Clock size={20} />,
      bg: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Completed',
      value: loading ? '—' : completed,
      icon: <CheckCircle size={20} />,
      bg: 'bg-green-50 text-green-600',
    },
    {
      label: 'Reviews Given',
      value: loading ? '—' : reviewsGiven,
      icon: <Star size={20} />,
      bg: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Welcome back, {user?.name || 'Patient'}!
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here's a summary of your health journey on Theralign.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                {m.label}
              </span>
              <span className="text-3xl font-extrabold text-slate-800 mt-1.5 block">
                {m.value}
              </span>
            </div>
            <div className={`p-3 rounded-xl ${m.bg}`}>{m.icon}</div>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments Preview */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-800 text-base">Upcoming Appointments</h2>
          <Link
            to="/patient/appointments"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : upcomingAppts.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">No upcoming appointments.</p>
            <Link
              to="/doctors"
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              Find a doctor <ArrowRight size={12} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppts.map((appt) => (
              <div
                key={appt._id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    Dr. {appt.doctor?.user?.name || '—'}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {Array.isArray(appt.doctor?.specialization)
                      ? appt.doctor.specialization[0]
                      : appt.doctor?.specialization || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-700">
                    {appt.date} · {appt.startTime}
                  </p>
                  <span className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded-full border mt-1 inline-block ${STATUS_COLORS[appt.status] || 'bg-slate-100 text-slate-500'}`}>
                    {appt.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/doctors"
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg hover:opacity-90 transition-all"
        >
          <div className="p-3 bg-white/20 rounded-xl">
            <Search size={22} />
          </div>
          <div>
            <p className="font-bold">Find a Doctor</p>
            <p className="text-blue-100 text-sm mt-0.5">Search physiotherapists near you</p>
          </div>
          <ArrowRight size={20} className="ml-auto" />
        </Link>

        <Link
          to="/patient/appointments"
          className="flex items-center gap-4 p-5 bg-white border border-slate-200 text-slate-700 rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
            <Calendar size={22} />
          </div>
          <div>
            <p className="font-bold text-slate-800">My Appointments</p>
            <p className="text-slate-500 text-sm mt-0.5">View booking history</p>
          </div>
          <ArrowRight size={20} className="ml-auto text-slate-400" />
        </Link>
      </div>
    </div>
  );
};

export default PatientDashboard;
