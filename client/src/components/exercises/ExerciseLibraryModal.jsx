import React, { useEffect, useMemo, useState } from 'react';
import { X, Search, Check, Minus, Plus } from 'lucide-react';
import {
  EXERCISE_CATEGORIES,
  searchExercises,
  getAllExercises,
} from '../../data/exerciseLibrary';
import { getCategoryIcon } from './ExerciseCategoryIcons';
import { getPositionFigure } from './PositionFigures';

const FREQUENCY_OPTIONS = [
  'Once daily',
  'Twice daily',
  'Three times daily',
  'Every other day',
  '3× per week',
  'As tolerated',
];

const DURATION_OPTIONS = [
  '10 sec', '15 sec', '20 sec', '30 sec',
  '45 sec', '1 min', '2 min', '5 min', '10 min',
];

const PRESCRIPTION_DURATION_OPTIONS = [
  '1 week',
  '2 weeks',
  '3 weeks',
  '4 weeks',
  '6 weeks',
  '8 weeks',
  '12 weeks',
  '1 month',
  '2 months',
  '3 months',
  'Until next session',
  'Ongoing',
];

const DIFFICULTY_STYLES = {
  beginner:     { bg: '#E8F8F5', color: '#0A7E6E' },
  intermediate: { bg: '#FEF3E2', color: '#B45309' },
  advanced:     { bg: '#FDF2F2', color: '#C0392B' },
};

const formatDefaultPrescription = (ex) => {
  const parts = [];
  if (ex.sets) parts.push(`${ex.sets} × ${ex.reps || ex.duration || '—'}`);
  else if (ex.duration) parts.push(ex.duration);
  return parts.join(' ') || '—';
};

const toPrescriptionItem = (exercise) => ({
  exerciseLibraryId: exercise.id,
  exerciseName: exercise.name,
  sets: exercise.defaultSets ?? null,
  reps: exercise.defaultReps ?? null,
  duration: exercise.defaultDuration ?? null,
  frequency: exercise.defaultFrequency ?? 'Once daily',
  prescriptionDuration: '2 weeks',
  notes: null,
  targetArea: exercise.targetArea,
  categoryColor: exercise.categoryColor,
  position: exercise.position,
  difficulty: exercise.difficulty,
  equipment: exercise.equipment,
});

/* ─── Inline style helpers ─────────────────────────────── */
const font = (size, weight, color, extra = {}) => ({
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: `${size}px`,
  fontWeight: weight,
  lineHeight: 1.4,
  color,
  ...extra,
});

/* Swiss shadow system — tinted primary, never black */
const shadow1 = '0px 1px 3px rgba(11,79,108,0.06), 0px 1px 2px rgba(11,79,108,0.04)';
const shadow2 = '0px 4px 16px rgba(11,79,108,0.10), 0px 2px 6px rgba(11,79,108,0.07)';
const shadow3 = '0px 20px 60px rgba(11,79,108,0.18), 0px 8px 24px rgba(11,79,108,0.12)';

/* Swiss structural divider */
const rule = '1px solid #EEF2F6';

/* ─── Stepper button — Swiss ghost style ───────────────── */
const StepBtn = ({ onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      width: 32, height: 32,
      border: '1.5px solid #DDE3EA',
      borderRadius: 6,
      backgroundColor: 'transparent',
      color: '#1C2B3A',
      cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background-color 150ms, border-color 150ms',
      flexShrink: 0,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = '#F0F4F7';
      e.currentTarget.style.borderColor = '#A8B8C8';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.borderColor = '#DDE3EA';
    }}
  >
    {children}
  </button>
);

/* ─── Select control ───────────────────────────────────── */
const SelectCtrl = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    style={{
      ...font(13, 500, '#1C2B3A'),
      border: '1.5px solid #DDE3EA',
      borderRadius: 6,
      height: 36,
      width: '100%',
      paddingLeft: 10,
      paddingRight: 10,
      backgroundColor: '#FFFFFF',
      outline: 'none',
      cursor: 'pointer',
      transition: 'border-color 150ms, box-shadow 150ms',
    }}
    onFocus={(e) => {
      e.target.style.borderWidth = '2px';
      e.target.style.borderColor = '#0B4F6C';
      e.target.style.boxShadow = '0 0 0 3px rgba(11,79,108,0.10)';
    }}
    onBlur={(e) => {
      e.target.style.borderWidth = '1.5px';
      e.target.style.borderColor = '#DDE3EA';
      e.target.style.boxShadow = 'none';
    }}
  >
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

