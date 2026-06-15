import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Loader2, CheckCircle, ChevronUp, ChevronDown,
  X, Play, GripVertical, ChevronDown as ChevronDownIcon, AlertCircle
} from 'lucide-react';
import { generateExerciseAPI } from '../../api/ai.api';
import { saveCustomExercise } from '../../utils/customExerciseStore';
import toast from 'react-hot-toast';

/* ─── Design system helpers ────────────────────────────────────────── */
const font = (size, weight, color, extra = {}) => ({
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: `${size}px`,
  fontWeight: weight,
  color,
  lineHeight: 1.4,
  ...extra,
});

const shadow1 = '0px 1px 3px rgba(11,79,108,0.06), 0px 1px 2px rgba(11,79,108,0.04)';
const shadow3 = '0px 20px 60px rgba(11,79,108,0.18), 0px 8px 24px rgba(11,79,108,0.12)';

const CATEGORIES = ['Strength', 'Flexibility', 'Balance', 'Cardio', 'Posture', 'Breathing', 'Functional', 'Manual Therapy'];
const DIFFICULTY_OPTIONS = ['beginner', 'intermediate', 'advanced'];

/* ─── Small reusable sub-components ────────────────────────────────── */

const inputStyle = {
  border: '1.5px solid #DDE3EA',
  borderRadius: 6,
  height: 40,
  width: '100%',
  padding: '0 12px',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: '14px',
  color: '#1C2B3A',
  backgroundColor: '#FFFFFF',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 150ms, box-shadow 150ms',
};

const applyFocus = (e) => {
  e.target.style.border = '2px solid #0B4F6C';
  e.target.style.boxShadow = '0 0 0 3px rgba(11,79,108,0.12)';
};

const removeFocus = (e) => {
  e.target.style.border = '1.5px solid #DDE3EA';
  e.target.style.boxShadow = 'none';
};

const FieldLabel = ({ children, required }) => (
  <span style={{ ...font(12, 600, '#6B7C93'), display: 'block', marginBottom: 6 }}>
    {children}{required && <span style={{ color: '#C0392B', marginLeft: 2 }}>*</span>}
  </span>
);

const DifficultyChips = ({ value, onChange }) => (
  <div style={{ display: 'flex', gap: 8 }}>
    {DIFFICULTY_OPTIONS.map((d) => {
      const active = value === d;
      return (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          style={{
            border: `1.5px solid ${active ? '#0B4F6C' : '#DDE3EA'}`,
            backgroundColor: active ? '#E8F4F8' : '#FFFFFF',
            color: active ? '#0B4F6C' : '#6B7C93',
            borderRadius: 9999,
            padding: '6px 18px',
            ...font(12, 600, active ? '#0B4F6C' : '#6B7C93'),
            cursor: 'pointer',
            transition: 'all 150ms',
            textTransform: 'capitalize',
          }}
        >
          {d}
        </button>
      );
    })}
  </div>
);

const StepBtn = ({ onClick, icon: Icon, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      width: 32, height: 32,
      border: '1.5px solid #DDE3EA', borderRadius: 6,
      backgroundColor: 'transparent', color: '#1C2B3A',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: disabled ? 0.4 : 1,
    }}
  >
    <Icon size={13} />
  </button>
);

const ReorderableList = ({ items, onChange, placeholder }) => {
  const move = (idx, dir) => {
    const next = [...items];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const update = (idx, val) => {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  };

  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  const add = () => onChange([...items, '']);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <StepBtn onClick={() => move(idx, -1)} icon={ChevronUp} disabled={idx === 0} />
            <StepBtn onClick={() => move(idx, 1)} icon={ChevronDown} disabled={idx === items.length - 1} />
          </div>
          <input
            value={item}
            onChange={(e) => update(idx, e.target.value)}
            placeholder={placeholder}
            style={{ ...inputStyle, flex: 1, height: 36 }}
            onFocus={applyFocus}
            onBlur={removeFocus}
          />
          <button
            type="button"
            onClick={() => remove(idx)}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#C0392B', padding: 4 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        style={{ ...font(13, 500, '#0B4F6C'), background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '4px 0' }}
      >
        + Add Step
      </button>
    </div>
  );
};

