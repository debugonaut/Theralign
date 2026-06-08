import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDoctorAppointments } from '../../api/appointment.api';
import SectionHeader from '../../components/common/SectionHeader';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const DoctorEarnings = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const getRefundState = (appointment) => {
    if (!appointment) return 'not_initiated';

    if (
      appointment.payment?.refundStatus === 'approved' ||
      appointment.payment?.refundStatus === 'processed' ||
      appointment.payment?.status === 'refunded' ||
      appointment.paymentStatus === 'refunded'
    ) {
      return 'approved';
    }

    if (
      appointment.payment?.refundStatus === 'pending' ||
      appointment.payment?.refundStatus === 'requested'
    ) {
      return 'initiated';
    }

    if (appointment.payment?.refundStatus === 'rejected') {
      return 'cancel';
    }

    return 'not_initiated';
  };

  useEffect(() => {
    document.title = 'EARNINGS — Theralign';
    const fetchData = async () => {
      try {
        const res = await getDoctorAppointments();
        const all = res.data?.appointments || res.data || res.appointments || [];
        // Only paid or refunded appointments reflect in payment history
        const paid = all.filter((a) => a.paymentStatus === 'paid' || a.paymentStatus === 'refunded');
        setAppointments(paid);
      } catch (err) {
        console.error(err);
        toast.error('FAILED TO FETCH EARNINGS RECORDS.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter for metrics: only completed, paid (not refunded) appointments reflect in actual lifetime stats
  const completedPaid = appointments.filter(
    (a) =>
      a.status === 'completed' &&
      (a.paymentStatus === 'paid' || a.paymentStatus === 'refunded') &&
      !['approved', 'processed'].includes(a.payment?.refundStatus) &&
      a.payment?.status !== 'refunded'
  );

  // Basic stats
  const totalEarnings = completedPaid.reduce((sum, a) => sum + (a.doctorEarnings || 0), 0);
  const totalSessions = completedPaid.length;
  const avgPerSession = totalSessions > 0 ? totalEarnings / totalSessions : 0;

  // Group by Month — YYYY-MM
  const monthlyMap = {};
  for (const appt of completedPaid) {
    const month = appt.date?.slice(0, 7) || 'Unknown';
    if (!monthlyMap[month]) {
      monthlyMap[month] = { sessions: 0, grossFee: 0, commission: 0, earnings: 0 };
    }
    monthlyMap[month].sessions++;
    monthlyMap[month].grossFee += appt.consultationFee || 0;
    monthlyMap[month].commission += appt.platformCommission || 0;
    monthlyMap[month].earnings += appt.doctorEarnings || 0;
  }

  const monthlyBreakdown = Object.entries(monthlyMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, data]) => ({ month, ...data }));

  // Month-over-month calculation for Current Month vs Previous Month
  const currentMonthKey = new Date().toISOString().slice(0, 7); // YYYY-MM
  
  // Previous month key
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonthKey = prevDate.toISOString().slice(0, 7);

  const currentMonthEarnings = monthlyMap[currentMonthKey]?.earnings || 0;
  const prevMonthEarnings = monthlyMap[prevMonthKey]?.earnings || 0;
  const diffEarnings = currentMonthEarnings - prevMonthEarnings;
  const isPositiveDiff = diffEarnings >= 0;

  // Pagination for Recent Transactions
  const sortedPayments = [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date));
  const totalPages = Math.ceil(sortedPayments.length / limit) || 1;
  const startIndex = (currentPage - 1) * limit;
  const paginatedPayments = sortedPayments.slice(startIndex, startIndex + limit);

  const formatMonth = (m) => {
    if (!m || m === 'Unknown') return m;
    const [year, month] = m.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString('en-IN', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const formatTransactionDate = (dateStr) => {
    try {
      return new Date(dateStr + 'T00:00:00')
        .toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        .toUpperCase();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-5 select-none text-left bg-white">
      
      {/* ── Page Header Section ── */}
      <SectionHeader title="EARNINGS" size="lg" ruled={true} className="mb-0" />

      {appointments.length === 0 && !loading ? (
        <div className="py-6 bg-white select-none">
          <EmptyState
            title="NO EARNINGS YET"
            description="Complete your first appointments to see your earnings here."
            action={() => navigate('/doctor/availability')}
            actionLabel="MANAGE AVAILABILITY →"
          />
        </div>
      ) : (
        <>
          {/* ── Top Metrics Row (3x1 Grid) ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Total Earnings */}
            <div className="p-6 bg-white border border-neutral-200/40 rounded-lg shadow-level-1 hover:shadow-level-2 transition-warm flex flex-col justify-between h-32 select-none">
              <div>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                  TOTAL EARNINGS
                </span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-1">
                  LIFETIME EARNINGS
                </span>
              </div>
              <div className="flex items-baseline select-none">
                <span className="text-ui-xl text-neutral-900 font-medium mr-1 select-none">₹</span>
                <span className="text-display-xs font-black text-neutral-900 select-none leading-none block">
                  {totalEarnings.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* This Month's Earnings (With MoM green/amber comparison text) */}
            <div className="p-6 bg-white border border-neutral-200/40 rounded-lg shadow-level-1 hover:shadow-level-2 transition-warm flex flex-col justify-between h-32 select-none">
              <div>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                  THIS MONTH
                </span>
                {diffEarnings !== 0 ? (
                  isPositiveDiff ? (
                    <span className="text-[10px] text-success font-black uppercase tracking-wider block mt-1 select-none">
                      +₹{diffEarnings.toLocaleString('en-IN')} FROM LAST MONTH
                    </span>
                  ) : (
                    <span className="text-[10px] text-warning font-black uppercase tracking-wider block mt-1 select-none">
                      ↓₹{Math.abs(diffEarnings).toLocaleString('en-IN')} FROM LAST MONTH
                    </span>
                  )
                ) : (
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-1">
                    CURRENT MONTH
                  </span>
                )}
              </div>
              <div className="flex items-baseline select-none">
                <span className="text-ui-xl text-neutral-900 font-medium mr-1 select-none">₹</span>
                <span className="text-display-xs font-black text-neutral-900 select-none leading-none block">
                  {currentMonthEarnings.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Average Per Session */}
            <div className="p-6 bg-white border border-neutral-200/40 rounded-lg shadow-level-1 hover:shadow-level-2 transition-warm flex flex-col justify-between h-32 select-none">
              <div>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                  AVERAGE PER SESSION
                </span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-1">
                  PER SESSION AVG
                </span>
              </div>
              <div className="flex items-baseline select-none">
                <span className="text-ui-xl text-neutral-900 font-medium mr-1 select-none">₹</span>
                <span className="text-display-xs font-black text-neutral-900 select-none leading-none block">
                  {Math.round(avgPerSession).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

          </div>

          {/* ── Monthly Breakdown Section ── */}
          <div className="flex flex-col gap-6 select-none">
            <SectionHeader title="MONTHLY BREAKDOWN" size="sm" ruled={true} className="mb-0" />
            
            <div className="w-full overflow-hidden border border-neutral-200/50 rounded-lg shadow-level-1 bg-white select-none max-w-[1200px]">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest">MONTH</th>
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest text-center">SESSIONS</th>
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest text-right">GROSS FEE</th>
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest text-right">PLATFORM FEE (10%)</th>
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-ui-sm tracking-widest text-right">YOUR EARNINGS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {monthlyBreakdown.map((row) => {
                    const isCurrentMonthRow = row.month === currentMonthKey;
                    return (
                       <tr
                        key={row.month}
                        className={`h-12 hover:bg-neutral-50 transition-colors duration-fast select-none
                          ${isCurrentMonthRow ? 'border-l-4 border-[#0A7E6E]' : ''}
                        `}
                      >
                        <td className="px-6 py-3 text-ui-sm font-black text-neutral-900 uppercase">
                          {formatMonth(row.month)}
                        </td>
                        <td className="px-6 py-3 text-center text-ui-md font-bold text-neutral-900">
                          {row.sessions}
                        </td>
                        <td className="px-6 py-3 text-right text-ui-md font-bold text-neutral-900">
                          ₹{row.grossFee.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-3 text-right text-ui-md font-bold text-neutral-900">
                          ₹{row.commission.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-3 text-right text-ui-md font-black text-neutral-900">
                          ₹{row.earnings.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Recent Transactions Section ── */}
          <div className="flex flex-col gap-6 select-none">
            <SectionHeader title="RECENT TRANSACTIONS" size="sm" ruled={true} className="mb-0" />
            
            <div className="w-full overflow-hidden border border-neutral-200/50 rounded-lg shadow-level-1 bg-white select-none max-w-[1200px]">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest">DATE</th>
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest">PATIENT</th>
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest text-right">SESSION FEE</th>
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest text-right">PLATFORM FEE</th>
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest text-right">YOUR EARNING</th>
                    <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {paginatedPayments.map((appt) => {
                    const patientName = appt.patient?.name || 'Patient';
                    const firstName = patientName.split(' ')[0];
                    const lastName = patientName.split(' ')[1] || '';
                    const initial = lastName ? ` ${lastName[0].toUpperCase()}.` : '';
                    const displayName = `${firstName}${initial}`;
                    const refundState = getRefundState(appt);

                    return (
                      <tr key={appt._id} className="h-12 hover:bg-neutral-50 transition-colors duration-fast select-none">
                        <td className="px-6 py-3 text-ui-xs font-bold text-neutral-500 uppercase tracking-widest">
                          {formatTransactionDate(appt.date)}
                        </td>
                        <td className="px-6 py-3 text-ui-sm font-black text-neutral-900 uppercase">
                          {displayName.toUpperCase()}
                        </td>
                        <td className="px-6 py-3 text-right text-ui-md font-bold text-neutral-900">
                          ₹{(appt.consultationFee || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-3 text-right text-ui-sm font-bold text-neutral-500">
                          ₹{(appt.platformCommission || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-3 text-right text-ui-md font-black text-neutral-900">
                          ₹{(appt.doctorEarnings || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-3">
                          {refundState === 'approved' ? (
                            <Badge variant="confirmed" label="REFUND APPROVED" />
                          ) : refundState === 'initiated' || (appt.status === 'cancelled' && appt.paymentStatus === 'paid') ? (
                            <Badge variant="warning" label="REFUND INITIATED" />
                          ) : refundState === 'cancel' ? (
                            <Badge variant="rejected" label="REFUND CANCEL" />
                          ) : (
                            <Badge variant="paid" label="PAYMENT RECEIVED" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination footer */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border border-neutral-200/50 p-4 bg-white rounded-lg shadow-level-1 select-none">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                  PAGE {currentPage} OF {totalPages} ({sortedPayments.length} SESSIONS)
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="h-10 px-4 border border-neutral-300 text-neutral-950 hover:border-neutral-950 font-bold text-ui-xs uppercase tracking-widest transition-all duration-150 select-none rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    ← PREVIOUS
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="h-10 px-4 border border-neutral-300 text-neutral-950 hover:border-neutral-950 font-bold text-ui-xs uppercase tracking-widest transition-all duration-150 select-none rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                  >
                    NEXT →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default DoctorEarnings;
