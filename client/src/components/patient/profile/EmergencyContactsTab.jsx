import React, { useState } from 'react';
import { Phone, Info, Check } from 'lucide-react';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const EmergencyContactsTab = ({ profile, formData, onChange, onSaveSuccess, onSaveDraft, completedSteps, onBack, onNext }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const { showToast } = useToast();

  // Field validation and shake state
  const [errors, setErrors] = useState({});

  const triggerShake = (fieldKey) => {
    setErrors(prev => ({ ...prev, [fieldKey]: true }));
    setTimeout(() => {
      setErrors(prev => ({ ...prev, [fieldKey]: false }));
    }, 300);
  };

  const handleAddContact = () => {
    if (formData.emergencyContacts.length >= 2) return;
    onChange({ emergencyContacts: [...formData.emergencyContacts, { name: '', relationship: '', phone: '' }] });
  };

  const handleRemoveContact = (index) => {
    const newContacts = [...formData.emergencyContacts];
    newContacts.splice(index, 1);
    onChange({ emergencyContacts: newContacts });
  };

  const handleChange = (index, field, value) => {
    const newContacts = formData.emergencyContacts.map((contact, idx) => {
      if (idx === index) {
        return { ...contact, [field]: value };
      }
      return contact;
    });
    onChange({ emergencyContacts: newContacts });
  };

  const handleDraftClick = () => {
    onSaveDraft();
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  const dbContacts = profile?.emergencyContacts || [];
  const isDirty = JSON.stringify(formData.emergencyContacts) !== JSON.stringify(dbContacts);

  const handleSave = async () => {
    // Validations to avoid mongoose schema validation crashes
    let hasError = false;
    const newErrors = {};

    for (let i = 0; i < formData.emergencyContacts.length; i++) {
      const contact = formData.emergencyContacts[i];
      if (!contact.name.trim()) {
        newErrors[`${i}-name`] = true;
        hasError = true;
      }
      if (!contact.relationship.trim()) {
        newErrors[`${i}-relationship`] = true;
        hasError = true;
      }
      if (!contact.phone.trim() || !/^\d{10}$/.test(contact.phone.trim())) {
        newErrors[`${i}-phone`] = true;
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      setTimeout(() => setErrors({}), 300);
      showToast('error', 'Please fill all required fields correctly (Phone must be 10 digits)');
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);
    try {
      const updatedProfile = await patientProfileService.updateProfile({ 
        emergencyContacts: formData.emergencyContacts,
        completedSteps: Array.from(new Set([...completedSteps, 3])) // Step 4 is index 3
      });
      setSaveStatus('success');
      onSaveSuccess(updatedProfile.data.profile);
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      showToast('error', error.response?.data?.message || 'Failed to save emergency contacts');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-slide-in {
          animation: slideIn 200ms ease-out forwards;
        }
        .animate-shake {
          animation: shake 300ms ease-in-out;
        }
      `}</style>

      {/* Title block */}
      <div className="flex justify-between items-center mb-2 mt-4 font-sans">
        <div>
          <span className="text-[10px] font-bold text-[#F4845F] tracking-[0.1em] uppercase block mb-1">
            STEP 4 OF 5
          </span>
          <h2 className="text-[22px] font-bold text-[#1C2B3A] tracking-[-0.02em] leading-tight">
            Emergency Contacts
          </h2>
        </div>
        <div className="flex items-center gap-1.5 bg-[#F7F9FB] border border-[#DDE3EA] rounded-[6px] px-3 py-1.5 text-[#6B7C93]">
          <Info size={12} className="shrink-0" />
          <span className="text-[11px] font-normal leading-none">
            This information is shared with your physiotherapist
          </span>
        </div>
      </div>
      <p className="text-[13px] font-normal text-[#6B7C93] mb-6 font-sans">
        Add up to two emergency contacts who can be reached in case of need during your session.
      </p>
      <div className="h-[1px] bg-[#EEF2F6] w-full mb-6" />

      {/* Cards & Affordances */}
      <div className="flex flex-col gap-5 mb-24 font-sans">
        {formData.emergencyContacts.length === 0 ? (
          <div 
            onClick={handleAddContact}
            className="flex flex-col items-center justify-center text-center p-8 bg-[#FAFBFC] border border-dashed border-[#DDE3EA] rounded-[12px] cursor-pointer hover:bg-[#E8F4F8] transition-all duration-200"
          >
            <Phone size={24} className="text-[#DDE3EA] mb-2" />
            <h4 className="text-[13px] font-bold text-[#0B4F6C] uppercase tracking-[0.06em] mb-0.5">
              + Add Emergency Contact
            </h4>
            <p className="text-[11px] text-[#6B7C93] mt-0.5">
              Add a contact who can be reached in case of emergency
            </p>
          </div>
        ) : (
          formData.emergencyContacts.map((contact, index) => (
            <div 
              key={index} 
              className="bg-white border border-[#EEF2F6] rounded-[12px] overflow-hidden shadow-sm animate-slide-in"
            >
              {/* Card Header */}
              <div className="bg-[#FAFBFC] border-b border-[#EEF2F6] px-6 py-[18px] flex justify-between items-center">
                <div className="flex items-center gap-2 text-[#0B4F6C]">
                  <Phone size={16} />
                  <h3 className="text-[13px] font-bold text-[#1C2B3A] uppercase tracking-[0.06em]">
                    Emergency Contact {index + 1}
                  </h3>
                </div>
                <button 
                  type="button" 
                  onClick={() => handleRemoveContact(index)} 
                  className="text-[11px] font-semibold text-[#C0392B] uppercase tracking-[0.06em] hover:underline cursor-pointer select-none"
                >
                  REMOVE
                </button>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={contact.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                      className={`w-full border rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C] transition-all duration-200 ${
                        errors[`${index}-name`] ? 'border-[#C0392B] animate-shake' : 'border-[#DDE3EA]'
                      }`}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                      Relationship
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Spouse"
                      value={contact.relationship}
                      onChange={(e) => handleChange(index, 'relationship', e.target.value)}
                      className={`w-full border rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C] transition-all duration-200 ${
                        errors[`${index}-relationship`] ? 'border-[#C0392B] animate-shake' : 'border-[#DDE3EA]'
                      }`}
                    />
                  </div>
                  <div className="md:col-span-5">
                    <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={contact.phone}
                      onChange={(e) => handleChange(index, 'phone', e.target.value)}
                      className={`w-full border rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C] transition-all duration-200 ${
                        errors[`${index}-phone`] ? 'border-[#C0392B] animate-shake' : 'border-[#DDE3EA]'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Add Second Contact Affordance */}
        {formData.emergencyContacts.length === 1 && (
          <div 
            onClick={handleAddContact}
            className="border border-dashed border-[#DDE3EA] hover:border-[#0B4F6C] bg-[#FAFBFC] hover:bg-[#E8F4F8] rounded-[12px] py-5 flex items-center justify-center cursor-pointer transition-all duration-200"
          >
            <span className="text-[11px] font-bold text-[#0B4F6C] uppercase tracking-[0.06em]">
              + ADD SECOND CONTACT →
            </span>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 right-0 left-[280px] bg-white border-t border-[#EEF2F6] px-6 py-4 flex items-center justify-between z-10 font-sans shadow-md">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onBack}
            className="h-10 px-5 border border-[#DDE3EA] hover:border-[#0B4F6C] text-[#6B7C93] hover:text-[#0B4F6C] bg-transparent rounded-[6px] text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors duration-200"
          >
            ← BACK
          </button>
          <button
            type="button"
            onClick={handleDraftClick}
            className="h-10 px-5 border border-[#DDE3EA] hover:border-[#0B4F6C] text-[#6B7C93] hover:text-[#0B4F6C] bg-transparent rounded-[6px] text-[12px] font-semibold uppercase tracking-[0.06em] transition-colors duration-200"
          >
            {draftSaved ? '✓ DRAFT SAVED' : 'SAVE DRAFT'}
          </button>
        </div>

        <div className="flex flex-col items-center relative">
          <span className="text-[10px] text-[#A8B8C8] font-normal mb-1">
            Changes saved automatically
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="h-10 px-6 bg-[#0B4F6C] hover:bg-[#083A52] text-white rounded-[6px] text-[12px] font-bold uppercase tracking-[0.06em] transition-colors duration-200 flex items-center justify-center shrink-0 min-w-[170px]"
          >
            {isSaving ? 'SAVING...' : saveStatus === 'success' ? '✓ SAVED' : 'SAVE & CONTINUE →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactsTab;
