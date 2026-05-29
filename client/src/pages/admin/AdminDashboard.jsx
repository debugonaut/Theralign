import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getPlatformOverviewAPI,
  getRevenueSeriesAPI,
  getAppointmentBreakdownAPI,
  getTopDoctorsAPI,
  getRecentActivityAPI,
} from '../../api/analytics.api';

import MetricCard from '../../components/admin/MetricCard';
import RevenueChart from '../../components/admin/RevenueChart';
import AppointmentDonutChart from '../../components/admin/AppointmentDonutChart';
import RecentActivityFeed from '../../components/admin/RecentActivityFeed';
import TopDoctorsTable from '../../components/admin/TopDoctorsTable';
import PageHeader from '../../components/admin/PageHeader';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [appointmentBreakdown, setAppointmentBreakdown] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState('daily');
  const [topDoctorMetric, setTopDoctorMetric] = useState('earnings');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, revenueRes, appointmentRes, activityRes, topDoctorsRes] =
        await Promise.all([
          getPlatformOverviewAPI(),
          getRevenueSeriesAPI({ period: revenuePeriod }),
          getAppointmentBreakdownAPI(),
          getRecentActivityAPI({ limit: 15 }),
          getTopDoctorsAPI({ limit: 5, metric: topDoctorMetric }),
        ]);

      setOverview(overviewRes.data.data);
      setRevenueSeries(revenueRes.data.data?.series || []);
      setAppointmentBreakdown(appointmentRes.data.data || []);
      setRecentActivity(activityRes.data.data?.activity || []);
      setTopDoctors(topDoctorsRes.data.data?.doctors || []);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [revenuePeriod, topDoctorMetric]);

  useEffect(() => {
    document.title = 'Admin Panel — PhysioConnect';
    loadDashboard();
  }, []);

  const handlePeriodChange = async (period) => {
    setRevenuePeriod(period);
    try {
      const res = await getRevenueSeriesAPI({ period });
      setRevenueSeries(res.data.data?.series || []);
    } catch {
      toast.error('Failed to load revenue data');
    }
  };

  const handleTopDoctorMetricChange = async (metric) => {
    setTopDoctorMetric(metric);
    try {
      const res = await getTopDoctorsAPI({ limit: 5, metric });
      setTopDoctors(res.data.data?.doctors || []);
    } catch {
      toast.error('Failed to load doctor rankings');
    }
  };

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `₹${(overview?.totalRevenue || 0).toLocaleString('en-IN')}`,
      subtitle: 'from paid appointments',
      icon: '💰',
      color: 'green',
    },
    {
      title: 'Platform Commission',
      value: `₹${(overview?.totalCommission || 0).toLocaleString('en-IN')}`,
      subtitle: '10% of total revenue',
      icon: '📊',
      color: 'blue',
    },
    {
      title: 'Total Users',
      value: overview?.totalUsers || 0,
      subtitle: `${overview?.totalPatients || 0} patients · ${overview?.totalDoctors || 0} doctors`,
      icon: '👥',
      color: 'purple',
    },
    {
      title: 'Verified Doctors',
      value: overview?.verifiedDoctors || 0,
      subtitle: `${overview?.pendingVerification || 0} pending review`,
      icon: '🩺',
      color: 'blue',
    },
    {
      title: 'Total Appointments',
      value: overview?.totalAppointments || 0,
      subtitle: `${overview?.completedAppointments || 0} completed`,
      icon: '📅',
      color: 'amber',
    },
    {
      title: 'Cancelled',
      value: overview?.cancelledAppointments || 0,
      subtitle: 'appointments cancelled',
      icon: '❌',
      color: 'red',
    },
    {
      title: 'Total Reviews',
      value: overview?.totalReviews || 0,
      subtitle: `avg ${(overview?.averagePlatformRating || 0).toFixed(1)} platform rating`,
      icon: '⭐',
      color: 'amber',
    },
    {
      title: 'Doctor Earnings',
      value: `₹${(overview?.totalDoctorEarnings || 0).toLocaleString('en-IN')}`,
      subtitle: '90% passed to doctors',
      icon: '💵',
      color: 'green',
    },
  ];

  return (
    <div className="p-6 space-y-6 select-none">
      <PageHeader
        title="Platform Overview"
        subtitle={`Last updated: ${new Date().toLocaleString('en-IN')}`}
      />

      {/* Metric Cards Grid — 4 columns desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => (
          <MetricCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-100 mb-4 text-base">Revenue Trend</h2>
          <RevenueChart
            data={revenueSeries}
            period={revenuePeriod}
            onPeriodChange={handlePeriodChange}
          />
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-100 mb-2 text-base">Appointments</h2>
          <AppointmentDonutChart data={appointmentBreakdown} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-100 mb-4 text-base">Top Doctors</h2>
          <TopDoctorsTable
            doctors={topDoctors}
            metric={topDoctorMetric}
            onMetricChange={handleTopDoctorMetricChange}
          />
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-100 mb-4 text-base">Recent Activity</h2>
          <RecentActivityFeed activity={recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
