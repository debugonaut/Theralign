import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getAllAppointments } from '../../api/admin.api';
import SectionHeader from '../../components/common/SectionHeader';
import Table from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import AppointmentMediaViewer from '../../components/appointments/AppointmentMediaViewer.jsx';

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

  const fetchAppointments = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
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
      if (!silent) toast.error('Failed to load appointments registry');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchAppointments(false);
  }, [fetchAppointments]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  const STATUS_TABS = [
    { label: 'ALL BOOKINGS', value: '' },
    { label: 'PENDING', value: 'pending' },
    { label: 'CONFIRMED', value: 'confirmed' },
    { label: 'COMPLETED', value: 'completed' },
    { label: 'CANCELLED', value: 'cancelled' },
  ];

  return (
    <div className="space-y-8 select-none text-neutral-900 bg-white">
      {/* Page Title */}
      <SectionHeader
        title="APPOINTMENTS"
        subtitle="PLATFORM TRANSACTION SCHEDULER, REAL-TIME STATUS AUDITS, AND SESSION RECORDS."
      />

      {/* Filter bar - Segmented status controls */}
      <div className="flex border-2 border-neutral-900 self-start inline-flex">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border-r-2 last:border-r-0 border-neutral-900 cursor-pointer transition-colors duration-fast ${
              statusFilter === tab.value
                ? 'bg-neutral-900 text-white'
                : 'bg-white text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings table */}
      <div className="bg-white border-2 border-neutral-900 rounded-none shadow-none text-left">
        {loading ? (
          <div className="p-6 text-center text-neutral-500 text-sm font-medium uppercase tracking-wider flex items-center justify-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" /> RETRIEVING SCHEDULER ENTRIES...
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 text-ui-sm font-medium uppercase tracking-wider">
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
                      className={`border-b border-neutral-200 hover:bg-neutral-50 transition-colors cursor-pointer ${
                        isExpanded ? 'bg-neutral-100' : ''
                      }`}
                      onClick={() => setExpandedRow(isExpanded ? null : appt._id)}
                    >
                      {/* Row index */}
                      <td className="px-4 py-4 align-middle text-neutral-500 font-mono text-sm">
                        {(page - 1) * LIMIT + i + 1}
                      </td>

                      {/* Patient */}
                      <td className="px-4 py-4 align-middle">
                        <span className="font-medium text-neutral-900 uppercase tracking-wide text-sm">
                          {appt.patient?.name || 'Patient Deleted'}
                        </span>
                      </td>

                      {/* Doctor */}
                      <td className="px-4 py-4 align-middle font-medium text-neutral-900 uppercase tracking-wide text-sm">
                        Dr. {appt.doctor?.user?.name || 'Physio Deleted'}
                      </td>

                      {/* Scheduled Date */}
                      <td className="px-4 py-4 align-middle font-mono text-sm text-swiss-gray-650">
                        {appt.date} · {appt.startTime}
                      </td>

                      {/* Fee */}
                      <td className="px-4 py-4 align-middle text-right font-medium text-neutral-900 swiss-numeric">
                        ₹{feeVal.toLocaleString('en-IN')}
                      </td>

                      {/* Commission */}
                      <td className="px-4 py-4 align-middle text-right font-medium text-neutral-500 swiss-numeric">
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
                      <td className="px-4 py-4 align-middle text-neutral-500">
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>

                    {/* Collapsible Details Drawer */}
                    {isExpanded && (
                      <tr className="bg-neutral-50 border-b border-neutral-900">
                        <td colSpan={9} className="px-6 py-6 text-left">
                          <div className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-sm">
                              <div>
                                <span className="text-neutral-500 uppercase font-semibold tracking-widest block mb-1">PATIENT EMAIL</span>
                                <span className="text-neutral-900 font-medium uppercase">{appt.patient?.email || '—'}</span>
                              </div>
                              
                              <div>
                                <span className="text-neutral-500 uppercase font-semibold tracking-widest block mb-1">CLINIC FACILITY</span>
                                <span className="text-neutral-900 font-medium uppercase">{appt.doctor?.clinicName || '—'}</span>
                              </div>

                              <div>
                                <span className="text-neutral-500 uppercase font-semibold tracking-widest block mb-1">PATIENT NOTES</span>
                                <span className="text-neutral-700 font-medium uppercase italic">“{appt.patientNotes || 'NO ADDITIONAL NOTES'}”</span>
                              </div>

                              <div>
                                <span className="text-neutral-500 uppercase font-semibold tracking-widest block mb-1">
                                  {appt.status === 'cancelled' ? 'CANCELLATION REASON' : 'TRANSACTION ID'}
                                </span>
                                <span className="text-neutral-900 font-medium uppercase font-mono text-sm">
                                  {appt.status === 'cancelled'
                                    ? (appt.cancellationReason || 'NOT REGISTERED')
                                    : (appt.paymentId || '—')}
                                </span>
                              </div>
                            </div>

                            {/* Patient Uploaded Media Files */}
                            <div className="border-t border-neutral-200 pt-4">
                              <AppointmentMediaViewer appointmentId={appt._id} showEmptyState={false} />
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
          <div className="px-6 py-4 border-t-2 border-neutral-900 bg-neutral-50 flex items-center justify-between text-sm font-medium uppercase tracking-wider">
            <span className="text-neutral-500">INDEXED {appointments.length} APPOINTMENTS SESSIONS</span>
            <div className="flex gap-6 text-neutral-900">
              <span>TOTAL FEES: <span className="text-neutral-900 font-semibold swiss-numeric">₹{pageTotals.fees.toLocaleString('en-IN')}</span></span>
              <span>COMMISSIONS (10%): <span className="text-success font-semibold swiss-numeric">₹{pageTotals.commission.toLocaleString('en-IN')}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm font-medium uppercase tracking-wider pt-2 select-none">
          <span className="text-neutral-500">PAGE {page} OF {totalPages}</span>
          <div className="flex gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-900 transition-all shrink-0 cursor-pointer"
            >
              ← PREV
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
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

export default AdminBookings;
