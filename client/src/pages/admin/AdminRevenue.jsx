import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getRevenueSeriesAPI,
  getSpecializationBreakdownAPI,
} from '../../api/analytics.api';
import RevenueChart from '../../components/admin/RevenueChart';
import MetricCard from '../../components/admin/MetricCard';
import PageHeader from '../../components/admin/PageHeader';
import PaymentsTable from '../../components/admin/PaymentsTable';

const AdminRevenue = () => {
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState('daily');
  const [specializations, setSpecializations] = useState([]);
  const [periodSummary, setPeriodSummary] = useState({ revenue: 0, commission: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [revenueRes, specRes] = await Promise.all([
        getRevenueSeriesAPI({ period: revenuePeriod }),
        getSpecializationBreakdownAPI(),
      ]);

      const series = revenueRes.data.data?.series || [];
      setRevenueSeries(series);
      setSpecializations(specRes.data.data || []);

      // Compute period summary from series
      const totalRevenue = series.reduce((s, d) => s + (d.revenue || 0), 0);
      const totalCommission = series.reduce((s, d) => s + (d.commission || 0), 0);
      setPeriodSummary({
        revenue: totalRevenue,
        commission: totalCommission,
        earnings: totalRevenue - totalCommission,
      });
    } catch {
      toast.error('Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  }, [revenuePeriod]);

  useEffect(() => { load(); }, [load]);

  const handlePeriodChange = (period) => {
    setRevenuePeriod(period);
  };

  const handleExportClick = () => {
    toast('Export feature coming soon', { icon: '📥' });
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Revenue & Payments"
        subtitle="Platform financial overview and payment analytics"
        action={
          <button
            onClick={handleExportClick}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-all border border-slate-700"
          >
            📥 Export to CSV
          </button>
        }
      />

      {/* Period Revenue Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`₹${periodSummary.revenue.toLocaleString('en-IN')}`}
          subtitle={`${revenuePeriod} period`}
          icon="💰"
          color="green"
          loading={loading}
        />
        <MetricCard
          title="Platform Commission"
          value={`₹${periodSummary.commission.toLocaleString('en-IN')}`}
          subtitle="10% retained"
          icon="📊"
          color="blue"
          loading={loading}
        />
        <MetricCard
          title="Doctor Earnings"
          value={`₹${periodSummary.earnings.toLocaleString('en-IN')}`}
          subtitle="90% distributed"
          icon="💵"
          color="purple"
          loading={loading}
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-100 mb-4 text-base">Revenue Trend</h2>
        <RevenueChart
          data={revenueSeries}
          period={revenuePeriod}
          onPeriodChange={handlePeriodChange}
        />
      </div>

      {/* Payments Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="font-semibold text-slate-100 text-base">All Payments</h2>
        </div>
        <PaymentsTable limit={10} />
      </div>

      {/* Specialization Breakdown */}
      {specializations.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800">
            <h2 className="font-semibold text-slate-100 text-base">Revenue by Specialization</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3.5">Specialization</th>
                  <th className="px-5 py-3.5 text-right">Doctors</th>
                  <th className="px-5 py-3.5 text-right">Appointments</th>
                  <th className="px-5 py-3.5 text-right">Revenue</th>
                  <th className="px-5 py-3.5 text-right">Avg Fee</th>
                </tr>
              </thead>
              <tbody>
                {specializations.map((spec, i) => (
                  <tr
                    key={i}
                    className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors"
                  >
                    <td className="px-5 py-4 text-slate-200 font-medium">{spec.specialization || '—'}</td>
                    <td className="px-5 py-4 text-right text-slate-400">{spec.doctorCount ?? '—'}</td>
                    <td className="px-5 py-4 text-right text-slate-300">{spec.appointmentCount}</td>
                    <td className="px-5 py-4 text-right text-emerald-400 font-semibold">
                      ₹{(spec.totalRevenue || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-5 py-4 text-right text-slate-400">
                      ₹{(spec.averageFee || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRevenue;
