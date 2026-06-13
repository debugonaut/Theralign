import React, { useEffect, useState } from 'react';
import { X, Play } from 'lucide-react';
import { getExerciseById } from '../../data/exerciseLibrary';

const formatPrescriptionFooter = ({ sets, reps, duration, frequency }) => {
  const parts = [];
  if (sets) parts.push(`${sets} sets`);
  if (reps) parts.push(`${reps} reps`);
  if (duration) parts.push(duration);
  if (frequency) parts.push(frequency);
  return parts.join(' · ');
};

const ExerciseVideoModal = ({
  isOpen,
  onClose,
  exerciseId,
  exerciseName,
  sets,
  reps,
  duration,
  frequency,
  doctorName,
}) => {
  const [embedSrc, setEmbedSrc] = useState('');

  useEffect(() => {
    if (isOpen && exerciseId) {
      const exercise = getExerciseById(exerciseId);
      if (exercise?.youtubeId) {
        setEmbedSrc(
          `https://www.youtube.com/embed/${exercise.youtubeId}?autoplay=1&rel=0&modestbranding=1`
        );
      }
    } else {
      setEmbedSrc('');
    }
  }, [isOpen, exerciseId]);

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

  if (!isOpen) return null;

  const prescriptionText = formatPrescriptionFooter({ sets, reps, duration, frequency });

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-video-title"
    >
      <div
        className="bg-white rounded-xl shadow-level-3 overflow-hidden w-full"
        style={{ maxWidth: '800px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center gap-2 min-w-0">
            <Play size={18} className="text-primary shrink-0" />
            <h2 id="exercise-video-title" className="text-ui-md font-semibold text-neutral-900 truncate">
              {exerciseName} — Demonstration
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-danger p-1 shrink-0"
            aria-label="Close video"
          >
            <X size={20} />
          </button>
        </div>

        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {embedSrc ? (
            <iframe
              src={embedSrc}
              title={exerciseName}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-500 text-ui-sm">
              Video unavailable for this exercise
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50">
          {doctorName && (
            <p className="text-ui-xs text-neutral-500 mb-1">
              Prescribed by {doctorName}
            </p>
          )}
          {prescriptionText && (
            <p className="text-ui-sm font-semibold text-neutral-900">{prescriptionText}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseVideoModal;
