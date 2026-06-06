import React, { useState } from 'react';
import PageHeader from '../../components/admin/PageHeader';
import MetricCard from '../../components/admin/MetricCard';
import PaymentsTable from '../../components/admin/PaymentsTable';
import SectionHeader from '../../components/common/SectionHeader';

const AdminRevenue = () => {
  const [aggregates, setAggregates] = useState({
    revenue: 0,
    commission: 0,
    earnings: 0,
  });

  const handleRevenueAggregates = (agg) => {
    setAggregates(agg);
  };

  return (
    <div className="space-y-8 select-none text-neutral-900 bg-white">
      {/* Page Title */}
      <SectionHeader
        title="REVENUE"
        subtitle="PLATFORM TRANSACTION LEDGER, COMMISSION SPLITS, AND PAYOUT RECONCILIATIONS."
      />

      {/* 1x3 Metric Cards Row representing calculations arithmetic */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₹${aggregates.revenue.toLocaleString('en-IN')}`}
          subtitle="gross platform transactions value"
          loading={false}
        />
        <MetricCard
          title="Platform Commission (10%)"
          value={`₹${aggregates.commission.toLocaleString('en-IN')}`}
          subtitle="platform service commission cut"
          loading={false}
        />
        <MetricCard
          title="Doctor Payouts (90%)"
          value={`₹${aggregates.earnings.toLocaleString('en-IN')}`}
          subtitle="net clinical payouts distributed"
          loading={false}
        />
      </div>

      {/* Thin horizontal rule separator */}
      <div className="w-full bg-neutral-200 max-w-[1200px]" style={{ height: '2px' }} />

      {/* Payments Ledger Table with built-in filter controls */}
      <div>
        <PaymentsTable onRevenueAggregates={handleRevenueAggregates} />
      </div>
    </div>
  );
};

export default AdminRevenue;
