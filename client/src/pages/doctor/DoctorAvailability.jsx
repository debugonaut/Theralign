import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { createSlot, createRecurringSlots, getMySlots, deleteSlot } from '../../api/availability.api';
import SectionHeader from '../../components/common/SectionHeader';
import Badge from '../../components/common/Badge';

const DoctorAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' });
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);

  // Inline delete confirmation state: stores the ID of the slot currently being deleted
  const [deletingSlotId, setDeletingSlotId] = useState(null);

  // Get today's local date string formatted as YYYY-MM-DD for the date input's minimum attribute
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await getMySlots();
      const rawSlots = res.data?.slots || res.data || res.slots || [];
      setSlots(rawSlots);
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO FETCH CLINICAL SCHEDULE SLOTS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'MANAGE AVAILABILITY — Theralign';
    fetchSlots();
  }, []);

  // Form Handle Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Form validations
  const isTimeInvalid = formData.startTime && formData.endTime && formData.startTime >= formData.endTime;
  const isFormIncomplete = !formData.date || !formData.startTime || !formData.endTime || isTimeInvalid;

  // Add new slot
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFormIncomplete) return;

    setSubmitting(true);
    try {
      if (isRecurring) {
        const res = await createRecurringSlots({
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          repeatWeeks,
        });
        if (res.success) {
          toast.success('WEEKLY RECURRING SLOTS CREATED.');
          setFormData({ date: formData.date, startTime: '', endTime: '' });
          setIsRecurring(false);
          await fetchSlots();
        }
      } else {
        const res = await createSlot(formData);
        if (res.success) {
          toast.success('AVAILABILITY SLOT ADDED.');
          setFormData({ date: formData.date, startTime: '', endTime: '' });
          await fetchSlots();
        }
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        toast.error('A SLOT OVERLAP DETECTED FOR THIS TIME RANGE.');
      } else {
        toast.error(err.response?.data?.message || 'FAILED TO CREATE TIME SLOT.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete slot
  const handleDeleteConfirm = async (slotId) => {
    try {
      const res = await deleteSlot(slotId);
      if (res.success) {
        toast.success('SLOT DELETED.');
        setSlots(slots.filter((s) => s._id !== slotId));
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO DELETE SLOT.');
    } finally {
      setDeletingSlotId(null);
    }
  };

  const formatHumanDate = (dateStr) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).toUpperCase();
    } catch (e) {
      return dateStr;
    }
  };

  // Group slots by date
  const groupedSlots = slots
    .filter((s) => s.date >= todayString)
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .reduce((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    }, {});
    
  const sortedDates = Object.keys(groupedSlots).sort();

  return (
    <div className="flex flex-col gap-10 select-none text-left bg-white max-w-5xl mx-auto w-full">
      
      {/* ── Page Header Section ── */}
      <div>
        <SectionHeader title="MANAGE AVAILABILITY" size="lg" ruled={true} className="mb-0" />
        <p className="text-ui-sm text-neutral-700 font-bold uppercase tracking-wide mt-3">
          Create time slots to allow patients to book appointments. Slots you add here appear on your public profile.
        </p>
      </div>

      {/* ── Add Slot Form Card (Horizontal Density Single Row Layout) ── */}
      <div className="w-full p-6 bg-white border border-neutral-200/50 rounded-lg shadow-level-1 transition-warm">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4 w-full">
          
          {/* Date Input */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              DATE
            </span>
            <input
              type="date"
              name="date"
              min={todayString}
              value={formData.date}
              onChange={handleChange}
              className="bg-white border border-neutral-300 focus:border-[#0A7E6E] px-4 py-2 text-ui-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-[#0A7E6E]/20 transition-all rounded-md transition-warm"
              required
            />
          </div>

          {/* Start Time */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              START TIME
            </span>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="bg-white border border-neutral-300 focus:border-[#0A7E6E] px-4 py-2 text-ui-sm font-semibold text-neutral-900 focus:ring-2 focus:ring-[#0A7E6E]/20 transition-all rounded-md transition-warm"
              required
            />
          </div>

          {/* End Time */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              END TIME
            </span>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={`bg-white border px-4 py-2 text-ui-sm font-semibold uppercase tracking-wider focus:ring-2 transition-all duration-fast rounded-md transition-warm
                ${isTimeInvalid 
                  ? 'border-warning text-warning focus:border-warning focus:ring-warning/20' 
                  : 'border-neutral-300 text-neutral-900 focus:border-[#0A7E6E] focus:ring-[#0A7E6E]/20'
                }
              `}
              required
            />
          </div>

          {/* Repeat Weekly Toggle */}
          <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 p-1.5 h-[42px] shrink-0 rounded-md transition-warm">
            <button
              type="button"
              onClick={() => setIsRecurring(!isRecurring)}
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-150 rounded-md cursor-pointer select-none
                ${isRecurring 
                  ? 'bg-neutral-900 text-white shadow-level-1' 
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900'
                }
              `}
            >
              REPEAT WEEKLY
            </button>

            {isRecurring && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">FOR</span>
                <input
                  type="number"
                  min="2"
                  max="12"
                  value={repeatWeeks}
                  onChange={(e) => setRepeatWeeks(parseInt(e.target.value) || 4)}
                  className="w-12 bg-white border border-neutral-300 focus:border-[#0A7E6E] focus:ring-2 focus:ring-[#0A7E6E]/20 text-center text-ui-xs font-semibold p-0.5 rounded-md transition-warm"
                />
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">WEEKS</span>
              </div>
            )}
          </div>

          {/* Add Slot Button (Accent Red CTA) */}
          <button
            type="submit"
            disabled={isFormIncomplete || submitting}
            className="h-[42px] px-6 bg-accent hover:bg-accent/90 text-white font-bold text-ui-sm uppercase tracking-wider transition-all duration-150 active:scale-[0.97] select-none shrink-0 rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-level-1"
          >
            {submitting ? 'ADDING...' : 'ADD SLOT →'}
          </button>

        </form>
      </div>

      {/* ── Slot list (Single Column Grouped) ── */}
      <div className="flex flex-col gap-8 select-none w-full">
        <div className="flex items-center justify-between pb-2 border-b-2 border-neutral-900">
          <span className="text-ui-md font-black text-neutral-900 uppercase tracking-tighter">
            UPCOMING SCHEDULE
          </span>
        </div>

        {sortedDates.length === 0 ? (
          <div className="border border-neutral-200 border-dashed p-12 text-center rounded-lg bg-neutral-50 select-none flex flex-col items-center gap-2">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
              NO SLOTS LISTED
            </span>
            <p className="text-ui-sm text-neutral-700 font-bold max-w-sm uppercase">
              Add slots using the form at the top to configure your clinic availability.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {sortedDates.map(dateStr => (
              <div key={dateStr} className="flex flex-col gap-3">
                <h3 className="text-ui-sm font-black text-neutral-600 uppercase tracking-widest border-b border-neutral-100 pb-1">
                  {formatHumanDate(dateStr)}
                </h3>
                <div className="w-full border border-neutral-200/50 rounded-lg shadow-level-1 bg-white select-none overflow-hidden">
                  <table className="w-full text-left border-collapse select-none">
                    <thead>
                      <tr className="border-b border-neutral-100 bg-neutral-50">
                        <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest w-[20%]">START</th>
                        <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest w-[20%]">END</th>
                        <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest w-[20%]">DURATION</th>
                        <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest w-[20%]">STATUS</th>
                        <th className="px-6 py-3.5 text-neutral-500 font-black uppercase text-[10px] tracking-widest text-right w-[20%]">DELETE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {groupedSlots[dateStr].map((slot) => {
                        const isBooked = slot.isBooked;
                        const isDeleting = deletingSlotId === slot._id;
                        
                        // Calculate duration in minutes
                        let durationText = '30 MIN';
                        try {
                          const [sh, sm] = slot.startTime.split(':').map(Number);
                          const [eh, em] = slot.endTime.split(':').map(Number);
                          const diff = (eh * 60 + em) - (sh * 60 + sm);
                          durationText = `${diff} MIN`;
                        } catch (e) {}

                        return (
                          <tr
                            key={slot._id}
                            className={`h-12 transition-colors duration-fast select-none
                              ${isDeleting ? 'bg-[rgba(255,48,0,0.04)]' : 'hover:bg-neutral-50'}
                            `}
                          >
                            {/* Start Time */}
                            <td className="px-6 py-3 text-ui-sm font-black text-neutral-900 uppercase">
                              {slot.startTime}
                            </td>

                            {/* End Time */}
                            <td className="px-6 py-3 text-ui-sm font-black text-neutral-900 uppercase">
                              {slot.endTime}
                            </td>

                            {/* Duration */}
                            <td className="px-6 py-3 text-ui-xs font-bold text-neutral-500 uppercase tracking-widest">
                              {durationText}
                            </td>

                            {/* Status */}
                            <td className="px-6 py-3">
                              {isBooked ? (
                                <Badge variant="paid" label="BOOKED" />
                              ) : !slot.isActive ? (
                                <Badge variant="cancelled" label="INACTIVE" />
                              ) : (
                                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                  AVAILABLE
                                </span>
                              )}
                            </td>

                            {/* Delete action */}
                            <td className="px-6 py-3 text-right">
                              {isBooked ? (
                                <span
                                  className="text-neutral-500 text-sm font-bold select-none block text-right pr-2 cursor-default"
                                  title="CANNOT DELETE A BOOKED SLOT"
                                >
                                  —
                                </span>
                              ) : isDeleting ? (
                                <div className="flex items-center justify-end gap-3 select-none">
                                  <button
                                    onClick={() => handleDeleteConfirm(slot._id)}
                                    className="text-[9px] font-bold text-[#E8341A] border border-[#E8341A] px-2 py-0.5 uppercase tracking-wider hover:bg-[#E8341A] hover:text-white transition-all duration-150 cursor-pointer rounded-md shadow-level-1"
                                  >
                                    CONFIRM DELETE
                                  </button>
                                  <button
                                    onClick={() => setDeletingSlotId(null)}
                                    className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider hover:text-neutral-900 cursor-pointer bg-transparent border-0"
                                  >
                                    CANCEL
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeletingSlotId(slot._id)}
                                  className="w-7 h-7 border border-neutral-200 hover:border-[#E8341A] text-neutral-600 hover:text-[#E8341A] flex items-center justify-center font-bold transition-all duration-150 rounded-md cursor-pointer bg-neutral-50 hover:bg-neutral-100 ml-auto"
                                  title="Delete slot"
                                >
                                  ✕
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default DoctorAvailability;
