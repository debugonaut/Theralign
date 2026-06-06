import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const EmergencyContactsTab = ({ profile, formData, onChange, onSaveSuccess, onSaveDraft, onNext }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const { showToast } = useToast();

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

  const dbContacts = profile?.emergencyContacts || [];
  const isDirty = JSON.stringify(formData.emergencyContacts) !== JSON.stringify(dbContacts);

  const handleSave = async () => {
    // Validations to avoid mongoose schema validation crashes
    for (let i = 0; i < formData.emergencyContacts.length; i++) {
      const contact = formData.emergencyContacts[i];
      if (!contact.name.trim() || !contact.relationship.trim() || !contact.phone.trim()) {
        showToast('error', `Emergency Contact ${formData.emergencyContacts.length > 1 ? i + 1 : ''} fields cannot be empty`);
        return;
      }
      if (!/^\d{10}$/.test(contact.phone.trim())) {
        showToast('error', `Emergency Contact ${formData.emergencyContacts.length > 1 ? i + 1 : ''} phone number must be exactly 10 digits`);
        return;
      }
    }

    setIsSaving(true);
    setSaveStatus(null);
    try {
      const updatedProfile = await patientProfileService.updateProfile({ emergencyContacts: formData.emergencyContacts });
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
    <div className="flex flex-col space-y-6">
      {formData.emergencyContacts.length === 0 && (
        <EmptyState 
          title="NO EMERGENCY CONTACTS" 
          description="Add a contact who can be reached in case of an emergency during your session." 
        />
      )}

      {formData.emergencyContacts.map((contact, index) => (
        <div key={index} className="border border-neutral-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="text-ui-xs text-neutral-400 font-bold uppercase tracking-widest">
              Emergency Contact {formData.emergencyContacts.length > 1 ? index + 1 : ''}
            </div>
            <button 
              type="button" 
              onClick={() => handleRemoveContact(index)} 
              className="text-ui-xs text-danger font-bold uppercase tracking-widest hover:underline select-none"
            >
              Remove
            </button>
          </div>
          <div className="h-[1px] bg-neutral-200 mb-6 w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input label="CONTACT NAME" value={contact.name} onChange={(e) => handleChange(index, 'name', e.target.value)} />
            <Input label="RELATIONSHIP" value={contact.relationship} onChange={(e) => handleChange(index, 'relationship', e.target.value)} />
            <Input label="PHONE NUMBER" value={contact.phone} onChange={(e) => handleChange(index, 'phone', e.target.value)} />
          </div>
        </div>
      ))}

      {formData.emergencyContacts.length === 1 && (
        <div className="border border-dashed border-neutral-200 rounded-lg p-6 flex items-center justify-center bg-neutral-50/50">
          <div className="text-ui-xs text-neutral-400 font-bold uppercase tracking-widest">
            + Add Second Contact
          </div>
        </div>
      )}

      {formData.emergencyContacts.length < 2 && (
        <div className="pt-2">
          <Button variant="ghost" onClick={handleAddContact} className="border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-4 py-2 font-bold text-ui-xs uppercase tracking-widest transition-all rounded-md shadow-sm">+ Add Emergency Contact &rarr;</Button>
        </div>
      )}

      <div className="border-t border-neutral-200 pt-6 mt-4 flex items-center gap-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary/20 bg-primary-light text-primary font-bold text-ui-sm uppercase tracking-widest rounded-md">
            <Check size={14} /> Emergency Contacts Saved
          </div>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              className={`h-10 px-6 font-bold ${saveStatus === 'error' ? 'border-danger text-danger bg-danger/5' : ''}`}
            >
              {isSaving ? 'Saving...' : saveStatus === 'error' ? 'Save Failed — Try Again' : 'Save Emergency Contacts →'}
            </Button>
            <Button
              variant="ghost"
              onClick={onSaveDraft}
              className="h-10 px-6 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold uppercase tracking-widest"
            >
              Save Draft
            </Button>
          </>
        )}
        {onNext && (
          <Button
            variant="ghost"
            onClick={isDirty ? handleSave : onNext}
            className="h-10 px-6 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold uppercase tracking-widest"
          >
            {isDirty ? 'Save & Next →' : 'Next Step →'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsTab;
