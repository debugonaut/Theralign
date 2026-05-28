import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { getDoctorAvailability, bookAppointment } from '../../api/appointment.api';
import useAuthStore from '../../store/authStore';
import BookingConfirmationModal from './BookingConfirmationModal';
import { useRazorpay } from '../../hooks/useRazorpay';

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
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-8 text-center flex flex-col items-center gap-2">
              <span className="text-3xl">📅</span>
              <p className="text-xs font-bold text-slate-700">No Clinic Slots Available</p>
              <p className="text-[10px] text-slate-400 max-w-xs">
                This doctor hasn't posted availability slots yet. Please check back later or contact customer care.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Date Pills */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Select a Consultation Date
                </label>
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {availabilityByDate.map((group) => {
                    const { weekday, dayNum, month } = formatDatePill(group.date);
                    const isSelected = selectedDate === group.date;
                    return (
                      <button
                        key={group.date}
                        type="button"
                        onClick={() => handleDateSelect(group.date)}
                        className={`flex flex-col items-center justify-center w-16 py-3 rounded-2xl border transition-all cursor-pointer shrink-0 select-none ${
                          isSelected
                            ? 'bg-primary border-primary text-white shadow-md'
                            : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className={`text-[9px] uppercase font-bold tracking-wider ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                          {weekday}
                        </span>
                        <span className="text-base font-extrabold leading-none mt-1">{dayNum}</span>
                        <span className={`text-[9px] font-bold mt-1 ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                          {month}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

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
