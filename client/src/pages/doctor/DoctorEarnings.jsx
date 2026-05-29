import React, { useState, useEffect } from 'react';
import { IndianRupee, Stethoscope, TrendingUp, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDoctorAppointments } from '../../api/appointment.api';

const DoctorEarnings = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDoctorAppointments();
        const all = res.data?.appointments || res.appointments || [];
        // Only completed + paid appointments matter for earnings
        const paid = all.filter((a) => a.status === 'completed' && a.paymentStatus === 'paid');
        setAppointments(paid);
      } catch {
        toast.error('Failed to load earnings data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Top-level metrics
  const totalEarnings = appointments.reduce((sum, a) => sum + (a.doctorEarnings || 0), 0);
  const totalSessions = appointments.length;
  const avgPerSession = totalSessions > 0 ? totalEarnings / totalSessions : 0;

  // Group by month — YYYY-MM
  const monthlyMap = {};
  for (const appt of appointments) {
    const month = appt.date?.slice(0, 7) || 'Unknown';
    if (!monthlyMap[month]) monthlyMap[month] = { sessions: 0, grossFee: 0, commission: 0, earnings: 0 };
    monthlyMap[month].sessions++;
    monthlyMap[month].grossFee += appt.consultationFee || 0;
    monthlyMap[month].commission += appt.platformCommission || 0;
    monthlyMap[month].earnings += appt.doctorEarnings || 0;
  }
  const monthlyBreakdown = Object.entries(monthlyMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, data]) => ({ month, ...data }));

  // Recent 10 paid sessions
  const recentPayments = [...appointments]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);

  const formatMonth = (m) => {
    if (!m || m === 'Unknown') return m;
    const [year, month] = m.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  };

  const metricCards = [
    {
      label: 'Total Earnings',
      value: `₹${totalEarnings.toLocaleString('en-IN')}`,
      icon: <IndianRupee size={20} />,
      bg: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Total Sessions',
      value: totalSessions,
      icon: <Stethoscope size={20} />,
      bg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Avg per Session',
      value: `₹${Math.round(avgPerSession).toLocaleString('en-IN')}`,
      icon: <TrendingUp size={20} />,
      bg: 'bg-purple-50 text-purple-600',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        <p className="mt-4 text-slate-500 font-medium">Loading earnings data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <IndianRupee className="text-emerald-600" size={26} />
          Earnings Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Your financial performance from completed consultations.
        </p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metricCards.map((m) => (
          <div key={m.label} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{m.label}</span>
              <span className="text-2xl font-extrabold text-slate-800 mt-1.5 block">{m.value}</span>
            </div>
            <div className={`p-3 rounded-xl ${m.bg}`}>{m.icon}</div>
          </div>
        ))}
      </div>

      {/* Monthly Breakdown */}
      {monthlyBreakdown.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Monthly Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider bg-slate-50">
                  <th className="px-6 py-3.5">Month</th>
                  <th className="px-6 py-3.5 text-right">Sessions</th>
                  <th className="px-6 py-3.5 text-right">Gross Fee</th>
                  <th className="px-6 py-3.5 text-right">Commission (10%)</th>
                  <th className="px-6 py-3.5 text-right">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {monthlyBreakdown.map((row) => (
                  <tr key={row.month} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700">{formatMonth(row.month)}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{row.sessions}</td>
                    <td className="px-6 py-4 text-right text-slate-600">₹{row.grossFee.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-rose-500">₹{row.commission.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-bold">₹{row.earnings.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Payments */}
      {recentPayments.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">Recent Sessions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs uppercase tracking-wider bg-slate-50">
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5 text-right">Fee</th>
                  <th className="px-6 py-3.5 text-right">Your Earnings</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((appt) => (
                  <tr key={appt._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-slate-600">{appt.date}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {/* Show first name only for privacy */}
                      {appt.patient?.name?.split(' ')[0] || 'Patient'}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">₹{(appt.consultationFee || 0).toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4 text-right text-emerald-600 font-bold">₹{(appt.doctorEarnings || 0).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
          <Calendar size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700">No Earnings Yet</h3>
          <p className="text-slate-400 text-sm mt-1">Complete appointments will appear here once payments are processed.</p>
        </div>
      )}
    </div>
  );
};

export default DoctorEarnings;
