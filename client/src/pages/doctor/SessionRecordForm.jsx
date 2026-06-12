import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  RotateCcw,
  ChevronDown,
  Dumbbell,
  Plus,
  Trash2,
  Loader2,
  CheckCircle,
  Calendar,
  ClipboardList,
} from 'lucide-react';

import { getDoctorAppointments } from '../../api/appointment.api';
import {
  createSessionRecord,
  getSessionRecord,
  updateSessionRecord,
} from '../../api/sessionRecord.api';

import SectionHeader from '../../components/common/SectionHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const PROGRESS_RATING_OPTIONS = [
  { value: 'worse', label: 'Worse', bg: 'bg-[#C0392B] text-white border-[#C0392B]' },
  { value: 'no_change', label: 'No Change', bg: 'bg-[#B45309] text-white border-[#B45309]' },
  { value: 'slight_improvement', label: 'Slight Improvement', bg: 'bg-[#0B4F6C] text-white border-[#0B4F6C]' },
  { value: 'significant_improvement', label: 'Significant Improvement', bg: 'bg-[#0A7E6E] text-white border-[#0A7E6E]' },
  { value: 'resolved', label: 'Resolved', bg: 'bg-[#0A7E6E] text-white border-[#0A7E6E]', icon: CheckCircle },
];

const PRESETS = [
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '3 weeks', days: 21 },
  { label: '1 month', days: 30 },
  { label: '6 weeks', days: 42 },
  { label: '2 months', days: 60 },
  { label: '3 months', days: 90 },
  { label: 'Custom', days: 'custom' },
];

