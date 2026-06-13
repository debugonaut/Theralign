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
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-video-title"
    >
      <div
        className="bg-white rounded-xl overflow-hidden w-full"
        style={{
          maxWidth: '800px',
          boxShadow: '0px 20px 60px rgba(11, 79, 108, 0.18), 0px 8px 24px rgba(11, 79, 108, 0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ backgroundColor: '#FAFBFC', borderBottomColor: '#EEF2F6' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Play size={18} style={{ color: '#0B4F6C', flexShrink: 0 }} />
            <h2
              id="exercise-video-title"
              className="truncate"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '18px',
                fontWeight: 700,
                lineHeight: '28px',
                color: '#1C2B3A',
              }}
            >
              {exerciseName} — Demonstration
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md shrink-0 transition-colors duration-150"
            style={{ color: '#6B7C93' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C0392B';
              e.currentTarget.style.backgroundColor = '#FDF2F2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#6B7C93';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Close video"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video embed — 16:9 aspect ratio */}
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
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ backgroundColor: '#F7F9FB' }}
            >
              <Play size={40} style={{ color: '#DDE3EA', marginBottom: '8px' }} />
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  fontWeight: 400,
                  color: '#6B7C93',
                }}
              >
                Video unavailable for this exercise
              </p>
            </div>
          )}
        </div>

        {/* Prescription footer */}
        <div
          className="px-6 py-4 border-t"
          style={{ backgroundColor: '#F7F9FB', borderTopColor: '#EEF2F6' }}
        >
          {doctorName && (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '12px',
                fontWeight: 400,
                color: '#6B7C93',
                marginBottom: '2px',
              }}
            >
              Prescribed by {doctorName}
            </p>
          )}
          {prescriptionText && (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                color: '#1C2B3A',
              }}
            >
              {prescriptionText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseVideoModal;
