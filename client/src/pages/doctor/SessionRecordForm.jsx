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
  TrendingDown,
  TrendingUp,
  Minus,
  ArrowRight,
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
  { value: 'worse', label: 'WORSE', bg: 'bg-[#C0392B] text-white border-[#C0392B]' },
  { value: 'no_change', label: 'NO CHANGE', bg: 'bg-[#B45309] text-white border-[#B45309]' },
  { value: 'slight_improvement', label: 'SLIGHT IMPROVEMENT', bg: 'bg-[#0B4F6C] text-white border-[#0B4F6C]' },
  { value: 'significant_improvement', label: 'SIGNIFICANT IMPROVEMENT', bg: 'bg-[#0A7E6E] text-white border-[#0A7E6E]' },
  { value: 'resolved', label: 'RESOLVED', bg: 'bg-[#0A7E6E] text-white border-[#0A7E6E]', icon: CheckCircle },
];

const PRESETS = [
  { label: '1 Week', days: 7 },
  { label: '2 Weeks', days: 14 },
  { label: '3 Weeks', days: 21 },
  { label: '1 Month', days: 30 },
  { label: '6 Weeks', days: 42 },
  { label: '2 Months', days: 60 },
  { label: '3 Months', days: 90 },
  { label: 'Custom', days: 'custom' },
];

