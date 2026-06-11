import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getPlatformOverviewAPI,
  getRevenueSeriesAPI,
  getAppointmentBreakdownAPI,
  getRecentActivityAPI,
  getServerHealthAPI,
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
  const [serverWarm, setServerWarm] = useState(null); // 'warm' | 'warming'

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
    document.title = 'System Overview — Theralign';
    loadDashboard();

    const pollDashboardSilent = async () => {
      try {
        const [overviewRes, activityRes] = await Promise.all([
          getPlatformOverviewAPI(),
          getRecentActivityAPI({ limit: 15 }),
        ]);
        setOverview(overviewRes.data?.data || overviewRes.data || {});
        setRecentActivity(activityRes.data?.data?.activity || activityRes.data?.activity || []);
      } catch (err) {
        console.error('Failed to silently poll dashboard updates', err);
      }
    };

    const checkServerHealth = async () => {
      try {
        const startTime = performance.now();
        await getServerHealthAPI();
        const endTime = performance.now();
        const responseTime = endTime - startTime;
        if (responseTime < 500) {
          setServerWarm('warm');
        } else {
          setServerWarm('warming');
        }
      } catch (err) {
        setServerWarm('warming');
      }
    };

    // Run health check initially
    checkServerHealth();

    const intervalId = setInterval(() => {
      pollDashboardSilent();
      checkServerHealth();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [loadDashboard]);

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
    <div className="space-y-8 select-none text-neutral-900 relative">
      {/* Server Health Status Chip in top-right */}
      {serverWarm && (
        <div className="absolute top-0 right-0 z-10">
          {serverWarm === 'warm' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 border border-teal-200 text-teal-700 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm animate-fade-in">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
              SERVER WARM
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm animate-fade-in">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
              WARMING UP
            </span>
          )}
        </div>
      )}

      {/* Platform Header */}
      <div className="pr-32">
        <SectionHeader
          title="SYSTEM OVERVIEW"
          subtitle="REAL-TIME OPERATIONS CONTROL CENTER & PLATFORM HEALTH INDEX."
        />
      </div>

      {/* Metric Cards Grid — 2x4 row structure */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((card) => (
          <MetricCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* Charts Row - 6:6 split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
