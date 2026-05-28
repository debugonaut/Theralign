import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { IndianRupee, ChevronLeft, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { getAllPayments } from '../../api/admin.api';

const PaymentsTable = ({ limit = 10, onPaymentsFetched }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPayments = async (page) => {
    setLoading(true);
    try {
      const res = await getAllPayments(page, limit);
      if (res.success && res.data) {
        setPayments(res.data.payments);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.totalCount);

        // Notify parent of fetched payments, including the calculated revenue aggregates
        if (onPaymentsFetched) {
          onPaymentsFetched({
            payments: res.data.payments,
            totalCount: res.data.totalCount,
            revenue: res.data.revenue || {
              totalRevenue: 0,
              totalCommission: 0,
              totalDoctorEarnings: 0
            }
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transaction ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(currentPage);
  }, [currentPage]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const formatHumanDate = (dateStr) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl select-none text-left">
      {/* Table Header Wrapper */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-100">Platform Payments Ledger</h3>
          <p className="text-xs text-slate-500 mt-1">Audit and monitor transaction receipts, commission splits, and payouts.</p>
        </div>
        <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1 rounded-full">
          {totalCount} Paid
        </span>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-xs font-semibold text-slate-500">Retrieving platform payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center gap-3">
          <AlertCircle className="text-slate-600" size={32} />
          <p className="text-sm font-bold text-slate-400">No Payments Recorded</p>
          <p className="text-xs text-slate-600">No successful payment transactions have been logged yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Physiotherapist</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Commission</th>
                <th className="px-6 py-4">Doctor Earnings</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Payment ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.map((payment) => {
                const patName = payment.patient?.name || 'Patient Deleted';
                const patEmail = payment.patient?.email || '';
                const docName = payment.doctor?.user?.name || 'Physio Deleted';
                const appt = payment.appointment || {};
                const paymentIdShort = payment.razorpayPaymentId
                  ? payment.razorpayPaymentId.slice(-8)
                  : 'N/A';

                return (
                  <tr key={payment._id} className="hover:bg-slate-900/20 transition-all font-medium">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-extrabold text-slate-200">{patName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{patEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-slate-200">Dr. {docName}</p>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold">{formatHumanDate(appt.date)}</td>
                    <td className="px-6 py-4 text-slate-200 font-extrabold">₹{payment.amount}</td>
                    <td className="px-6 py-4 text-primary font-extrabold">
                      ₹{payment.platformCommission}
                      <span className="text-[9px] text-slate-500 font-bold block">(10%)</span>
                    </td>
                    <td className="px-6 py-4 text-emerald-400 font-extrabold">
                      ₹{payment.doctorEarnings}
                      <span className="text-[9px] text-slate-500 font-bold block">(90%)</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                        <ShieldCheck size={10} /> Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className="text-[10px] text-slate-400 font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg cursor-help"
                        title={payment.razorpayPaymentId}
                      >
                        {paymentIdShort}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Pagination */}
      {!loading && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/10 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-bold">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-2 border border-slate-800 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-800 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTable;
