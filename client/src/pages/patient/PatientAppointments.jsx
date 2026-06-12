import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMyAppointments, cancelAppointment } from '../../api/appointment.api';
import { submitReview } from '../../api/review.api';
import SectionHeader from '../../components/common/SectionHeader';
import Table, { ActionLink } from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import CancellationModal from '../../components/booking/CancellationModal.jsx';

const PatientAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL APPOINTMENTS');

  const formatINR = (value) => {
    if (value === undefined || value === null) return '₹0';
    return '₹' + new Intl.NumberFormat('en-IN').format(value);
  };

  // Expanded row ID for inline details
  const [expandedRowId, setExpandedRowId] = useState(null);

  const [selectedAppointmentForCancel, setSelectedAppointmentForCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Inline Review Form states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState({}); // { [apptId]: boolean }
  const [submittedReviews, setSubmittedReviews] = useState({}); // { [apptId]: { rating, comment } }
  const [sidebarReviewTab, setSidebarReviewTab] = useState('ONGOING'); // 'ONGOING' | 'COMPLETED'
  const [selectedSidebarApptId, setSelectedSidebarApptId] = useState(null);

  const fetchAppointments = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getMyAppointments();
      if (res.success && res.data) {
        setAppointments(res.data);
      }
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
    document.title = 'MY APPOINTMENTS — Theralign';
    fetchAppointments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAppointments(true);
    }, 15000);
    return () => clearInterval(interval);
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

  const handlePatientCancelAppointment = async (reason) => {
    if (!selectedAppointmentForCancel) return;
    try {
      setCancelLoading(true);
      // cancelAppointment (PATCH /:id/cancel) atomically cancels and sets
      // refundStatus: 'requested' on the Payment if paymentStatus === 'paid'
      await cancelAppointment(selectedAppointmentForCancel._id, reason);
      const wasPaid = selectedAppointmentForCancel.paymentStatus === 'paid';
      toast.success(
        wasPaid
          ? 'Appointment cancelled. Refund request submitted for admin review.'
          : 'Appointment cancelled successfully.'
      );
      fetchAppointments(true);
      setSelectedAppointmentForCancel(null);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setCancelLoading(false);
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
        // Reset selected appointment and local form values
        setSelectedSidebarApptId(null);
        setRating(0);
        setComment('');
        // Trigger background fetch to re-sync
        fetchAppointments(true);
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

  // Derive ongoing and completed care eligible for rating/review in the sidebar
  const ongoingEligible = appointments.filter(
    (a) => (a.status === 'pending' || a.status === 'confirmed') && !a.reviewSubmitted
  );
  const completedEligible = appointments.filter(
    (a) => a.status === 'completed' && !a.reviewSubmitted
  );

  return (
    <div className="flex flex-col gap-5 select-none text-left bg-white max-w-[1200px] mx-auto w-full">
      
      {/* Page Header Section */}
      <SectionHeader
        title="MY APPOINTMENTS"
        size="lg"
        ruled={true}
        className="mb-0"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        {/* Left Column: List Ledger Table */}
        <div className="lg:col-span-8 flex flex-col gap-5 w-full">
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
        <div className="py-6 text-center text-ui-xs font-bold text-neutral-500 uppercase tracking-widest">
          LOADING CLINIC TRANSACTION LEDGERS...
        </div>
      ) : activeAppts.length === 0 ? (
        <div className="border border-neutral-200 border-dashed p-6 text-center rounded-lg flex flex-col items-center gap-3 max-w-lg mx-auto bg-neutral-50">
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
        <div className="w-full overflow-hidden border border-neutral-200/50 rounded-lg shadow-level-1 max-w-[1200px]">
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
                          <button
                            className="cancel-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointmentForCancel(appt);
                            }}
                          >
                            CANCEL
                          </button>
                        )}
                      </Table.Cell>
                    </Table.Row>

                    {/* Inline Row Expansion (Indented, 4px black left accent border) */}
                    {isExpanded && (
                      <Table.Row expanded={true} className="border-l-4 border-neutral-900">
                        <td colSpan={8} className="bg-neutral-100 p-6 text-left">
                          <div className="flex flex-col gap-6 w-full max-w-[1200px]">
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

                            {/* Session Record — Phase 15 */}
                            {appt.status === 'completed' && (
                              <div className="pt-4 border-t border-neutral-200 flex items-center justify-between">
                                {appt.sessionRecord ? (
                                  <>
                                    <div>
                                      <span className="text-[10px] font-black text-success uppercase tracking-widest block">
                                        CLINICAL SESSION NOTES AVAILABLE
                                      </span>
                                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-0.5">
                                        Your physiotherapist has recorded your session notes and exercise plan.
                                      </span>
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); navigate(`/patient/care-timeline`); }}
                                      className="h-10 px-4 border-2 border-success text-success bg-white hover:bg-success hover:text-white font-black text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none rounded-md whitespace-nowrap cursor-pointer"
                                    >
                                      VIEW NOTES →
                                    </button>
                                  </>
                                ) : (
                                  <div>
                                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">
                                      SESSION NOTES PENDING
                                    </span>
                                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-0.5">
                                      Awaiting your physiotherapist's session notes.
                                    </span>
                                  </div>
                                )}
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

                            {/* ── Reviewed Confirmation ── */}
                            {appt.reviewSubmitted && (
                              <div className="pt-4 border-t border-neutral-200 text-left">
                                <div className="bg-white border border-[#0A7E6E]/10 p-4 rounded-md text-left flex flex-col gap-1.5">
                                  <span className="text-[10px] font-black text-success uppercase tracking-widest block">
                                    FEEDBACK SUCCESSFULLY RECORDED
                                  </span>
                                  <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider block">
                                    You have submitted a review/rating for this appointment in the sidebar panel.
                                  </span>
                                </div>
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
        </div>

        {/* Right Column: Review Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-5 w-full bg-neutral-50 border-2 border-neutral-900 p-6 shadow-none rounded-lg">
          <div>
            <span className="text-[10px] font-black text-accent uppercase tracking-widest block mb-1">
              REVIEW SYSTEM
            </span>
            <h3 className="text-ui-lg font-black text-neutral-900 uppercase tracking-tight">
              RATE & REVIEW CARE
            </h3>
            <div className="h-[1px] bg-neutral-200 w-full mt-2" />
          </div>

          {selectedSidebarApptId ? (
            // Form UI
            (() => {
              const appt = appointments.find(a => a._id === selectedSidebarApptId);
              if (!appt) return null;
              const docName = appt.doctor?.user?.name || 'Physiotherapist';
              const specText = Array.isArray(appt.doctor?.specialization)
                ? appt.doctor.specialization[0]
                : appt.doctor?.specialization || 'Clinical';

              return (
                <div className="flex flex-col gap-4 text-left">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSidebarApptId(null);
                      setRating(0);
                      setComment('');
                    }}
                    className="text-[10px] font-black text-neutral-500 hover:text-neutral-950 uppercase tracking-wider self-start flex items-center gap-1 cursor-pointer"
                  >
                    ← BACK TO LIST
                  </button>

                  <div className="bg-white border border-neutral-200 p-4 rounded-md">
                    <span className="text-[9px] font-black text-accent uppercase tracking-wider block">
                      {appt.status.toUpperCase()} APPOINTMENT
                    </span>
                    <h4 className="font-bold text-neutral-900 uppercase text-ui-sm mt-0.5">
                      Dr. {docName}
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">
                      {specText}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono block mt-1">
                      {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()} · {appt.startTime}
                    </span>
                  </div>

                  {/* 5-Star Rating Selector */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                      RATING
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRating(val)}
                          className="text-[28px] leading-none transition-transform duration-100 active:scale-90 focus:outline-none cursor-pointer hover:scale-110"
                          aria-label={`Rate ${val} out of 5`}
                        >
                          <span
                            className={`transition-colors duration-150 ${
                              val <= rating ? 'text-amber-400' : 'text-neutral-300'
                            }`}
                          >
                            ★
                          </span>
                        </button>
                      ))}
                      {rating > 0 && (
                        <span className={`ml-3 text-[10px] font-black uppercase tracking-widest ${
                          rating <= 2 ? 'text-accent' : rating === 3 ? 'text-warning' : 'text-success'
                        }`}>
                          {['', 'Poor', 'Fair', 'Good', 'Excellent', 'Outstanding'][rating]}
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
                      rows={4}
                      className="w-full bg-white border border-neutral-200 focus:border-neutral-900 px-4 py-3 text-ui-sm font-semibold text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-neutral-900/10 transition-all rounded-md resize-none transition-warm"
                    />
                    <span className="text-[9px] font-black text-neutral-500 text-right uppercase tracking-widest">
                      {comment.length} / 1000 CHARACTERS (MIN 10)
                    </span>
                  </div>

                  {/* Submit Action */}
                  <Button
                    onClick={() => handleReviewSubmit(selectedSidebarApptId)}
                    disabled={rating === 0 || comment.trim().length < 10 || submittingReview[selectedSidebarApptId]}
                    variant="primary"
                    fullWidth
                  >
                    {submittingReview[selectedSidebarApptId] ? 'SUBMITTING...' : 'SUBMIT REVIEW →'}
                  </Button>
                </div>
              );
            })()
          ) : (
            // List UI with ongoing/completed tabs
            <div className="flex flex-col gap-4">
              {/* Sidebar Tabs */}
              <div className="flex border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => setSidebarReviewTab('ONGOING')}
                  className={`flex-1 pb-2 font-bold text-[10px] uppercase tracking-widest border-b-2 transition-colors cursor-pointer
                    ${sidebarReviewTab === 'ONGOING' 
                      ? 'border-neutral-900 text-neutral-950 font-black' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                    }
                  `}
                >
                  Ongoing Care
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarReviewTab('COMPLETED')}
                  className={`flex-1 pb-2 font-bold text-[10px] uppercase tracking-widest border-b-2 transition-colors cursor-pointer
                    ${sidebarReviewTab === 'COMPLETED' 
                      ? 'border-neutral-900 text-neutral-950 font-black' 
                      : 'border-transparent text-neutral-400 hover:text-neutral-700'
                    }
                  `}
                >
                  Completed Sessions
                </button>
              </div>

              {/* Sidebar List items */}
              <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
                {sidebarReviewTab === 'ONGOING' ? (
                  ongoingEligible.length === 0 ? (
                    <p className="text-ui-xs font-bold text-neutral-400 uppercase tracking-wide py-4 text-center">
                      No ongoing care entries to rate.
                    </p>
                  ) : (
                    ongoingEligible.map((appt) => {
                      const docName = appt.doctor?.user?.name || 'Physiotherapist';
                      return (
                        <div
                          key={appt._id}
                          onClick={() => {
                            setSelectedSidebarApptId(appt._id);
                            setRating(0);
                            setComment('');
                          }}
                          className="bg-white border border-neutral-200 hover:border-neutral-900 p-4 rounded-md cursor-pointer transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-accent uppercase tracking-wider">
                              {appt.status.toUpperCase()}
                            </span>
                            <span className="text-[9px] font-mono text-neutral-400">
                              {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-bold text-neutral-900 uppercase text-ui-xs mt-1">
                            Dr. {docName}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-0.5">
                            {Array.isArray(appt.doctor?.specialization) ? appt.doctor.specialization[0] : appt.doctor?.specialization || 'Clinical'}
                          </span>
                        </div>
                      );
                    })
                  )
                ) : (
                  completedEligible.length === 0 ? (
                    <p className="text-ui-xs font-bold text-neutral-400 uppercase tracking-wide py-4 text-center">
                      No completed sessions to review.
                    </p>
                  ) : (
                    completedEligible.map((appt) => {
                      const docName = appt.doctor?.user?.name || 'Physiotherapist';
                      return (
                        <div
                          key={appt._id}
                          onClick={() => {
                            setSelectedSidebarApptId(appt._id);
                            setRating(0);
                            setComment('');
                          }}
                          className="bg-white border border-neutral-200 hover:border-neutral-900 p-4 rounded-md cursor-pointer transition-colors text-left"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-success uppercase tracking-wider">
                              COMPLETED
                            </span>
                            <span className="text-[9px] font-mono text-neutral-400">
                              {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-bold text-neutral-900 uppercase text-ui-xs mt-1">
                            Dr. {docName}
                          </h4>
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-0.5">
                            {Array.isArray(appt.doctor?.specialization) ? appt.doctor.specialization[0] : appt.doctor?.specialization || 'Clinical'}
                          </span>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <CancellationModal
        appointment={selectedAppointmentForCancel}
        isOpen={!!selectedAppointmentForCancel}
        onClose={() => setSelectedAppointmentForCancel(null)}
        onSubmit={handlePatientCancelAppointment}
        isLoading={cancelLoading}
      />

    </div>
  );
};

export default PatientAppointments;
