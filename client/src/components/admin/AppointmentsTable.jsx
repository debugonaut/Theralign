import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, IndianRupee, ChevronLeft, ChevronRight, User, AlertCircle } from 'lucide-react';
import { getAllAppointments } from '../../api/admin.api';

const AppointmentsTable = ({ limit = 10, onMetricsFetched }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchAppointments = async (page) => {
    setLoading(true);
    try {
      const res = await getAllAppointments(page, limit);
      if (res.success && res.data) {
        setAppointments(res.data.appointments);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.totalCount);
        
        // Pass metrics up if a callback is provided
        if (onMetricsFetched) {
          onMetricsFetched({
            totalCount: res.data.totalCount,
            totalPlatformCommission: res.data.totalPlatformCommission
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments(currentPage);
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'cancelled':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl select-none text-left">
      {/* Table Header Wrapper */}
      <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-100">All Clinic Bookings</h3>
          <p className="text-xs text-slate-500 mt-1">Audit and monitor all platform scheduled consultations.</p>
        </div>
        <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1 rounded-full">
          {totalCount} Total
        </span>
      </div>

      {/* Table Content */}
      {loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-xs font-semibold text-slate-500">Retrieving system bookings...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="p-6 text-center flex flex-col items-center gap-3">
          <AlertCircle className="text-slate-600" size={32} />
          <p className="text-sm font-bold text-slate-400">No Appointments Recorded</p>
          <p className="text-xs text-slate-600">No bookings have been made across the platform yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-slate-300 text-sm">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-800 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
                <th className="px-4 py-2">Patient</th>
                <th className="px-4 py-2">Physiotherapist</th>
                <th className="px-4 py-2">Specialization</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Consult Fee</th>
                <th className="px-4 py-2">Commission</th>
                <th className="px-4 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {appointments.map((appt) => {
                const patName = appt.patient?.name || 'Patient Deleted';
                const patEmail = appt.patient?.email || '';
                const docName = appt.doctor?.user?.name || 'Physio Deleted';
                const specialization = appt.doctor?.specialization?.[0] || 'General';

                return (
                  <tr key={appt._id} className="hover:bg-slate-900/20 transition-all font-medium">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-extrabold text-slate-200">{patName}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{patEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-extrabold text-slate-200">Dr. {docName}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-bold">{specialization}</td>
                    <td className="px-4 py-3 text-xs font-bold">{formatHumanDate(appt.date)}</td>
                    <td className="px-4 py-3 text-xs font-bold">{appt.startTime} – {appt.endTime}</td>
                    <td className="px-4 py-3 text-slate-200 font-extrabold">₹{appt.consultationFee}</td>
                    <td className="px-4 py-3 text-primary font-extrabold">
                      ₹{appt.platformCommission}
                      <span className="text-[9px] text-slate-500 font-bold block">(10%)</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${getStatusStyle(appt.status)}`}>
                        {appt.status}
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

export default AppointmentsTable;
