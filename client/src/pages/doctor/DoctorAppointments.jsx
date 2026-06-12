import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AlertTriangle, X, Check, FileText } from 'lucide-react';
import { getDoctorAppointments, cancelAppointment, completeAppointment } from '../../api/appointment.api';
import axiosInstance from '../../api/axiosInstance';
import SectionHeader from '../../components/common/SectionHeader';
import Table, { ActionLink } from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import DoctorCancellationModal from '../../components/appointments/DoctorCancellationModal.jsx';
import AppointmentMediaViewer from '../../components/appointments/AppointmentMediaViewer.jsx';

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const formatINR = (value) => {
    if (value === undefined || value === null) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(value);
  };

  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Row expansion state
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Cancellation Modal state
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null, reason: '' });
  const [cancelling, setCancelling] = useState(false);
  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Document action loading state
  const [actionLoading, setActionLoading] = useState({});

  const fetchAppointments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getDoctorAppointments();
      const rawAppts = res.data?.appointments || res.data || res.appointments || [];
      setAppointments(rawAppts);
    } catch (err) {
      console.error(err);
      if (!silent) {
        toast.error('FAILED TO FETCH APPOINTMENT TRANSACTION RECORDS.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'APPOINTMENTS — Theralign';
    fetchAppointments(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments(true);
    }, 15000);
    return () => clearInterval(interval);
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

  const handleDoctorCancelAppointment = async () => {
    if (!selectedAppointmentForCancel) return;
    try {
      setCancelLoading(true);
      await cancelAppointment(selectedAppointmentForCancel._id, 'Cancelled by physiotherapist');
      toast.success('Appointment cancelled. Patient refund has been initiated automatically.');
      fetchAppointments(true);
      setSelectedAppointmentForCancel(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(false);
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
    <div className="flex flex-col gap-5 select-none text-left bg-white">
      
      {/* ── Page Header Section ── */}
      <SectionHeader title="APPOINTMENTS" size="lg" ruled={true} className="mb-0" />

      {/* ── Filter and Control Row ── */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-between gap-6 border border-neutral-200/50 p-6 bg-white rounded-lg shadow-level-1 transition-warm">
        
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
                className={`px-4 py-2 font-bold text-[11px] uppercase tracking-widest transition-all duration-150 rounded-md cursor-pointer select-none border
                  ${isActive 
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-level-1' 
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
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
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              FROM
            </span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-white border border-neutral-300 focus:border-[#0A7E6E] px-4 py-2 text-ui-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-[#0A7E6E]/20 transition-all rounded-md transition-warm"
            />
          </div>

          <span className="text-ui-md font-bold text-neutral-900 select-none self-center mb-2">—</span>

          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              TO
            </span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-white border border-neutral-300 focus:border-[#0A7E6E] px-4 py-2 text-ui-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-[#0A7E6E]/20 transition-all rounded-md transition-warm"
            />
          </div>

          {(fromDate || toDate) && (
            <button
              onClick={handleClearFilters}
              className="h-10 px-4 text-ui-xs font-bold uppercase tracking-widest text-accent border border-accent hover:bg-accent hover:text-white transition-all duration-150 rounded-md cursor-pointer self-end"
            >
              CLEAR
            </button>
          )}
        </div>

      </div>

      {/* ── Appointments Table Ledger ── */}
      {loading ? (
        <div className="py-6 text-center text-ui-xs font-bold text-neutral-500 uppercase tracking-widest">
          LOADING CLINIC TRANSACTION LEDGERS...
        </div>
      ) : activeAppts.length === 0 ? (
        <div className="border-2 border-neutral-900 border-dashed p-6 text-center rounded-none flex flex-col items-center gap-3 max-w-lg mx-auto w-full bg-white select-none">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            NO SESSIONS FILED
          </span>
          <p className="text-ui-md text-neutral-700 font-bold max-w-sm">
            There are no booking entries recorded in this ledger list.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden border border-neutral-200/50 rounded-lg shadow-level-1 bg-white select-none max-w-[1200px]">
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
                      <Table.Cell className="font-bold text-neutral-500">
                        {dateText}
                      </Table.Cell>
                      
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          {/* 24px initial circle */}
                          <div className="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                            {initial}
                          </div>
                          <span className="font-black text-neutral-900 uppercase">
                            {patientName.toUpperCase()}
                          </span>
                        </div>
                      </Table.Cell>

                      <Table.Cell className="font-bold">
                        {appt.startTime} – {appt.endTime}
                      </Table.Cell>

                      <Table.Cell numeric className="font-black">
                        {formatINR(appt.consultationFee)}
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
                              className="font-bold uppercase cursor-pointer text-neutral-900 hover:text-neutral-700 bg-transparent border-0 text-[11px] tracking-widest"
                            >
                              MARK COMPLETE →
                            </button>
                            {appt.status === 'confirmed' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedAppointmentForCancel(appt);
                                }}
                                className="cancel-link font-bold uppercase cursor-pointer"
                              >
                                CANCEL
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleOpenCancelModal(e, appt._id)}
                                className="font-bold uppercase cursor-pointer text-accent hover:opacity-75 bg-transparent border-0 text-[11px] tracking-widest"
                              >
                                CANCEL →
                              </button>
                            )}
                          </>
                        )}

                        {isCompleted && (
                          appt.hasSessionRecord ? (
                            <ActionLink onClick={(e) => { e.stopPropagation(); navigate(`/doctor/appointments/${appt._id}/session-record`); }}>
                              VIEW NOTES →
                            </ActionLink>
                          ) : (
                            <ActionLink onClick={(e) => { e.stopPropagation(); navigate(`/doctor/appointments/${appt._id}/session-record`); }}>
                              ADD SESSION NOTES →
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
                      <Table.Row expanded={true} className="border-l-4 border-neutral-900">
                        <td colSpan={7} className="bg-neutral-100 p-6 text-left">
                          <div className="flex flex-col gap-6 w-full max-w-[1200px]">
                            
                            {/* Grid Detail layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">
                                  PATIENT CONTACT EMAIL (PRIVACY COMPLIANT)
                                </span>
                                <span className="text-ui-md font-bold text-neutral-900 uppercase block">
                                  {appt.patient?.email || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">
                                  PATIENT NOTES
                                </span>
                                <span className="text-ui-md font-bold text-neutral-700 uppercase block leading-relaxed italic">
                                  "{appt.patientNotes || 'NO SYMPTOMS FILED ON TRANSACTION RECORD.'}"
                                </span>
                              </div>
                            </div>

                            {/* Patient Uploaded Media Files */}
                            <AppointmentMediaViewer appointmentId={appt._id} showEmptyState={false} />

                            {/* Cancellation Summary */}
                            {appt.status === 'cancelled' && (
                              <div className="p-4 bg-white border border-neutral-200/60 rounded-lg shadow-level-1">
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">
                                  CANCELLATION REASON
                                </span>
                                <p className="text-ui-sm text-neutral-700 font-bold uppercase tracking-wide">
                                  Cancelled by {appt.cancelledBy || 'system'}. Reason: <b>{appt.cancellationReason || 'UNSPECIFIED'}</b>.
                                </p>
                              </div>
                            )}

                            {/* Session Document Upload/Download section */}
                            {isCompleted && (
                              <div className="pt-4 border-t border-neutral-200 flex flex-col gap-4">
                                <div>
                                  <span className="text-[10px] font-black text-success uppercase tracking-widest block">
                                    CLINICAL SESSION DOCUMENTATION
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-0.5">
                                    Upload session recovery logs or prescriptions in PDF format. Patients can download this from their portals.
                                  </span>
                                </div>

                                {appt.sessionDocument?.url ? (
                                  <div className="flex items-center justify-between bg-white border border-neutral-200/60 p-4 rounded-lg shadow-level-1">
                                    <div className="flex items-center gap-3">
                                      <FileText className="w-5 h-5 text-neutral-500 shrink-0" />
                                      <div className="flex flex-col">
                                        <span className="text-ui-sm font-black text-neutral-900 uppercase">
                                          {appt.sessionDocument.fileName || 'SESSION_NOTES.PDF'}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <a
                                        href={appt.sessionDocument.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-10 px-4 border border-neutral-300 hover:border-neutral-900 text-neutral-700 hover:text-neutral-900 bg-white font-bold text-ui-xs flex items-center uppercase tracking-widest transition-all duration-150 select-none rounded-md"
                                      >
                                        DOWNLOAD →
                                      </a>
                                      <button
                                        onClick={() => handleRemoveNotes(appt._id)}
                                        disabled={actionLoading[appt._id]}
                                        className="h-10 px-4 border border-accent text-accent bg-white hover:bg-accent hover:text-white font-bold text-ui-xs flex items-center uppercase tracking-widest transition-all duration-150 select-none rounded-md cursor-pointer"
                                      >
                                        {actionLoading[appt._id] ? 'REMOVING...' : 'REMOVE'}
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center justify-center border border-dashed border-neutral-300 bg-white p-6 rounded-lg">
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
                                        <span className="text-ui-xs font-black text-neutral-500 uppercase tracking-widest">
                                          UPLOADING PDF FILE...
                                        </span>
                                      ) : (
                                        <>
                                          <span className="text-ui-xs font-bold text-neutral-900 uppercase tracking-widest border border-neutral-300 rounded-md px-4 py-2 hover:bg-neutral-900 hover:text-white transition-all duration-150">
                                            UPLOAD SESSION NOTES (PDF ONLY)
                                          </span>
                                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-1">
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
            <p className="text-ui-sm text-neutral-700 font-bold uppercase tracking-wide leading-relaxed">
              Are you sure you want to cancel this patient consultation slot? The slot will immediately unlock and become available for other patients to book.
            </p>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                REASON FOR CANCELLATION (OPTIONAL)
              </label>
              <textarea
                value={cancelModal.reason}
                onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                placeholder="E.g. Clinic closed, emergency conflicts, reschedule preference..."
                rows={3}
                maxLength={200}
                className="w-full bg-white border border-neutral-200 focus:border-accent px-4 py-3 text-ui-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-accent/20 transition-all rounded-md resize-none transition-warm"
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

      <DoctorCancellationModal
        appointment={selectedAppointmentForCancel}
        isOpen={!!selectedAppointmentForCancel}
        onClose={() => setSelectedAppointmentForCancel(null)}
        onSubmit={handleDoctorCancelAppointment}
        isLoading={cancelLoading}
      />

    </div>
  );
};

export default DoctorAppointments;
