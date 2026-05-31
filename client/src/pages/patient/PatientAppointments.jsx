import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMyAppointments, cancelAppointment } from '../../api/appointment.api';
import { submitReview } from '../../api/review.api';
import SectionHeader from '../../components/common/SectionHeader';
import Table, { ActionLink } from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL APPOINTMENTS');

  const formatINR = (value) => {
    if (value === undefined || value === null) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(value);
  };

  // Expanded row ID for inline details
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Cancellation Modal state (Destructive action)
  const [cancelModal, setCancelModal] = useState({ open: false, appointmentId: null, reason: '' });
  const [cancelling, setCancelling] = useState(false);

  // Inline Review Form states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState({}); // { [apptId]: boolean }
  const [submittedReviews, setSubmittedReviews] = useState({}); // { [apptId]: { rating, comment } }

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await getMyAppointments();
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO FETCH APPOINTMENT TRANSACTION RECORDS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'MY APPOINTMENTS — Theralign';
    fetchAppointments();
  }, []);

  // Sync date categorizations
  const todayStr = new Date().toISOString().split('T')[0];

  // Derive filtered list
  const getFilteredAppointments = () => {
    switch (activeTab) {
      case 'UPCOMING':
        return appointments.filter((a) => a.status === 'confirmed' && a.date >= todayStr);
      case 'COMPLETED':
        return appointments.filter((a) => a.status === 'completed');
      case 'CANCELLED':
        return appointments.filter((a) => a.status === 'cancelled');
      case 'ALL APPOINTMENTS':
      default:
        return appointments;
    }
  };

  const activeAppts = getFilteredAppointments();

  // Handle Cancellation
  const handleOpenCancelModal = (e, appointmentId) => {
    e.stopPropagation(); // Prevent expanding row
    setCancelModal({ open: true, appointmentId, reason: '' });
  };

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelAppointment(cancelModal.appointmentId, cancelModal.reason);
      if (res.success) {
        toast.success('BOOKING CANCELLED.');
        setAppointments(
          appointments.map((a) =>
            a._id === cancelModal.appointmentId
              ? { ...a, status: 'cancelled', cancellationReason: cancelModal.reason }
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

  // Handle Review submission
  const handleReviewSubmit = async (apptId) => {
    if (rating === 0) {
      toast.error('PLEASE SELECT A RATING VALUE.');
      return;
    }
    if (comment.trim().length < 10) {
      toast.error('COMMENT MUST EXCEED 10 CHARACTERS.');
      return;
    }

    setSubmittingReview({ ...submittingReview, [apptId]: true });
    try {
      const res = await submitReview({
        appointmentId: apptId,
        rating,
        comment,
      });

      if (res.success) {
        toast.success('REVIEW FILED.');
        // Set local confirmation
        setSubmittedReviews({
          ...submittedReviews,
          [apptId]: { rating, comment }
        });
        // Update main list
        setAppointments(
          appointments.map((a) =>
            a._id === apptId ? { ...a, reviewSubmitted: true } : a
          )
        );
        // Reset local form values
        setRating(0);
        setComment('');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'REVIEW SUBMISSION FAILURE.');
    } finally {
      setSubmittingReview({ ...submittingReview, [apptId]: false });
    }
  };

  const toggleRowExpansion = (apptId) => {
    setExpandedRowId(expandedRowId === apptId ? null : apptId);
    // Reset review form when changing rows
    setRating(0);
    setComment('');
  };

  return (
    <div className="flex flex-col gap-8 select-none text-left bg-white">
      
      {/* Page Header Section */}
      <SectionHeader
        title="MY APPOINTMENTS"
        size="lg"
        ruled={true}
        className="mb-0"
      />

      {/* Segmented Tab Row */}
      <div className="flex items-center gap-1.5 pt-2 flex-wrap">
        {['ALL APPOINTMENTS', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setExpandedRowId(null); // Reset expansion on tab swap
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

      {/* Appointments Ledger Table */}
      {loading ? (
        <div className="py-12 text-center text-ui-xs font-bold text-neutral-500 uppercase tracking-widest">
          LOADING CLINIC TRANSACTION LEDGERS...
        </div>
      ) : activeAppts.length === 0 ? (
        <div className="border border-neutral-200 border-dashed p-12 text-center rounded-lg flex flex-col items-center gap-4 max-w-lg mx-auto bg-neutral-50">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            NO SESSIONS FILED
          </span>
          <p className="text-ui-md text-neutral-700 font-bold max-w-sm">
            There are no booking entries recorded in this list status tab.
          </p>
          <Button variant="primary" onClick={() => navigate('/doctors')}>
            SCHEDULE VISIT →
          </Button>
        </div>
      ) : (
        <div className="w-full overflow-hidden border border-neutral-200/50 rounded-lg shadow-level-1">
          <Table>
            <Table.Head>
              <tr>
                <Table.Header>DATE</Table.Header>
                <Table.Header>DOCTOR</Table.Header>
                <Table.Header>TIME</Table.Header>
                <Table.Header className="hidden md:table-cell">DURATION</Table.Header>
                <Table.Header numeric>FEE</Table.Header>
                <Table.Header>PAYMENT</Table.Header>
                <Table.Header>STATUS</Table.Header>
                <Table.Header actions>ACTIONS</Table.Header>
              </tr>
            </Table.Head>
            <Table.Body>
              {activeAppts.map((appt) => {
                const isExpanded = expandedRowId === appt._id;
                const docName = appt.doctor?.user?.name || 'Physiotherapist';
                
                // Stacked spec Text
                const specText = Array.isArray(appt.doctor?.specialization)
                  ? appt.doctor.specialization[0]
                  : appt.doctor?.specialization || 'CLINICAL';

                // Format human Date
                const dateText = new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                }).toUpperCase();

                const isFuture = appt.date >= todayStr;
                const canCancel = appt.status === 'confirmed' && isFuture;

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
                        <div className="flex flex-col text-left">
                          <span className="font-black text-neutral-900 uppercase">
                            DR. {docName.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-accent font-black tracking-widest mt-0.5">
                            {specText.toUpperCase()}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="font-bold">
                        {appt.startTime} – {appt.endTime}
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell text-neutral-500 font-bold">
                        30 MIN
                      </Table.Cell>
                      <Table.Cell numeric className="font-black">
                        {formatINR(appt.consultationFee || appt.doctor?.consultationFee)}
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={appt.paymentStatus === 'paid' ? 'paid' : 'pending'} />
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={appt.status} />
                      </Table.Cell>
                      <Table.Cell actions>
                        <ActionLink onClick={() => toggleRowExpansion(appt._id)}>
                          VIEW
                        </ActionLink>
                        {canCancel && (
                          <ActionLink
                            destructive={true}
                            onClick={(e) => handleOpenCancelModal(e, appt._id)}
                          >
                            CANCEL
                          </ActionLink>
                        )}
                      </Table.Cell>
                    </Table.Row>

                    {/* Inline Row Expansion (Indented, 4px black left accent border) */}
                    {isExpanded && (
                      <Table.Row expanded={true} className="border-l-4 border-neutral-900">
                        <td colSpan={8} className="bg-neutral-100 p-6 text-left">
                          <div className="flex flex-col gap-6 w-full">
                            {/* Summary Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">
                                  CLINIC NAME
                                </span>
                                <span className="text-ui-md font-bold text-neutral-900 uppercase block">
                                  {appt.doctor?.clinicName || 'Theralign Clinic Center'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">
                                  CLINIC LOCATION
                                </span>
                                <span className="text-ui-md font-bold text-neutral-900 uppercase block">
                                  {appt.doctor?.clinicAddress || 'Pune, India'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">
                                  PATIENT NOTES
                                </span>
                                <span className="text-ui-md font-bold text-neutral-700 uppercase block leading-relaxed italic">
                                  "{appt.patientNotes || 'NO SYMPTOMS FILED ON TRANSACTION RECORD.'}"
                                </span>
                              </div>
                            </div>

                            {/* Session Document Attachment F3 */}
                            {appt.sessionDocument?.url && (
                              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-black text-success uppercase tracking-widest block">
                                    CLINICAL DOCUMENTS ATTACHED
                                  </span>
                                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-0.5">
                                    Your physiotherapist has uploaded session recovery logs.
                                  </span>
                                </div>
                                <a
                                  href={appt.sessionDocument.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-10 px-4 border-2 border-success text-success bg-white hover:bg-success hover:text-white font-black text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none rounded-none"
                                >
                                  DOWNLOAD NOTES →
                                </a>
                              </div>
                            )}

                            {/* Cancellation Log */}
                            {appt.status === 'cancelled' && (
                              <div className="p-4 bg-white border-2 border-neutral-200 rounded-none text-left">
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">
                                  CANCELLATION SUMMARY
                                </span>
                                <p className="text-ui-sm text-neutral-700 font-medium">
                                  Cancelled by {appt.cancelledBy || 'system'}. Reason: <b>{appt.cancellationReason || 'UNSPECIFIED'}</b>.
                                </p>
                              </div>
                            )}

                             {/* ── D3.7 Inline Review Form ── */}
                            {appt.status === 'completed' && (
                              <div className="pt-6 border-t border-neutral-200 text-left">
                                {!appt.reviewSubmitted && !submittedReviews[appt._id] ? (
                                  <div className="bg-white border border-neutral-200/60 p-6 rounded-lg shadow-level-1 flex flex-col gap-4">
                                    <div>
                                      <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">
                                        LEAVE A REVIEW
                                      </span>
                                      <h4 className="text-ui-lg font-black text-neutral-900 uppercase tracking-tighter">
                                        SHARE YOUR SESSION EXPERIENCE WITH DR. {docName.toUpperCase()}
                                      </h4>
                                      <div className="h-[1px] bg-neutral-200 w-full mt-2" />
                                    </div>

                                    {/* Number star rating selector */}
                                    <div className="flex flex-col gap-2">
                                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                        RATING
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map((val) => {
                                          const isSelected = rating === val;
                                          return (
                                            <button
                                              key={val}
                                              type="button"
                                              onClick={() => setRating(val)}
                                              className={`w-10 h-10 border font-bold text-ui-sm flex items-center justify-center rounded-md select-none cursor-pointer transition-all duration-150 active:scale-[0.93]
                                                ${isSelected 
                                                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-level-1' 
                                                  : 'bg-neutral-50 border-neutral-200 text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                                                }
                                              `}
                                            >
                                              {val}
                                            </button>
                                          );
                                        })}
                                        {rating > 0 && (
                                          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-3">
                                            {rating === 1 && '1 = POOR'}
                                            {rating === 2 && '2 = FAIR'}
                                            {rating === 3 && '3 = GOOD'}
                                            {rating === 4 && '4 = EXCELLENT'}
                                            {rating === 5 && '5 = OUTSTANDING'}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Review Text */}
                                    <div className="flex flex-col gap-2">
                                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                        YOUR EXPERIENCE
                                      </span>
                                      <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Describe your session, the physiotherapist's approach, and your recovery progress..."
                                        maxLength={1000}
                                        rows={3}
                                        className="w-full bg-white border border-neutral-200 focus:border-[#0A7E6E] px-4 py-3 text-ui-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-[#0A7E6E]/20 transition-all rounded-md resize-none transition-warm"
                                      />
                                      <span className="text-[9px] font-black text-neutral-500 text-right uppercase tracking-widest">
                                        {comment.length} / 1000 CHARACTERS (MIN 10 CHARACTERS)
                                      </span>
                                    </div>

                                    {/* Submit action */}
                                    <div className="pt-2">
                                      <Button
                                        onClick={() => handleReviewSubmit(appt._id)}
                                        disabled={rating === 0 || comment.trim().length < 10 || submittingReview[appt._id]}
                                        variant="primary"
                                        fullWidth
                                      >
                                        {submittingReview[appt._id] ? 'SUBMITTING...' : 'SUBMIT REVIEW →'}
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  /* Post-submission confirmed card state */
                                  <div className="bg-white border border-[#0A7E6E]/20 p-6 rounded-lg shadow-level-1 flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 border border-[#0A7E6E]/30 bg-[#0A7E6E]/5 flex items-center justify-center text-[#0A7E6E] text-ui-sm font-bold rounded-md">
                                        {submittedReviews[appt._id]?.rating || appt.rating || 5}
                                      </div>
                                      <div className="text-left">
                                        <span className="text-[10px] font-black text-success uppercase tracking-widest block">
                                          REVIEW SUBMITTED — THANK YOU.
                                        </span>
                                        <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-0.5">
                                          Your feedback helps patient search indexes remain transparent.
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-ui-md text-neutral-900 italic font-medium leading-relaxed mt-2">
                                      "{submittedReviews[appt._id]?.comment || appt.comment || 'YOUR REVIEW WAS RECORDED SUCCESSFULLY.'}"
                                    </p>
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
              Are you sure you want to cancel your clinical consultation slot? Unlocked slots will immediately become available for other patients to book.
            </p>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                REASON FOR CANCELLATION (OPTIONAL)
              </label>
              <textarea
                value={cancelModal.reason}
                onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                placeholder="E.g. Schedule conflict, feeling better, booked another practice clinic..."
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

    </div>
  );
};

export default PatientAppointments;