/* ─── Field label — UPPERCASE Swiss system label ───────── */
const FieldLabel = ({ children }) => (
  <span style={font(10, 700, '#6B7C93', {
    display: 'block',
    marginBottom: 8,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
  })}>
    {children}
  </span>
);

/* ═══════════════════════════════════════════════════════ */

const ExerciseLibraryModal = ({ isOpen, onClose, initialPrescription = [], onDone }) => {
  const [activeCategoryId, setActiveCategoryId] = useState(EXERCISE_CATEGORIES[0]?.id || 'spine');
  const [searchQuery, setSearchQuery] = useState('');
  const [prescription, setPrescription] = useState([]);
  const [addedFlash, setAddedFlash] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      setPrescription(
        initialPrescription.map((ex) => ({
          ...ex,
          sets: ex.sets ?? null,
          reps: ex.reps ?? null,
          duration: ex.duration ?? null,
          frequency: ex.frequency || 'Once daily',
          prescriptionDuration: ex.prescriptionDuration || '2 weeks',
        }))
      );
      setSearchQuery('');
      setActiveCategoryId(EXERCISE_CATEGORIES[0]?.id || 'spine');
    }
  }, [isOpen, initialPrescription]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchExercises(searchQuery);
  }, [searchQuery]);

  const activeCategory = EXERCISE_CATEGORIES.find((c) => c.id === activeCategoryId);

  const handleAddExercise = (exercise) => {
    const enriched = getAllExercises().find((e) => e.id === exercise.id) || exercise;
    setPrescription((prev) => {
      if (prev.some((p) => p.exerciseLibraryId === enriched.id)) return prev;
      return [...prev, toPrescriptionItem(enriched)];
    });
    setAddedFlash((prev) => new Set(prev).add(exercise.id));
    setTimeout(() => {
      setAddedFlash((prev) => {
        const next = new Set(prev);
        next.delete(exercise.id);
        return next;
      });
    }, 800);
  };

  const updateItem = (index, field, value) => {
    setPrescription((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeItem = (index) => {
    setPrescription((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDone = () => {
    onDone?.(
      prescription.map(({ targetArea, categoryColor, position, difficulty, equipment, ...rest }) => rest)
    );
    onClose?.();
  };

  if (!isOpen) return null;

  /* ── Exercise card ──────────────────────────────────── */
  const renderCard = (exercise) => {
    const Figure = getPositionFigure(exercise.position);
    const color = exercise.categoryColor || activeCategory?.color || '#0B4F6C';
    const isAdded = prescription.some((p) => p.exerciseLibraryId === exercise.id);
    const isFlashing = addedFlash.has(exercise.id);
    const diff = DIFFICULTY_STYLES[exercise.difficulty] || DIFFICULTY_STYLES.beginner;

    return (
      <div
        key={exercise.id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: shadow1,
          transition: 'box-shadow 200ms',
          minHeight: 230,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = shadow2;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = shadow1;
        }}
      >
        {/* Figure zone */}
        <div style={{
          height: 132,
          backgroundColor: '#FAFBFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Figure size={96} color="#0B4F6C" />
        </div>

        {/* Content zone */}
        <div style={{ flex: 1, padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
          {/* Category label (search mode) */}
          {searchResults && (
            <span style={{
              ...font(10, 700, '#6B7C93', {
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                backgroundColor: '#F0F4F7',
                padding: '3px 8px',
                borderRadius: 4,
                alignSelf: 'flex-start',
              }),
            }}>
              {exercise.categoryLabel}
            </span>
          )}

          {/* Name */}
          <p style={font(15, 700, '#1C2B3A', { lineHeight: '22px' })} className="truncate">
            {exercise.name}
          </p>

          {/* Target area */}
          <p style={font(12, 500, '#6B7C93')} className="truncate">
            {exercise.targetArea}
          </p>

          {/* Badges row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            <span style={{
              ...font(10, 700, diff.color, {
                backgroundColor: diff.bg,
                padding: '3px 10px',
                borderRadius: 4,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }),
            }}>
              {exercise.difficulty}
            </span>
            {exercise.equipment && exercise.equipment !== 'none' && (
              <span style={{
                ...font(10, 700, '#6B7C93', {
                  backgroundColor: '#F0F4F7',
                  padding: '3px 10px',
                  borderRadius: 4,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }),
              }}>
                {exercise.equipment}
              </span>
            )}
          </div>

          {/* Bottom row (Summary text + Add button) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            marginTop: 'auto',
            paddingTop: 4,
          }}>
            {/* Default prescription */}
            <p style={{
              ...font(12, 400, '#6B7C93'),
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              flex: 1,
              margin: 0,
            }}>
              {formatDefaultPrescription({
                sets: exercise.defaultSets,
                reps: exercise.defaultReps,
                duration: exercise.defaultDuration,
              })}
              {exercise.defaultFrequency ? ` · ${exercise.defaultFrequency}` : ''}
            </p>

            {/* Add button */}
            <button
              type="button"
              onClick={() => handleAddExercise(exercise)}
              disabled={isAdded}
              aria-label={`Add ${exercise.name}`}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                border: `2px solid #0B4F6C`,
                backgroundColor: isAdded || isFlashing ? '#0B4F6C' : 'transparent',
                color: isAdded || isFlashing ? '#FFFFFF' : '#0B4F6C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isAdded ? 'default' : 'pointer',
                opacity: isAdded ? 0.65 : 1,
                transition: 'background-color 150ms, color 150ms',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (!isAdded) {
                  e.currentTarget.style.backgroundColor = '#E8F4F8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAdded) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {isFlashing || isAdded ? <Check size={14} /> : <Plus size={14} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-library-title"
    >
      {/* ── Modal shell — 90 × 90 viewport ── */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          boxShadow: shadow3,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          width: '90vw',
          height: '90vh',
          maxWidth: 1400,
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ══ HEADER ═══════════════════════════════════════ */}
        <div style={{
          flexShrink: 0,
          padding: '24px 32px 20px',
          backgroundColor: '#FAFBFC',
          borderBottom: '1px solid #EEF2F6',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <h2
                id="exercise-library-title"
                style={font(22, 700, '#1C2B3A', { lineHeight: '30px', marginBottom: 4 })}
              >
                Exercise Library
              </h2>
              <p style={font(14, 400, '#6B7C93')}>
                Find and prescribe the right exercises for your patient
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close exercise library"
              style={{
                padding: 8,
                borderRadius: 6,
                border: 'none',
                backgroundColor: 'transparent',
                color: '#6B7C93',
                cursor: 'pointer',
                display: 'flex',
                transition: 'background-color 150ms, color 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FDF2F2';
                e.currentTarget.style.color = '#C0392B';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#6B7C93';
              }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginTop: 16 }}>
            <Search
              size={16}
              style={{
                position: 'absolute', left: 14,
                top: '50%', transform: 'translateY(-50%)',
                color: '#6B7C93', pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              id="exercise-library-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises by name, tag, or target area..."
              style={{
                ...font(14, 400, '#1C2B3A'),
                width: '100%',
                height: 44,
                paddingLeft: 44,
                paddingRight: 16,
                border: '1.5px solid #DDE3EA',
                borderRadius: 6,
                backgroundColor: '#FFFFFF',
                outline: 'none',
                transition: 'border 150ms, box-shadow 150ms',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid #0B4F6C';
                e.target.style.boxShadow = '0 0 0 3px rgba(11,79,108,0.12)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1.5px solid #DDE3EA';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* ══ BODY — three panels ═══════════════════════════ */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* ── Category sidebar (220px) ─────────────────── */}
          <div style={{
            width: 220,
            flexShrink: 0,
            overflowY: 'auto',
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            borderRight: '1px solid #EEF2F6',
            opacity: searchQuery ? 0.5 : 1,
            transition: 'opacity 150ms',
          }}>
            {EXERCISE_CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const count = cat.subcategories.reduce((s, sub) => s + sub.exercises.length, 0);
              const isActive = activeCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: 'none',
                    borderLeft: `3px solid ${isActive ? '#0B4F6C' : 'transparent'}`,
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'background-color 150ms',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#F0F4F7';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon size={32} color={isActive ? '#1C2B3A' : '#A8B8C8'} />
                  <div style={{ minWidth: 0 }}>
                    <p style={font(14, isActive ? 700 : 500, isActive ? '#1C2B3A' : '#6B7C93', {
                      lineHeight: '20px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    })}>
                      {cat.label}
                    </p>
                    <p style={font(11, 400, '#A8B8C8', { lineHeight: '16px' })}>
                      {count} exercises
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Exercise grid ─────────────────────────────── */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            backgroundColor: '#F7F9FB',
            minWidth: 0,
          }}>
            {searchResults ? (
              searchResults.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  height: '100%', textAlign: 'center',
                }}>
                  <Search size={40} style={{ color: '#DDE3EA', marginBottom: 12 }} />
                  <p style={font(18, 700, '#1C2B3A', { marginBottom: 6 })}>No exercises found</p>
                  <p style={font(14, 400, '#6B7C93')}>Try a different name, tag, or target area</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                  {searchResults.map(renderCard)}
                </div>
              )
            ) : (
              activeCategory?.subcategories.map((sub) => (
                <div key={sub.id} style={{ marginBottom: 32 }}>
                  <h3 style={{
                    ...font(12, 700, '#6B7C93', {
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 16,
                      paddingBottom: 10,
                      borderBottom: '1px solid #EEF2F6',
                      position: 'sticky',
                      top: 0,
                      backgroundColor: '#F7F9FB',
                      zIndex: 10,
                    }),
                  }}>
                    {sub.label}
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
                    {sub.exercises.map((ex) => renderCard({
                      ...ex,
                      categoryColor: activeCategory.color,
                      categoryLabel: activeCategory.label,
                    }))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Prescription panel (280px) ────────────────── */}
          <div style={{
            width: 280,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: '1px solid #EEF2F6',
            backgroundColor: '#F7F9FB',
          }}>
            {/* Panel header */}
            <div style={{
              flexShrink: 0,
              padding: '20px 20px 12px',
              borderBottom: '1px solid #EEF2F6',
            }}>
              <p style={font(11, 700, '#6B7C93', {
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              })}>
                Prescription
              </p>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>
              {prescription.length === 0 ? (
                <div style={{
                  border: '1px dashed #DDE3EA',
                  borderRadius: 12,
                  padding: '32px 20px',
                  backgroundColor: '#FAFBFC',
                  textAlign: 'center',
                  marginTop: 8,
                }}>
                  <p style={font(13, 400, '#A8B8C8', { lineHeight: '20px' })}>
                    Add exercises from the grid to build a prescription
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {prescription.map((item, idx) => (
                    <div
                      key={`${item.exerciseLibraryId || item.exerciseName}-${idx}`}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: 12,
                        padding: '14px 14px 14px',
                        position: 'relative',
                        boxShadow: shadow1,
                      }}
                    >
                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        aria-label="Remove exercise"
                        style={{
                          position: 'absolute', top: 12, right: 12,
                          border: 'none', background: 'transparent',
                          padding: 4, borderRadius: 4,
                          color: '#A8B8C8', cursor: 'pointer',
                          display: 'flex',
                          transition: 'color 150ms',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#C0392B'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#A8B8C8'; }}
                      >
                        <X size={14} />
                      </button>

                      {/* Exercise name */}
                      <p style={font(14, 700, '#1C2B3A', {
                        paddingRight: 24, lineHeight: '20px', marginBottom: 12,
                      })}>
                        {item.exerciseName}
                      </p>

                      {/* Duration-only */}
                      {item.duration && !item.reps ? (
                        <div>
                          <FieldLabel>Duration</FieldLabel>
                          <SelectCtrl
                            value={item.duration || DURATION_OPTIONS[3]}
                            onChange={(e) => updateItem(idx, 'duration', e.target.value)}
                            options={DURATION_OPTIONS}
                          />
                        </div>
                      ) : (
                        /* Sets + Reps */
                        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                          {/* Sets */}
                          <div>
                            <FieldLabel>Sets</FieldLabel>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <StepBtn onClick={() => updateItem(idx, 'sets', Math.max(1, (item.sets || 1) - 1))}>
                                <Minus size={13} />
                              </StepBtn>
                              <span style={font(16, 700, '#1C2B3A', { width: 28, textAlign: 'center' })}>
                                {item.sets || 1}
                              </span>
                              <StepBtn onClick={() => updateItem(idx, 'sets', Math.min(20, (item.sets || 1) + 1))}>
                                <Plus size={13} />
                              </StepBtn>
                            </div>
                          </div>
                          {/* Reps */}
                          <div>
                            <FieldLabel>Reps</FieldLabel>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <StepBtn onClick={() => updateItem(idx, 'reps', Math.max(1, (item.reps || 1) - 1))}>
                                <Minus size={13} />
                              </StepBtn>
                              <span style={font(16, 700, '#1C2B3A', { width: 28, textAlign: 'center' })}>
                                {item.reps || 1}
                              </span>
                              <StepBtn onClick={() => updateItem(idx, 'reps', Math.min(50, (item.reps || 1) + 1))}>
                                <Plus size={13} />
                              </StepBtn>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Frequency */}
                      <div style={{ marginTop: item.duration && !item.reps ? 12 : 0 }}>
                        <FieldLabel>Frequency</FieldLabel>
                        <SelectCtrl
                          value={item.frequency || 'Once daily'}
                          onChange={(e) => updateItem(idx, 'frequency', e.target.value)}
                          options={FREQUENCY_OPTIONS}
                        />
                      </div>

                      {/* Overall Duration */}
                      <div style={{ marginTop: 12 }}>
                        <FieldLabel>Prescribe For</FieldLabel>
                        <SelectCtrl
                          value={item.prescriptionDuration || '2 weeks'}
                          onChange={(e) => updateItem(idx, 'prescriptionDuration', e.target.value)}
                          options={PRESCRIPTION_DURATION_OPTIONS}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Done footer */}
            <div style={{
              flexShrink: 0,
              padding: '16px 16px 20px',
              borderTop: '1px solid #EEF2F6',
            }}>
              <p style={font(13, 400, '#6B7C93', { marginBottom: 12 })}>
                {prescription.length === 0
                  ? 'No exercises selected'
                  : `${prescription.length} exercise${prescription.length !== 1 ? 's' : ''} selected`}
              </p>
              <button
                type="button"
                onClick={handleDone}
                disabled={prescription.length === 0}
                style={{
                  width: '100%',
                  height: 44,
                  backgroundColor: prescription.length === 0 ? '#DDE3EA' : '#0B4F6C',
                  color: prescription.length === 0 ? '#A8B8C8' : '#FFFFFF',
                  border: 'none',
                  borderRadius: 6,
                  ...font(14, 700, prescription.length === 0 ? '#A8B8C8' : '#FFFFFF'),
                  cursor: prescription.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: prescription.length === 0 ? 'none' : '0 2px 8px rgba(11,79,108,0.25)',
                  transition: 'background-color 150ms',
                }}
                onMouseEnter={(e) => {
                  if (prescription.length > 0) e.currentTarget.style.backgroundColor = '#083A52';
                }}
                onMouseLeave={(e) => {
                  if (prescription.length > 0) e.currentTarget.style.backgroundColor = '#0B4F6C';
                }}
              >
                Add to Prescription →
              </button>
            </div>
          </div>
        </div>

        {/* ══ MOBILE footer ════════════════════════════════ */}
        <div style={{
          display: 'none', // hidden on desktop, shown via media query below (mobile)
          flexShrink: 0,
          padding: '12px 20px',
          borderTop: '1px solid #EEF2F6',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }} className="mobile-prescription-footer">
          <span style={font(14, 400, '#6B7C93')}>{prescription.length} selected</span>
          <button
            type="button"
            onClick={handleDone}
            style={{
              height: 44, padding: '0 24px',
              backgroundColor: '#0B4F6C', color: '#FFFFFF',
              border: 'none', borderRadius: 6,
              ...font(14, 700, '#FFFFFF'),
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(11,79,108,0.25)',
            }}
          >
            Done →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibraryModal;
