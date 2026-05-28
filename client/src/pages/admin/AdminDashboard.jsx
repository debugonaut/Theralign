import React, { useState } from 'react';
import { Calendar, DollarSign, Users, Award, ShieldAlert, TrendingUp } from 'lucide-react';
import AppointmentsTable from '../../components/admin/AppointmentsTable';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({ totalCount: 0, totalPlatformCommission: 0 });

  const handleMetricsFetched = ({ totalCount, totalPlatformCommission }) => {
    setMetrics({ totalCount, totalPlatformCommission });
  };

  return (
    <div className="p-8 space-y-8 select-none">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="text-primary" size={24} />
          System Overview Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor platform performance, track operational booking pipelines, and review consolidated commission earnings.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Metric 1: Total Appointments */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Appointments
            </span>
            <span className="text-3xl font-extrabold text-slate-100 mt-2 block">
              {metrics.totalCount}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              across all statuses
            </span>
          </div>
          <div className="p-4 bg-primary/10 text-primary border border-primary/20 rounded-2xl">
            <Calendar size={24} />
          </div>
        </div>

        {/* Metric 2: Platform Earnings */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Platform Earnings
            </span>
            <span className="text-3xl font-extrabold text-primary mt-2 block">
              ₹{metrics.totalPlatformCommission}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              from completed consultations
            </span>
          </div>
          <div className="p-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl">
            <DollarSign size={24} />
          </div>
        </div>

        {/* Metric 3: Active Growth */}
        <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Platform Status
            </span>
            <span className="text-3xl font-extrabold text-slate-100 mt-2 block flex items-center gap-1.5">
              100% <span className="text-xs font-extrabold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5"><TrendingUp size={10} /> Active</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-1 block">
              operational systems healthy
            </span>
          </div>
          <div className="p-4 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-2xl">
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* Main Table Preview Section */}
      <AppointmentsTable limit={5} onMetricsFetched={handleMetricsFetched} />
    </div>
  );
};

export default AdminDashboard;