const TagInput = ({ tags, onChange, placeholder }) => {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); commit(); }
    if (e.key === 'Backspace' && !draft && tags.length > 0) onChange(tags.slice(0, -1));
  };

  return (
    <div
      style={{
        border: '1.5px solid #DDE3EA', borderRadius: 6, minHeight: 40,
        padding: '6px 10px', display: 'flex', flexWrap: 'wrap', gap: 6,
        backgroundColor: '#FFFFFF', cursor: 'text',
      }}
      onClick={(e) => e.currentTarget.querySelector('input')?.focus()}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            ...font(12, 600, '#0B4F6C'), backgroundColor: '#E8F4F8',
            borderRadius: 4, padding: '2px 8px',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {tag}
          <button type="button" onClick={() => onChange(tags.filter((t) => t !== tag))}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: '#0B4F6C' }}>
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={tags.length === 0 ? placeholder : ''}
        style={{ border: 'none', outline: 'none', flex: 1, minWidth: 80, fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, color: '#1C2B3A' }}
      />
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════ */

/**
 * AIExerciseCreatorModal — 3-step wizard
 *
 * Step 1: Describe
 * Step 2: Review & Edit
 * Step 3: Saved Confirmation
 *
 * Props:
 *   isOpen {boolean}
 *   onClose {() => void}
 *   fromPrescriptionContext {boolean} — shows "Add to Prescription" button in Step 2
 *   onAddToPrescription {(exercise) => void} — called when "Add to Prescription" is clicked
 */
