import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Calendar, Clock, Plus, Trash2, ShieldAlert, Sparkles, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { createSlot, getMySlots, deleteSlot } from '../../api/availability.api';

const DoctorAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ date: '', startTime: '', endTime: '' });
  const [formError, setFormError] = useState('');

  // Get today's local date string formatted as YYYY-MM-DD for the date input's minimum attribute
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`;

  // Fetch slots on component mount
  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await getMySlots();
      if (res.success && res.data) {
        setSlots(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load your availability slots.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // Compute grouped slots by date, sorted chronologically
  const slotsByDate = slots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

  // Sort dates keys chronologically
  const sortedDates = Object.keys(slotsByDate).sort();

  // Form handle change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  // Add new slot
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { date, startTime, endTime } = formData;

    if (!date || !startTime || !endTime) {
      setFormError('All fields are required.');
      return;
    }

    if (startTime >= endTime) {
      setFormError('Start time must be strictly before end time.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const res = await createSlot(formData);
      if (res.success) {
        toast.success('Availability slot added successfully!');
        // Reset form times but keep the selected date to make adding multiple slots for the same day easy
        setFormData({ date, startTime: '', endTime: '' });
        await fetchSlots();
      }
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        toast.error('A slot already exists for this date and time.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to add availability slot.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Delete slot
  const handleDelete = async (slot) => {
    if (slot.isBooked) {
      toast.error('Cannot delete a slot with an existing booking.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this availability slot?');
    if (!confirmDelete) return;

    try {
      const res = await deleteSlot(slot._id);
      if (res.success) {
        toast.success('Availability slot deleted.');
        // Update local state instantly for snappy UX
        setSlots(slots.filter(s => s._id !== slot._id));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete availability slot.');
    }
  };

  const formatHumanDate = (dateStr) => {
    try {
      // Append local T00:00:00 to prevent off-by-one UTC conversions
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
    <div className="space-y-8 select-none">
      {/* Greeting/Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="text-primary" size={24} />
          Manage Availability Slots
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Create and manage your clinical time slots to allow patients to schedule appointments with you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Form Card */}
        <div className="lg:col-span-1 bg-white border border-slate-100 p-6 rounded-2xl shadow-card">
          <h2 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="text-primary" size={18} />
            Add New Slot
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Date
              </label>
              <input
                type="date"
                name="date"
                min={todayString}
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-600 animate-pulse-subtle">
                <AlertCircle size={14} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-3 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding Slot...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Time Slot
                </>
              )}
            </button>
          </form>

          <div className="mt-6 p-4 bg-slate-50/60 border border-slate-100 rounded-xl flex items-start gap-2.5">
            <Sparkles className="text-primary mt-0.5 shrink-0" size={15} />
            <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Adding custom slots makes your clinic instantly discoverable to local patients in Pune. Keep your calendar up to date to boost ratings.
            </div>
          </div>
        </div>

        {/* Right Column: Existing Slots Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-primary" size={18} />
            Your Scheduled Slots
          </h2>

          {loading ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm select-none">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-xs font-semibold text-slate-400">Loading your clinic hours...</p>
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="bg-white border border-slate-100 border-dashed rounded-2xl p-12 text-center shadow-sm select-none flex flex-col items-center gap-3">
              <span className="text-4xl text-slate-300">📅</span>
              <p className="text-sm font-bold text-slate-700">No Availability Slots Added Yet</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Add your first time slot using the form on the left to start appearing in search lists!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map((dateKey) => (
                <div key={dateKey} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                  {/* Date Header */}
                  <h3 className="text-xs font-extrabold text-slate-700 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg inline-block">
                    {formatHumanDate(dateKey)}
                  </h3>

                  {/* Slots Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {slotsByDate[dateKey].map((slot) => (
                      <div
                        key={slot._id}
                        className={`border rounded-xl p-3.5 flex items-center justify-between transition-all ${
                          slot.isBooked
                            ? 'bg-slate-50/50 border-slate-100'
                            : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${slot.isBooked ? 'bg-slate-200/50 text-slate-400' : 'bg-blue-50 text-primary'}`}>
                            <Clock size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-slate-800">
                              {slot.startTime} – {slot.endTime}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5">
                              {slot.isBooked ? (
                                <span className="inline-flex items-center text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                                  Booked
                                </span>
                              ) : (
                                <span className="inline-flex items-center text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded">
                                  Available
                                </span>
                              )}
                              {!slot.isActive && (
                                <span className="inline-flex items-center text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-100 px-1.5 py-0.5 rounded">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <button
                          type="button"
                          onClick={() => handleDelete(slot)}
                          disabled={slot.isBooked}
                          className={`p-2 rounded-lg transition-all ${
                            slot.isBooked
                              ? 'text-slate-300 bg-slate-100/50 cursor-not-allowed'
                              : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                          }`}
                          title={slot.isBooked ? 'Has booking — cannot delete' : 'Delete slot'}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAvailability;
