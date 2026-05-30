import React, { useState } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';
import { patientProfileService } from '../../../services/patientProfileService';
import { useToast } from '../../common/Toast';

const EmergencyContactsTab = ({ profile, onSaveSuccess, onUnsavedChanges }) => {
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
        <div key={index} className="border-2 border-black border-t-[4px] p-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-ui-xs text-[#FF3000] font-bold uppercase tracking-widest">
              EMERGENCY CONTACT {contacts.length > 1 ? index + 1 : ''}
            </div>
            <button 
              type="button" 
              onClick={() => handleRemoveContact(index)} 
              className="text-ui-xs text-[#FF3000] font-bold uppercase tracking-widest hover:underline"
            >
              REMOVE
            </button>
          </div>
          <div className="h-[1px] bg-swiss-gray-100 mb-6 w-full"></div>
          <div className="flex gap-4">
            <div className="w-[40%]">
              <Input label="CONTACT NAME" value={contact.name} onChange={(e) => handleChange(index, 'name', e.target.value)} />
            </div>
            <div className="w-[25%]">
              <Input label="RELATIONSHIP" value={contact.relationship} onChange={(e) => handleChange(index, 'relationship', e.target.value)} />
            </div>
            <div className="w-[35%]">
              <Input label="PHONE NUMBER" value={contact.phone} onChange={(e) => handleChange(index, 'phone', e.target.value)} />
            </div>
          </div>
        </div>
      ))}

      {contacts.length === 1 && (
        <div className="border-2 border-dashed border-swiss-gray-100 p-8 flex items-center justify-center">
          <div className="text-ui-xs text-gray-500 font-bold uppercase tracking-widest">
            + ADD SECOND CONTACT &rarr;
          </div>
        </div>
      )}

      {contacts.length < 2 && (
        <div className="pt-2">
          <Button variant="ghost" onClick={handleAddContact}>+ ADD EMERGENCY CONTACT &rarr;</Button>
        </div>
      )}

      <div className="border-t-2 border-black pt-8 mt-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center px-4 py-3 border-2 border-[#0D7377] text-[#0D7377] font-bold text-ui-sm uppercase tracking-widest bg-white">
            ✓ EMERGENCY CONTACTS SAVED
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className={saveStatus === 'error' ? 'border-[#FF3000] text-[#FF3000]' : ''}
          >
            {isSaving ? 'SAVING...' : saveStatus === 'error' ? 'SAVE FAILED — TRY AGAIN' : 'SAVE EMERGENCY CONTACTS →'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmergencyContactsTab;