const AIExerciseCreatorModal = ({
  isOpen,
  onClose,
  fromPrescriptionContext = false,
  onAddToPrescription,
}) => {
  const [step, setStep] = useState(1);
  const [slideDir, setSlideDir] = useState('forward'); // 'forward' | 'back'
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Step 1 state
  const [prompt, setPrompt] = useState('');
  const [muscleGroupsRaw, setMuscleGroupsRaw] = useState('');
  const [patientCondition, setPatientCondition] = useState('');
  const [difficulty, setDifficulty] = useState('intermediate');

  // Step 2 state (AI-generated exercise, fully editable)
  const [exercise, setExercise] = useState(null);
  const [savedExercise, setSavedExercise] = useState(null);
  const [modificationsOpen, setModificationsOpen] = useState(false);

  // Animation state
  const [visible, setVisible] = useState(false);
  const [slideClass, setSlideClass] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      setVisible(false);
      // Reset on close
      setTimeout(() => {
        setStep(1);
        setPrompt('');
        setMuscleGroupsRaw('');
        setPatientCondition('');
        setDifficulty('intermediate');
        setExercise(null);
        setSavedExercise(null);
        setError(null);
        setIsGenerating(false);
      }, 200);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const updateEx = (field, value) => setExercise((prev) => ({ ...prev, [field]: value }));
  const updateModification = (key, value) =>
    setExercise((prev) => ({ ...prev, modifications: { ...(prev.modifications || {}), [key]: value } }));

  const goToStep = (nextStep, direction = 'forward') => {
    setSlideDir(direction);
    setStep(nextStep);
  };

  const handleGenerate = async () => {
    if (prompt.trim().length < 10) {
      setError('Please describe the exercise in at least 10 characters.');
      return;
    }
    setError(null);
    setIsGenerating(true);

    const targetMuscleGroups = muscleGroupsRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await generateExerciseAPI({
        prompt: prompt.trim(),
        targetMuscleGroups,
        patientCondition: patientCondition.trim() || null,
        difficultyLevel: difficulty,
      });
      const data = res.data?.data || res.data;
      setExercise({
        ...data,
        targetMuscleGroups: data.targetMuscleGroups || [],
        stepByStepInstructions: data.stepByStepInstructions || [],
        commonMistakes: data.commonMistakes || [],
        contraindications: data.contraindications || [],
        equipmentRequired: data.equipmentRequired || [],
        modifications: data.modifications || { easier: '', harder: '' },
      });
      goToStep(2, 'forward');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to generate exercise. Please try again.';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    if (!exercise) return;
    const saved = saveCustomExercise(exercise);
    setSavedExercise(saved);
    goToStep(3, 'forward');
  };

  const handleAddToPrescription = () => {
    if (!exercise) return;
    const saved = saveCustomExercise(exercise);
    setSavedExercise(saved);
    onAddToPrescription?.(saved || exercise);
    toast.success(`${exercise.name} added to prescription`);
    onClose?.();
  };

  const handleReset = () => {
    setStep(1);
    setPrompt('');
    setMuscleGroupsRaw('');
    setPatientCondition('');
    setDifficulty('intermediate');
    setExercise(null);
    setSavedExercise(null);
    setError(null);
  };

  /* ─── Slide animation ────────────────────────────────────────────── */
  const slideStyle = {
    transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
  };

  /* ═══════════════════════════════════════════════════════ RENDER ═══ */
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        backgroundColor: 'rgba(28, 43, 58, 0.65)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-label="AI Exercise Creator"
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: shadow3,
          width: 680,
          maxWidth: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
          transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          flexShrink: 0,
          padding: '20px 24px 16px',
          borderBottom: '1px solid #EEF2F6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={font(18, 700, '#1C2B3A', { margin: 0, lineHeight: '26px' })}>AI Exercise Creator</h2>
            <p style={font(13, 400, '#6B7C93', { margin: '2px 0 0' })}>
              Step {step} of 3{step === 1 ? ' — Describe' : step === 2 ? ' — Review & Edit' : ' — Saved'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6B7C93', padding: 4 }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

          {/* ══ STEP 1 — DESCRIBE ══════════════════════════════════════ */}
          {step === 1 && (
            <div style={slideStyle}>
              {/* Intro card */}
              <div style={{
                background: '#F0F4F7', borderRadius: 8, padding: '14px 18px',
                marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12,
              }}>
                <Sparkles size={18} color="#0B4F6C" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={font(14, 600, '#1C2B3A', { margin: 0 })}>Describe your exercise in plain English</p>
                  <p style={font(12, 400, '#6B7C93', { margin: '3px 0 0' })}>
                    The AI will generate a fully structured, clinical exercise prescription from your description.
                  </p>
                </div>
              </div>

              {/* Prompt textarea */}
              <div style={{ marginBottom: 20 }}>
                <FieldLabel required>Exercise Description</FieldLabel>
                <div style={{ position: 'relative' }}>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
                    placeholder="e.g. A standing balance exercise for post-ankle sprain rehabilitation that targets proprioception and ankle stabilizer muscles"
                    rows={4}
                    style={{
                      ...inputStyle,
                      height: 'auto',
                      minHeight: 100,
                      resize: 'vertical',
                      padding: 12,
                      lineHeight: 1.6,
                    }}
                    onFocus={applyFocus}
                    onBlur={removeFocus}
                  />
                  <span style={{
                    ...font(11, 400, '#A8B8C8'),
                    position: 'absolute', bottom: 8, right: 10,
                  }}>
                    {prompt.length}/500
                  </span>
                </div>
              </div>

              {/* Optional context row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <FieldLabel>Target Muscle Groups</FieldLabel>
                  <input
                    value={muscleGroupsRaw}
                    onChange={(e) => setMuscleGroupsRaw(e.target.value)}
                    placeholder="e.g. Quadriceps, Gluteus Medius"
                    style={inputStyle}
                    onFocus={applyFocus}
                    onBlur={removeFocus}
                  />
                  <p style={font(11, 400, '#A8B8C8', { marginTop: 4 })}>Separate multiple muscles with a comma.</p>
                </div>
                <div>
                  <FieldLabel>Patient Condition (Optional)</FieldLabel>
                  <input
                    value={patientCondition}
                    onChange={(e) => setPatientCondition(e.target.value)}
                    placeholder="e.g. Post-ACL reconstruction, week 6"
                    style={inputStyle}
                    onFocus={applyFocus}
                    onBlur={removeFocus}
                  />
                  <p style={font(11, 400, '#A8B8C8', { marginTop: 4 })}>Helps the AI tailor the exercise appropriately.</p>
                </div>
              </div>

              {/* Difficulty */}
              <div style={{ marginBottom: 24 }}>
                <FieldLabel>Difficulty Level</FieldLabel>
                <DifficultyChips value={difficulty} onChange={setDifficulty} />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: '#FDF2F2', borderRadius: 6, padding: '10px 14px', marginBottom: 16,
                }}>
                  <AlertCircle size={14} color="#C0392B" />
                  <p style={font(13, 500, '#C0392B', { margin: 0 })}>{error}</p>
                </div>
              )}
            </div>
          )}

          {/* ══ STEP 2 — REVIEW & EDIT ══════════════════════════════════ */}
          {step === 2 && exercise && (
            <div style={slideStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', gap: 24 }}>

                {/* Left column — clinical fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Exercise Name */}
                  <div>
                    <FieldLabel required>Exercise Name</FieldLabel>
                    <input
                      value={exercise.name || ''}
                      onChange={(e) => updateEx('name', e.target.value)}
                      style={{ ...inputStyle, ...font(14, 600, '#1C2B3A') }}
                      onFocus={applyFocus}
                      onBlur={removeFocus}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <FieldLabel>Category</FieldLabel>
                    <select
                      value={exercise.category || ''}
                      onChange={(e) => updateEx('category', e.target.value)}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                      onFocus={applyFocus}
                      onBlur={removeFocus}
                    >
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Target Muscle Groups */}
                  <div>
                    <FieldLabel>Target Muscle Groups</FieldLabel>
                    <TagInput
                      tags={exercise.targetMuscleGroups || []}
                      onChange={(v) => updateEx('targetMuscleGroups', v)}
                      placeholder="Add muscle, press Enter"
                    />
                  </div>

                  {/* Step-by-Step Instructions */}
                  <div>
                    <FieldLabel>Step-by-Step Instructions</FieldLabel>
                    <ReorderableList
                      items={exercise.stepByStepInstructions || []}
                      onChange={(v) => updateEx('stepByStepInstructions', v)}
                      placeholder="Instruction step..."
                    />
                  </div>

                  {/* Common Mistakes */}
                  <div>
                    <FieldLabel>Common Mistakes</FieldLabel>
                    <ReorderableList
                      items={exercise.commonMistakes || []}
                      onChange={(v) => updateEx('commonMistakes', v)}
                      placeholder="Common error to avoid..."
                    />
                  </div>

                  {/* Contraindications */}
                  <div>
                    <FieldLabel>Contraindications</FieldLabel>
                    <ReorderableList
                      items={exercise.contraindications || []}
                      onChange={(v) => updateEx('contraindications', v)}
                      placeholder="Condition where exercise is contraindicated..."
                    />
                  </div>

                  {/* Clinical Notes */}
                  <div>
                    <FieldLabel>Clinical Notes</FieldLabel>
                    <textarea
                      value={exercise.clinicalNotes || ''}
                      onChange={(e) => updateEx('clinicalNotes', e.target.value.slice(0, 500))}
                      rows={3}
                      style={{ ...inputStyle, height: 'auto', padding: 12, resize: 'vertical' }}
                      onFocus={applyFocus}
                      onBlur={removeFocus}
                    />
                  </div>
                </div>

                {/* Right column — prescription parameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{
                    backgroundColor: '#FFFFFF', borderRadius: 12, boxShadow: shadow1, padding: 20,
                  }}>
                    <p style={font(14, 700, '#1C2B3A', { marginBottom: 12, borderBottom: '1px solid #EEF2F6', paddingBottom: 12 })}>
                      Prescription Parameters
                    </p>

                    {/* Sets */}
                    <div style={{ marginBottom: 14 }}>
                      <FieldLabel>Sets</FieldLabel>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StepBtn onClick={() => updateEx('sets', Math.max(1, (exercise.sets || 1) - 1))} icon={ChevronUp} />
                        <span style={font(16, 700, '#1C2B3A', { width: 28, textAlign: 'center' })}>{exercise.sets || 1}</span>
                        <StepBtn onClick={() => updateEx('sets', Math.min(20, (exercise.sets || 1) + 1))} icon={ChevronDown} />
                      </div>
                    </div>

                    {/* Reps */}
                    <div style={{ marginBottom: 14 }}>
                      <FieldLabel>Reps</FieldLabel>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <StepBtn onClick={() => updateEx('reps', Math.max(1, (exercise.reps || 1) - 1))} icon={ChevronUp} />
                        <span style={font(16, 700, '#1C2B3A', { width: 28, textAlign: 'center' })}>{exercise.reps || 1}</span>
                        <StepBtn onClick={() => updateEx('reps', Math.min(50, (exercise.reps || 1) + 1))} icon={ChevronDown} />
                      </div>
                    </div>

                    {/* Hold Duration */}
                    <div style={{ marginBottom: 14 }}>
                      <FieldLabel>Hold Duration</FieldLabel>
                      <input
                        value={exercise.holdDuration || ''}
                        onChange={(e) => updateEx('holdDuration', e.target.value)}
                        placeholder="e.g. 30 seconds"
                        style={inputStyle}
                        onFocus={applyFocus}
                        onBlur={removeFocus}
                      />
                    </div>

                    {/* Frequency */}
                    <div style={{ marginBottom: 14 }}>
                      <FieldLabel>Frequency</FieldLabel>
                      <input
                        value={exercise.frequency || ''}
                        onChange={(e) => updateEx('frequency', e.target.value)}
                        placeholder="e.g. Twice daily"
                        style={inputStyle}
                        onFocus={applyFocus}
                        onBlur={removeFocus}
                      />
                    </div>

                    {/* Equipment */}
                    <div style={{ marginBottom: 14 }}>
                      <FieldLabel>Equipment Required</FieldLabel>
                      <TagInput
                        tags={exercise.equipmentRequired || []}
                        onChange={(v) => updateEx('equipmentRequired', v)}
                        placeholder="Add equipment..."
                      />
                    </div>

                    {/* Difficulty */}
                    <div>
                      <FieldLabel>Difficulty</FieldLabel>
                      <DifficultyChips value={exercise.difficulty || 'intermediate'} onChange={(v) => updateEx('difficulty', v)} />
                    </div>
                  </div>

                  {/* YouTube preview */}
                  <div style={{
                    border: '1px dashed #DDE3EA', borderRadius: 8,
                    padding: 14, backgroundColor: '#FAFBFC',
                  }}>
                    <p style={font(11, 600, '#6B7C93', { letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 })}>
                      VIDEO PREVIEW
                    </p>
                    <div style={{
                      borderRadius: 8, backgroundColor: '#F0F4F7',
                      height: 120, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden',
                    }}>
                      <Play size={28} color="#A8B8C8" />
                      <p style={{
                        ...font(11, 400, '#6B7C93'),
                        textAlign: 'center', padding: '0 12px',
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        margin: 0,
                      }}>
                        {exercise.youtubeSearchQuery || 'No search query'}
                      </p>
                    </div>
                    {exercise.youtubeSearchQuery && (
                      <button
                        type="button"
                        onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.youtubeSearchQuery)}`, '_blank')}
                        style={{ ...font(12, 600, '#0B4F6C'), background: 'transparent', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0 }}
                      >
                        Search on YouTube →
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Modifications expander */}
              <div style={{ marginTop: 20, borderTop: '1px solid #EEF2F6', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setModificationsOpen(!modificationsOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    ...font(14, 600, '#1C2B3A'),
                  }}
                >
                  <ChevronDownIcon
                    size={16}
                    style={{ transform: modificationsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
                  />
                  Modifications
                </button>
                {modificationsOpen && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                    <div>
                      <FieldLabel>Easier Modification</FieldLabel>
                      <input
                        value={exercise.modifications?.easier || ''}
                        onChange={(e) => updateModification('easier', e.target.value)}
                        placeholder="How to make it easier"
                        style={inputStyle}
                        onFocus={applyFocus}
                        onBlur={removeFocus}
                      />
                    </div>
                    <div>
                      <FieldLabel>Harder Modification</FieldLabel>
                      <input
                        value={exercise.modifications?.harder || ''}
                        onChange={(e) => updateModification('harder', e.target.value)}
                        placeholder="How to make it harder"
                        style={inputStyle}
                        onFocus={applyFocus}
                        onBlur={removeFocus}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ STEP 3 — CONFIRMATION ══════════════════════════════════ */}
          {step === 3 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', textAlign: 'center', padding: '40px 20px',
            }}>
              <CheckCircle
                size={40}
                color="#0A7E6E"
                style={{ animation: 'aiCreatorBounce 300ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
              />
              <style>{`
                @keyframes aiCreatorBounce {
                  0% { transform: scale(0.5); opacity: 0; }
                  100% { transform: scale(1.0); opacity: 1; }
                }
              `}</style>
              <h3 style={font(18, 700, '#1C2B3A', { margin: '16px 0 8px' })}>Exercise Created</h3>
              <p style={font(13, 400, '#6B7C93', { margin: 0 })}>
                {exercise?.name || 'Your exercise'} has been added to your exercise library.
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          flexShrink: 0,
          padding: '16px 24px',
          borderTop: '1px solid #EEF2F6',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
          backgroundColor: '#FFFFFF',
        }}>
          {/* Step 1 footer */}
          {step === 1 && (
            <>
              <button type="button" onClick={onClose}
                style={{ ...font(13, 600, '#1C2B3A'), border: '1.5px solid #DDE3EA', borderRadius: 6, height: 40, padding: '0 16px', background: '#FFFFFF', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  backgroundColor: isGenerating ? '#083A52' : '#0B4F6C',
                  color: '#FFFFFF', border: 'none', borderRadius: 6, height: 40, padding: '0 20px',
                  ...font(13, 600, '#FFFFFF'), cursor: isGenerating ? 'not-allowed' : 'pointer',
                  animation: isGenerating ? 'aiGeneratePulse 1.2s ease-in-out infinite' : 'none',
                  transition: 'background-color 150ms',
                }}
              >
                <style>{`
                  @keyframes aiGeneratePulse {
                    0%, 100% { background-color: #0B4F6C; }
                    50% { background-color: #083A52; }
                  }
                `}</style>
                {isGenerating
                  ? <><Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Generating…</>
                  : <><Sparkles size={14} /> Generate Exercise</>
                }
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </button>
            </>
          )}

          {/* Step 2 footer */}
          {step === 2 && (
            <>
              <button type="button" onClick={() => goToStep(1, 'back')}
                style={{ ...font(13, 600, '#1C2B3A'), border: '1.5px solid #DDE3EA', borderRadius: 6, height: 40, padding: '0 16px', background: '#FFFFFF', cursor: 'pointer' }}>
                Back
              </button>
              <button type="button" onClick={handleSave}
                style={{ ...font(13, 600, '#FFFFFF'), backgroundColor: '#0B4F6C', border: 'none', borderRadius: 6, height: 40, padding: '0 20px', cursor: 'pointer' }}>
                Save to My Library
              </button>
              {fromPrescriptionContext && (
                <button type="button" onClick={handleAddToPrescription}
                  style={{ ...font(13, 600, '#FFFFFF'), backgroundColor: '#F4845F', border: 'none', borderRadius: 6, height: 40, padding: '0 20px', cursor: 'pointer' }}>
                  Add to Prescription
                </button>
              )}
            </>
          )}

          {/* Step 3 footer */}
          {step === 3 && (
            <>
              <button type="button" onClick={handleReset}
                style={{ ...font(13, 600, '#1C2B3A'), border: '1.5px solid #DDE3EA', borderRadius: 6, height: 40, padding: '0 16px', background: '#FFFFFF', cursor: 'pointer' }}>
                Create Another
              </button>
              <button type="button" onClick={onClose}
                style={{ ...font(13, 600, '#FFFFFF'), backgroundColor: '#0B4F6C', border: 'none', borderRadius: 6, height: 40, padding: '0 20px', cursor: 'pointer' }}>
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIExerciseCreatorModal;