const getProgressBadgeStyle = (rating) => {
  switch (rating) {
    case 'worse':
      return { bg: 'bg-[#FDF2F2]', text: 'text-[#C0392B]' };
    case 'no_change':
      return { bg: 'bg-[#FEF3E2]', text: 'text-[#B45309]' };
    case 'slight_improvement':
      return { bg: 'bg-[#E8F4F8]', text: 'text-[#0B4F6C]' };
    case 'significant_improvement':
    case 'resolved':
      return { bg: 'bg-[#E8F8F5]', text: 'text-[#0A7E6E]' };
    default:
      return { bg: 'bg-[#F0F4F7]', text: 'text-[#6B7C93]' };
  }
};

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

  // Validation state for required fields
  const [showValidation, setShowValidation] = useState(false);

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
    if (!formData.presentingCondition.trim() || !formData.treatmentProvided.trim() || !formData.progressRating) {
      setShowValidation(true);
      toast.error('Please fill in all required fields.');
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
        <span className="bg-[#EAFDF8] border-2 border-neutral-900 text-[#0A7E6E] rounded-none px-2 py-1 text-[11px] font-black uppercase tracking-wider">
          ↓ {delta} BETTER
        </span>
      );
    } else if (painAfter > painBefore) {
      painDeltaPill = (
        <span className="bg-[#FDF2F2] border-2 border-neutral-900 text-[#C0392B] rounded-none px-2 py-1 text-[11px] font-black uppercase tracking-wider">
          ↑ {delta} WORSE
        </span>
      );
    } else {
      painDeltaPill = (
        <span className="bg-neutral-50 border-2 border-neutral-900 text-neutral-600 rounded-none px-2 py-1 text-[11px] font-black uppercase tracking-wider">
          NO CHANGE
        </span>
      );
    }
  }

  const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="max-w-[1200px] mx-auto py-8 px-10 text-left select-none bg-[#F7F9FB] min-h-[90vh] pb-8">
      
      {/* Page Title Area */}
      <SectionHeader
        title="SESSION RECORD"
        subtitle="Document treatment details for this appointment"
        size="lg"
        ruled={true}
        className="mb-6"
      />


      {/* Context Bar */}
      <div className="bg-white rounded-none border-2 border-neutral-900 p-4 px-6 mb-6 flex items-center justify-between select-none shadow-none">
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
            <span className="text-[15px] text-[#1C2B3A] font-bold uppercase tracking-wider">
              {patientName}
            </span>
            <span className="text-[#A8B8C8] text-xs font-light">·</span>
            <span className="text-[13px] text-[#6B7C93] font-bold uppercase tracking-wider">
              {getDisplayDateString(appointment.date)}
            </span>
            <span className="text-[#A8B8C8] text-xs font-light">·</span>
            <span className="text-[13px] text-[#6B7C93] font-bold uppercase tracking-wider">
              {formatApptTime(appointment.startTime)} – {formatApptTime(appointment.endTime)}
            </span>
            <span className="text-[#A8B8C8] text-xs font-light">·</span>
            <span className="text-[13px] text-primary font-bold uppercase tracking-wider">
              ₹{appointment.consultationFee}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <span className="bg-[#FEF3E2] text-[#B45309] rounded-none border border-neutral-900 px-[10px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] animate-pulse"></span>
              EDITING MODE
            </span>
          )}
          {isReadOnly && (
            <span className="bg-[#FDF2F2] text-[#C0392B] rounded-none border border-neutral-900 px-[10px] py-[3px] text-[10px] font-bold uppercase tracking-[0.08em] flex items-center gap-1">
              READ-ONLY
            </span>
          )}
        </div>
      </div>

      {/* Read Only Banner */}
      {isReadOnly && signedDate && (
        <div className="bg-[#FDF2F2] text-[#C0392B] rounded-none border-2 border-neutral-900 p-4 mb-6 text-ui-sm font-bold uppercase tracking-wide">
          This record was finalized on {new Date(signedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. The 24-hour edit window has closed.
        </div>
      )}

      {/* Draft Resume Banner */}
      {hasDraft && !isEditMode && (
        <div className="bg-[#E8F4F8] border-2 border-neutral-900 rounded-none p-4 mb-6 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-[#0B4F6C]" />
            <span className="text-[13px] text-[#0B4F6C] font-bold uppercase tracking-wider">
              DRAFT RESTORED FROM YOUR LAST SESSION
            </span>
          </div>
          <button
            onClick={handleDiscardDraft}
            className="text-[12px] text-[#6B7C93] hover:text-[#C0392B] bg-transparent border-0 cursor-pointer select-none font-bold uppercase transition-colors duration-150 ease-swiss"
          >
            DISCARD DRAFT
          </button>
        </div>
      )}

      {/* Main Form container */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Accordion 1: Clinical Assessment */}
        <div className="bg-white rounded-none border-2 border-neutral-900 mb-4 overflow-hidden shadow-none">
          <div
            onClick={() => toggleSection('clinical')}
            className="group flex items-center justify-between p-4 px-6 border-b-2 border-neutral-900 bg-[#FAFBFC] cursor-pointer hover:bg-[#F0F4F7] transition-colors duration-150 ease-swiss select-none"
          >
            <h3 className="text-[15px] text-[#1C2B3A] font-bold uppercase tracking-wider">
              CLINICAL ASSESSMENT
            </h3>
            <div className="flex items-center gap-3">
              <span 
                className={`rounded-none border border-neutral-900 text-[10px] font-bold uppercase tracking-[0.08em] py-[3px] px-[10px] ${
                  formData.progressRating 
                    ? `${getProgressBadgeStyle(formData.progressRating).bg} ${getProgressBadgeStyle(formData.progressRating).text}`
                    : 'bg-[#F0F4F7] text-[#6B7C93]'
                }`}
              >
                {selectedProgressOption ? selectedProgressOption.label : 'REQUIRED'}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#6B7C93] group-hover:text-neutral-700 transition-transform duration-200 ease-swiss motion-reduce:duration-[0.01ms] ${
                  expanded.clinical ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-swiss motion-reduce:duration-[0.01ms] overflow-hidden ${
              expanded.clinical ? 'max-h-[1200px]' : 'max-h-0'
            }`}
          >
            <div className="p-6 flex flex-col gap-5">
              
              {/* Presenting Condition */}
              <div className="flex flex-col relative">
                <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                  PRESENTING CONDITION <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  disabled={isReadOnly}
                  rows={3}
                  maxLength={500}
                  value={formData.presentingCondition}
                  onChange={(e) => handleFieldChange('presentingCondition', e.target.value)}
                  placeholder="What brought the patient in today? Describe their primary complaint."
                  className={`w-full border-2 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all duration-200 ease-swiss ${
                    showValidation && !formData.presentingCondition.trim()
                      ? 'border-danger focus:border-danger'
                      : 'border-neutral-200'
                  }`}
                />
                <span 
                  className={`absolute bottom-3 right-3 text-[11px] font-mono ${
                    formData.presentingCondition.length >= 400 ? 'text-[#B45309]' : 'text-[#A8B8C8]'
                  }`}
                >
                  {formData.presentingCondition.length}/500
                </span>
                {showValidation && !formData.presentingCondition.trim() && (
                  <p className="text-[11px] font-bold text-danger mt-1 uppercase tracking-wider">↑ Presenting condition is required.</p>
                )}
              </div>

              {/* Treatment Provided */}
              <div className="flex flex-col relative mt-2">
                <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                  TREATMENT PROVIDED <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  disabled={isReadOnly}
                  rows={4}
                  maxLength={1000}
                  value={formData.treatmentProvided}
                  onChange={(e) => handleFieldChange('treatmentProvided', e.target.value)}
                  placeholder="Describe the treatment, techniques, and interventions used during this session."
                  className={`w-full border-2 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all duration-200 ease-swiss ${
                    showValidation && !formData.treatmentProvided.trim()
                      ? 'border-danger focus:border-danger'
                      : 'border-neutral-200'
                  }`}
                />
                <span 
                  className={`absolute bottom-3 right-3 text-[11px] font-mono ${
                    formData.treatmentProvided.length >= 800 ? 'text-[#B45309]' : 'text-[#A8B8C8]'
                  }`}
                >
                  {formData.treatmentProvided.length}/1000
                </span>
                {showValidation && !formData.treatmentProvided.trim() && (
                  <p className="text-[11px] font-bold text-danger mt-1 uppercase tracking-wider">↑ Treatment provided is required.</p>
                )}
              </div>

              {/* Progress Rating */}
              <div className="flex flex-col mt-2">
                <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                  PROGRESS RATING <span className="text-danger">*</span>
                </label>
                <div className="border-2 border-neutral-900 rounded-none h-11 flex overflow-hidden bg-white select-none p-0.5 gap-0.5">
                  {PROGRESS_RATING_OPTIONS.map((opt, optIdx) => {
                    const isSelected = formData.progressRating === opt.value;
                    
                    let selectedStyle = '';
                    if (isSelected) {
                      if (opt.value === 'worse') selectedStyle = 'bg-danger text-white border-danger';
                      else if (opt.value === 'no_change') selectedStyle = 'bg-warning text-white border-warning';
                      else if (opt.value === 'slight_improvement') selectedStyle = 'bg-primary text-white border-primary';
                      else selectedStyle = 'bg-success text-white border-success'; // significant_improvement, resolved
                    }

                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleFieldChange('progressRating', opt.value)}
                        className={`flex-1 h-full flex items-center justify-center gap-1.5 px-4 cursor-pointer text-[13px] uppercase transition-all duration-150 ease-swiss select-none ${
                          isSelected
                            ? selectedStyle
                            : 'bg-white text-neutral-500 hover:bg-[#F0F4F7] hover:text-[#3D5166]'
                        } ${optIdx < PROGRESS_RATING_OPTIONS.length - 1 ? 'border-r-2 border-neutral-900' : ''}`}
                        style={{ fontWeight: 700 }}
                      >
                        {isSelected && opt.value === 'resolved' && <CheckCircle size={14} />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
                {showValidation && !formData.progressRating && (
                  <p className="text-[11px] font-bold text-danger mt-1 uppercase tracking-wider">↑ Progress rating is required.</p>
                )}
              </div>

              {/* Pain Scores */}
              <div className="flex flex-col mt-2">
                <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                  PAIN SCORES (OPTIONAL)
                </label>
                <div className="flex items-center gap-4 select-none">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider text-center">PAIN BEFORE</span>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      min={0}
                      max={10}
                      value={formData.painScoreBefore}
                      onChange={(e) => handleFieldChange('painScoreBefore', e.target.value === '' ? '' : Math.min(10, Math.max(0, parseInt(e.target.value, 10))))}
                      className="w-20 h-12 text-center border-2 border-neutral-900 rounded-none text-[18px] font-bold text-neutral-900 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50"
                    />
                  </div>

                  <ArrowRight size={16} className="text-[#A8B8C8] mt-4 shrink-0" />

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider text-center">PAIN AFTER</span>
                    <input
                      type="number"
                      disabled={isReadOnly}
                      min={0}
                      max={10}
                      value={formData.painScoreAfter}
                      onChange={(e) => handleFieldChange('painScoreAfter', e.target.value === '' ? '' : Math.min(10, Math.max(0, parseInt(e.target.value, 10))))}
                      className="w-20 h-12 text-center border-2 border-neutral-900 rounded-none text-[18px] font-bold text-neutral-900 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50"
                    />
                  </div>

                  <div className="pt-4 ml-2 select-none">
                    {(() => {
                      const before = formData.painScoreBefore !== '' ? Number(formData.painScoreBefore) : null;
                      const after = formData.painScoreAfter !== '' ? Number(formData.painScoreAfter) : null;
                      if (before !== null && after !== null) {
                        const delta = Math.abs(before - after);
                        if (after < before) {
                          return (
                            <span className="bg-[#E8F8F5] text-[#0A7E6E] rounded-none border border-[#0A7E6E] text-[10px] font-bold uppercase tracking-[0.08em] py-[3px] px-[10px] flex items-center gap-1">
                              <TrendingDown size={12} />
                              {delta} BETTER
                            </span>
                          );
                        } else if (after > before) {
                          return (
                            <span className="bg-[#FDF2F2] text-[#C0392B] rounded-none border border-[#C0392B] text-[10px] font-bold uppercase tracking-[0.08em] py-[3px] px-[10px] flex items-center gap-1">
                              <TrendingUp size={12} />
                              {delta} WORSE
                            </span>
                          );
                        } else {
                          return (
                            <span className="bg-[#F0F4F7] text-[#6B7C93] rounded-none border border-neutral-900 text-[10px] font-bold uppercase tracking-[0.08em] py-[3px] px-[10px] flex items-center gap-1">
                              <Minus size={12} />
                              NO CHANGE
                            </span>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Accordion 2: Exercise Prescription */}
        <div className="bg-white rounded-none border-2 border-neutral-900 mb-4 overflow-hidden shadow-none">
          <div
            onClick={() => toggleSection('exercise')}
            className="group flex items-center justify-between p-4 px-6 border-b-2 border-neutral-900 bg-[#FAFBFC] cursor-pointer hover:bg-[#F0F4F7] transition-colors duration-150 ease-swiss select-none"
          >
            <h3 className="text-[15px] text-[#1C2B3A] font-bold uppercase tracking-wider">
              EXERCISE PRESCRIPTION
            </h3>
            <div className="flex items-center gap-3">
              <span className="bg-[#F0F4F7] text-[#6B7C93] rounded-none border border-neutral-900 text-[10px] font-bold uppercase tracking-[0.08em] py-[3px] px-[10px]">
                {formData.exercisePrescription.length} EXERCISE{formData.exercisePrescription.length !== 1 ? 'S' : ''} ADDED
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#6B7C93] group-hover:text-neutral-700 transition-transform duration-200 ease-swiss motion-reduce:duration-[0.01ms] ${
                  expanded.exercise ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-swiss motion-reduce:duration-[0.01ms] overflow-hidden ${
              expanded.exercise ? 'max-h-[2000px]' : 'max-h-0'
            }`}
          >
            <div className="p-6 flex flex-col gap-4">
              
              {formData.exercisePrescription.length === 0 ? (
                <div className="bg-[#FAFBFC] border-2 border-dashed border-neutral-300 rounded-none p-6 py-10 flex flex-col items-center justify-center text-center select-none mb-2">
                  <div className="w-12 h-12 rounded-none border-2 border-neutral-900 bg-neutral-100 flex items-center justify-center text-neutral-300 mb-3">
                    <Dumbbell size={28} />
                  </div>
                  <h4 className="text-[14px] text-[#1C2B3A] mb-1 font-bold uppercase tracking-wider">
                    NO EXERCISES PRESCRIBED YET
                  </h4>
                  <p className="text-[12px] text-[#6B7C93] font-regular max-w-[400px]">
                    Add exercises to give your patient a clear home program.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {formData.exercisePrescription.map((ex, idx) => (
                    <div
                      key={idx}
                      className="bg-white border-2 border-neutral-900 rounded-none p-4 px-5 mb-2 relative shadow-none transition-all duration-200 ease-swiss flex flex-col gap-3"
                    >
                      {/* Delete Exercise Trigger */}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="absolute top-4 right-4 text-[#C0392B] hover:text-[#C0392B] bg-transparent border-2 border-neutral-900 cursor-pointer p-1.5 rounded-none hover:bg-[#FDF2F2] transition-colors duration-150 ease-swiss select-none"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {/* Row 1: Exercise Name */}
                      <div className="flex flex-col pr-8">
                        <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                          EXERCISE NAME
                        </label>
                        <input
                          type="text"
                          required
                          disabled={isReadOnly}
                          value={ex.exerciseName}
                          onChange={(e) => handleUpdateExercise(idx, 'exerciseName', e.target.value)}
                          placeholder="e.g. Quad Clenches, Hamstring Stretch..."
                          className="w-full h-10 border-2 border-neutral-200 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 transition-all duration-200 ease-swiss"
                        />
                      </div>

                      {/* Row 2: Parameters */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div className="flex flex-col">
                          <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">SETS</label>
                          <input
                            type="number"
                            disabled={isReadOnly}
                            min={1}
                            value={ex.sets}
                            onChange={(e) => handleUpdateExercise(idx, 'sets', e.target.value)}
                            placeholder="Sets"
                            className="w-full h-10 border-2 border-neutral-200 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 transition-all duration-200 ease-swiss"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">REPS</label>
                          <input
                            type="number"
                            disabled={isReadOnly}
                            min={1}
                            value={ex.reps}
                            onChange={(e) => handleUpdateExercise(idx, 'reps', e.target.value)}
                            placeholder="Reps"
                            className="w-full h-10 border-2 border-neutral-200 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 transition-all duration-200 ease-swiss"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">FREQUENCY</label>
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={ex.frequency}
                            onChange={(e) => handleUpdateExercise(idx, 'frequency', e.target.value)}
                            placeholder="e.g. twice daily"
                            className="w-full h-10 border-2 border-neutral-200 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 transition-all duration-200 ease-swiss"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">DURATION</label>
                          <input
                            type="text"
                            disabled={isReadOnly}
                            value={ex.duration}
                            onChange={(e) => handleUpdateExercise(idx, 'duration', e.target.value)}
                            placeholder="e.g. 30 seconds"
                            className="w-full h-10 border-2 border-neutral-200 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 transition-all duration-200 ease-swiss"
                          />
                        </div>
                      </div>

                      {/* Row 3: Notes */}
                      <div className="flex flex-col gap-1 mt-1">
                        <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">NOTES</label>
                        <input
                          type="text"
                          disabled={isReadOnly}
                          value={ex.notes}
                          onChange={(e) => handleUpdateExercise(idx, 'notes', e.target.value)}
                          placeholder="Optional notes or instructions for this specific exercise"
                          className="w-full h-10 border-2 border-neutral-200 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 transition-all duration-200 ease-swiss"
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
                  className="h-9 px-4 bg-neutral-900 hover:bg-accent text-white hover:text-neutral-900 rounded-none flex items-center justify-center gap-1.5 transition-colors duration-150 ease-swiss select-none cursor-pointer border-2 border-neutral-900 max-w-[200px] font-bold uppercase"
                  style={{ fontSize: '13px' }}
                >
                  <Plus size={14} /> ADD EXERCISE
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Accordion 3: Medications & Observations */}
        <div className="bg-white rounded-none border-2 border-neutral-900 mb-4 overflow-hidden shadow-none">
          <div
            onClick={() => toggleSection('meds')}
            className="group flex items-center justify-between p-4 px-6 border-b-2 border-neutral-900 bg-[#FAFBFC] cursor-pointer hover:bg-[#F0F4F7] transition-colors duration-150 ease-swiss select-none"
          >
            <h3 className="text-[15px] text-[#1C2B3A] font-bold uppercase tracking-wider">
              MEDICATIONS & OBSERVATIONS
            </h3>
            <div className="flex items-center gap-3">
              <span className="bg-[#F0F4F7] text-[#6B7C93] rounded-none border border-neutral-900 text-[10px] font-bold uppercase tracking-[0.08em] py-[3px] px-[10px]">
                {formData.medications.length} ADDED
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#6B7C93] group-hover:text-neutral-700 transition-transform duration-200 ease-swiss motion-reduce:duration-[0.01ms] ${
                  expanded.meds ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-swiss motion-reduce:duration-[0.01ms] overflow-hidden ${
              expanded.meds ? 'max-h-[1200px]' : 'max-h-0'
            }`}
          >
            <div className="p-6 flex flex-col gap-6">
              
              {/* Medications Tag Input */}
              <div className="flex flex-col">
                <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                  PRESCRIBED MEDICATIONS / SUPPLEMENTS
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.medications.map((med, idx) => (
                    <span
                      key={idx}
                      className="bg-[#E8F4F8] text-[#0B4F6C] border-2 border-neutral-900 rounded-none px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5"
                    >
                      {med.toUpperCase()}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMed(idx)}
                          className="text-[#0B4F6C] hover:text-danger bg-transparent border-0 cursor-pointer font-bold text-[12px] leading-none"
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
                    className="w-full h-10 border-2 border-neutral-200 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none"
                  />
                )}
              </div>

              {/* Clinical Observations */}
              <div className="flex flex-col relative mt-2">
                <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                  CLINICAL OBSERVATIONS
                </label>
                <textarea
                  disabled={isReadOnly}
                  rows={5}
                  maxLength={2000}
                  value={formData.clinicalObservations}
                  onChange={(e) => handleFieldChange('clinicalObservations', e.target.value)}
                  placeholder="Free-form clinical notes, professional observations, contraindications, special considerations."
                  className="w-full border-2 border-neutral-200 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 disabled:text-neutral-500 transition-all duration-200 ease-swiss"
                />
                <span 
                  className={`absolute bottom-3 right-3 text-[11px] font-mono ${
                    formData.clinicalObservations.length >= 1600 ? 'text-[#B45309]' : 'text-[#A8B8C8]'
                  }`}
                >
                  {formData.clinicalObservations.length}/2000
                </span>
              </div>

          </div>
        </div>
      </div>
        <div className="bg-white rounded-none border-2 border-neutral-900 mb-4 overflow-hidden shadow-none">
          <div
            onClick={() => toggleSection('followup')}
            className="group flex items-center justify-between p-4 px-6 border-b-2 border-neutral-900 bg-[#FAFBFC] cursor-pointer hover:bg-[#F0F4F7] transition-colors duration-150 ease-swiss select-none"
          >
            <h3 className="text-[15px] text-[#1C2B3A] font-bold uppercase tracking-wider">
              FOLLOW-UP & SHARING
            </h3>
            <div className="flex items-center gap-3">
              <span 
                className={`rounded-none border border-neutral-900 text-[10px] font-bold uppercase tracking-[0.08em] py-[3px] px-[10px] ${
                  formData.followUpRecommendation.recommended 
                    ? 'bg-[#E8F4F8] text-[#0B4F6C]' 
                    : 'bg-[#F0F4F7] text-[#6B7C93]'
                }`}
              >
                {formData.followUpRecommendation.recommended ? 'FOLLOW-UP RECOMMENDED' : 'NO FOLLOW-UP'}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#6B7C93] group-hover:text-neutral-700 transition-transform duration-200 ease-swiss motion-reduce:duration-[0.01ms] ${
                  expanded.followup ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>

          <div
            className={`transition-all duration-300 ease-swiss motion-reduce:duration-[0.01ms] overflow-hidden ${
              expanded.followup ? 'max-h-[1200px]' : 'max-h-0'
            }`}
          >
            <div className="p-6 flex flex-col gap-6">
              
              {/* Recommend Follow-Up Toggle switch */}
              <div className="flex items-center justify-between py-4 border-t border-neutral-100 first:border-t-0 select-none">
                <div>
                  <span className="text-[14px] text-neutral-900 block uppercase font-bold tracking-wider">
                    RECOMMEND FOLLOW-UP SESSION
                  </span>
                  <span className="text-[12px] text-neutral-500 font-regular block mt-1">
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
                  <div className="w-12 h-6 border-2 border-neutral-900 bg-neutral-200 rounded-none peer peer-checked:bg-primary transition-colors duration-200 ease-swiss select-none relative after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-2 after:border-neutral-900 after:rounded-none after:h-5 after:w-5 after:box-border after:transition-transform after:duration-200 after:ease-swiss peer-checked:after:translate-x-[24px] disabled:opacity-50"></div>
                </label>
              </div>

              {/* Recommendation Fields (conditional expand) */}
              {formData.followUpRecommendation.recommended && (
                <div className="flex flex-col gap-5 border-t border-neutral-100 pt-5 transition-all select-none">
                  
                  {/* Presets and custom return interval */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 select-none">
                    
                    {/* Interval Presets */}
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                        FOLLOW-UP INTERVAL
                      </label>
                      <div className="flex flex-wrap gap-2 select-none">
                        {PRESETS.map((p) => {
                          const isSel = selectedPreset === p.label;
                          return (
                            <button
                              key={p.label}
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => handlePresetChange(p.label)}
                              className={`px-4 py-[6px] text-[12px] font-bold rounded-none border-2 transition-colors duration-150 ease-swiss cursor-pointer select-none whitespace-nowrap uppercase tracking-wider ${
                                isSel
                                  ? 'bg-neutral-900 border-neutral-900 text-white font-bold'
                                  : 'bg-white border-neutral-900 text-neutral-900 hover:bg-[#F0F4F7]'
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
                        <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                          SUGGESTED RETURN DATE
                        </label>
                        <input
                          type="date"
                          disabled={isReadOnly}
                          min={tomorrowStr}
                          value={formData.followUpRecommendation.suggestedDate}
                          onChange={(e) => handleSuggestedDateChange(e.target.value)}
                          className="w-full h-10 border-2 border-neutral-900 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 transition-all duration-200 ease-swiss font-bold"
                        />
                      </div>
                      
                      {selectedPreset === 'Custom' && (
                        <div className="w-28 flex flex-col gap-2">
                          <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                            DAYS
                          </label>
                          <input
                            type="number"
                            disabled={isReadOnly}
                            min={1}
                            value={formData.followUpRecommendation.intervalDays}
                            onChange={(e) => handleCustomDaysChange(e.target.value)}
                            className="w-full h-10 border-2 border-neutral-900 rounded-none py-[10px] px-[12px] text-[14px] font-bold text-center text-neutral-900 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 transition-all duration-200 ease-swiss"
                          />
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Session Goal */}
                  <div className="flex flex-col relative mt-2">
                    <label className="text-[12px] text-neutral-900 mb-2 block uppercase font-bold tracking-wider">
                      SESSION GOAL (OPTIONAL)
                    </label>
                    <input
                      type="text"
                      disabled={isReadOnly}
                      maxLength={300}
                      value={formData.followUpRecommendation.sessionGoal}
                      onChange={(e) => handleFollowUpFieldChange('sessionGoal', e.target.value)}
                      placeholder="What should the next session aim to achieve? (e.g. advance to weight-bearing exercises)"
                      className="w-full h-10 border-2 border-neutral-200 rounded-none py-[10px] px-[12px] text-[14px] text-neutral-900 placeholder-neutral-300 focus:border-neutral-900 focus:ring-0 focus:outline-none disabled:bg-neutral-50 transition-all duration-200 ease-swiss"
                    />
                    <span 
                      className={`absolute bottom-3 right-3 text-[11px] font-mono ${
                        formData.followUpRecommendation.sessionGoal.length >= 240 ? 'text-[#B45309]' : 'text-[#A8B8C8]'
                      }`}
                    >
                      {formData.followUpRecommendation.sessionGoal.length}/300
                    </span>
                  </div>

                </div>
              )}

              {/* Share With Patient Toggle */}
              <div className="flex items-center justify-between border-t border-neutral-100 pt-5 select-none">
                <div>
                  <span className="text-[14px] text-neutral-900 block uppercase font-bold tracking-wider">
                    SHARE WITH PATIENT
                  </span>
                  <span className="text-[12px] text-neutral-500 font-regular block mt-1">
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
                  <div className="w-12 h-6 border-2 border-neutral-900 bg-neutral-200 rounded-none peer peer-checked:bg-primary transition-colors duration-200 ease-swiss select-none relative after:content-[''] after:absolute after:top-0 after:left-0 after:bg-white after:border-2 after:border-neutral-900 after:rounded-none after:h-5 after:w-5 after:box-border after:transition-transform after:duration-200 after:ease-swiss peer-checked:after:translate-x-[24px] disabled:opacity-50"></div>
                </label>
              </div>

            </div>
          </div>
        </div>

        {/* Form Footer Bar */}
        <div className="bg-white border-2 border-neutral-900 rounded-none p-5 px-10 flex items-center justify-between select-none shadow-none">
          <div>
            {isEditMode && signedDate && (
              <span className="text-[11px] text-[#6B7C93] font-bold uppercase tracking-widest font-mono select-none">
                Signed on: {new Date(signedDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/doctor/appointments')}
              className="h-10 px-6 bg-transparent border-2 border-neutral-900 text-neutral-900 hover:bg-[#F7F9FB] rounded-none transition-all duration-150 ease-swiss select-none cursor-pointer uppercase font-bold"
              style={{ fontSize: '13px' }}
            >
              CANCEL
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-6 bg-neutral-900 hover:bg-accent text-white hover:text-neutral-900 border-2 border-neutral-900 transition-all duration-150 ease-swiss select-none rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase font-bold"
                style={{ fontSize: '13px' }}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin h-3.5 w-3.5 text-white" />
                    SAVING…
                  </span>
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
                className="h-10 px-4 bg-transparent border-2 border-neutral-900 text-neutral-900 hover:bg-[#F7F9FB] rounded-none transition-all duration-150 ease-swiss select-none cursor-pointer uppercase font-bold"
                style={{ fontSize: '13px' }}
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={confirmKeepPrivate}
                className="h-10 px-4 bg-transparent border-2 border-[#C0392B] text-[#C0392B] hover:bg-[#FDF2F2] rounded-none transition-all duration-150 ease-swiss select-none cursor-pointer uppercase font-bold"
                style={{ fontSize: '13px' }}
              >
                YES, KEEP PRIVATE
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
