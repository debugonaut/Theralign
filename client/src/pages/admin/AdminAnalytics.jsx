import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getRevenueSeriesAPI,
  getTopDoctorsAPI,
  getSpecializationBreakdownAPI,
} from '../../api/analytics.api';

import MetricCard from '../../components/admin/MetricCard';
import RevenueChart from '../../components/admin/RevenueChart';
import TopDoctorsTable from '../../components/admin/TopDoctorsTable';
import SectionHeader from '../../components/common/SectionHeader';
import Card from '../../components/common/Card';

const AdminAnalytics = () => {
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState('daily');
  const [topDoctors, setTopDoctors] = useState([]);
  const [topDoctorMetric, setTopDoctorMetric] = useState('earnings');
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Computed secondary metrics for the planning overview
  const [summaryMetrics, setSummaryMetrics] = useState({
    avgRevenue: 0,
    highestRevenue: 0,
    lowestRevenue: 999999,
  });

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const [revenueRes, topDoctorsRes, specRes] = await Promise.all([
        getRevenueSeriesAPI({ period: revenuePeriod }),
        getTopDoctorsAPI({ limit: 10, metric: topDoctorMetric }),
        getSpecializationBreakdownAPI(),
      ]);

      const series = revenueRes.data?.data?.series || revenueRes.data?.series || [];
      setRevenueSeries(series);
      setTopDoctors(topDoctorsRes.data?.data?.doctors || topDoctorsRes.data?.doctors || []);
      setSpecializations(specRes.data?.data || specRes.data || []);

      // Calculate secondary metrics from the series
      if (series.length > 0) {
        const revenues = series.map((s) => s.revenue || 0);
        const sum = revenues.reduce((a, b) => a + b, 0);
        const avg = Math.round(sum / series.length);
        const max = Math.max(...revenues);
        const min = Math.min(...revenues);
        
        setSummaryMetrics({
          avgRevenue: avg,
          highestRevenue: max,
          lowestRevenue: min === 999999 ? 0 : min,
        });
      }
    } catch (err) {
      toast.error('Failed to load platform planning analytics data');
    } finally {
      setLoading(false);
    }
  }, [revenuePeriod, topDoctorMetric]);

  useEffect(() => {
    document.title = 'Analytics & Planning — Theralign';
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const handlePeriodChange = (period) => {
    setRevenuePeriod(period);
  };

  const handleTopDoctorMetricChange = (metric) => {
    setTopDoctorMetric(metric);
  };

  // Compute specialization percentages
  const totalAppointments = specializations.reduce((s, spec) => s + (spec.appointmentCount || 0), 0);
  const specsWithPercentages = specializations.map((spec) => {
    const pct = totalAppointments > 0 ? ((spec.appointmentCount || 0) / totalAppointments) * 100 : 0;
    return {
      ...spec,
      pct: Math.round(pct),
    };
  });

  return (
    <div className="space-y-8 select-none text-neutral-900">
      {/* Page Title */}
      <SectionHeader
        title="ANALYTICS & PLANNING"
        subtitle="LONG-TERM DEMAND MODELING, SPECIALIZATION TRACTION, AND REVENUE FLOW STABILITY AUDITS."
      />

      {/* Revenue Section: Full Width Chart */}
      <div className="space-y-6">
        <RevenueChart
          data={revenueSeries}
          period={revenuePeriod}
          onPeriodChange={handlePeriodChange}
        />

        {/* Secondary Context metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard
            title="Average Period Revenue"
            value={`₹${summaryMetrics.avgRevenue.toLocaleString('en-IN')}`}
            subtitle={`Average intake per ${revenuePeriod} slice`}
            loading={loading}
          />
          <MetricCard
            title="Highest Revenue Single Slice"
            value={`₹${summaryMetrics.highestRevenue.toLocaleString('en-IN')}`}
            subtitle="Maximum generated platform slice"
            loading={loading}
          />
          <MetricCard
            title="Lowest Revenue Single Slice"
            value={`₹${summaryMetrics.lowestRevenue.toLocaleString('en-IN')}`}
            subtitle="Minimum recorded platform slice"
            loading={loading}
          />
        </div>
      </div>

      {/* Leaderboard Section */}
      <div>
        <TopDoctorsTable
          doctors={topDoctors}
          metric={topDoctorMetric}
          onMetricChange={handleTopDoctorMetricChange}
        />
      </div>

      {/* Specialization Breakdown: 3:9 Asymmetric Layout */}
      {specializations.length > 0 && (
        <div className="bg-white border-2 border-neutral-900 p-6 rounded-none shadow-none text-left">
          {/* Section Heading */}
          <div className="pb-4 border-b border-neutral-200 mb-6">
            <span className="text-sm font-medium text-neutral-500 uppercase tracking-widest block mb-1">
              MARKET PENETRATION INDEX
            </span>
            <h3 className="text-ui-lg font-medium text-neutral-900 uppercase tracking-tight">
              SPECIALIZATION POPULARITY INDEX
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 4 Columns: Stacking specialization names as bordered rows */}
            <div className="lg:col-span-4 border-r-0 lg:border-r-2 border-neutral-200 pr-0 lg:pr-6 space-y-3">
              <span className="text-sm font-semibold text-neutral-500 uppercase tracking-widest block pb-2 border-b border-swiss-gray-250">
                SPECIALIZATION / FRACTION
              </span>
              <div className="flex flex-col border border-neutral-900 divide-y border-collapse">
                {specsWithPercentages.map((spec) => (
                  <div 
                    key={spec.specialization} 
                    className="flex justify-between items-center p-3 bg-neutral-50 text-sm font-medium"
                  >
                    <span className="uppercase tracking-wider text-neutral-900 truncate mr-2">
                      {spec.specialization || 'GENERAL'}
                    </span>
                    <span className="text-accent font-semibold shrink-0">
                      {spec.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 8 Columns: Horizontal bar chart proportional block rects */}
            <div className="lg:col-span-8 space-y-4">
              <span className="text-sm font-semibold text-neutral-500 uppercase tracking-widest block pb-2 border-b border-swiss-gray-250">
                PROPORTIONAL SESSIONS DISTRIBUTION
              </span>
              <div className="space-y-4">
                {specsWithPercentages.map((spec) => {
                  const specName = spec.specialization || 'GENERAL';
                  return (
                    <div key={specName} className="space-y-1 text-left">
                      {/* Label above */}
                      <div className="flex justify-between items-center text-sm font-semibold uppercase text-neutral-500 tracking-wider">
                        <span>{specName}</span>
                        <span className="font-mono">{spec.appointmentCount || 0} APPOINTMENTS</span>
                      </div>

                      {/* Proportional black rectangular bar on gray track */}
                      <div className="w-full h-8 bg-neutral-100 border border-neutral-900 rounded-none overflow-hidden relative max-w-[1200px]">
                        <div 
                          className="h-full bg-neutral-900 transition-all duration-fast rounded-none"
                          style={{ width: `${Math.max(4, spec.pct)}%` }}
                        />
                      </div>

                      {/* Label below */}
                      <div className="text-sm font-medium text-neutral-500 uppercase tracking-widest pt-0.5">
                        {specName} INDEPENDENT PLATFORM SHARE ({spec.pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;
