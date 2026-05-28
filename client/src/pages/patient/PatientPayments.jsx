import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, IndianRupee, ShieldCheck, CreditCard, Inbox } from 'lucide-react';
import { getMyPayments } from '../../api/payment.api';

const PatientPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await getMyPayments();
      if (res.success && res.data) {
        setPayments(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

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

  const formatPaidOn = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="p-8 space-y-8 select-none text-left">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CreditCard className="text-primary" size={24} />
          Payment History
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review and audit your clinic consultation receipts and paid transaction records.
        </p>
      </div>

      {/* Skeletons Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-100 rounded w-1/2" />
                <div className="h-6 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-3 bg-slate-100 rounded w-3/4" />
              <div className="space-y-2 pt-2 border-t border-slate-50">
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
                <div className="h-3 bg-slate-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-16 text-center max-w-lg mx-auto flex flex-col items-center gap-4">
          <div className="p-4 bg-slate-200/50 text-slate-400 rounded-2xl">
            <Inbox size={32} />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-700">No Payments Recorded</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Your payment records and transaction receipts will appear here automatically once you schedule and pay for clinical visits.
            </p>
          </div>
        </div>
      ) : (
        /* Payment Ledger Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((payment) => {
            const doctorName = payment.doctor?.user?.name || 'Physiotherapist';
            const specialization = payment.doctor?.specialization?.join(', ') || 'General Physiotherapy';
            const appt = payment.appointment || {};
            const paymentIdShort = payment.razorpayPaymentId
              ? payment.razorpayPaymentId.slice(-8)
              : 'N/A';

            return (
              <div
                key={payment._id}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-extrabold text-slate-800 text-sm truncate">Dr. {doctorName}</h3>
                    <span className="text-base font-extrabold text-slate-800 shrink-0">
                      ₹{payment.amount}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-bold truncate">{specialization}</p>
                </div>

                <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
                  <p className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    {formatHumanDate(appt.date)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400 shrink-0" />
                    {appt.startTime} – {appt.endTime}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Paid on {formatPaidOn(payment.createdAt)}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span
                    className="text-[9px] text-slate-400 font-bold bg-slate-50 border border-slate-100/50 px-2 py-0.5 rounded-lg cursor-help shrink-0"
                    title={payment.razorpayPaymentId}
                  >
                    Txn: {paymentIdShort}
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck size={11} /> Paid
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PatientPayments;
