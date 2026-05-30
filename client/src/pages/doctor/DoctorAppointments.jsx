import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertTriangle, X, Check } from 'lucide-react';
import { getDoctorAppointments, cancelAppointment, completeAppointment } from '../../api/appointment.api';
import axiosInstance from '../../api/axiosInstance';
import SectionHeader from '../../components/common/SectionHeader';
import Table, { ActionLink } from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Row expansion state
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Cancellation Modal state
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null, reason: '' });
  const [cancelling, setCancelling] = useState(false);

  // Document action loading state
  const [actionLoading, setActionLoading] = useState({});

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getDoctorAppointments();
      const rawAppts = res.data?.appointments || res.data || res.appointments || [];
      setAppointments(rawAppts);
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO FETCH APPOINTMENT TRANSACTION RECORDS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'APPOINTMENTS — KINETIQ';
    fetchAppointments();
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering Logic
  const getFilteredAppointments = () => {
    let filtered = [...appointments];

    // Filter by tab
    if (activeTab === 'UPCOMING') {
      filtered = filtered.filter((a) => a.status === 'confirmed' || a.status === 'pending');
    } else if (activeTab === 'COMPLETED') {
      filtered = filtered.filter((a) => a.status === 'completed');
    } else if (activeTab === 'CANCELLED') {
      filtered = filtered.filter((a) => a.status === 'cancelled');
    }

    // Filter by Date Range (From - To)
    if (fromDate) {
      filtered = filtered.filter((a) => a.date >= fromDate);
    }
    if (toDate) {
      filtered = filtered.filter((a) => a.date <= toDate);
    }

    return filtered;
  };

  const activeAppts = getFilteredAppointments();

  const handleOpenCancelModal = (e, appointmentId) => {
    e.stopPropagation(); // Avoid triggering expansion
    setCancelModal({ open: true, appointmentId, reason: '' });
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelAppointment(cancelModal.appointmentId, cancelModal.reason);
      if (res.success) {
        toast.success('APPOINTMENT CANCELLED.');
        setAppointments(
          appointments.map((a) =>
            a._id === cancelModal.appointmentId
              ? { ...a, status: 'cancelled', cancellationReason: cancelModal.reason, cancelledBy: 'doctor' }
              : a
          )
        );
        setCancelModal({ open: false, appointmentId: null, reason: '' });
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO CANCEL APPOINTMENT.');
    } finally {
      setCancelling(false);
    }
  };

  const handleMarkComplete = async (e, id) => {
    e.stopPropagation(); // Avoid triggering expansion
    const confirm = window.confirm('ARE YOU SURE YOU WANT TO MARK THIS CONSULTATION AS COMPLETED?');
    if (!confirm) return;

    try {
      const res = await completeAppointment(id);
      if (res.success) {
        toast.success('CONSULTATION COMPLETED.');
        setAppointments(
          appointments.map((a) =>
            a._id === id ? { ...a, status: 'completed' } : a
          )
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO COMPLETE APPOINTMENT.');
    }
  };

  const handleUploadNotes = async (apptId, file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('ONLY PDF DOCUMENTS ARE ACCEPTED.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('PDF FILE SIZE MUST NOT EXCEED 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('document', file);

    setActionLoading((prev) => ({ ...prev, [apptId]: true }));
    try {
      const res = await axiosInstance.post(`/documents/upload/${apptId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success && res.data?.data) {
        toast.success('CLINICAL SESSION NOTES ATTACHED.');
        // Update local appointment state with returned appointment object
        setAppointments(
          appointments.map((a) => (a._id === apptId ? res.data.data : a))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'FAILED TO UPLOAD DOCUMENT.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [apptId]: false }));
    }
  };

  const handleRemoveNotes = async (apptId) => {
    const confirm = window.confirm('ARE YOU SURE YOU WANT TO REMOVE THIS SESSION DOCUMENT?');
    if (!confirm) return;

    setActionLoading((prev) => ({ ...prev, [apptId]: true }));
    try {
      const res = await axiosInstance.delete(`/documents/${apptId}`);
      if (res.data?.success && res.data?.data) {
        toast.success('CLINICAL DOCUMENT REMOVED.');
        setAppointments(
          appointments.map((a) => (a._id === apptId ? res.data.data : a))
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO REMOVE CLINICAL DOCUMENT.');
    } finally {
      setActionLoading((prev) => ({ ...prev, [apptId]: false }));
    }
  };

  const toggleRowExpansion = (apptId) => {
    setExpandedRowId(expandedRowId === apptId ? null : apptId);
  };

  const handleActionLinkClick = (e, apptId, actionType) => {
    e.stopPropagation(); // Avoid triggering expansion
    toggleRowExpansion(apptId);
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
  };

  return (
    <div className="flex flex-col gap-8 select-none text-left bg-swiss-white">
      
      {/* ── Page Header Section ── */}
      <SectionHeader title="APPOINTMENTS" size="lg" ruled={true} className="mb-0" />

      {/* ── Filter and Control Row ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-6 border border-swiss-black p-6 bg-swiss-white rounded-none">
        
        {/* Status segmented filters */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setExpandedRowId(null);
                }}
                className={`px-4 py-2 border-2 border-swiss-black font-black text-[11px] uppercase tracking-widest transition-colors duration-fast rounded-none cursor-pointer select-none
                  ${isActive 
                    ? 'bg-swiss-black text-swiss-white' 
                    : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-100'
                  }
                `}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Date inputs date range selector */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              FROM
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-swiss-white border-2 border-swiss-black px-4 py-2 text-ui-sm font-bold uppercase tracking-wider text-swiss-black focus:border-4 focus:ring-0 transition-all rounded-none"
            />
          </div>

          <span className="text-ui-md font-bold text-swiss-black select-none self-center mb-2">—</span>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              TO
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-swiss-white border-2 border-swiss-black px-4 py-2 text-ui-sm font-bold uppercase tracking-wider text-swiss-black focus:border-4 focus:ring-0 transition-all rounded-none"
            />
          </div>

          {(fromDate || toDate) && (
            <button
              onClick={handleClearFilters}
              className="h-10 px-4 text-ui-xs font-black uppercase tracking-widest text-swiss-red border-2 border-swiss-red hover:bg-swiss-red hover:text-swiss-white transition-colors rounded-none cursor-pointer self-end"
            >
              CLEAR
            </button>
          )}
        </div>

      </div>

      {/* ── Appointments Table Ledger ── */}
      {loading ? (
        <div className="py-12 text-center text-ui-xs font-bold text-swiss-gray-400 uppercase tracking-widest">
          LOADING CLINIC TRANSACTION LEDGERS...
        </div>
      ) : activeAppts.length === 0 ? (
        <div className="border-2 border-swiss-black border-dashed p-12 text-center rounded-none flex flex-col items-center gap-4 max-w-lg mx-auto w-full bg-swiss-white select-none">
          <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            NO SESSIONS FILED
          </span>
          <p className="text-ui-md text-swiss-gray-600 font-bold max-w-sm">
            There are no booking entries recorded in this ledger list.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden border-2 border-swiss-black rounded-none bg-swiss-white select-none">
          <Table>
            <Table.Head>
              <tr>
                <Table.Header>DATE</Table.Header>
                <Table.Header>PATIENT</Table.Header>
                <Table.Header>TIME</Table.Header>
                <Table.Header numeric>FEE</Table.Header>
                <Table.Header>PAYMENT</Table.Header>
                <Table.Header>STATUS</Table.Header>
                <Table.Header actions>ACTIONS</Table.Header>
              </tr>
            </Table.Head>
            <Table.Body>
              {activeAppts.map((appt) => {
                const isExpanded = expandedRowId === appt._id;
                const patientName = appt.patient?.name || 'Patient';
                const initial = patientName.charAt(0).toUpperCase();

                // Format human Date
                const dateText = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                }).toUpperCase();

                const isUpcoming = appt.status === 'confirmed' || appt.status === 'pending';
                const isCompleted = appt.status === 'completed';

                return (
                  <React.Fragment key={appt._id}>
                    {/* Standard Table Row */}
                    <Table.Row
                      hoverable={true}
                      expanded={isExpanded}
                      onClick={() => toggleRowExpansion(appt._id)}
                    >
                      <Table.Cell className="font-bold text-swiss-gray-400">
                        {dateText}
                      </Table.Cell>
                      
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          {/* 24px initial circle */}
                          <div className="w-6 h-6 rounded-full bg-swiss-black text-swiss-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                            {initial}
                          </div>
                          <span className="font-black text-swiss-black uppercase">
                            {patientName.toUpperCase()}
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="font-bold">
                        {appt.startTime} – {appt.endTime}
                      </Table.Cell>

                      <Table.Cell numeric className="font-black">
                        ₹{appt.consultationFee}
                      </Table.Cell>

                      <Table.Cell>
                        <Badge variant={appt.paymentStatus === 'paid' ? 'paid' : 'pending'} />
                      </Table.Cell>

                      <Table.Cell>
                        <Badge variant={appt.status} />
                      </Table.Cell>

                      <Table.Cell actions>
                        {isUpcoming && (
                          <>
                            <button
                              onClick={(e) => handleMarkComplete(e, appt._id)}
                              className="font-bold uppercase cursor-pointer text-swiss-black hover:text-swiss-gray-600 bg-transparent border-0 text-[11px] tracking-widest"
                            >
                              MARK COMPLETE →
                            </button>
                            <button
                              onClick={(e) => handleOpenCancelModal(e, appt._id)}
                              className="font-bold uppercase cursor-pointer text-swiss-red hover:opacity-75 bg-transparent border-0 text-[11px] tracking-widest"
                            >
                              CANCEL →
                            </button>
                          </>
                        )}

                        {isCompleted && (
                          appt.sessionDocument?.url ? (
                            <ActionLink onClick={(e) => handleActionLinkClick(e, appt._id, 'view')}>
                              VIEW NOTES →
                            </ActionLink>
                          ) : (
                            <ActionLink onClick={(e) => handleActionLinkClick(e, appt._id, 'upload')}>
                              UPLOAD NOTES →
                            </ActionLink>
                          )
                        )}

                        {!isUpcoming && !isCompleted && (
                          <ActionLink onClick={() => toggleRowExpansion(appt._id)}>
                            VIEW →
                          </ActionLink>
                        )}
                      </Table.Cell>
                    </Table.Row>

                    {/* Inline Row Expansion */}
                    {isExpanded && (
                      <Table.Row expanded={true} className="border-l-4 border-swiss-black">
                        <td colSpan={7} className="bg-swiss-gray-100 p-6 text-left">
                          <div className="flex flex-col gap-6 w-full">
                            
                            {/* Grid Detail layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block mb-1">
                                  PATIENT CONTACT EMAIL (PRIVACY COMPLIANT)
                                </span>
                                <span className="text-ui-md font-bold text-swiss-black uppercase block">
                                  {appt.patient?.email || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-swiss-red uppercase tracking-widest block mb-1">
                                  PATIENT NOTES
                                </span>
                                <span className="text-ui-md font-bold text-swiss-gray-600 uppercase block leading-relaxed italic">
                                  "{appt.patientNotes || 'NO SYMPTOMS FILED ON TRANSACTION RECORD.'}"
                                </span>
                              </div>
                            </div>

                            {/* Cancellation Summary */}
                            {appt.status === 'cancelled' && (
                              <div className="p-4 bg-swiss-white border-2 border-swiss-gray-200 rounded-none">
                                <span className="text-[10px] font-black text-swiss-red uppercase tracking-widest block mb-1">
                                  CANCELLATION REASON
                                </span>
                                <p className="text-ui-sm text-swiss-gray-600 font-bold uppercase tracking-wide">
                                  Cancelled by {appt.cancelledBy || 'system'}. Reason: <b>{appt.cancellationReason || 'UNSPECIFIED'}</b>.
                                </p>
                              </div>
                            )}

                            {/* Session Document Upload/Download section */}
                            {isCompleted && (
                              <div className="pt-4 border-t border-swiss-gray-200 flex flex-col gap-4">
                                <div>
                                  <span className="text-[10px] font-black text-swiss-teal uppercase tracking-widest block">
                                    CLINICAL SESSION DOCUMENTATION
                                  </span>
                                  <span className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                                    Upload session recovery logs or prescriptions in PDF format. Patients can download this from their portals.
                                  </span>
                                </div>

                                {appt.sessionDocument?.url ? (
                                  <div className="flex items-center justify-between bg-swiss-white border-2 border-swiss-black p-4 rounded-none">
                                    <div className="flex items-center gap-3">
                                      <span className="text-lg">📄</span>
                                      <div className="flex flex-col">
                                        <span className="text-ui-sm font-black text-swiss-black uppercase">
                                          {appt.sessionDocument.fileName || 'SESSION_NOTES.PDF'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <a
                                        href={appt.sessionDocument.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-10 px-4 border-2 border-swiss-black text-swiss-black bg-swiss-white hover:bg-swiss-black hover:text-swiss-white font-black text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none rounded-none"
                                      >
                                        DOWNLOAD →
                                      </a>
                                      <button
                                        onClick={() => handleRemoveNotes(appt._id)}
                                        disabled={actionLoading[appt._id]}
                                        className="h-10 px-4 border-2 border-swiss-red text-swiss-red bg-swiss-white hover:bg-swiss-red hover:text-swiss-white font-black text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none rounded-none cursor-pointer"
                                      >
                                        {actionLoading[appt._id] ? 'REMOVING...' : 'REMOVE'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-swiss-gray-400 bg-swiss-white p-6 rounded-none">
                                    <label className="flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center w-full">
                                      <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          handleUploadNotes(appt._id, file);
                                        }}
                                        disabled={actionLoading[appt._id]}
                                        className="hidden"
                                      />
                                      {actionLoading[appt._id] ? (
                                        <span className="text-ui-xs font-black text-swiss-gray-400 uppercase tracking-widest">
                                          UPLOADING PDF FILE...
                                        </span>
                                      ) : (
                                        <>
                                          <span className="text-ui-xs font-black text-swiss-black uppercase tracking-widest border-2 border-swiss-black px-4 py-2 hover:bg-swiss-black hover:text-swiss-white transition-colors">
                                            UPLOAD SESSION NOTES (PDF ONLY)
                                          </span>
                                          <span className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider block mt-1">
                                            MAXIMUM FILE SIZE 5MB.
                                          </span>
                                        </>
                                      )}
                                    </label>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        </td>
                      </Table.Row>
                    )}
                  </React.Fragment>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}

      {/* Cancellation Reason Modal */}
      {cancelModal.open && (
        <Modal
          isOpen={cancelModal.open}
          onClose={() => setCancelModal({ open: false, appointmentId: null, reason: '' })}
          title="CANCEL APPOINTMENT"
        >
          <div className="flex flex-col gap-5 text-left select-none">
            <p className="text-ui-sm text-swiss-gray-600 font-bold uppercase tracking-wide leading-relaxed">
              Are you sure you want to cancel this patient consultation slot? The slot will immediately unlock and become available for other patients to book.
            </p>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
                REASON FOR CANCELLATION (OPTIONAL)
              </label>
              <textarea
                value={cancelModal.reason}
                onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                placeholder="E.G. CLINIC CLOSED, EMERGENCY CONFLICTS, RESCHEDULE PREFERENCE..."
                rows={3}
                maxLength={200}
                className="w-full bg-swiss-white border-2 border-swiss-black px-4 py-3 text-ui-sm font-bold uppercase tracking-wider text-swiss-black placeholder-swiss-gray-400 focus:border-4 focus:ring-0 transition-all rounded-none resize-none"
              />
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="accent"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? 'CANCELLING...' : 'YES, CANCEL APPOINTMENT'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setCancelModal({ open: false, appointmentId: null, reason: '' })}
                disabled={cancelling}
              >
                NO, KEEP APPOINTMENT
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default DoctorAppointments;
