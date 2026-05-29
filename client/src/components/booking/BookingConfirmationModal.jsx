import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const BookingConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  slot, 
  doctorName, 
  consultationFee, 
  loading 
}) => {
  const [patientNotes, setPatientNotes] = useState('');

  if (!isOpen || !slot) return null;

  const formatHumanDate = (dateStr) => {
    try {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleConfirm = () => {
    onConfirm(patientNotes);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="CONFIRM BOOKING"
      size="md" // 560px width
    >
      <div className="flex flex-col gap-6 text-left select-none">
        
        {/* Definition-list layout for key-value appointment details */}
        <dl className="grid grid-cols-1 gap-y-4">
          <div className="flex justify-between items-baseline border-b border-swiss-gray-200 pb-2">
            <dt className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              DOCTOR
            </dt>
            <dd className="text-ui-md font-bold text-swiss-black uppercase">
              DR. {doctorName}
            </dd>
          </div>

          <div className="flex justify-between items-baseline border-b border-swiss-gray-200 pb-2">
            <dt className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              SPECIALIZATION
            </dt>
            <dd className="text-[10px] font-black text-swiss-red uppercase tracking-widest">
              CLINICAL PHYSIOTHERAPY
            </dd>
          </div>

          <div className="flex justify-between items-baseline border-b border-swiss-gray-200 pb-2">
            <dt className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              DATE
            </dt>
            <dd className="text-ui-md font-bold text-swiss-black uppercase">
              {formatHumanDate(slot.date)}
            </dd>
          </div>

          <div className="flex justify-between items-baseline border-b border-swiss-gray-200 pb-2">
            <dt className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              TIME
            </dt>
            <dd className="text-ui-md font-bold text-swiss-black uppercase">
              {slot.startTime} – {slot.endTime}
            </dd>
          </div>

          <div className="flex justify-between items-baseline border-b border-swiss-gray-200 pb-2">
            <dt className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              DURATION
            </dt>
            <dd className="text-ui-md font-bold text-swiss-black uppercase">
              30 MINUTES
            </dd>
          </div>

          <div className="flex justify-between items-center pt-2">
            <dt className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              CONSULTATION FEE
            </dt>
            <dd className="text-display-xs font-black text-swiss-black tracking-tighter uppercase">
              ₹{consultationFee}
            </dd>
          </div>
        </dl>

        <div className="h-[2px] bg-swiss-black w-full my-1" />

        {/* Symptoms / Medical Notes (Optional) */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            SYMPTOMS / MEDICAL NOTES (OPTIONAL)
          </label>
          <textarea
            value={patientNotes}
            onChange={(e) => setPatientNotes(e.target.value)}
            placeholder="E.G. CHRONIC LOWER BACK STIFFNESS, POST-RUNNING KNEE INFLAMMATION..."
            maxLength={300}
            rows={3}
            className="w-full bg-swiss-white border-2 border-swiss-black px-4 py-3 text-ui-sm font-bold uppercase tracking-wider text-swiss-black placeholder-swiss-gray-400 focus:border-4 focus:ring-0 transition-all rounded-none resize-none"
          />
        </div>

        {/* Payment details card on gray surface */}
        <div className="bg-swiss-gray-100 border-2 border-swiss-black p-5 rounded-none flex flex-col gap-2">
          <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            AMOUNT DUE
          </span>
          <h2 className="text-display-sm font-black text-swiss-black uppercase tracking-tighter leading-none">
            ₹{consultationFee}
          </h2>
          <span className="text-[9px] font-black text-swiss-teal uppercase tracking-widest mt-1 block">
            PAID VIA RAZORPAY GATEWAY
          </span>
        </div>

        {/* Notice line */}
        <p className="text-[10px] text-swiss-gray-400 leading-relaxed font-bold uppercase tracking-wide">
          You will be redirected to complete payment. Your appointment is confirmed immediately upon successful payment.
        </p>

        {/* Action Buttons Stacked Full-Width */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            variant="accent"
            fullWidth
            onClick={handleConfirm}
            loading={loading}
            className="font-black h-12"
          >
            {loading ? 'PROCESSING...' : `CONFIRM & PAY ₹${consultationFee} →`}
          </Button>
          <Button
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={loading}
            className="font-black h-12"
          >
            CANCEL
          </Button>
        </div>

      </div>
    </Modal>
  );
};

export default BookingConfirmationModal;
