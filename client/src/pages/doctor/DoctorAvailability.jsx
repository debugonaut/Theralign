import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getWeeklyScheduleAPI, saveWeeklyScheduleAPI, blockDateAPI, unblockDateAPI } from '../../api/availability.api';
import SectionHeader from '../../components/common/SectionHeader';
import Button from '../../components/common/Button';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = [
  { key: 'monday',    label: 'Monday' },
  { key: 'tuesday',   label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday',  label: 'Thursday' },
  { key: 'friday',    label: 'Friday' },
  { key: 'saturday',  label: 'Saturday' },
  { key: 'sunday',    label: 'Sunday' },
];

const DEFAULT_SCHEDULE = DAYS.reduce((acc, d) => {
  acc[d.key] = { enabled: false, startTime: '09:00', endTime: '17:00' };
  return acc;
}, {});

const TIME_OPTIONS = [];
for (let h = 6; h <= 22; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hStr = String(h).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    TIME_OPTIONS.push(`${hStr}:${mStr}`);
  }
}

// ─── Time Select ─────────────────────────────────────────────────────────────
const TimeSelect = ({ value, onChange, disabled }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={`h-9 px-2 border border-neutral-200 rounded-md text-ui-xs font-bold text-neutral-900 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white ${
      disabled ? 'opacity-40 cursor-not-allowed' : ''
    }`}
  >
    {TIME_OPTIONS.map((t) => (
      <option key={t} value={t}>{t}</option>
    ))}
  </select>
);

