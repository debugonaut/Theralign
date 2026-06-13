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
  '10 sec',
  '15 sec',
  '20 sec',
  '30 sec',
  '45 sec',
  '1 min',
  '2 min',
  '5 min',
  '10 min',
];

const DIFFICULTY_STYLES = {
  beginner:     'bg-[#E8F8F5] text-[#0A7E6E]',
  intermediate: 'bg-[#FEF3E2] text-[#B45309]',
  advanced:     'bg-[#FDF2F2] text-[#C0392B]',
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
  notes: null,
  targetArea: exercise.targetArea,
  categoryColor: exercise.categoryColor,
  position: exercise.position,
  difficulty: exercise.difficulty,
  equipment: exercise.equipment,
});

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

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

  const updatePrescriptionItem = (index, field, value) => {
    setPrescription((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removePrescriptionItem = (index) => {
    setPrescription((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDone = () => {
    onDone?.(
      prescription.map(({ targetArea, categoryColor, position, difficulty, equipment, ...rest }) => rest)
    );
    onClose?.();
  };

  if (!isOpen) return null;

  // ─── Exercise Card ────────────────────────────────────────────────────────
  const renderExerciseCard = (exercise) => {
    const PositionFigure = getPositionFigure(exercise.position);
    const color = exercise.categoryColor || activeCategory?.color || '#0B4F6C';
    const isAdded = prescription.some((p) => p.exerciseLibraryId === exercise.id);
    const isFlashing = addedFlash.has(exercise.id);

    return (
      <div
        key={exercise.id}
        className="flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-200"
        style={{
          minHeight: '196px',
          boxShadow: '0px 1px 3px rgba(11, 79, 108, 0.06), 0px 1px 2px rgba(11, 79, 108, 0.04)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            '0px 4px 16px rgba(11, 79, 108, 0.10), 0px 2px 6px rgba(11, 79, 108, 0.07)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            '0px 1px 3px rgba(11, 79, 108, 0.06), 0px 1px 2px rgba(11, 79, 108, 0.04)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Figure zone */}
        <div
          className="h-[104px] flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#F8F8F6' }}
        >
          <PositionFigure size={76} color={`${color}B3`} />
        </div>

        {/* Content zone */}
        <div className="flex-1 p-3 flex flex-col gap-1 relative">
          {/* Category label shown only in search results */}
          {searchResults && (
            <span
              className="self-start px-2 py-0.5 rounded-sm"
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                backgroundColor: `${color}18`,
                color: color,
              }}
            >
              {exercise.categoryLabel}
            </span>
          )}

          {/* Exercise name */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              lineHeight: '20px',
              color: '#1C2B3A',
            }}
            className="truncate"
          >
            {exercise.name}
          </p>

          {/* Target area */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 400,
              color: '#6B7C93',
            }}
            className="truncate"
          >
            {exercise.targetArea}
          </p>

          {/* Difficulty + equipment badges */}
          <div className="flex flex-wrap gap-1 mt-1">
            <span
              className={`px-2 py-0.5 rounded-sm ${DIFFICULTY_STYLES[exercise.difficulty] || DIFFICULTY_STYLES.beginner}`}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {exercise.difficulty}
            </span>
            {exercise.equipment && exercise.equipment !== 'none' && (
              <span
                className="px-2 py-0.5 rounded-sm bg-[#F0F4F7] text-[#6B7C93]"
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {exercise.equipment}
              </span>
            )}
          </div>

          {/* Default prescription summary */}
          <p
            className="mt-auto"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 400,
              color: '#6B7C93',
            }}
          >
            {formatDefaultPrescription({
              sets: exercise.defaultSets,
              reps: exercise.defaultReps,
              duration: exercise.defaultDuration,
            })}
            {exercise.defaultFrequency ? ` · ${exercise.defaultFrequency}` : ''}
          </p>

          {/* Add / Added button */}
          <button
            type="button"
            onClick={() => handleAddExercise(exercise)}
            disabled={isAdded}
            className="absolute bottom-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-150"
            style={{
              border: `2px solid ${isAdded || isFlashing ? '#0B4F6C' : '#0B4F6C'}`,
              backgroundColor: isAdded || isFlashing ? '#0B4F6C' : 'transparent',
              color: isAdded || isFlashing ? '#FFFFFF' : '#0B4F6C',
              opacity: isAdded ? 0.65 : 1,
              cursor: isAdded ? 'default' : 'pointer',
            }}
            aria-label={`Add ${exercise.name}`}
          >
            {isFlashing || isAdded ? <Check size={13} /> : <Plus size={13} />}
          </button>
        </div>
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-library-title"
    >
      {/* Modal container */}
      <div
        className="bg-white flex flex-col w-full h-full sm:h-[620px] sm:max-h-[90vh] rounded-none sm:rounded-xl overflow-hidden"
        style={{
          maxWidth: '880px',
          boxShadow: '0px 20px 60px rgba(11, 79, 108, 0.18), 0px 8px 24px rgba(11, 79, 108, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ─────────────────────────────────────────────── */}
        <div
          className="shrink-0 px-6 py-4 border-b"
          style={{ backgroundColor: '#FAFBFC', borderBottomColor: '#EEF2F6' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="exercise-library-title"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '18px',
                  fontWeight: 700,
                  lineHeight: '28px',
                  color: '#1C2B3A',
                }}
              >
                Exercise Library
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: 400,
                  color: '#6B7C93',
                  marginTop: '2px',
                }}
              >
                Find and prescribe the right exercises for your patient
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 p-1 rounded-md transition-colors duration-150"
              style={{ color: '#6B7C93' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#C0392B'; e.currentTarget.style.backgroundColor = '#FDF2F2'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7C93'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              aria-label="Close exercise library"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search input */}
          <div className="relative mt-3">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#6B7C93' }}
            />
            <input
              type="text"
              id="exercise-library-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises by name, tag, or target area..."
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 400,
                color: '#1C2B3A',
                border: '1.5px solid #DDE3EA',
                borderRadius: '6px',
                height: '40px',
                paddingLeft: '36px',
                paddingRight: '12px',
                width: '100%',
                backgroundColor: '#FFFFFF',
                outline: 'none',
                transition: 'border-color 150ms, box-shadow 150ms',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.border = '2px solid #0B4F6C';
                e.target.style.boxShadow = '0 0 0 3px rgba(11, 79, 108, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.border = '1.5px solid #DDE3EA';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {/* ── Three-panel body ─────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0">

          {/* ── Category Sidebar ─────────────────────────────────────── */}
          <div
            className={`hidden sm:flex flex-col w-[180px] shrink-0 overflow-y-auto p-3 gap-0.5 border-r`}
            style={{
              borderRightColor: '#EEF2F6',
              opacity: searchQuery ? 0.55 : 1,
              transition: 'opacity 150ms',
            }}
          >
            {EXERCISE_CATEGORIES.map((cat) => {
              const Icon = getCategoryIcon(cat.icon);
              const count = cat.subcategories.reduce((sum, sub) => sum + sub.exercises.length, 0);
              const isActive = activeCategoryId === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150 w-full"
                  style={{
                    borderLeft: `3px solid ${isActive ? cat.color : 'transparent'}`,
                    backgroundColor: isActive ? `${cat.color}14` : 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#F0F4F7';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={28} color={isActive ? cat.color : '#6B7C93'} />
                  <div className="min-w-0">
                    <p
                      className="truncate"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#1C2B3A' : '#6B7C93',
                        lineHeight: '18px',
                      }}
                    >
                      {cat.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '11px',
                        fontWeight: 400,
                        color: '#A8B8C8',
                        lineHeight: '16px',
                      }}
                    >
                      {count} exercises
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Exercise Grid ─────────────────────────────────────────── */}
          <div
            className="flex-1 overflow-y-auto p-4 min-w-0"
            style={{ backgroundColor: '#F7F9FB' }}
          >
            {searchResults ? (
              searchResults.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center h-full text-center py-12"
                  style={{ color: '#6B7C93' }}
                >
                  <Search size={32} style={{ color: '#DDE3EA', marginBottom: '12px' }} />
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px', fontWeight: 600, color: '#1C2B3A' }}>
                    No exercises found
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', fontWeight: 400, color: '#6B7C93', marginTop: '4px' }}>
                    Try a different name, tag, or target area
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.map(renderExerciseCard)}
                </div>
              )
            ) : (
              activeCategory?.subcategories.map((sub) => (
                <div key={sub.id} className="mb-6">
                  <h3
                    className="sticky top-0 z-10 py-2 mb-3"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#6B7C93',
                      backgroundColor: '#F7F9FB',
                    }}
                  >
                    {sub.label}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sub.exercises.map((ex) =>
                      renderExerciseCard({
                        ...ex,
                        categoryColor: activeCategory.color,
                        categoryLabel: activeCategory.label,
                      })
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── Prescription Panel ────────────────────────────────────── */}
          <div
            className="hidden sm:flex flex-col w-[240px] shrink-0 border-l"
            style={{ borderLeftColor: '#EEF2F6', backgroundColor: '#F7F9FB' }}
          >
            {/* Prescription header */}
            <div
              className="shrink-0 px-4 pt-4 pb-2"
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#6B7C93',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Prescription
              </p>
            </div>

            {/* Prescription items */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
              {prescription.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center text-center mt-6 rounded-xl p-4"
                  style={{
                    border: '1px dashed #DDE3EA',
                    backgroundColor: '#FAFBFC',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '12px',
                      fontWeight: 400,
                      color: '#A8B8C8',
                      lineHeight: '18px',
                    }}
                  >
                    Add exercises from the grid to build a prescription
                  </p>
                </div>
              ) : (
                prescription.map((item, idx) => (
                  <div
                    key={`${item.exerciseLibraryId || item.exerciseName}-${idx}`}
                    className="bg-white rounded-xl p-3 relative"
                    style={{
                      boxShadow: '0px 1px 3px rgba(11, 79, 108, 0.06), 0px 1px 2px rgba(11, 79, 108, 0.04)',
                    }}
                  >
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removePrescriptionItem(idx)}
                      className="absolute top-2.5 right-2.5 p-0.5 rounded transition-colors duration-150"
                      style={{ color: '#A8B8C8' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#C0392B'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#A8B8C8'; }}
                      aria-label="Remove exercise"
                    >
                      <X size={13} />
                    </button>

                    {/* Exercise name */}
                    <p
                      className="pr-5"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#1C2B3A',
                        lineHeight: '18px',
                      }}
                    >
                      {item.exerciseName}
                    </p>

                    {/* Duration-only exercises */}
                    {item.duration && !item.reps ? (
                      <div className="mt-2">
                        <label
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '11px',
                            fontWeight: 600,
                            color: '#6B7C93',
                            display: 'block',
                            marginBottom: '4px',
                          }}
                        >
                          Duration
                        </label>
                        <select
                          value={item.duration || DURATION_OPTIONS[3]}
                          onChange={(e) => updatePrescriptionItem(idx, 'duration', e.target.value)}
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '12px',
                            fontWeight: 400,
                            color: '#1C2B3A',
                            border: '1.5px solid #DDE3EA',
                            borderRadius: '6px',
                            height: '32px',
                            width: '100%',
                            paddingLeft: '8px',
                            paddingRight: '8px',
                            backgroundColor: '#FFFFFF',
                            outline: 'none',
                          }}
                          onFocus={(e) => {
                            e.target.style.border = '2px solid #0B4F6C';
                            e.target.style.boxShadow = '0 0 0 3px rgba(11, 79, 108, 0.12)';
                          }}
                          onBlur={(e) => {
                            e.target.style.border = '1.5px solid #DDE3EA';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          {DURATION_OPTIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      /* Sets + Reps steppers */
                      <div className="flex gap-3 mt-2">
                        {/* Sets */}
                        <div>
                          <label
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#6B7C93',
                              display: 'block',
                              marginBottom: '4px',
                            }}
                          >
                            Sets
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updatePrescriptionItem(idx, 'sets', Math.max(1, (item.sets || 1) - 1))}
                              className="flex items-center justify-center transition-colors duration-150"
                              style={{
                                width: '26px',
                                height: '26px',
                                border: '1.5px solid #DDE3EA',
                                borderRadius: '6px',
                                backgroundColor: 'transparent',
                                color: '#3D5166',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0F4F7'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Minus size={11} />
                            </button>
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '14px',
                                fontWeight: 700,
                                color: '#1C2B3A',
                                width: '22px',
                                textAlign: 'center',
                              }}
                            >
                              {item.sets || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => updatePrescriptionItem(idx, 'sets', Math.min(20, (item.sets || 1) + 1))}
                              className="flex items-center justify-center transition-colors duration-150"
                              style={{
                                width: '26px',
                                height: '26px',
                                border: '1.5px solid #DDE3EA',
                                borderRadius: '6px',
                                backgroundColor: 'transparent',
                                color: '#3D5166',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0F4F7'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>

                        {/* Reps */}
                        <div>
                          <label
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: '11px',
                              fontWeight: 600,
                              color: '#6B7C93',
                              display: 'block',
                              marginBottom: '4px',
                            }}
                          >
                            Reps
                          </label>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updatePrescriptionItem(idx, 'reps', Math.max(1, (item.reps || 1) - 1))}
                              className="flex items-center justify-center transition-colors duration-150"
                              style={{
                                width: '26px',
                                height: '26px',
                                border: '1.5px solid #DDE3EA',
                                borderRadius: '6px',
                                backgroundColor: 'transparent',
                                color: '#3D5166',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0F4F7'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Minus size={11} />
                            </button>
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: '14px',
                                fontWeight: 700,
                                color: '#1C2B3A',
                                width: '22px',
                                textAlign: 'center',
                              }}
                            >
                              {item.reps || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => updatePrescriptionItem(idx, 'reps', Math.min(50, (item.reps || 1) + 1))}
                              className="flex items-center justify-center transition-colors duration-150"
                              style={{
                                width: '26px',
                                height: '26px',
                                border: '1.5px solid #DDE3EA',
                                borderRadius: '6px',
                                backgroundColor: 'transparent',
                                color: '#3D5166',
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F0F4F7'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Frequency */}
                    <div className="mt-2">
                      <label
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#6B7C93',
                          display: 'block',
                          marginBottom: '4px',
                        }}
                      >
                        Frequency
                      </label>
                      <select
                        value={item.frequency || 'Once daily'}
                        onChange={(e) => updatePrescriptionItem(idx, 'frequency', e.target.value)}
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '12px',
                          fontWeight: 400,
                          color: '#1C2B3A',
                          border: '1.5px solid #DDE3EA',
                          borderRadius: '6px',
                          height: '32px',
                          width: '100%',
                          paddingLeft: '8px',
                          paddingRight: '8px',
                          backgroundColor: '#FFFFFF',
                          outline: 'none',
                        }}
                        onFocus={(e) => {
                          e.target.style.border = '2px solid #0B4F6C';
                          e.target.style.boxShadow = '0 0 0 3px rgba(11, 79, 108, 0.12)';
                        }}
                        onBlur={(e) => {
                          e.target.style.border = '1.5px solid #DDE3EA';
                          e.target.style.boxShadow = 'none';
                        }}
                      >
                        {FREQUENCY_OPTIONS.map((f) => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Done button ─────────────────────────────────────────── */}
            <div
              className="shrink-0 px-4 py-4 border-t"
              style={{ borderTopColor: '#EEF2F6' }}
            >
              <p
                className="mb-3"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '12px',
                  fontWeight: 400,
                  color: '#6B7C93',
                }}
              >
                {prescription.length === 0
                  ? 'No exercises selected'
                  : `${prescription.length} exercise${prescription.length !== 1 ? 's' : ''} selected`}
              </p>
              <button
                type="button"
                onClick={handleDone}
                disabled={prescription.length === 0}
                className="w-full transition-all duration-150 active:scale-[0.97]"
                style={{
                  height: '40px',
                  backgroundColor: prescription.length === 0 ? '#A8B8C8' : '#0B4F6C',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: prescription.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: prescription.length === 0 ? 'none' : '0 2px 8px rgba(11, 79, 108, 0.25)',
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

        {/* ── Mobile prescription footer ────────────────────────────────── */}
        <div
          className="sm:hidden shrink-0 px-4 py-3 border-t flex items-center justify-between gap-3"
          style={{ borderTopColor: '#EEF2F6' }}
        >
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              color: '#6B7C93',
            }}
          >
            {prescription.length} selected
          </span>
          <button
            type="button"
            onClick={handleDone}
            style={{
              height: '40px',
              padding: '0 20px',
              backgroundColor: '#0B4F6C',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontFamily: "'Inter', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(11, 79, 108, 0.25)',
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
