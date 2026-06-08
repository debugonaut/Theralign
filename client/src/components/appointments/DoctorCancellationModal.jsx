import { X, AlertTriangle } from 'lucide-react';
import '../booking/CancellationModal.css';
import './DoctorCancellationModal.css';

export default function DoctorCancellationModal({
  appointment,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) {
  if (!isOpen || !appointment) return null;

  const patientName = appointment.patient?.name || 'Patient';
  const [firstName, ...lastNameParts] = patientName.split(' ');
  const lastInitial = lastNameParts.length > 0 ? lastNameParts[lastNameParts.length - 1][0] : '';
  const displayName = `${firstName} ${lastInitial}.`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content doctor-cancellation-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Cancel Appointment</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="modal-divider"></div>

        {/* Warning Box */}
        <div className="warning-box doctor-warning">
          <AlertTriangle className="w-5 h-5 text-[#b45309] shrink-0 mt-0.5" />
          <p>
            Cancelling this appointment will automatically issue a full refund to the patient.
            This action cannot be undone.
          </p>
        </div>

        {/* Appointment Summary */}
        <div className="appointment-summary doctor-summary">
          <div className="summary-row">
            <span className="summary-label">Patient</span>
            <span className="summary-value">{displayName}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Date & Time</span>
            <span className="summary-value">
              {appointment.date} at {appointment.startTime}
            </span>
          </div>
        </div>

        {/* Information Note */}
        <div className="info-note">
          <p>The patient will be notified immediately and their refund will be processed automatically.</p>
        </div>

        {/* Action Buttons */}
        <div className="modal-actions">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isLoading}
          >
            Keep Appointment
          </button>
          <button
            className="btn btn-danger"
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                SUBMITTING...
              </>
            ) : (
              'CANCEL APPOINTMENT →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
