import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getDoctorAvailability, bookAppointment, cancelAppointment } from '../../api/appointment.api';
import useAuthStore from '../../store/authStore';
import BookingConfirmationModal from './BookingConfirmationModal';
import { useRazorpay } from '../../hooks/useRazorpay';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import Button from '../common/Button';

// Dynamically generate default 9-5 slots for 28 days (Monday-Friday) in Asia/Kolkata or local time
const generateDefaultAvailability = (doctorId) => {
  const targetDates = [];
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  
  for (let i = 0; i < 28; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    
    // Format YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayOfWeek = d.getDay();
    
    // Monday-Friday are working days
    const isWorkingDay = dayOfWeek >= 1 && dayOfWeek <= 5;
    
    if (isWorkingDay) {
      const slots = [];
      const startMins = 9 * 60; // 09:00 AM
      const endMins = 17 * 60;  // 05:00 PM
      const duration = 30;      // 30 minute duration
      
      let cursor = startMins;
      while (cursor + duration <= endMins) {
        const fromMinutes = (totalMins) => {
          const h = Math.floor(totalMins / 60).toString().padStart(2, '0');
          const m = (totalMins % 60).toString().padStart(2, '0');
          return `${h}:${m}`;
        };
        const startTimeStr = fromMinutes(cursor);
        const endTimeStr = fromMinutes(cursor + duration);
        
        slots.push({
          _id: `slot_weekly_${doctorId}_${dateStr}_${startTimeStr}`,
          startTime: startTimeStr,
          endTime: endTimeStr,
          date: dateStr,
          doctor: doctorId,
          isBooked: false,
          isActive: true,
        });
        cursor += duration;
      }
      
      targetDates.push({
        date: dateStr,
        slots: slots
      });
    }
  }
  return targetDates;
};

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
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [tempAppointmentId, setTempAppointmentId] = useState(null);

  const selectedDateRef = useRef(selectedDate);
  const selectedSlotRef = useRef(selectedSlot);
  const showModalRef = useRef(showModal);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    selectedSlotRef.current = selectedSlot;
  }, [selectedSlot]);

  useEffect(() => {
    showModalRef.current = showModal;
  }, [showModal]);

  // Fetch available slots
  const fetchAvailability = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    }
    try {
      const res = await getDoctorAvailability(doctorId);
      if (res.success && res.data && res.data.length > 0) {
        setAvailabilityByDate(res.data);
        
        const currentSelectedDate = selectedDateRef.current;
        const currentSelectedSlot = selectedSlotRef.current;

        const hasDate = res.data.some(d => d.date === currentSelectedDate);
        if (currentSelectedDate && hasDate) {
          if (currentSelectedSlot) {
            const dateEntry = res.data.find(d => d.date === currentSelectedDate);
            const slotStillAvailable = dateEntry?.slots?.some(s => s._id === currentSelectedSlot._id);
            if (!slotStillAvailable && !showModalRef.current) {
              setSelectedSlot(null);
            }
          }
        } else {
          if (res.data.length > 0) {
            setSelectedDate(res.data[0].date);
            setSelectedSlot(null);
          } else {
            setSelectedDate(null);
            setSelectedSlot(null);
          }
        }
      } else {
        // Fallback if res.data is empty
        const fallback = generateDefaultAvailability(doctorId);
        setAvailabilityByDate(fallback);
        
        const currentSelectedDate = selectedDateRef.current;
        const currentSelectedSlot = selectedSlotRef.current;

        const hasDate = fallback.some(d => d.date === currentSelectedDate);
        if (currentSelectedDate && hasDate) {
          if (currentSelectedSlot) {
            const dateEntry = fallback.find(d => d.date === currentSelectedDate);
            const slotStillAvailable = dateEntry?.slots?.some(s => s._id === currentSelectedSlot._id);
            if (!slotStillAvailable && !showModalRef.current) {
              setSelectedSlot(null);
            }
          }
        } else {
          if (fallback.length > 0) {
            setSelectedDate(fallback[0].date);
            setSelectedSlot(null);
          } else {
            setSelectedDate(null);
            setSelectedSlot(null);
          }
        }
      }
    } catch (err) {
      console.error(err);
      // Fallback on error
      const fallback = generateDefaultAvailability(doctorId);
      setAvailabilityByDate(fallback);
      
      const currentSelectedDate = selectedDateRef.current;
      const currentSelectedSlot = selectedSlotRef.current;

      const hasDate = fallback.some(d => d.date === currentSelectedDate);
      if (currentSelectedDate && hasDate) {
        if (currentSelectedSlot) {
          const dateEntry = fallback.find(d => d.date === currentSelectedDate);
          const slotStillAvailable = dateEntry?.slots?.some(s => s._id === currentSelectedSlot._id);
          if (!slotStillAvailable && !showModalRef.current) {
            setSelectedSlot(null);
          }
        }
      } else {
        if (fallback.length > 0) {
          setSelectedDate(fallback[0].date);
          setSelectedSlot(null);
        } else {
          setSelectedDate(null);
          setSelectedSlot(null);
        }
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAvailability(false);
    const interval = setInterval(() => {
      fetchAvailability(true);
    }, 8000); // Poll every 8 seconds for near-real-time slot updates
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

  const handleBookAppointment = async (patientNotes) => {
    setBookingLoading(true);
    try {
      const res = await bookAppointment({
        slotId: selectedSlot._id,
        patientNotes,
      });

      if (res.success && res.data) {
        const appointmentId = res.data._id;
        setTempAppointmentId(appointmentId);
      }
    } catch (err) {
      console.error(err);
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

  const handleProceedToPayment = async () => {
    if (!tempAppointmentId) return;
    setPaymentLoading(true);
    try {
      const appointmentId = tempAppointmentId;
      await initiatePayment({
        appointmentId,
        onSuccess: () => {
          setTempAppointmentId(null);
          setShowModal(false);
          setPaymentLoading(false);
          navigate(`/booking-success/${appointmentId}`);
        },
        onFailure: async () => {
          setPaymentLoading(false);
          setShowModal(false);
          setTempAppointmentId(null);
          try {
            await cancelAppointment(appointmentId, 'Payment failed or cancelled');
            toast.error('Payment was not completed. Your booking has not been confirmed.', { duration: 5000 });
          } catch (err) {
            console.error('Failed to auto-cancel unpaid appointment:', err);
          }
          await fetchAvailability();
        },
      });
    } catch (err) {
      console.error(err);
      setPaymentLoading(false);
      toast.error('Payment initiation failed. Please try again.');
    }
  };

  const handleCloseModal = async () => {
    setShowModal(false);
    if (tempAppointmentId) {
      const idToCancel = tempAppointmentId;
      setTempAppointmentId(null);
      try {
        await cancelAppointment(idToCancel, 'Booking abandoned before payment');
        toast.error('Booking abandoned before payment.');
      } catch (err) {
        console.error('Failed to auto-cancel unpaid appointment:', err);
      }
      await fetchAvailability();
    }
  };

  return (
    <div className="flex flex-col gap-5 select-none w-full">
      {/* ── Consultation Fee Header ── */}
      <div className="text-left pb-3 border-b border-neutral-200">
        <h2 className="text-display-sm font-medium text-neutral-900 tracking-tighter leading-none">
          ₹{consultationFee}
        </h2>
        <span className="text-sm font-semibold text-neutral-500 uppercase tracking-widest mt-1.5 block">
          PER SESSION
        </span>
      </div>

      {/* ── Loading / Auth Gates ── */}
      {loading && (
        <div className="w-full py-4 text-center text-ui-sm font-medium text-neutral-500 uppercase tracking-widest">
          Loading clinic availability...
        </div>
      )}

      {!loading && (
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
              <label className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">
                SELECT TIME SLOT
              </label>
              {selectedDate && (
                <span className="text-ui-sm font-medium text-primary">
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
                <span className="text-ui-sm text-neutral-500 font-medium uppercase">
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
              <span className="text-sm font-semibold text-neutral-500 uppercase tracking-widest">
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
              className="font-medium h-12"
            >
              {selectedSlot ? 'CONFIRM & PAY →' : 'SELECT A TIME SLOT'}
            </Button>
            <p className="text-sm font-medium text-neutral-500 mt-2 text-center tracking-wider">
              Secure payment via Razorpay. Confirmation sent by email.
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <BookingConfirmationModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onBook={handleBookAppointment}
        onPay={handleProceedToPayment}
        slot={selectedSlot}
        doctorName={doctorName}
        consultationFee={consultationFee}
        loading={bookingLoading}
        paymentLoading={paymentLoading}
        appointmentId={tempAppointmentId}
      />
    </div>
  );
};

export default SlotPicker;
