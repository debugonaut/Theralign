import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Loader2 } from 'lucide-react';
import { getAllPayments } from '../../api/admin.api';
import Table from '../common/Table';
import Badge from '../common/Badge';

const PaymentsTable = ({ onRevenueAggregates }) => {
  const [allPayments, setAllPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const fetchPayments = async () => {
    try {
      setLoading(true);
      // Fetch high limit of payments to allow client-side audit filtering
      const res = await getAllPayments(1, 100);
      const data = res.data?.payments || res.payments || [];
      setAllPayments(data);
      setFilteredPayments(data);

      // Trigger aggregate computations for the parent cards
      if (onRevenueAggregates) {
        const totalRev = data.reduce((s, p) => s + (p.amount || 0), 0);
        const totalComm = data.reduce((s, p) => s + (p.platformCommission || 0), 0);
        onRevenueAggregates({
          revenue: totalRev,
          commission: totalComm,
          earnings: totalRev - totalComm,
        });
      }
    } catch (err) {
      toast.error('Failed to load transaction ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter computation
  useEffect(() => {
    let result = [...allPayments];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => 
        (p.patient?.name || '').toLowerCase().includes(q) ||
        (p.doctor?.user?.name || '').toLowerCase().includes(q) ||
        (p.razorpayPaymentId || '').toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      // In this system all records are PAID or pending
      const checkPaid = statusFilter === 'paid';
      result = result.filter(p => checkPaid ? p.amount > 0 : p.amount === 0);
    }

    // Date range filter
    if (startDate) {
      const start = new Date(startDate);
      result = result.filter(p => {
        const apptDate = p.appointment?.date ? new Date(p.appointment.date) : null;
        return apptDate ? apptDate >= start : true;
      });
    }

    if (endDate) {
      const end = new Date(endDate);
      result = result.filter(p => {
        const apptDate = p.appointment?.date ? new Date(p.appointment.date) : null;
        return apptDate ? apptDate <= end : true;
      });
    }

    setFilteredPayments(result);
    setPage(1);
  }, [allPayments, search, statusFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredPayments.length / LIMIT);
  const startIndex = (page - 1) * LIMIT;
  const pagePayments = filteredPayments.slice(startIndex, startIndex + LIMIT);

  const formatHumanDate = (dateStr) => {
    try {
      if (!dateStr) return '—';
      return new Date(dateStr).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).toUpperCase();
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Inputs & Status Segmented Controls Filter Bar */}
      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between border-2 border-neutral-900 p-4 bg-white">
        
        {/* Search */}
        <div className="flex-1 relative min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
          <input
            type="text"
            placeholder="FILTER BY PATIENT, DOCTOR, OR PAYMENT ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border-2 border-neutral-900 text-sm font-medium uppercase placeholder-neutral-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Date Inputs */}
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 border-2 border-neutral-900 bg-white text-sm font-medium focus:outline-none uppercase"
          />
          <span className="text-sm font-medium text-neutral-900">—</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 border-2 border-neutral-900 bg-white text-sm font-medium focus:outline-none uppercase"
          />
        </div>

        {/* Status segmented controls */}
        <div className="flex border-2 border-neutral-900">
          {['all', 'paid'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-r-2 last:border-r-0 border-neutral-900 cursor-pointer ${
                statusFilter === status
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {status === 'all' ? 'ALL STATUS' : 'PAID ONLY'}
            </button>
          ))}
        </div>

      </div>

      {/* Bordered Table wrapper */}
      <div className="bg-white border-2 border-neutral-900 rounded-none shadow-none text-left">
        {loading ? (
          <div className="p-6 text-center text-neutral-500 text-sm font-medium uppercase tracking-wider flex items-center justify-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" /> RETRIEVING TRANSACTIONS...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 text-ui-sm font-medium uppercase tracking-wider">
            NO TRANSACTION RECORDS MATCH FILTERS
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Date</Table.Header>
                <Table.Header>Patient</Table.Header>
                <Table.Header>Physiotherapist</Table.Header>
                <Table.Header numeric={true}>Amount</Table.Header>
                <Table.Header numeric={true}>Commission</Table.Header>
                <Table.Header numeric={true}>Doctor Earnings</Table.Header>
                <Table.Header>Payment ID</Table.Header>
                <Table.Header className="w-[100px]">Status</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {pagePayments.map((payment) => {
                const patName = payment.patient?.name || 'Patient Deleted';
                const patEmail = payment.patient?.email || '';
                const docName = payment.doctor?.user?.name || 'Physio Deleted';
                const appt = payment.appointment || {};
                const paymentId = payment.razorpayPaymentId || 'N/A';
                const paymentIdShort = paymentId !== 'N/A'
                  ? `…${paymentId.slice(-8)}`
                  : '—';

                return (
                  <Table.Row key={payment._id}>
                    {/* Date */}
                    <Table.Cell className="font-mono text-sm whitespace-nowrap text-neutral-700">
                      {formatHumanDate(appt.date || payment.createdAt)}
                    </Table.Cell>

                    {/* Patient */}
                    <Table.Cell>
                      <div className="text-left">
                        <span className="font-medium text-neutral-900 uppercase tracking-wide text-sm block">
                          {patName}
                        </span>
                        <span className="text-sm text-neutral-500 font-mono block">
                          {patEmail}
                        </span>
                      </div>
                    </Table.Cell>

                    {/* Doctor */}
                    <Table.Cell className="font-medium text-neutral-900 uppercase tracking-wide text-sm">
                      Dr. {docName}
                    </Table.Cell>

                    {/* Amount */}
                    <Table.Cell numeric={true} className="font-medium text-neutral-900">
                      ₹{payment.amount}
                    </Table.Cell>

                    {/* Commission */}
                    <Table.Cell numeric={true} className="font-medium text-neutral-700">
                      ₹{payment.platformCommission}
                      <span className="text-sm text-neutral-500 font-medium block">(10%)</span>
                    </Table.Cell>

                    {/* Doctor net earnings */}
                    <Table.Cell numeric={true} className="font-semibold text-neutral-900">
                      ₹{payment.doctorEarnings}
                      <span className="text-sm text-neutral-500 font-medium block">(90%)</span>
                    </Table.Cell>

                    {/* Payment ID with tooltip */}
                    <Table.Cell className="font-mono text-sm text-neutral-500 whitespace-nowrap" title={paymentId}>
                      {paymentIdShort}
                    </Table.Cell>

                    {/* Paid Status */}
                    <Table.Cell>
                      <Badge variant="paid" size="sm" />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm font-medium uppercase tracking-wider pt-2 select-none">
          <span className="text-neutral-500">
            PAGE {page} OF {totalPages} · {filteredPayments.length} TRANSACTIONS
          </span>
          <div className="flex gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-900 transition-all shrink-0 cursor-pointer"
            >
              ← PREV
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-900 transition-all shrink-0 cursor-pointer"
            >
              NEXT →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsTable;
