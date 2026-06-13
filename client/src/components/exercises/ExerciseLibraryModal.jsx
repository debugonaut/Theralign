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
  'once daily',
  'twice daily',
  'three times daily',
  'every other day',
  '3× per week',
  'as tolerated',
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
  beginner: 'bg-success/10 text-success',
  intermediate: 'bg-warning/10 text-warning',
  advanced: 'bg-danger/10 text-danger',
};

const formatPrescription = (ex) => {
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
  frequency: exercise.defaultFrequency ?? 'once daily',
  notes: null,
  targetArea: exercise.targetArea,
  categoryColor: exercise.categoryColor,
  position: exercise.position,
  difficulty: exercise.difficulty,
  equipment: exercise.equipment,
});

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
          frequency: ex.frequency || 'once daily',
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

  const renderExerciseCard = (exercise) => {
    const PositionFigure = getPositionFigure(exercise.position);
    const color = exercise.categoryColor || activeCategory?.color || '#0B4F6C';
    const isAdded = prescription.some((p) => p.exerciseLibraryId === exercise.id);
    const isFlashing = addedFlash.has(exercise.id);

    return (
      <div
        key={exercise.id}
        className="flex flex-col bg-white rounded-lg overflow-hidden shadow-level-1 hover:shadow-level-2 hover:bg-primary-light/30 transition-all duration-150"
        style={{ minHeight: '200px' }}
      >
        <div className="h-[110px] bg-[#F8F8F6] flex items-center justify-center">
          <PositionFigure size={80} color={`${color}B3`} />
        </div>
        <div className="flex-1 p-3 flex flex-col gap-1 relative">
          {searchResults && (
            <span className="text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-sm self-start">
              {exercise.categoryLabel}
            </span>
          )}
          <p className="text-ui-sm font-semibold text-neutral-900 truncate">{exercise.name}</p>
          <p className="text-ui-xs text-neutral-500 truncate">{exercise.targetArea}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-sm ${DIFFICULTY_STYLES[exercise.difficulty] || DIFFICULTY_STYLES.beginner}`}>
              {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
            </span>
            {exercise.equipment && exercise.equipment !== 'none' && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-neutral-100 text-neutral-500">
                {exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1)}
              </span>
            )}
          </div>
          <p className="text-ui-xs text-neutral-500 mt-auto">
            {formatPrescription({
              sets: exercise.defaultSets,
              reps: exercise.defaultReps,
              duration: exercise.defaultDuration,
            })}
            {exercise.defaultFrequency ? ` · ${exercise.defaultFrequency}` : ''}
          </p>
          <button
            type="button"
            onClick={() => handleAddExercise(exercise)}
            disabled={isAdded}
            className="absolute bottom-3 right-3 w-6 h-6 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors disabled:opacity-60"
            aria-label={`Add ${exercise.name}`}
          >
            {isFlashing || isAdded ? <Check size={14} /> : <Plus size={14} />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-6"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-library-title"
    >
      <div
        className="bg-white flex flex-col w-full h-full sm:h-[620px] sm:max-h-[90vh] rounded-none sm:rounded-xl shadow-level-3 overflow-hidden"
        style={{ maxWidth: '880px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-neutral-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="exercise-library-title" className="text-ui-lg font-semibold text-neutral-900">
                Exercise Library
              </h2>
              <p className="text-ui-sm text-neutral-500 mt-1">
                Find and prescribe the right exercises for your patient
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-500 hover:text-danger p-1"
              aria-label="Close exercise library"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative mt-4">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises by name, tag, or target area..."
              className="w-full h-10 pl-9 pr-3 border-2 border-neutral-200 rounded-md text-ui-sm focus:border-primary focus:ring-2 focus:ring-primary/12 focus:outline-none transition-all duration-150"
            />
          </div>
        </div>

        {/* Three-panel body */}
        <div className="flex flex-1 min-h-0">
          {/* Category panel */}
          <div
            className={`hidden sm:flex flex-col w-[180px] shrink-0 border-r border-neutral-200 overflow-y-auto p-3 gap-1 ${searchQuery ? 'opacity-60' : ''}`}
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${
                    isActive
                      ? 'text-neutral-900 font-semibold'
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                  style={{
                    borderLeft: isActive ? `3px solid ${cat.color}` : '3px solid transparent',
                    backgroundColor: isActive ? `${cat.color}14` : 'transparent',
                  }}
                >
                  <Icon size={32} color={cat.color} />
                  <div className="min-w-0">
                    <p className="text-ui-sm font-semibold text-neutral-900 truncate">{cat.label}</p>
                    <p className="text-[10px] text-neutral-500">{count} exercises</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Exercise grid */}
          <div className="flex-1 overflow-y-auto p-4 min-w-0">
            {searchResults ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map(renderExerciseCard)}
              </div>
            ) : (
              activeCategory?.subcategories.map((sub) => (
                <div key={sub.id} className="mb-6">
                  <h3
                    id={`sub-${sub.id}`}
                    className="sticky top-0 z-10 bg-white text-[12px] font-semibold text-neutral-700 py-2 mb-3"
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

          {/* Prescription panel */}
          <div className="hidden sm:flex flex-col w-[240px] shrink-0 border-l border-neutral-200 bg-neutral-50">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {prescription.length === 0 ? (
                <p className="text-ui-xs text-neutral-500 text-center mt-8">
                  Add exercises from the grid to build a prescription
                </p>
              ) : (
                prescription.map((item, idx) => (
                  <div key={`${item.exerciseLibraryId || item.exerciseName}-${idx}`} className="bg-white shadow-level-1 rounded-lg p-3 relative">
                    <button
                      type="button"
                      onClick={() => removePrescriptionItem(idx)}
                      className="absolute top-2 right-2 text-neutral-500 hover:text-danger"
                      aria-label="Remove exercise"
                    >
                      <X size={14} />
                    </button>
                    <p className="text-ui-sm font-semibold text-neutral-900 pr-5">{item.exerciseName}</p>

                    {item.duration && !item.reps ? (
                      <div className="mt-2">
                        <label className="text-[12px] font-semibold text-neutral-700">Duration</label>
                        <select
                          value={item.duration || DURATION_OPTIONS[3]}
                          onChange={(e) => updatePrescriptionItem(idx, 'duration', e.target.value)}
                          className="w-full h-8 mt-1 border-2 border-neutral-200 rounded-md text-ui-xs px-2 focus:border-primary focus:ring-2 focus:ring-primary/12 focus:outline-none transition-all duration-150 bg-white"
                        >
                          {DURATION_OPTIONS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="flex gap-3 mt-2">
                        <div>
                          <label className="text-[12px] font-semibold text-neutral-700">Sets</label>
                          <div className="flex items-center gap-1 mt-1">
                            <button type="button" onClick={() => updatePrescriptionItem(idx, 'sets', Math.max(1, (item.sets || 1) - 1))} className="w-7 h-7 border-2 border-neutral-200 rounded-md flex items-center justify-center hover:bg-neutral-100 hover:border-neutral-300 transition-colors"><Minus size={12} /></button>
                            <span className="w-6 text-center text-ui-sm font-semibold">{item.sets || 1}</span>
                            <button type="button" onClick={() => updatePrescriptionItem(idx, 'sets', Math.min(20, (item.sets || 1) + 1))} className="w-7 h-7 border-2 border-neutral-200 rounded-md flex items-center justify-center hover:bg-neutral-100 hover:border-neutral-300 transition-colors"><Plus size={12} /></button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[12px] font-semibold text-neutral-700">Reps</label>
                          <div className="flex items-center gap-1 mt-1">
                            <button type="button" onClick={() => updatePrescriptionItem(idx, 'reps', Math.max(1, (item.reps || 1) - 1))} className="w-7 h-7 border-2 border-neutral-200 rounded-md flex items-center justify-center hover:bg-neutral-100 hover:border-neutral-300 transition-colors"><Minus size={12} /></button>
                            <span className="w-6 text-center text-ui-sm font-semibold">{item.reps || 1}</span>
                            <button type="button" onClick={() => updatePrescriptionItem(idx, 'reps', Math.min(50, (item.reps || 1) + 1))} className="w-7 h-7 border-2 border-neutral-200 rounded-md flex items-center justify-center hover:bg-neutral-100 hover:border-neutral-300 transition-colors"><Plus size={12} /></button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-2">
                      <label className="text-[12px] font-semibold text-neutral-700">Frequency</label>
                      <select
                        value={item.frequency || 'once daily'}
                        onChange={(e) => updatePrescriptionItem(idx, 'frequency', e.target.value)}
                        className="w-full h-8 mt-1 border-2 border-neutral-200 rounded-md text-ui-xs px-2 focus:border-primary focus:ring-2 focus:ring-primary/12 focus:outline-none transition-all duration-150 bg-white"
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
            <div className="shrink-0 p-4 border-t border-neutral-200">
              <p className="text-ui-xs text-neutral-500 mb-3">
                {prescription.length} exercise{prescription.length !== 1 ? 's' : ''}
              </p>
              <button
                type="button"
                onClick={handleDone}
                className="w-full h-10 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark shadow-btn-primary hover:shadow-level-2 active:scale-98 transition-all duration-150 text-ui-sm"
              >
                Done — Add to Prescription →
              </button>
            </div>
          </div>
        </div>

        {/* Mobile prescription footer */}
        <div className="sm:hidden shrink-0 p-4 border-t border-neutral-200 flex items-center justify-between gap-3">
          <span className="text-ui-xs text-neutral-500">{prescription.length} selected</span>
          <button
            type="button"
            onClick={handleDone}
            className="h-10 px-4 bg-primary text-white font-semibold rounded-md shadow-btn-primary hover:bg-primary-dark active:scale-98 transition-all duration-150 text-ui-sm"
          >
            Done →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibraryModal;
