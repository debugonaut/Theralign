import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getAllAppointments } from '../../api/admin.api';
import SectionHeader from '../../components/common/SectionHeader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';

const AdminBookings = () => {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  // Summary aggregates for current page
  const [pageTotals, setPageTotals] = useState({ fees: 0, commission: 0 });

  const LIMIT = 10;

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllAppointments(page, LIMIT);
      const d = res.data || res || {};
      const appts = d.appointments || [];

      // Client-side status filtering matching selection
      const filtered = statusFilter
        ? appts.filter((a) => a.status === statusFilter)
        : appts;

      setAppointments(filtered);
      setTotal(d.total || appts.length);
      setTotalPages(d.totalPages || 1);

      const fees = filtered.reduce((s, a) => s + (a.consultationFee || 0), 0);
      const comm = filtered.reduce((s, a) => s + (a.platformCommission || 0), 0);
      setPageTotals({ fees, commission: comm });
    } catch {
      toast.error('Failed to load appointments registry');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const STATUS_TABS = [
    { label: 'ALL BOOKINGS', value: '' },
    { label: 'PENDING', value: 'pending' },
    { label: 'CONFIRMED', value: 'confirmed' },
    { label: 'COMPLETED', value: 'completed' },
    { label: 'CANCELLED', value: 'cancelled' },
  ];

  return (
    <div className="space-y-8 select-none text-swiss-black bg-swiss-white">
      {/* Page Title */}
      <SectionHeader
        title="APPOINTMENTS"
        subtitle="PLATFORM TRANSACTION SCHEDULER, REAL-TIME STATUS AUDITS, AND SESSION RECORDS."
      />

      {/* Filter bar - Segmented status controls */}
      <div className="flex border-2 border-swiss-black self-start inline-flex">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-r-2 last:border-r-0 border-swiss-black cursor-pointer transition-colors duration-fast ${
              statusFilter === tab.value
                ? 'bg-swiss-black text-swiss-white'
                : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings table */}
      <div className="bg-swiss-white border-2 border-swiss-black rounded-none shadow-none text-left">
        {loading ? (
          <div className="p-12 text-center text-swiss-gray-400 text-xs font-bold uppercase tracking-wider">
            <span className="inline-block animate-spin mr-2">⏳</span> RETRIEVING SCHEDULER ENTRIES...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center text-swiss-gray-400 text-ui-sm font-bold uppercase tracking-wider">
            NO SCHEDULER RECORDS MATCH FILTERS
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header className="w-[60px]">#</Table.Header>
                <Table.Header>Patient</Table.Header>
                <Table.Header>Doctor</Table.Header>
                <Table.Header>Scheduled Date</Table.Header>
                <Table.Header numeric={true}>Fee</Table.Header>
                <Table.Header numeric={true}>Commission</Table.Header>
                <Table.Header>Payment</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header className="w-[60px]" />
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {appointments.map((appt, i) => {
                const isExpanded = expandedRow === appt._id;
                const feeVal = appt.consultationFee || 0;
                const commVal = appt.platformCommission || 0;

                let paymentBadgeVariant = appt.paymentStatus === 'paid' ? 'paid' : 'pending';
                let statusBadgeVariant = 'pending';
                if (appt.status === 'confirmed') statusBadgeVariant = 'confirmed';
                if (appt.status === 'completed') statusBadgeVariant = 'completed';
                if (appt.status === 'cancelled') statusBadgeVariant = 'cancelled';

                return (
                  <React.Fragment key={appt._id}>
                    <tr
                      className={`border-b border-swiss-gray-200 hover:bg-swiss-gray-50 transition-colors cursor-pointer ${
                        isExpanded ? 'bg-swiss-gray-100' : ''
                      }`}
                      onClick={() => setExpandedRow(isExpanded ? null : appt._id)}
                    >
                      {/* Row index */}
                      <td className="px-4 py-4 align-middle text-swiss-gray-500 font-mono text-xs">
                        {(page - 1) * LIMIT + i + 1}
                      </td>

                      {/* Patient */}
                      <td className="px-4 py-4 align-middle">
                        <span className="font-bold text-swiss-black uppercase tracking-wide text-xs">
                          {appt.patient?.name || 'Patient Deleted'}
                        </span>
                      </td>

                      {/* Doctor */}
                      <td className="px-4 py-4 align-middle font-bold text-swiss-black uppercase tracking-wide text-xs">
                        Dr. {appt.doctor?.user?.name || 'Physio Deleted'}
                      </td>

                      {/* Scheduled Date */}
                      <td className="px-4 py-4 align-middle font-mono text-xs text-swiss-gray-650">
                        {appt.date} · {appt.startTime}
                      </td>

                      {/* Fee */}
                      <td className="px-4 py-4 align-middle text-right font-bold text-swiss-black swiss-numeric">
                        ₹{feeVal.toLocaleString('en-IN')}
                      </td>

                      {/* Commission */}
                      <td className="px-4 py-4 align-middle text-right font-bold text-swiss-gray-500 swiss-numeric">
                        ₹{commVal.toLocaleString('en-IN')}
                      </td>

                      {/* Payment Status */}
                      <td className="px-4 py-4 align-middle">
                        <Badge variant={paymentBadgeVariant} size="sm" />
                      </td>

                      {/* Booking Status */}
                      <td className="px-4 py-4 align-middle">
                        <Badge variant={statusBadgeVariant} size="sm" />
                      </td>

                      {/* Collapse indicator */}
                      <td className="px-4 py-4 align-middle text-swiss-gray-400">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>

                    {/* Collapsible Details Drawer */}
                    {isExpanded && (
                      <tr className="bg-swiss-gray-50 border-b border-swiss-black">
                        <td colSpan={9} className="px-8 py-6 text-left">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                            <div>
                              <span className="text-swiss-gray-400 uppercase font-black tracking-widest block mb-1">PATIENT EMAIL</span>
                              <span className="text-swiss-black font-bold uppercase">{appt.patient?.email || '—'}</span>
                            </div>
                            
                            <div>
                              <span className="text-swiss-gray-400 uppercase font-black tracking-widest block mb-1">CLINIC FACILITY</span>
                              <span className="text-swiss-black font-bold uppercase">{appt.doctor?.clinicName || '—'}</span>
                            </div>

                            <div>
                              <span className="text-swiss-gray-400 uppercase font-black tracking-widest block mb-1">PATIENT NOTES</span>
                              <span className="text-swiss-gray-600 font-bold uppercase italic">“{appt.patientNotes || 'NO ADDITIONAL NOTES'}”</span>
                            </div>

                            <div>
                              <span className="text-swiss-gray-400 uppercase font-black tracking-widest block mb-1">
                                {appt.status === 'cancelled' ? 'CANCELLATION REASON' : 'TRANSACTION ID'}
                              </span>
                              <span className="text-swiss-black font-bold uppercase font-mono text-[10px]">
                                {appt.status === 'cancelled'
                                  ? (appt.cancellationReason || 'NOT REGISTERED')
                                  : (appt.paymentId || '—')}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </Table.Body>
          </Table>
        )}

        {/* Totals aggregate row */}
        {!loading && appointments.length > 0 && (
          <div className="px-6 py-4 border-t-2 border-swiss-black bg-swiss-gray-50 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
            <span className="text-swiss-gray-400">INDEXED {appointments.length} APPOINTMENTS SESSIONS</span>
            <div className="flex gap-6 text-swiss-black">
              <span>TOTAL FEES: <span className="text-swiss-black font-black swiss-numeric">₹{pageTotals.fees.toLocaleString('en-IN')}</span></span>
              <span>COMMISSIONS (10%): <span className="text-swiss-teal font-black swiss-numeric">₹{pageTotals.commission.toLocaleString('en-IN')}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider pt-2 select-none">
          <span className="text-swiss-gray-400">PAGE {page} OF {totalPages}</span>
          <div className="flex gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border-2 border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white disabled:opacity-40 disabled:hover:bg-swiss-white disabled:hover:text-swiss-black transition-all shrink-0 cursor-pointer"
            >
              ← PREV
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border-2 border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white disabled:opacity-40 disabled:hover:bg-swiss-white disabled:hover:text-swiss-black transition-all shrink-0 cursor-pointer"
            >
              NEXT →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
