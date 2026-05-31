import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getDoctorAvailability, bookAppointment } from '../../api/appointment.api';
import { joinWaitlist, leaveWaitlist, checkWaitlistStatus } from '../../api/waitlist.api';
import useAuthStore from '../../store/authStore';
import BookingConfirmationModal from './BookingConfirmationModal';
import { useRazorpay } from '../../hooks/useRazorpay';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import Button from '../common/Button';

const SlotPicker = ({ doctorId, doctorName, consultationFee }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { initiatePayment } = useRazorpay();

  const [availabilityByDate, setAvailabilityByDate] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [onWaitlist, setOnWaitlist] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Fetch available slots
  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await getDoctorAvailability(doctorId);
      if (res.success && res.data) {
        setAvailabilityByDate(res.data);
        if (res.data.length > 0) {
          setSelectedDate(res.data[0].date);
          setSelectedSlot(null);
        } else {
          setSelectedDate(null);
          setSelectedSlot(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [doctorId]);

  // Check waitlist status if empty
  useEffect(() => {
    const fetchWaitlistStatus = async () => {
      if (availabilityByDate.length === 0 && isAuthenticated && user?.role === 'patient') {
        try {
          const res = await checkWaitlistStatus(doctorId);
          if (res.success && res.data) {
            setOnWaitlist(res.data.onWaitlist);
          }
        } catch (err) {
          console.warn('Silent waitlist fetch warning:', err.message);
        }
      }
    };
    fetchWaitlistStatus();
  }, [availabilityByDate, doctorId, isAuthenticated, user]);

  const handleJoinWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      await joinWaitlist(doctorId);
      setOnWaitlist(true);
      toast.success('Joined waitlist successfully.');
    } catch (err) {
      toast.error('Failed to join waitlist.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      await leaveWaitlist(doctorId);
      setOnWaitlist(false);
      toast.success('Left waitlist successfully.');
    } catch (err) {
      toast.error('Failed to leave waitlist.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const slotsForSelectedDate = availabilityByDate.find(d => d.date === selectedDate)?.slots || [];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
  };

  const handleOpenBookingModal = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to schedule an appointment.');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    
    if (user?.role !== 'patient') {
      toast.error('Only patients can schedule appointments.');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a time slot.');
      return;
    }

    setShowModal(true);
  };

  const handleConfirmBooking = async (patientNotes) => {
    setBookingLoading(true);
    try {
      const res = await bookAppointment({
        slotId: selectedSlot._id,
        patientNotes,
      });

      if (res.success && res.data) {
        const appointmentId = res.data._id;
        await initiatePayment({
          appointmentId,
          onSuccess: () => {
            setShowModal(false);
            setTimeout(() => navigate('/patient/appointments'), 1500);
          },
          onFailure: () => {
            setShowModal(false);
            setTimeout(() => navigate('/patient/appointments'), 1500);
          },
        });
      }
    } catch (err) {
      console.error(err);
      setShowModal(false);
      if (err.response?.status === 409) {
        toast.error('Slot concurrently claimed. Retrying...');
        await fetchAvailability();
      } else {
        toast.error(err.response?.data?.message || 'Transaction scheduling failure.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  // Convert DR. DR_NAME to Dr. Name Title Case
  const displayDoctorName = doctorName
    ? doctorName.toLowerCase().replace(/(^\s*dr\.\s*|^\s*)/i, '').replace(/\b\w/g, c => c.toUpperCase())
    : '';

  // ── Render Waitlist UI if no availability (D3.10) ──
  const renderWaitlistUI = () => {
    return (
      <div className="w-full p-6 bg-white border border-neutral-200 rounded-lg shadow-level-1 text-left">
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">
          NO AVAILABILITY
        </span>
        <h3 className="text-ui-xl font-black text-neutral-900 uppercase tracking-tighter mb-2 leading-none">
          Dr. {displayDoctorName} has no open slots currently
        </h3>
        <p className="text-ui-sm text-neutral-700 font-bold mb-4">
          Join the waitlist and we'll notify you when new slots open.
        </p>

        {onWaitlist ? (
          <div className="flex flex-col gap-2 bg-[#F8F8F6] border border-success p-4 rounded-md">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border border-success flex items-center justify-center text-success text-xs font-black shrink-0 rounded-md bg-white">
                ✓
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black text-success uppercase tracking-widest block">
                  You're on the waitlist
                </span>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block mt-0.5">
                  We'll notify you when new slots are available.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLeaveWaitlist}
              disabled={waitlistLoading}
              className="text-[9px] font-black text-neutral-500 hover:text-accent uppercase tracking-widest text-left mt-2 select-none cursor-pointer border-t border-neutral-200 pt-2 w-full bg-transparent border-0"
            >
              {waitlistLoading ? 'LEAVING...' : 'LEAVE WAITLIST'}
            </button>
          </div>
        ) : (
          <Button
            onClick={handleJoinWaitlist}
            disabled={waitlistLoading}
            variant="primary"
            fullWidth
          >
            {waitlistLoading ? 'PROCESSING...' : 'JOIN WAITLIST →'}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-5 select-none w-full">
      {/* ── Consultation Fee Header ── */}
      <div className="text-left pb-3 border-b border-neutral-200">
        <h2 className="text-display-sm font-black text-neutral-900 tracking-tighter leading-none">
          ₹{consultationFee}
        </h2>
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1.5 block">
          PER SESSION
        </span>
      </div>

      {/* ── Loading / Auth Gates ── */}
      {loading && (
        <div className="w-full py-12 text-center text-ui-xs font-bold text-neutral-500 uppercase tracking-widest">
          Loading clinic availability...
        </div>
      )}

      {!loading && (
        <>
          {availabilityByDate.length === 0 ? (
            renderWaitlistUI()
          ) : (
            <div className="flex flex-col gap-6 text-left">
              {/* Heatmap calendar */}
              <AvailabilityHeatmap
                availabilityByDate={availabilityByDate}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />

              {/* Time slot grid selector */}
              <div className="flex flex-col gap-3 pt-4 border-t border-neutral-200">
                <div className="flex justify-between items-baseline mb-1">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                    SELECT TIME SLOT
                  </label>
                  {selectedDate && (
                    <span className="text-ui-sm font-bold text-primary">
                      {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </span>
                  )}
                </div>

                {selectedDate ? (
                  slotsForSelectedDate.length === 0 ? (
                    <span className="text-ui-xs text-neutral-500 font-bold uppercase">
                      No slots scheduled for this date.
                    </span>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slotsForSelectedDate.map((slot) => {
                        const isSelected = selectedSlot?._id === slot._id;
                        return (
                          <button
                            key={slot._id}
                            type="button"
                            onClick={() => handleSlotSelect(slot)}
                            className={`h-10 border font-bold text-[11px] flex items-center justify-center rounded-md transition-all duration-fast select-none cursor-pointer
                              ${isSelected
                                ? 'bg-success border-success text-white shadow-level-1'
                                : 'bg-white border-neutral-200 text-neutral-900 hover:bg-neutral-100'
                              }
                            `}
                          >
                            {slot.startTime} – {slot.endTime}
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                    SELECT A DATE TO SEE AVAILABLE TIMES →
                  </span>
                )}
              </div>

              {/* CTA Booking Action */}
              <div className="pt-2">
                <Button
                  variant="accent"
                  fullWidth
                  disabled={!selectedSlot}
                  onClick={handleOpenBookingModal}
                  className="font-bold h-12"
                >
                  {selectedSlot ? 'CONFIRM & PAY →' : 'SELECT A TIME SLOT'}
                </Button>
                <p className="text-[9px] font-bold text-neutral-500 mt-2 text-center tracking-wider">
                  Secure payment via Razorpay. Confirmation sent by email.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmBooking}
        slot={selectedSlot}
        doctorName={doctorName}
        consultationFee={consultationFee}
        loading={bookingLoading}
      />
    </div>
  );
};

export default SlotPicker;
