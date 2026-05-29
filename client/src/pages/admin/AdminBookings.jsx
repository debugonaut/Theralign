import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { getAllAppointments } from '../../api/admin.api';
import PageHeader from '../../components/admin/PageHeader';

const STATUS_COLORS = {
  confirmed:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed:  'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled:  'bg-red-500/10 text-red-400 border-red-500/20',
  pending:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const AdminBookings = () => {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  // Summary totals from current page
  const [pageTotals, setPageTotals] = useState({ fees: 0, commission: 0 });

  const LIMIT = 10;

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAllAppointments(page, LIMIT);
      // admin.api.js returns response.data (the response body: {success, data: {appointments, total, totalPages}})
      const d = res.data || res;
      const appts = d.appointments || [];

      // Filter by status if set (client-side on top of API)
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
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const STATUS_TABS = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Completed', value: 'completed' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Appointment Management"
        subtitle={`${total} total appointments on the platform`}
      />

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16 text-slate-500 text-sm">
            No appointments found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Fee</th>
                  <th className="px-5 py-3.5 text-right hidden md:table-cell">Commission</th>
                  <th className="px-5 py-3.5">Payment</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt, i) => (
                  <React.Fragment key={appt._id}>
                    <tr
                      className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors cursor-pointer"
                      onClick={() => setExpandedRow(expandedRow === appt._id ? null : appt._id)}
                    >
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {(page - 1) * LIMIT + i + 1}
                      </td>
                      <td className="px-5 py-4 text-slate-200 font-medium">
                        {appt.patient?.name || '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-300">
                        {appt.doctor?.user?.name ? `Dr. ${appt.doctor.user.name}` : '—'}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs">
                        {appt.date} · {appt.startTime}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-200 font-semibold">
                        ₹{(appt.consultationFee || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4 text-right text-slate-400 hidden md:table-cell text-xs">
                        ₹{(appt.platformCommission || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4">
                        {appt.paymentStatus === 'paid' ? (
                          <span className="text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                            Paid
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full border ${STATUS_COLORS[appt.status] || 'bg-slate-800 text-slate-400'}`}>
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500">
                        {expandedRow === appt._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedRow === appt._id && (
                      <tr className="bg-slate-900/60 border-b border-slate-800">
                        <td colSpan={9} className="px-8 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <span className="text-slate-500 uppercase font-bold block mb-1">Patient Email</span>
                              <span className="text-slate-300">{appt.patient?.email || '—'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 uppercase font-bold block mb-1">Clinic</span>
                              <span className="text-slate-300">{appt.doctor?.clinicName || '—'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 uppercase font-bold block mb-1">Patient Notes</span>
                              <span className="text-slate-300">{appt.patientNotes || 'None'}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 uppercase font-bold block mb-1">
                                {appt.status === 'cancelled' ? 'Cancellation Reason' : 'Payment ID'}
                              </span>
                              <span className="text-slate-300 font-mono text-[10px]">
                                {appt.status === 'cancelled'
                                  ? (appt.cancellationReason || 'Not provided')
                                  : (appt.paymentId || '—')}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Summary row */}
        {!loading && appointments.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {appointments.length} appointments</span>
            <div className="flex gap-4">
              <span>Total Fees: <span className="text-slate-300 font-semibold">₹{pageTotals.fees.toLocaleString('en-IN')}</span></span>
              <span>Commission: <span className="text-slate-300 font-semibold">₹{pageTotals.commission.toLocaleString('en-IN')}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
