import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { getDoctorAvailability } from '../../api/appointment.api';
import { rescheduleAppointment } from '../../api/appointment.api';
import { toast } from 'react-hot-toast';

const RescheduleModal = ({ isOpen, onClose, appointment, onSuccess }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && appointment?.doctor?._id) {
      const fetchAvailability = async () => {
        setLoading(true);
        try {
          const data = await getDoctorAvailability(appointment.doctor._id);
          // Filter out the currently booked slot from the results to prevent re-selection
          const filtered = data.map(group => ({
            ...group,
            slots: group.slots.filter(s => s._id !== appointment.slot?._id && s._id !== appointment.slot)
          })).filter(group => group.slots.length > 0);

          setAvailability(filtered);
          if (filtered.length > 0) {
            setSelectedDate(filtered[0].date);
          } else {
            setSelectedDate('');
          }
          setSelectedSlot(null);
        } catch (err) {
          console.error(err);
          toast.error('Failed to load doctor availability.');
        } finally {
          setLoading(false);
        }
      };
      fetchAvailability();
    }
  }, [isOpen, appointment]);

  if (!isOpen) return null;

  const currentGroup = availability.find(group => group.date === selectedDate);
  const availableSlots = currentGroup ? currentGroup.slots : [];

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
  };

  const handleReschedule = async () => {
    if (!selectedSlot) {
      toast.error('Please select a new time slot.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await rescheduleAppointment(appointment._id, selectedSlot._id);
      if (res.success) {
        toast.success('Appointment rescheduled successfully!');
        if (onSuccess) onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        toast.error('The selected slot was just booked. Please pick another one.');
        // Refresh availability list
        if (appointment?.doctor?._id) {
          const data = await getDoctorAvailability(appointment.doctor._id);
          const filtered = data.map(group => ({
            ...group,
            slots: group.slots.filter(s => s._id !== appointment.slot?._id && s._id !== appointment.slot)
          })).filter(group => group.slots.length > 0);
          setAvailability(filtered);
          setSelectedSlot(null);
        }
      } else {
        toast.error(err.response?.data?.message || 'Failed to reschedule appointment.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatHumanDate = (dateStr) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const formatFullHumanDate = (dateStr) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="bg-white border border-slate-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 animate-scaleIn text-left flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50 bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-sm font-medium text-slate-800">Reschedule Appointment</h3>
            <p className="text-sm text-slate-500 font-medium mt-0.5">
              Select a new time slot with Dr. {appointment?.doctor?.user?.name || 'Physiotherapist'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 min-h-0">
          {/* Current Booking Info Alert */}
          <div className="p-3.5 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-2.5">
            <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={16} />
            <div className="text-sm text-amber-800 leading-relaxed font-normal">
              Your current booking is on <strong className="text-amber-900">{formatFullHumanDate(appointment?.date)}</strong> at <strong className="text-amber-900">{appointment?.startTime} – {appointment?.endTime}</strong>. Confirming a new slot will automatically release this time to other patients.
            </div>
          </div>

          {loading ? (
            <div className="py-4 text-center">
              <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary mx-auto" />
              <p className="mt-3 text-sm text-slate-400 font-medium">Fetching therapist's calendar...</p>
            </div>
          ) : availability.length === 0 ? (
            <div className="py-4 text-center flex flex-col items-center gap-2">
              <Calendar className="h-8 w-8 text-neutral-400 mx-auto" strokeWidth={1.5} />
              <p className="text-sm font-medium text-slate-700">No Other Slots Available</p>
              <p className="text-sm text-slate-400 max-w-xs">
                This doctor doesn't have any other open availability slots at the moment. Keep your current booking or try again later.
              </p>
            </div>
          ) : (
            <div className="space-y-5 select-none">
              {/* Date Pills Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 uppercase tracking-wider block">
                  Select a New Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide shrink-0">
                  {availability.map((group) => {
                    const isSelected = group.date === selectedDate;
                    return (
                      <button
                        key={group.date}
                        type="button"
                        onClick={() => handleDateSelect(group.date)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-primary border-primary text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200/60 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                        }`}
                      >
                        {formatHumanDate(group.date)}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Chips Grid */}
              <div className="space-y-2.5">
                <label className="text-sm font-medium text-slate-400 uppercase tracking-wider block">
                  Select a New Time Slot
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-sm text-slate-400 font-normal italic">No active slots left on this day.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot?._id === slot._id;
                      return (
                        <button
                          key={slot._id}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3 rounded-xl text-xs font-bold border transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-primary text-primary shadow-sm ring-1 ring-primary/20'
                              : 'bg-white border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <Clock size={13} className={isSelected ? 'text-primary' : 'text-slate-400'} />
                          {slot.startTime} – {slot.endTime}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            Keep Original
          </button>
          <button
            type="button"
            onClick={handleReschedule}
            disabled={submitting || !selectedSlot}
            className="bg-primary hover:bg-primary-dark text-white rounded-xl px-5 py-2.5 font-medium text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rescheduling...
              </>
            ) : (
              'Confirm Reschedule'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleModal;
