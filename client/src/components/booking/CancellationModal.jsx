import { useState } from 'react';
import './CancellationModal.css';

export default function CancellationModal({
  appointment,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) {
  const [reason, setReason] = useState('');

  if (!isOpen || !appointment) return null;

  const characterCount = reason.length;
  const minCharacters = 10;
  const isValid = characterCount >= minCharacters;
  const paymentAmount = appointment.consultationFee || 0;

  const handleSubmit = () => {
    if (isValid) {
      onSubmit(reason);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cancellation-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>Cancel Appointment</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-divider"></div>

        {/* Warning Box */}
        <div className="warning-box">
          <span className="warning-icon">⚠️</span>
          <p>
            This appointment has been paid. Cancelling will submit a refund request that requires admin approval.
            Refunds typically process within 2-3 business days.
          </p>
        </div>

        {/* Appointment Summary */}
        <div className="appointment-summary">
          <div className="summary-row">
            <span className="summary-label">Doctor</span>
            <span className="summary-value">{appointment.doctor?.user?.name || 'N/A'}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Date & Time</span>
            <span className="summary-value">
              {appointment.date} at {appointment.startTime}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Amount Paid</span>
            <span className="summary-value">₹{paymentAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Reason Textarea */}
        <div className="form-group">
          <label htmlFor="cancellation-reason" className="form-label">
            Reason for cancellation
          </label>
          <div className="textarea-wrapper">
            <textarea
              id="cancellation-reason"
              className="form-textarea"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you are cancelling this appointment. This helps us improve our service and process your refund request. (Minimum 10 characters)"
              maxLength={500}
            />
            <div className={`character-counter ${isValid ? 'valid' : ''}`}>
              {characterCount}/{minCharacters} minimum
            </div>
          </div>
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
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                SUBMITTING...
              </>
            ) : (
              'CANCEL & REQUEST REFUND →'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
