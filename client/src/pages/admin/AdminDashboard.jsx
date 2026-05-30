import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getPlatformOverviewAPI,
  getRevenueSeriesAPI,
  getAppointmentBreakdownAPI,
  getRecentActivityAPI,
} from '../../api/analytics.api';

import MetricCard from '../../components/admin/MetricCard';
import RevenueChart from '../../components/admin/RevenueChart';
import AppointmentDonutChart from '../../components/admin/AppointmentDonutChart';
import RecentActivityFeed from '../../components/admin/RecentActivityFeed';
import SectionHeader from '../../components/common/SectionHeader';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [appointmentBreakdown, setAppointmentBreakdown] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState('daily');

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, revenueRes, appointmentRes, activityRes] =
        await Promise.all([
          getPlatformOverviewAPI(),
          getRevenueSeriesAPI({ period: revenuePeriod }),
          getAppointmentBreakdownAPI(),
          getRecentActivityAPI({ limit: 15 }),
        ]);

      setOverview(overviewRes.data?.data || overviewRes.data || {});
      setRevenueSeries(revenueRes.data?.data?.series || revenueRes.data?.series || []);
      setAppointmentBreakdown(appointmentRes.data?.data || appointmentRes.data || []);
      setRecentActivity(activityRes.data?.data?.activity || activityRes.data?.activity || []);
    } catch (err) {
      toast.error('Failed to load dashboard operations data');
    } finally {
      setLoading(false);
    }
  }, [revenuePeriod]);

  useEffect(() => {
    document.title = 'System Overview — PhysioConnect';
    loadDashboard();
  }, []);

  const handlePeriodChange = async (period) => {
    setRevenuePeriod(period);
    try {
      const res = await getRevenueSeriesAPI({ period });
      setRevenueSeries(res.data?.data?.series || res.data?.series || []);
    } catch {
      toast.error('Failed to load revenue data');
    }
  };

  // Swiss dense 2x4 metric cards
  const metricCards = [
    {
      title: 'Total Revenue',
      value: `₹${(overview?.totalRevenue || 0).toLocaleString('en-IN')}`,
      subtitle: 'from paid appointments',
    },
    {
      title: 'Platform Commission',
      value: `₹${(overview?.totalCommission || 0).toLocaleString('en-IN')}`,
      subtitle: '10% of total revenue',
    },
    {
      title: 'Pending Verification',
      value: overview?.pendingVerification || 0,
      subtitle: 'clinicians awaiting review',
    },
    {
      title: 'Verified Doctors',
      value: overview?.verifiedDoctors || 0,
      subtitle: `${overview?.totalDoctors || 0} registered total`,
    },
    {
      title: 'Total Users',
      value: overview?.totalUsers || 0,
      subtitle: `${overview?.totalPatients || 0} patients · ${overview?.totalDoctors || 0} doctors`,
    },
    {
      title: 'Total Appointments',
      value: overview?.totalAppointments || 0,
      subtitle: `${overview?.completedAppointments || 0} completed sessions`,
    },
    {
      title: 'Cancelled Appointments',
      value: overview?.cancelledAppointments || 0,
      subtitle: 'appointments cancelled',
    },
    {
      title: 'Doctor Earnings',
      value: `₹${(overview?.totalDoctorEarnings || 0).toLocaleString('en-IN')}`,
      subtitle: '90% passed to doctors',
    },
  ];

  return (
    <div className="space-y-12 select-none text-swiss-black">
      {/* Platform Header */}
      <SectionHeader
        title="SYSTEM OVERVIEW"
        subtitle="REAL-TIME OPERATIONS CONTROL CENTER & PLATFORM HEALTH INDEX."
      />

      {/* Metric Cards Grid — 2x4 row structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card) => (
          <MetricCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts Row - 6:6 split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueChart
          data={revenueSeries}
          period={revenuePeriod}
          onPeriodChange={handlePeriodChange}
        />
        <AppointmentDonutChart data={appointmentBreakdown} />
      </div>

      {/* Recent Activity full-width row */}
      <div>
        <RecentActivityFeed activity={recentActivity} loading={loading} />
      </div>
    </div>
  );
};

export default AdminDashboard;
