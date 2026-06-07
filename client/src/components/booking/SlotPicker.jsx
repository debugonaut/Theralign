import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getDoctorAvailability, bookAppointment, cancelAppointment } from '../../api/appointment.api';
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
    const interval = setInterval(fetchAvailability, 15000); // Poll every 15 seconds to update slots in real time
    return () => clearInterval(interval);
  }, [doctorId]);

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
            navigate(`/booking-success/${appointmentId}`);
          },
          onFailure: async () => {
            setShowModal(false);
            try {
              await cancelAppointment(appointmentId, 'Payment failed or cancelled');
              toast.error('Payment was not completed. Your booking has not been confirmed.', { duration: 5000 });
            } catch (err) {
              console.error('Failed to auto-cancel unpaid appointment:', err);
            }
            await fetchAvailability();
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
        <div className="w-full py-4 text-center text-ui-xs font-bold text-neutral-500 uppercase tracking-widest">
          Loading clinic availability...
        </div>
      )}

      {!loading && (
        <>
          {availabilityByDate.length === 0 ? (
            <div className="w-full p-6 bg-white border border-neutral-200 rounded-lg shadow-level-1 text-left">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">NO AVAILABILITY</span>
              <p className="text-ui-sm text-neutral-700 font-bold">No open slots at the moment. Please check back later.</p>
            </div>
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
