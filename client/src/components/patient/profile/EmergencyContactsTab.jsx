import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const EmergencyContactsTab = ({ profile, onSaveSuccess, onUnsavedChanges, onNext }) => {
  const [contacts, setContacts] = useState(profile?.emergencyContacts || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const { showToast } = useToast();

  const handleAddContact = () => {
    if (contacts.length >= 2) return;
    setContacts([...contacts, { name: '', relationship: '', phone: '' }]);
    onUnsavedChanges(true);
  };

  const handleRemoveContact = (index) => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    setContacts(newContacts);
    onUnsavedChanges(true);
  };

  const handleChange = (index, field, value) => {
    const newContacts = [...contacts];
    newContacts[index][field] = value;
    setContacts(newContacts);
    onUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const updatedProfile = await patientProfileService.updateProfile({ emergencyContacts: contacts });
      setSaveStatus('success');
      onUnsavedChanges(false);
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
      {contacts.length === 0 && (
        <EmptyState 
          title="NO EMERGENCY CONTACTS" 
          description="Add a contact who can be reached in case of an emergency during your session." 
        />
      )}

      {contacts.map((contact, index) => (
        <div key={index} className="border border-neutral-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex justify-between items-center mb-4">
            <div className="text-ui-xs text-neutral-400 font-bold uppercase tracking-widest">
              Emergency Contact {contacts.length > 1 ? index + 1 : ''}
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

      {contacts.length === 1 && (
        <div className="border border-dashed border-neutral-200 rounded-lg p-6 flex items-center justify-center bg-neutral-50/50">
          <div className="text-ui-xs text-neutral-400 font-bold uppercase tracking-widest">
            + Add Second Contact
          </div>
        </div>
      )}

      {contacts.length < 2 && (
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
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className={`h-10 px-6 font-bold ${saveStatus === 'error' ? 'border-danger text-danger bg-danger/5' : ''}`}
          >
            {isSaving ? 'Saving...' : saveStatus === 'error' ? 'Save Failed — Try Again' : 'Save Emergency Contacts →'}
          </Button>
        )}
        {onNext && (
          <Button
            variant="ghost"
            onClick={onNext}
            className="h-10 px-6 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-bold uppercase tracking-widest"
          >
            Next Step →
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsTab;
