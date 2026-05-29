import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getDoctorAvailability, bookAppointment } from '../../api/appointment.api';
import { joinWaitlist, leaveWaitlist, checkWaitlistStatus } from '../../api/waitlist.api';
import useAuthStore from '../../store/authStore';
import BookingConfirmationModal from './BookingConfirmationModal';
import { useRazorpay } from '../../hooks/useRazorpay';
import AvailabilityHeatmap from './AvailabilityHeatmap';
import { Bell, Check, AlertCircle } from 'lucide-react';

const SlotPicker = ({ doctorId, doctorName, consultationFee }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { initiatePayment } = useRazorpay();

  const [availabilityByDate, setAvailabilityByDate] = useState([]); // [{ date, slots: [] }]
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [onWaitlist, setOnWaitlist] = useState(false);
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // Fetch available slots for this doctor
  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const res = await getDoctorAvailability(doctorId);
      if (res.success && res.data) {
        setAvailabilityByDate(res.data);
        // Pre-select first date if slots exist
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
      toast.error('Failed to load doctor clinical slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [doctorId]);

  // Check waitlist subscription status on mount/availability fetch
  useEffect(() => {
    const fetchWaitlistStatus = async () => {
      if (availabilityByDate.length === 0 && isAuthenticated && user?.role === 'patient') {
        try {
          const res = await checkWaitlistStatus(doctorId);
          if (res.data?.success && res.data.data) {
            setOnWaitlist(res.data.data.onWaitlist);
          } else if (res.success && res.data) {
            setOnWaitlist(res.data.onWaitlist);
          }
        } catch (err) {
          console.warn('Silent waitlist status fetch warning:', err.message);
        }
      }
    };
    fetchWaitlistStatus();
  }, [availabilityByDate, doctorId, isAuthenticated, user]);

  const handleJoinWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      const res = await joinWaitlist(doctorId);
      setOnWaitlist(true);
      toast.success(res.message || res.data?.message || 'Joined waitlist! We will notify you when slots open.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join waitlist.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    setWaitlistLoading(true);
    try {
      const res = await leaveWaitlist(doctorId);
      setOnWaitlist(false);
      toast.success(res.message || res.data?.message || 'Removed from waitlist.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave waitlist.');
    } finally {
      setWaitlistLoading(false);
    }
  };

  // Derived state: slots for the selected date
  const slotsForSelectedDate = availabilityByDate.find(d => d.date === selectedDate)?.slots || [];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null); // Reset time selection on date switch
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
      toast.error('Only patient accounts can schedule appointments.');
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

        // Immediately trigger the secure online payment flow
        await initiatePayment({
          appointmentId,
          onSuccess: () => {
            setShowModal(false);
            setTimeout(() => {
              navigate('/patient/appointments');
            }, 1500);
          },
          onFailure: () => {
            setShowModal(false);
            setTimeout(() => {
              navigate('/patient/appointments');
            }, 1500);
          },
        });
      }
    } catch (err) {
      console.error(err);
      setShowModal(false);
      
      if (err.response?.status === 409) {
        toast.error('This slot was just booked by another patient. Please select another slot.');
        await fetchAvailability();
      } else {
        toast.error(err.response?.data?.message || 'Booking transaction failed. Please try again.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDatePill = (dateStr) => {
    try {
      const dateObj = new Date(dateStr + 'T00:00:00');
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); // Mon
      const dayNum = dateObj.toLocaleDateString('en-US', { day: 'numeric' }); // 10
      const month = dateObj.toLocaleDateString('en-US', { month: 'short' }); // Feb
      return { weekday, dayNum, month };
    } catch (e) {
      return { weekday: '', dayNum: dateStr, month: '' };
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left select-none space-y-6">
      <h2 className="text-lg font-bold text-slate-800 pb-2 border-b border-slate-50 flex items-center gap-2">
        <Calendar size={20} className="text-primary" />
        Schedule Consultation
      </h2>

      {/* Auth Guard Banner */}
      {!isAuthenticated && (
        <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-5 text-center flex flex-col items-center gap-3">
          <div className="p-2.5 bg-slate-200/50 text-slate-500 rounded-xl">
            <Lock size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Patient Scheduling Restricted</p>
            <p className="text-[10px] text-slate-400 mt-1">
              Please sign in or register a patient account to browse dates and claim time slots.
            </p>
          </div>
          <Link
            to="/login"
            state={{ from: window.location.pathname }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline transition-colors mt-1 cursor-pointer"
          >
            Login to Book Slot <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {isAuthenticated && user?.role !== 'patient' && (
        <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-5 text-center flex flex-col items-center gap-2.5">
          <Lock className="text-slate-400" size={20} />
          <p className="text-xs font-bold text-slate-700">Patients-Only Action</p>
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs">
            You are logged in as a <b>{user?.role}</b>. Realtime bookings are only permitted for patient accounts.
          </p>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && isAuthenticated && user?.role === 'patient' && (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-slate-100 rounded w-1/4" />
          <div className="flex gap-3 overflow-hidden">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-16 h-20 bg-slate-100 rounded-2xl shrink-0" />
            ))}
          </div>
          <div className="h-4 bg-slate-100 rounded w-1/4 pt-2" />
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-10 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Main Picker Interface */}
      {!loading && isAuthenticated && user?.role === 'patient' && (
        <>
          {availabilityByDate.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
              <div className="p-3 bg-white rounded-full border border-slate-100 shadow-sm flex items-center justify-center">
                <Bell className="h-6 w-6 text-slate-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700">No Clinic Slots Available</p>
                <p className="text-[10px] text-slate-400 max-w-xs mt-1">
                  This doctor hasn't posted availability slots yet. Join the waitlist to receive immediate alerts when slots open up!
                </p>
              </div>

              {onWaitlist ? (
                <div className="w-full flex flex-col items-center mt-2 p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                    <Check className="h-4 w-4 bg-emerald-100 rounded-full p-0.5" />
                    You are on the waitlist
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    We will notify you immediately once slot dates are scheduled.
                  </p>
                  <button
                    type="button"
                    onClick={handleLeaveWaitlist}
                    disabled={waitlistLoading}
                    className="text-[10px] text-slate-400 hover:text-red-500 font-bold transition-colors mt-3 border-t border-slate-100 w-full pt-2"
                  >
                    {waitlistLoading ? 'Processing...' : 'Leave waitlist'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleJoinWaitlist}
                  disabled={waitlistLoading}
                  className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer mt-2 w-full justify-center"
                >
                  <Bell className="h-3.5 w-3.5" />
                  {waitlistLoading ? 'Joining...' : 'Join Waitlist'}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Availability Heatmap (Feature F6) */}
              <AvailabilityHeatmap
                availabilityByDate={availabilityByDate}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
              />

              {/* Time Chips */}
              {selectedDate && (
                <div className="space-y-2.5 animate-fadeIn">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Select a Time Window
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {slotsForSelectedDate.map((slot) => {
                      const isSelected = selectedSlot?._id === slot._id;
                      return (
                        <button
                          key={slot._id}
                          type="button"
                          onClick={() => handleSlotSelect(slot)}
                          className={`py-3 px-4 rounded-xl border font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-blue-50 border-primary text-primary shadow-sm ring-1 ring-primary/20'
                              : 'bg-slate-50/50 border-slate-100 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          <Clock size={12} className={isSelected ? 'text-primary' : 'text-slate-400'} />
                          {slot.startTime} – {slot.endTime}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CTA Booking Button */}
              <button
                type="button"
                onClick={handleOpenBookingModal}
                disabled={!selectedSlot}
                className="w-full bg-primary hover:bg-primary-dark text-white rounded-2xl py-3.5 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                Schedule Booking
                <ArrowRight size={16} />
              </button>
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