// ─── Toggle Switch ────────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-primary border-primary' : 'bg-neutral-200 border-neutral-200'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
        checked ? 'translate-x-5' : 'translate-x-0.5'
      }`}
    />
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DoctorAvailability = () => {
  const [schedule, setSchedule]           = useState(DEFAULT_SCHEDULE);
  const [slotDuration, setSlotDuration]   = useState(30);
  const [breakEnabled, setBreakEnabled]   = useState(false);
  const [breakStart, setBreakStart]       = useState('13:00');
  const [breakEnd, setBreakEnd]           = useState('14:00');
  const [blockedDates, setBlockedDates]   = useState([]);
  const [newBlockDate, setNewBlockDate]   = useState('');
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [blockingDate, setBlockingDate]   = useState(false);

  // Get today's local date string for the date input min attribute
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getWeeklyScheduleAPI();
      const s = res?.data?.schedule;
      if (s) {
        setSchedule(s.schedule || DEFAULT_SCHEDULE);
        setSlotDuration(s.slotDurationMinutes || 30);
        setBreakEnabled(s.breakEnabled || false);
        setBreakStart(s.breakStartTime || '13:00');
        setBreakEnd(s.breakEndTime || '14:00');
        setBlockedDates(s.blockedDates || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO LOAD WEEKLY SCHEDULE.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'MANAGE AVAILABILITY — Theralign';
    loadSchedule();
  }, [loadSchedule]);

  // ─── Day row handlers ────────────────────────────────────────────────────
  const toggleDay = (dayKey) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], enabled: !prev[dayKey].enabled },
    }));
  };

  const setDayTime = (dayKey, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: { ...prev[dayKey], [field]: value },
    }));
  };

  const copyToAllDays = (sourceKey) => {
    const source = schedule[sourceKey];
    const updated = {};
    DAYS.forEach(({ key }) => {
      updated[key] = { ...source };
    });
    setSchedule(updated);
    toast.success('HOURS COPIED TO ALL DAYS.');
  };

  // ─── Save ────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveWeeklyScheduleAPI({
        schedule,
        slotDurationMinutes: slotDuration,
        breakEnabled,
        breakStartTime: breakStart,
        breakEndTime: breakEnd,
      });
      toast.success('WEEKLY SCHEDULE SAVED SUCCESSFULLY.');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'FAILED TO SAVE SCHEDULE.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Block date ──────────────────────────────────────────────────────────
  const handleBlockDate = async () => {
    if (!newBlockDate) return;
    if (blockedDates.includes(newBlockDate)) {
      toast.error('DATE IS ALREADY BLOCKED.');
      return;
    }
    setBlockingDate(true);
    try {
      const res = await blockDateAPI(newBlockDate);
      setBlockedDates(res?.data?.blockedDates || [...blockedDates, newBlockDate]);
      setNewBlockDate('');
      toast.success(`DATE ${newBlockDate} BLOCKED.`);
    } catch (err) {
      toast.error('FAILED TO BLOCK DATE.');
    } finally {
      setBlockingDate(false);
    }
  };

  const handleUnblockDate = async (date) => {
    try {
      const res = await unblockDateAPI(date);
      setBlockedDates(res?.data?.blockedDates || blockedDates.filter((d) => d !== date));
      toast.success(`DATE ${date} UNBLOCKED.`);
    } catch (err) {
      toast.error('FAILED TO UNBLOCK DATE.');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-ui-sm font-medium text-neutral-500 uppercase tracking-widest">
        LOADING SCHEDULE CONFIGURATION...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 select-none text-left bg-white max-w-4xl mx-auto w-full">

      {/* ── Page Header ── */}
      <div>
        <SectionHeader title="WEEKLY SCHEDULE" size="lg" ruled={true} className="mb-0" />
        <p className="text-ui-sm text-neutral-700 font-medium uppercase tracking-wide mt-3">
          Set your recurring weekly hours. Patients will see available slots based on this schedule.
        </p>
      </div>

      {/* ── Section 1: Slot Duration ── */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Slot Duration" size="sm" ruled={true} className="mb-0" />
        <div className="flex items-center gap-3">
          {[30, 45, 60].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSlotDuration(d)}
              className={`px-5 py-2 border-2 text-[10px] font-black uppercase tracking-widest transition-all duration-150 rounded-md cursor-pointer ${
                slotDuration === d
                  ? 'bg-neutral-900 border-neutral-900 text-white'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-500'
              }`}
            >
              {d} MIN
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 2: Weekly Day Schedule ── */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Working Hours" size="sm" ruled={true} className="mb-0" />

        <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-level-1">
          {DAYS.map(({ key, label }, idx) => {
            const day = schedule[key] || { enabled: false, startTime: '09:00', endTime: '17:00' };
            const isLast = idx === DAYS.length - 1;
            return (
              <div
                key={key}
                className={`flex flex-wrap items-center gap-4 px-5 py-4 transition-colors duration-150 ${
                  day.enabled ? 'bg-white hover:bg-neutral-50/50' : 'bg-neutral-50'
                } ${!isLast ? 'border-b border-neutral-100' : ''}`}
              >
                {/* Toggle + Day Label */}
                <div className="flex items-center gap-3 w-36 shrink-0">
                  <Toggle checked={day.enabled} onChange={() => toggleDay(key)} />
                  <span className={`text-ui-xs font-black uppercase tracking-wider ${
                    day.enabled ? 'text-neutral-900' : 'text-neutral-400'
                  }`}>
                    {label}
                  </span>
                </div>

                {/* Time range */}
                {day.enabled ? (
                  <div className="flex items-center gap-2 flex-1">
                    <TimeSelect value={day.startTime} onChange={(v) => setDayTime(key, 'startTime', v)} />
                    <span className="text-neutral-400 font-medium text-sm">—</span>
                    <TimeSelect value={day.endTime} onChange={(v) => setDayTime(key, 'endTime', v)} />
                  </div>
                ) : (
                  <span className="text-sm font-medium text-neutral-400 uppercase tracking-widest flex-1">
                    Day Off
                  </span>
                )}

                {/* Copy to all */}
                {day.enabled && (
                  <button
                    type="button"
                    onClick={() => copyToAllDays(key)}
                    className="text-sm font-medium text-primary hover:underline uppercase tracking-widest shrink-0 transition-colors"
                  >
                    Copy to all →
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 3: Lunch / Break ── */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Break / Lunch Period" size="sm" ruled={true} className="mb-0" />

        <div className="border border-neutral-200 rounded-lg px-5 py-4 bg-white shadow-level-1">
          <div className="flex items-center gap-4 flex-wrap">
            <Toggle checked={breakEnabled} onChange={setBreakEnabled} />
            <span className={`text-ui-sm font-semibold uppercase tracking-wider ${breakEnabled ? 'text-neutral-900' : 'text-neutral-400'}`}>
              Enable lunch break (slots will not be generated during this window)
            </span>
            {breakEnabled && (
              <div className="flex items-center gap-2 ml-2">
                <TimeSelect value={breakStart} onChange={setBreakStart} />
                <span className="text-neutral-400 font-medium text-sm">—</span>
                <TimeSelect value={breakEnd} onChange={setBreakEnd} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 4: Save ── */}
      <div className="flex justify-start">
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving}
          className="h-10 px-6 font-medium"
        >
          {saving ? 'SAVING...' : 'SAVE SCHEDULE →'}
        </Button>
      </div>

      {/* ── Divider ── */}
      <div className="h-px bg-neutral-200 w-full max-w-[1200px]" />

      {/* ── Section 5: Block Dates ── */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="BLOCK DATES" size="sm" ruled={true} className="mb-0" />
        <p className="text-ui-sm text-neutral-500 font-medium">
          Mark specific dates as unavailable (holidays, leave, conferences). Blocked dates override your weekly schedule.
        </p>

        {/* Add block date form */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="date"
            min={today}
            value={newBlockDate}
            onChange={(e) => setNewBlockDate(e.target.value)}
            className="h-10 px-4 border border-neutral-200 rounded-md text-ui-sm font-normal text-neutral-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white focus:outline-none"
          />
          <Button
            variant="ghost"
            onClick={handleBlockDate}
            disabled={!newBlockDate || blockingDate}
            className="h-10 px-6 border-2 border-accent text-accent hover:bg-accent hover:text-white font-medium"
          >
            {blockingDate ? 'BLOCKING...' : 'BLOCK DATE →'}
          </Button>
        </div>

        {/* Blocked dates list */}
        {blockedDates.length > 0 ? (
          <div className="flex flex-col gap-2">
            {[...blockedDates].sort().map((date) => (
              <div
                key={date}
                className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-md px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />
                  <span className="text-ui-sm font-semibold text-neutral-900 uppercase">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUnblockDate(date)}
                  className="text-sm font-semibold text-neutral-500 hover:text-accent uppercase tracking-widest transition-colors cursor-pointer"
                >
                  REMOVE ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-200 rounded-md p-6 text-center">
            <span className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">
              No blocked dates — all scheduled days are available to patients
            </span>
          </div>
        )}
      </div>

    </div>
  );
};

export default DoctorAvailability;