export default function SessionRecordForm() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form Mode & Lock Status
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [signedDate, setSignedDate] = useState(null);

  // Accordion toggle states (all expanded by default)
  const [expanded, setExpanded] = useState({
    clinical: true,
    exercise: true,
    meds: true,
    followup: true,
  });

  // State for Medications Tag Input
  const [medInput, setMedInput] = useState('');

  // Follow-up Interval Preset selection
  const [selectedPreset, setSelectedPreset] = useState('');

  // Draft banner state
  const [hasDraft, setHasDraft] = useState(false);

  // Share confirmation modal state
  const [showShareModal, setShowShareModal] = useState(false);

  const DRAFT_KEY = `sessionRecord_draft_${appointmentId}`;

  const defaultFormState = {
    presentingCondition: '',
    treatmentProvided: '',
    progressRating: '',
    painScoreBefore: '',
    painScoreAfter: '',
    exercisePrescription: [],
    medications: [],
    clinicalObservations: '',
    followUpRecommendation: {
      recommended: false,
      intervalDays: '',
      suggestedDate: '',
      sessionGoal: '',
    },
    isSharedWithPatient: true,
  };

  const [formData, setFormData] = useState(defaultFormState);

  // Fetch Appointment context and Session Record
  useEffect(() => {
    const loadContextAndData = async () => {
      setLoading(true);
      try {
        // Fetch doctor appointments list and filter by ID
        const apptsRes = await getDoctorAppointments();
        const apptsList = apptsRes.data?.appointments || apptsRes.data || apptsRes.appointments || [];
        const matchingAppt = apptsList.find((a) => a._id === appointmentId);
        
        if (!matchingAppt) {
          toast.error('Appointment context not found.');
          navigate('/doctor/appointments');
          return;
        }

        if (matchingAppt.status !== 'completed') {
          toast.error('Session records can only be created for completed appointments.');
          navigate('/doctor/appointments');
          return;
        }

        setAppointment(matchingAppt);

        // Try retrieving existing session record
        try {
          const recRes = await getSessionRecord(appointmentId);
          const record = recRes.data?.data || recRes.data;
          if (record) {
            setIsEditMode(true);
            setSignedDate(record.doctorSignedAt);

            // Populate form values mapping null/missing clinical fields appropriately
            setFormData({
              presentingCondition: record.presentingCondition || '',
              treatmentProvided: record.treatmentProvided || '',
              progressRating: record.progressRating || '',
              painScoreBefore: record.painScoreBefore !== null && record.painScoreBefore !== undefined ? record.painScoreBefore : '',
              painScoreAfter: record.painScoreAfter !== null && record.painScoreAfter !== undefined ? record.painScoreAfter : '',
              exercisePrescription: record.exercisePrescription || [],
              medications: record.medications || [],
              clinicalObservations: record.clinicalObservations || '',
              followUpRecommendation: {
                recommended: record.followUpRecommendation?.recommended || false,
                intervalDays: record.followUpRecommendation?.intervalDays !== null && record.followUpRecommendation?.intervalDays !== undefined ? record.followUpRecommendation.intervalDays : '',
                suggestedDate: record.followUpRecommendation?.suggestedDate || '',
                sessionGoal: record.followUpRecommendation?.sessionGoal || '',
              },
              isSharedWithPatient: record.isSharedWithPatient !== false,
            });

            // Map loaded intervalDays to presets if possible
            const loadedDays = record.followUpRecommendation?.intervalDays;
            if (loadedDays) {
              const matched = PRESETS.find((p) => p.days === loadedDays);
              setSelectedPreset(matched ? matched.label : 'Custom');
            }

            // Check if 24-hour edit window is expired
            if (record.doctorSignedAt) {
              const msElapsed = Date.now() - new Date(record.doctorSignedAt).getTime();
              if (msElapsed > 24 * 60 * 60 * 1000) {
                setIsReadOnly(true);
              }
            }
          }
        } catch (err) {
          // If 404, record does not exist yet. Check for draft in localStorage
          if (err.response?.status === 404 || err.status === 404) {
            const savedDraft = localStorage.getItem(DRAFT_KEY);
            if (savedDraft) {
              try {
                const draft = JSON.parse(savedDraft);
                setFormData(draft);
                setHasDraft(true);
                
                // Map draft intervalDays to presets if possible
                const draftDays = draft.followUpRecommendation?.intervalDays;
                if (draftDays) {
                  const matched = PRESETS.find((p) => p.days === draftDays);
                  setSelectedPreset(matched ? matched.label : 'Custom');
                }
              } catch {
                localStorage.removeItem(DRAFT_KEY);
              }
            }
          } else {
            console.error(err);
            toast.error('Failed to load session record status.');
          }
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load appointment details.');
        navigate('/doctor/appointments');
      } finally {
        setLoading(false);
      }
    };

    loadContextAndData();
  }, [appointmentId]);

  // Debounced autosave to localStorage (only when not in read-only and not already existing in DB)
  useEffect(() => {
    if (loading || isEditMode || isReadOnly) return;

    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
    }, 500);

    return () => clearTimeout(timer);
  }, [formData, loading, isEditMode, isReadOnly]);

  // Toggle sections helper
  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Discard draft helper
  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData(defaultFormState);
    setSelectedPreset('');
    setHasDraft(false);
    toast.success('Draft discarded successfully.');
  };

  // Inline inputs change helpers
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFollowUpFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      followUpRecommendation: {
        ...prev.followUpRecommendation,
        [field]: value,
      },
    }));
  };

  // Follow-up preset change helper
  const handlePresetChange = (presetLabel) => {
    setSelectedPreset(presetLabel);
    const preset = PRESETS.find((p) => p.label === presetLabel);
    if (!preset) return;

    if (preset.days === 'custom') {
      // Clear preset values, let user type
      setFormData((prev) => ({
        ...prev,
        followUpRecommendation: {
          ...prev.followUpRecommendation,
          intervalDays: '',
          suggestedDate: '',
        },
      }));
    } else {
      const days = preset.days;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      const dateString = futureDate.toISOString().split('T')[0];

      setFormData((prev) => ({
        ...prev,
        followUpRecommendation: {
          ...prev.followUpRecommendation,
          intervalDays: days,
          suggestedDate: dateString,
        },
      }));
    }
  };

  // Custom days input helper
  const handleCustomDaysChange = (val) => {
    const days = parseInt(val, 10);
    if (isNaN(days) || days <= 0) {
      setFormData((prev) => ({
        ...prev,
        followUpRecommendation: {
          ...prev.followUpRecommendation,
          intervalDays: '',
          suggestedDate: '',
        },
      }));
      return;
    }

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const dateString = futureDate.toISOString().split('T')[0];

    setFormData((prev) => ({
      ...prev,
      followUpRecommendation: {
        ...prev.followUpRecommendation,
        intervalDays: days,
        suggestedDate: dateString,
      },
    }));
  };

  // Date picker suggested return date change helper
  const handleSuggestedDateChange = (dateVal) => {
    if (!dateVal) {
      setFormData((prev) => ({
        ...prev,
        followUpRecommendation: {
          ...prev.followUpRecommendation,
          suggestedDate: '',
          intervalDays: '',
        },
      }));
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(dateVal);
    selected.setHours(0, 0, 0, 0);
    
    const diffTime = selected.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    setFormData((prev) => ({
      ...prev,
      followUpRecommendation: {
        ...prev.followUpRecommendation,
        suggestedDate: dateVal,
        intervalDays: diffDays > 0 ? diffDays : '',
      },
    }));

    // Check if calculated days match any preset
    if (diffDays > 0) {
      const matched = PRESETS.find((p) => p.days === diffDays);
      setSelectedPreset(matched ? matched.label : 'Custom');
    }
  };

  // Exercises array helpers
  const handleAddExercise = () => {
    const newItem = { exerciseName: '', sets: '', reps: '', frequency: '', duration: '', notes: '' };
    setFormData((prev) => ({
      ...prev,
      exercisePrescription: [...prev.exercisePrescription, newItem],
    }));
  };

  const handleUpdateExercise = (index, field, value) => {
    const updated = [...formData.exercisePrescription];
    updated[index] = {
      ...updated[index],
      [field]: field === 'sets' || field === 'reps' ? (value === '' ? '' : parseInt(value, 10)) : value,
    };
    setFormData((prev) => ({ ...prev, exercisePrescription: updated }));
  };

  const handleRemoveExercise = (index) => {
    const updated = formData.exercisePrescription.filter((_, idx) => idx !== index);
    setFormData((prev) => ({ ...prev, exercisePrescription: updated }));
  };

  // Medications list helpers
  const handleMedKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = medInput.trim().replace(/,$/, '');
      if (trimmed && !formData.medications.includes(trimmed)) {
        setFormData((prev) => ({
          ...prev,
          medications: [...prev.medications, trimmed],
        }));
      }
      setMedInput('');
    }
  };

  const handleRemoveMed = (index) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, idx) => idx !== index),
    }));
  };

  // Intercept Share toggle ON -> OFF
  const handleShareToggle = (e) => {
    const checked = e.target.checked;
    if (!checked) {
      // Prevent immediate toggle, show confirmation modal instead
      e.preventDefault();
      setShowShareModal(true);
    } else {
      handleFieldChange('isSharedWithPatient', true);
    }
  };

  const confirmKeepPrivate = () => {
    handleFieldChange('isSharedWithPatient', false);
    setShowShareModal(false);
  };

  // Date display helper
  const getDisplayDateString = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Time format helper
  const formatApptTime = (time) => {
    if (!time) return '';
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch {
      return time;
    }
  };

  // Form Submit Action
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    // Validate required fields
    if (!formData.presentingCondition.trim()) {
      toast.error('Presenting Condition is required.');
      return;
    }
    if (!formData.treatmentProvided.trim()) {
      toast.error('Treatment Provided is required.');
      return;
    }
    if (!formData.progressRating) {
      toast.error('Progress Rating selection is required.');
      return;
    }

    setSubmitting(true);
    try {
      // Sanitize fields before sending
      const payload = {
        presentingCondition: formData.presentingCondition.trim(),
        treatmentProvided: formData.treatmentProvided.trim(),
        progressRating: formData.progressRating,
        painScoreBefore: formData.painScoreBefore === '' ? null : Number(formData.painScoreBefore),
        painScoreAfter: formData.painScoreAfter === '' ? null : Number(formData.painScoreAfter),
        exercisePrescription: formData.exercisePrescription.map((ex) => ({
          exerciseName: ex.exerciseName.trim(),
          sets: ex.sets === '' ? null : Number(ex.sets),
          reps: ex.reps === '' ? null : Number(ex.reps),
          frequency: ex.frequency ? ex.frequency.trim() : null,
          duration: ex.duration ? ex.duration.trim() : null,
          notes: ex.notes ? ex.notes.trim() : null,
        })),
        medications: formData.medications,
        clinicalObservations: formData.clinicalObservations.trim() || null,
        followUpRecommendation: {
          recommended: formData.followUpRecommendation.recommended,
          intervalDays: formData.followUpRecommendation.recommended && formData.followUpRecommendation.intervalDays !== ''
            ? Number(formData.followUpRecommendation.intervalDays)
            : null,
          suggestedDate: formData.followUpRecommendation.recommended && formData.followUpRecommendation.suggestedDate
            ? formData.followUpRecommendation.suggestedDate
            : null,
          sessionGoal: formData.followUpRecommendation.recommended && formData.followUpRecommendation.sessionGoal.trim()
            ? formData.followUpRecommendation.sessionGoal.trim()
            : null,
        },
        isSharedWithPatient: formData.isSharedWithPatient,
      };

      if (isEditMode) {
        await updateSessionRecord(appointmentId, payload);
        toast.success('Session record updated successfully.');
      } else {
        await createSessionRecord(appointmentId, payload);
        localStorage.removeItem(DRAFT_KEY);
        toast.success('Session record saved successfully.');
      }

      setTimeout(() => {
        navigate('/doctor/appointments');
      }, 500);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save session record. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="animate-spin h-8 w-8 text-[#0B4F6C]" />
        <span className="text-ui-sm font-black uppercase text-neutral-500 tracking-wider">Loading Session Info...</span>
      </div>
    );
  }

  // Get initials for Avatar
  const patientName = appointment?.patient?.name || 'Patient';
  const patientInitials = patientName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const selectedProgressOption = PROGRESS_RATING_OPTIONS.find((o) => o.value === formData.progressRating);

  // Pain delta badge logic
  const painBefore = formData.painScoreBefore !== '' ? Number(formData.painScoreBefore) : null;
  const painAfter = formData.painScoreAfter !== '' ? Number(formData.painScoreAfter) : null;
  let painDeltaPill = null;
  if (painBefore !== null && painAfter !== null) {
    const delta = Math.abs(painBefore - painAfter);
    if (painAfter < painBefore) {
      painDeltaPill = (
        <span className="bg-[#EAFDF8] border border-[#0A7E6E] text-[#0A7E6E] rounded px-2 py-1 text-[11px] font-black uppercase tracking-wider">
          ↓ {delta} BETTER
        </span>
      );
    } else if (painAfter > painBefore) {
      painDeltaPill = (
        <span className="bg-[#FDF2F2] border border-[#C0392B] text-[#C0392B] rounded px-2 py-1 text-[11px] font-black uppercase tracking-wider">
          ↑ {delta} WORSE
        </span>
      );
    } else {
      painDeltaPill = (
        <span className="bg-neutral-50 border border-neutral-300 text-neutral-600 rounded px-2 py-1 text-[11px] font-black uppercase tracking-wider">
          NO CHANGE
        </span>
      );
    }
  }

  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-10 text-left select-none bg-[#F7F9FB] min-h-[90vh] pb-32">
      
      {/* Page Title */}
      <SectionHeader
        title="Session Notes"
        subtitle="Document treatment details for this appointment"
        className="mb-6"
      />

      {/* Context Bar */}
      <div className="bg-[#F7F9FB] border border-[#EEF2F6] rounded-xl p-4 px-6 mb-6 flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#0B4F6C] border border-[#0B4F6C] flex items-center justify-center overflow-hidden shrink-0">
            {appointment.patient?.profileImage ? (
              <img
                src={appointment.patient.profileImage}
                alt={patientName}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                }}
              />
            ) : (
              <span className="font-extrabold text-[14px] text-white tracking-tight">
                {patientInitials}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[15px] text-[#1C2B3A]">
              {patientName}
            </span>
            <span className="text-[#A8B8C8] text-xs font-light">·</span>
            <span className="text-[13px] text-[#6B7C93] font-medium">
              {getDisplayDateString(appointment.date)}
            </span>
            <span className="text-[#A8B8C8] text-xs font-light">·</span>
            <span className="text-[13px] text-[#6B7C93] font-medium">
              {formatApptTime(appointment.startTime)} – {formatApptTime(appointment.endTime)}
            </span>
            <span className="text-[#A8B8C8] text-xs font-light">·</span>
            <span className="text-[13px] text-[#0B4F6C] font-semibold">
              ₹{appointment.consultationFee}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <span className="bg-[#FFF8E6] border border-[#FFC73B] text-[#B45309] rounded-md px-2.5 py-1 text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-pulse"></span>
              EDITING MODE
            </span>
          )}
          {isReadOnly && (
            <span className="bg-[#FFF0F0] border border-[#FFC1C1] text-[#C0392B] rounded-md px-2.5 py-1 text-[11px] font-black uppercase tracking-widest flex items-center gap-1">
              READ-ONLY
            </span>
          )}
        </div>
      </div>

      {/* Read Only Banner */}
      {isReadOnly && signedDate && (
        <div className="bg-[#FDF2F2] border border-[#FADBD8] text-[#C0392B] rounded-lg p-4 mb-6 text-ui-sm font-bold uppercase tracking-wide">
          This record was finalized on {new Date(signedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. The 24-hour edit window has closed.
        </div>
      )}

      {/* Draft Resume Banner */}
      {hasDraft && !isEditMode && (
        <div className="bg-[#E8F4F8] border border-[#B3D5E4] rounded-lg p-4 mb-6 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-[#0B4F6C]" />
            <span className="text-[13px] text-[#0B4F6C] font-semibold">
              Draft restored from your last session
            </span>
          </div>
          <button
            onClick={handleDiscardDraft}
            className="text-[12px] text-[#6B7C93] font-bold uppercase tracking-wider bg-transparent border-0 hover:text-danger cursor-pointer select-none"
          >
            DISCARD DRAFT
          </button>
        </div>
      )}

      {/* Main Form container */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Accordion 1: Clinical Assessment */}
        <div className="bg-white border border-neutral-200/50 rounded-xl shadow-swiss overflow-hidden">
          <div
            onClick={() => toggleSection('clinical')}
            className="flex items-center justify-between p-4 px-6 border-b border-neutral-100 bg-neutral-50/40 cursor-pointer select-none"
          >
            <h3 className="font-semibold text-[15px] text-[#1C2B3A]">
              Clinical Assessment
            </h3>
            <div className="flex items-center gap-3">
              <span className={`text-[12px] font-medium ${formData.progressRating ? 'text-[#0A7E6E]' : 'text-[#C0392B]'}`}>
                {selectedProgressOption ? selectedProgressOption.label.toUpperCase() : 'REQUIRED'}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-neutral-500 transition-transform duration-300 ${
                  expanded.clinical ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              expanded.clinical ? 'max-h-[1200px]' : 'max-h-0'
            }`}
          >
            <div className="p-6 flex flex-col gap-6">
              
              {/* Presenting Condition */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                  Presenting Condition *
                </label>
                <textarea
                  required
                  disabled={isReadOnly}
                  rows={3}
                  maxLength={500}
                  value={formData.presentingCondition}
                  onChange={(e) => handleFieldChange('presentingCondition', e.target.value)}
                  placeholder="What brought the patient in today? Describe their primary complaint."
                  className="w-full border border-neutral-300/80 rounded-lg p-3 text-ui-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50 disabled:text-neutral-500"
                />
                <span className="absolute bottom-3 right-3 text-[11px] text-[#A8B8C8] font-mono">
                  {formData.presentingCondition.length}/500
                </span>
              </div>

              {/* Treatment Provided */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                  Treatment Provided *
                </label>
                <textarea
                  required
                  disabled={isReadOnly}
                  rows={4}
                  maxLength={1000}
                  value={formData.treatmentProvided}
                  onChange={(e) => handleFieldChange('treatmentProvided', e.target.value)}
                  placeholder="Describe the treatment, techniques, and interventions used during this session."
                  className="w-full border border-neutral-300/80 rounded-lg p-3 text-ui-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50 disabled:text-neutral-500"
                />
                <span className="absolute bottom-3 right-3 text-[11px] text-[#A8B8C8] font-mono">
                  {formData.treatmentProvided.length}/1000
                </span>
              </div>

              {/* Progress Rating */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                  Progress Rating *
                </label>
                <div className="flex w-full border border-neutral-200 rounded-lg overflow-hidden select-none bg-white p-0.5 gap-0.5">
                  {PROGRESS_RATING_OPTIONS.map((opt) => {
                    const isSelected = formData.progressRating === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleFieldChange('progressRating', opt.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-md font-bold text-[12px] uppercase tracking-wider transition-all select-none border-2 cursor-pointer ${
                          isSelected
                            ? opt.bg
                            : 'bg-white text-neutral-500 border-transparent hover:bg-neutral-50/50 hover:text-neutral-800'
                        }`}
                      >
                        {Icon && <Icon size={14} />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pain Scores */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                  Pain Scores (Optional)
                </label>
                <div className="flex items-center gap-4 select-none">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider text-center">PAIN BEFORE</span>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      min={0}
                      max={10}
                      value={formData.painScoreBefore}
                      onChange={(e) => handleFieldChange('painScoreBefore', e.target.value === '' ? '' : Math.min(10, Math.max(0, parseInt(e.target.value, 10))))}
                      className="w-24 h-10 text-center border border-neutral-300 rounded-lg text-ui-md font-bold text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                    />
                  </div>

                  <span className="text-neutral-300 font-medium text-lg pt-4">→</span>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider text-center">PAIN AFTER</span>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      min={0}
                      max={10}
                      value={formData.painScoreAfter}
                      onChange={(e) => handleFieldChange('painScoreAfter', e.target.value === '' ? '' : Math.min(10, Math.max(0, parseInt(e.target.value, 10))))}
                      className="w-24 h-10 text-center border border-neutral-300 rounded-lg text-ui-md font-bold text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                    />
                  </div>

                  <div className="pt-4 ml-2 select-none">
                    {painDeltaPill}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Accordion 2: Exercise Prescription */}
        <div className="bg-white border border-neutral-200/50 rounded-xl shadow-swiss overflow-hidden">
          <div
            onClick={() => toggleSection('exercise')}
            className="flex items-center justify-between p-4 px-6 border-b border-neutral-100 bg-neutral-50/40 cursor-pointer select-none"
          >
            <h3 className="font-semibold text-[15px] text-[#1C2B3A]">
              Exercise Prescription
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-neutral-500 font-medium">
                {formData.exercisePrescription.length} EXERCISE{formData.exercisePrescription.length !== 1 ? 'S' : ''} ADDED
              </span>
              <ChevronDown
                className={`h-5 w-5 text-neutral-500 transition-transform duration-300 ${
                  expanded.exercise ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              expanded.exercise ? 'max-h-[2000px]' : 'max-h-0'
            }`}
          >
            <div className="p-6 flex flex-col gap-4">
              
              {formData.exercisePrescription.length === 0 ? (
                <div className="bg-[#FAFBFC] border border-dashed border-[#DDE3EA] rounded-xl p-8 flex flex-col items-center justify-center text-center select-none mb-2">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                    <Dumbbell size={24} />
                  </div>
                  <h4 className="font-bold text-[14px] text-[#1C2B3A] uppercase tracking-wide">
                    No exercises prescribed yet
                  </h4>
                  <p className="text-[12px] text-[#6B7C93] font-medium uppercase mt-0.5 tracking-wider">
                    Add exercises to give your patient a clear home program.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {formData.exercisePrescription.map((ex, idx) => (
                    <div
                      key={idx}
                      className="border border-[#EEF2F6] rounded-xl p-4 bg-[#FAFBFC]/30 flex flex-col gap-3 relative hover:shadow-sm transition-all"
                    >
                      {/* Delete Exercise Trigger */}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="absolute top-4 right-4 text-[#C0392B] hover:text-[#962D22] bg-transparent border-0 cursor-pointer p-1 rounded hover:bg-neutral-100 transition-all select-none"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {/* Row 1: Exercise Name */}
                      <div className="flex flex-col gap-1.5 pr-8">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">
                          Exercise Name
                        </label>
                        <input
                          type="text"
                          required
                          disabled={isReadOnly}
                          value={ex.exerciseName}
                          onChange={(e) => handleUpdateExercise(idx, 'exerciseName', e.target.value)}
                          placeholder="e.g. Quad Clenches, Hamstring Stretch..."
                          className="w-full border border-neutral-300 rounded-lg p-2.5 text-ui-sm text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                        />
                      </div>

                      {/* Row 2: Parameters */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Sets</label>
                          <input
                            type="number"
                            disabled={isReadOnly}
                            min={1}
                            value={ex.sets}
                            onChange={(e) => handleUpdateExercise(idx, 'sets', e.target.value)}
                            placeholder="Sets"
                            className="w-full border border-neutral-300 rounded-lg p-2.5 text-ui-sm text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Reps</label>
                          <input
                            type="number"
                            disabled={isReadOnly}
                            min={1}
                            value={ex.reps}
                            onChange={(e) => handleUpdateExercise(idx, 'reps', e.target.value)}
                            placeholder="Reps"
                            className="w-full border border-neutral-300 rounded-lg p-2.5 text-ui-sm text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Frequency</label>
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={ex.frequency}
                            onChange={(e) => handleUpdateExercise(idx, 'frequency', e.target.value)}
                            placeholder="e.g. twice daily"
                            className="w-full border border-neutral-300 rounded-lg p-2.5 text-ui-sm text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Duration</label>
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={ex.duration}
                            onChange={(e) => handleUpdateExercise(idx, 'duration', e.target.value)}
                            placeholder="e.g. 30 seconds"
                            className="w-full border border-neutral-300 rounded-lg p-2.5 text-ui-sm text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                          />
                        </div>
                      </div>

                      {/* Row 3: Notes */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest">Notes</label>
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={ex.notes}
                          onChange={(e) => handleUpdateExercise(idx, 'notes', e.target.value)}
                          placeholder="Optional notes or instructions for this specific exercise"
                          className="w-full border border-neutral-300 rounded-lg p-2.5 text-ui-sm text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Exercise Trigger Button */}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={handleAddExercise}
                  className="h-10 px-4 border-2 border-dashed border-[#0B4F6C] hover:border-[#083A52] text-[#0B4F6C] hover:text-[#083A52] bg-white font-black text-ui-xs flex items-center justify-center gap-1.5 uppercase tracking-widest transition-colors select-none rounded-lg cursor-pointer max-w-[200px]"
                >
                  <Plus size={14} /> Add Exercise
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Accordion 3: Medications & Observations */}
        <div className="bg-white border border-neutral-200/50 rounded-xl shadow-swiss overflow-hidden">
          <div
            onClick={() => toggleSection('meds')}
            className="flex items-center justify-between p-4 px-6 border-b border-neutral-100 bg-neutral-50/40 cursor-pointer select-none"
          >
            <h3 className="font-semibold text-[15px] text-[#1C2B3A]">
              Medications & Observations
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-neutral-500 font-medium">
                {formData.medications.length} ADDED
              </span>
              <ChevronDown
                className={`h-5 w-5 text-neutral-500 transition-transform duration-300 ${
                  expanded.meds ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              expanded.meds ? 'max-h-[1200px]' : 'max-h-0'
            }`}
          >
            <div className="p-6 flex flex-col gap-6">
              
              {/* Medications Tag Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                  Medications / Supplements
                </label>
                <div className="flex flex-wrap gap-2 mb-1">
                  {formData.medications.map((med, idx) => (
                    <span
                      key={idx}
                      className="bg-[#E8F4F8] text-[#0B4F6C] border border-[#B3D5E4] rounded-md px-2.5 py-1 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5"
                    >
                      {med}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMed(idx)}
                          className="text-[#0B4F6C] hover:text-danger bg-transparent border-0 cursor-pointer font-black text-[12px] leading-none"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
                {!isReadOnly && (
                  <input
                    type="text"
                    value={medInput}
                    onChange={(e) => setMedInput(e.target.value)}
                    onKeyDown={handleMedKeyPress}
                    placeholder="Type a medication and press Enter or comma"
                    className="w-full border border-neutral-300 rounded-lg p-3 text-ui-sm text-neutral-900 focus:outline-none focus:border-[#0B4F6C]"
                  />
                )}
              </div>

              {/* Clinical Observations */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                  Clinical Observations
                </label>
                <textarea
                  disabled={isReadOnly}
                  rows={5}
                  maxLength={2000}
                  value={formData.clinicalObservations}
                  onChange={(e) => handleFieldChange('clinicalObservations', e.target.value)}
                  placeholder="Free-form clinical notes, professional observations, contraindications, special considerations."
                  className="w-full border border-neutral-300/80 rounded-lg p-3 text-ui-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50 disabled:text-neutral-500"
                />
                <span className="absolute bottom-3 right-3 text-[11px] text-[#A8B8C8] font-mono">
                  {formData.clinicalObservations.length}/2000
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Accordion 4: Follow-Up & Sharing */}
        <div className="bg-white border border-neutral-200/50 rounded-xl shadow-swiss overflow-hidden">
          <div
            onClick={() => toggleSection('followup')}
            className="flex items-center justify-between p-4 px-6 border-b border-neutral-100 bg-neutral-50/40 cursor-pointer select-none"
          >
            <h3 className="font-semibold text-[15px] text-[#1C2B3A]">
              Follow-Up & Sharing
            </h3>
            <div className="flex items-center gap-3">
              <span className={`text-[12px] font-medium ${formData.followUpRecommendation.recommended ? 'text-[#0B4F6C]' : 'text-neutral-500'}`}>
                {formData.followUpRecommendation.recommended ? 'FOLLOW-UP RECOMMENDED' : 'NO FOLLOW-UP'}
              </span>
              <ChevronDown
                className={`h-5 w-5 text-neutral-500 transition-transform duration-300 ${
                  expanded.followup ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${
              expanded.followup ? 'max-h-[1200px]' : 'max-h-0'
            }`}
          >
            <div className="p-6 flex flex-col gap-6">
              
              {/* Recommend Follow-Up Toggle switch */}
              <div className="flex items-center justify-between select-none">
                <div>
                  <span className="text-[11px] font-black text-neutral-500 uppercase tracking-widest block">
                    Recommend Follow-Up Session
                  </span>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-0.5">
                    Flag if the patient requires follow-up care.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={formData.followUpRecommendation.recommended}
                    onChange={(e) => handleFollowUpFieldChange('recommended', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B4F6C] disabled:opacity-50 select-none"></div>
                </label>
              </div>

              {/* Recommendation Fields (conditional expand) */}
              {formData.followUpRecommendation.recommended && (
                <div className="flex flex-col gap-5 border-t border-neutral-100 pt-5 transition-all select-none">
                  
                  {/* Presets and custom return interval */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                    
                    {/* Interval Presets */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                        Follow-Up Interval
                      </label>
                      <div className="grid grid-cols-4 gap-1.5 select-none bg-neutral-50 p-1 border border-neutral-200 rounded-lg">
                        {PRESETS.map((p) => {
                          const isSel = selectedPreset === p.label;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handlePresetChange(p.label)}
                              className={`py-2 px-1 text-[11px] font-bold uppercase rounded-md transition-all border text-center select-none cursor-pointer whitespace-nowrap ${
                                isSel
                                  ? 'bg-[#0B4F6C] text-white border-[#0B4F6C] font-black'
                                  : 'bg-white text-neutral-500 border-neutral-200/50 hover:bg-neutral-50'
                              }`}
                            >
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Return date and Custom days */}
                    <div className="flex items-end gap-4">
                      <div className="flex-1 flex flex-col gap-2">
                        <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                          Suggested Return Date
                        </label>
                        <input
                          type="date"
                          disabled={isReadOnly}
                          min={tomorrowStr}
                          value={formData.followUpRecommendation.suggestedDate}
                          onChange={(e) => handleSuggestedDateChange(e.target.value)}
                          className="w-full border border-neutral-300 rounded-lg p-2.5 text-ui-sm text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                        />
                      </div>
                      
                      {selectedPreset === 'Custom' && (
                        <div className="w-28 flex flex-col gap-2">
                          <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                            Days
                          </label>
                          <input
                            type="number"
                            disabled={isReadOnly}
                            min={1}
                            value={formData.followUpRecommendation.intervalDays}
                            onChange={(e) => handleCustomDaysChange(e.target.value)}
                            className="w-full border border-neutral-300 rounded-lg p-2.5 text-ui-sm font-bold text-center text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                          />
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Session Goal */}
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-[11px] font-black text-neutral-500 uppercase tracking-widest">
                      Session Goal (Optional)
                    </label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      maxLength={300}
                      value={formData.followUpRecommendation.sessionGoal}
                      onChange={(e) => handleFollowUpFieldChange('sessionGoal', e.target.value)}
                      placeholder="What should the next session aim to achieve? (e.g. advance to weight-bearing exercises)"
                      className="w-full border border-neutral-300 rounded-lg p-2.5 text-ui-sm text-neutral-900 focus:outline-none focus:border-[#0B4F6C] disabled:bg-neutral-50"
                    />
                    <span className="absolute right-3 top-[38px] text-[10px] text-[#A8B8C8] font-mono">
                      {formData.followUpRecommendation.sessionGoal.length}/300
                    </span>
                  </div>

                </div>
              )}

              {/* Share With Patient Toggle */}
              <div className="flex items-center justify-between border-t border-neutral-100 pt-5 select-none">
                <div>
                  <span className="text-[11px] font-black text-neutral-500 uppercase tracking-widest block">
                    Share With Patient
                  </span>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mt-0.5">
                    Make treatment notes and exercises visible to the patient.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={isReadOnly}
                    checked={formData.isSharedWithPatient}
                    onChange={handleShareToggle}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B4F6C] disabled:opacity-50 select-none"></div>
                </label>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Fixed row */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-[#EEF2F6] p-4 px-10 bg-white flex items-center justify-between z-40 select-none shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)]">
          <div>
            {isEditMode && signedDate && (
              <span className="text-[11px] text-[#A8B8C8] font-semibold uppercase tracking-widest font-mono select-none">
                Signed on: {new Date(signedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/doctor/appointments')}
              className="h-10 px-6 border-2 border-neutral-300 text-neutral-900 hover:border-neutral-900 font-black text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none rounded-md bg-white cursor-pointer"
            >
              CANCEL
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-6 bg-[#0B4F6C] hover:bg-[#083A52] text-white font-black text-ui-xs flex items-center gap-2 uppercase tracking-widest transition-colors select-none rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                    SAVING…
                  </>
                ) : (
                  'SAVE SESSION RECORD'
                )}
              </button>
            )}
          </div>
        </div>

      </form>

      {/* Confirmation Modal when toggle is OFF */}
      {showShareModal && (
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title="HIDE FROM PATIENT?"
          size="sm"
        >
          <div className="flex flex-col gap-4 text-left select-none">
            <p className="text-ui-sm text-neutral-700 font-bold uppercase tracking-wide leading-relaxed">
              This record will be saved but your patient won't be able to see it. You can share it later by editing the record.
            </p>
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="h-10 px-4 border border-neutral-300 text-neutral-700 hover:border-neutral-950 font-bold text-ui-xs uppercase tracking-widest transition-colors select-none rounded-md bg-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmKeepPrivate}
                className="h-10 px-4 bg-[#C0392B] hover:bg-[#962D22] text-white font-black text-ui-xs uppercase tracking-widest transition-colors select-none rounded-md cursor-pointer border-0"
              >
                Yes, Keep Private
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
