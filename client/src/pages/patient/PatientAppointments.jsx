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
    document.title = 'MY APPOINTMENTS — KINETIQ';
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
    <div className="flex flex-col gap-8 select-none text-left bg-swiss-white">
      
      {/* Page Header Section */}
      <SectionHeader
        title="MY APPOINTMENTS"
        size="lg"
        ruled={true}
        className="mb-0"
      />

      {/* Segmented Tab Row */}
      <div className="flex items-center gap-1.5 pt-2">
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

      {/* Appointments Ledger Table */}
      {loading ? (
        <div className="py-12 text-center text-ui-xs font-bold text-swiss-gray-400 uppercase tracking-widest">
          LOADING CLINIC TRANSACTION LEDGERS...
        </div>
      ) : activeAppts.length === 0 ? (
        <div className="border-2 border-swiss-black border-dashed p-12 text-center rounded-none flex flex-col items-center gap-4 max-w-lg mx-auto">
          <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            NO SESSIONS FILED
          </span>
          <p className="text-ui-md text-swiss-gray-600 font-bold max-w-sm">
            There are no booking entries recorded in this list status tab.
          </p>
          <Button variant="primary" onClick={() => navigate('/doctors')}>
            SCHEDULE VISIT →
          </Button>
        </div>
      ) : (
        <div className="w-full overflow-hidden border-2 border-swiss-black rounded-none">
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
                      <Table.Cell className="font-bold text-swiss-gray-400">
                        {dateText}
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex flex-col text-left">
                          <span className="font-black text-swiss-black uppercase">
                            DR. {docName.toUpperCase()}
                          </span>
                          <span className="text-[10px] text-swiss-red font-black tracking-widest mt-0.5">
                            {specText.toUpperCase()}
                          </span>
                        </div>
                      </Table.Cell>
                      <Table.Cell className="font-bold">
                        {appt.startTime} – {appt.endTime}
                      </Table.Cell>
                      <Table.Cell className="hidden md:table-cell text-swiss-gray-400 font-bold">
                        30 MIN
                      </Table.Cell>
                      <Table.Cell numeric className="font-black">
                        ₹{appt.consultationFee || appt.doctor?.consultationFee}
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
                      <Table.Row expanded={true} className="border-l-4 border-swiss-black">
                        <td colSpan={8} className="bg-swiss-gray-100 p-6 text-left">
                          <div className="flex flex-col gap-6 w-full">
                            {/* Summary Details */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block mb-1">
                                  CLINIC NAME
                                </span>
                                <span className="text-ui-md font-bold text-swiss-black uppercase block">
                                  {appt.doctor?.clinicName || 'Theralign Clinic Center'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block mb-1">
                                  CLINIC LOCATION
                                </span>
                                <span className="text-ui-md font-bold text-swiss-black uppercase block">
                                  {appt.doctor?.clinicAddress || 'Pune, India'}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block mb-1">
                                  PATIENT NOTES
                                </span>
                                <span className="text-ui-md font-bold text-swiss-gray-600 uppercase block leading-relaxed italic">
                                  "{appt.patientNotes || 'NO SYMPTOMS FILED ON TRANSACTION RECORD.'}"
                                </span>
                              </div>
                            </div>

                            {/* Session Document Attachment F3 */}
                            {appt.sessionDocument && (
                              <div className="pt-4 border-t border-swiss-gray-200 flex items-center justify-between">
                                <div>
                                  <span className="text-[10px] font-black text-swiss-teal uppercase tracking-widest block">
                                    CLINICAL DOCUMENTS ATTACHED
                                  </span>
                                  <span className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                                    Your physiotherapist has uploaded session recovery logs.
                                  </span>
                                </div>
                                <a
                                  href={appt.sessionDocument}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-10 px-4 border-2 border-swiss-teal text-swiss-teal bg-swiss-white hover:bg-swiss-teal hover:text-swiss-white font-black text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none rounded-none"
                                >
                                  DOWNLOAD NOTES →
                                </a>
                              </div>
                            )}

                            {/* Cancellation Log */}
                            {appt.status === 'cancelled' && (
                              <div className="p-4 bg-swiss-white border-2 border-swiss-gray-200 rounded-none text-left">
                                <span className="text-[10px] font-black text-swiss-red uppercase tracking-widest block mb-1">
                                  CANCELLATION SUMMARY
                                </span>
                                <p className="text-ui-sm text-swiss-gray-600 font-medium">
                                  Cancelled by {appt.cancelledBy || 'system'}. Reason: <b>{appt.cancellationReason || 'UNSPECIFIED'}</b>.
                                </p>
                              </div>
                            )}

                            {/* ── D3.7 Inline Review Form ── */}
                            {appt.status === 'completed' && appt.paymentStatus === 'paid' && (
                              <div className="pt-6 border-t border-swiss-gray-200 text-left">
                                {!appt.reviewSubmitted && !submittedReviews[appt._id] ? (
                                  <div className="bg-swiss-white border-2 border-swiss-black p-6 rounded-none flex flex-col gap-4">
                                    <div>
                                      <span className="text-[10px] font-black text-swiss-red uppercase tracking-widest block mb-1">
                                        LEAVE A REVIEW
                                      </span>
                                      <h4 className="text-ui-lg font-black text-swiss-black uppercase tracking-tighter">
                                        SHARE YOUR SESSION EXPERIENCE WITH DR. {docName.toUpperCase()}
                                      </h4>
                                      <div className="h-[1px] bg-swiss-gray-200 w-full mt-2" />
                                    </div>

                                    {/* Number star rating selector */}
                                    <div className="flex flex-col gap-2">
                                      <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
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
                                              className={`w-10 h-10 border-2 font-black text-ui-sm flex items-center justify-center rounded-none select-none cursor-pointer transition-colors
                                                ${isSelected 
                                                  ? 'bg-swiss-black border-swiss-black text-swiss-white' 
                                                  : 'bg-swiss-white border-swiss-black text-swiss-black hover:bg-swiss-gray-100'
                                                }
                                              `}
                                            >
                                              {val}
                                            </button>
                                          );
                                        })}
                                        {rating > 0 && (
                                          <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest ml-3">
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
                                      <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
                                        YOUR EXPERIENCE
                                      </span>
                                      <textarea
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Describe your session, the physiotherapist's approach, and your recovery progress..."
                                        maxLength={1000}
                                        rows={3}
                                        className="w-full bg-swiss-white border-2 border-swiss-black px-4 py-3 text-ui-sm font-bold uppercase tracking-wider text-swiss-black placeholder-swiss-gray-400 focus:border-4 focus:ring-0 transition-all rounded-none resize-none"
                                      />
                                      <span className="text-[9px] font-black text-swiss-gray-400 text-right uppercase tracking-widest">
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
                                  <div className="bg-swiss-white border-2 border-swiss-teal p-6 rounded-none flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 border-2 border-swiss-teal flex items-center justify-center text-swiss-teal text-ui-sm font-black rounded-none">
                                        {submittedReviews[appt._id]?.rating || appt.rating || 5}
                                      </div>
                                      <div className="text-left">
                                        <span className="text-[10px] font-black text-swiss-teal uppercase tracking-widest block">
                                          REVIEW SUBMITTED — THANK YOU.
                                        </span>
                                        <span className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider block mt-0.5">
                                          Your feedback helps patient search indexes remain transparent.
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-ui-md text-swiss-black italic font-medium leading-relaxed mt-2">
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
            <p className="text-ui-sm text-swiss-gray-600 font-bold uppercase tracking-wide leading-relaxed">
              Are you sure you want to cancel your clinical consultation slot? Unlocked slots will immediately become available for other patients to book.
            </p>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
                REASON FOR CANCELLATION (OPTIONAL)
              </label>
              <textarea
                value={cancelModal.reason}
                onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                placeholder="E.G. SCHEDULE CONFLICT, FEELING BETTER, BOOKED ANOTHER PRACTICE CLINIC..."
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

export default PatientAppointments;
