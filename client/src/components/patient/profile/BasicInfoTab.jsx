import React, { useState } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import SegmentedControl from '../../common/SegmentedControl';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const BasicInfoTab = ({ profile, onSaveSuccess, onUnsavedChanges }) => {
  const [formData, setFormData] = useState({
    name: profile?.user?.name || '',
    dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
    phone: profile?.user?.phone || '',
    gender: profile?.gender || '',
    bloodGroup: profile?.bloodGroup || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'success' | 'error'
  const { showToast } = useToast();

  const bloodGroupOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A−', label: 'A−' },
    { value: 'B+', label: 'B+' },
    { value: 'B−', label: 'B−' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB−', label: 'AB−' },
    { value: 'O+', label: 'O+' },
    { value: 'O−', label: 'O−' },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    onUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const updatedProfile = await patientProfileService.updateProfile(formData);
      setSaveStatus('success');
      onUnsavedChanges(false);
      onSaveSuccess(updatedProfile.data.profile);
      
      // Reset success status after 2000ms as specified
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      showToast('error', error.response?.data?.message || 'Failed to save basic info');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-8 mb-8">
        <Input
          label="FULL NAME"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />
        <Input
          label="DATE OF BIRTH"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
        />
        <Input
          label="PHONE NUMBER"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
        <Input
          label="GENDER"
          value={formData.gender}
          onChange={(e) => handleChange('gender', e.target.value)}
        />
      </div>

      <div className="mb-8 w-1/2">
        <label className="block text-ui-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          BLOOD GROUP
        </label>
        <SegmentedControl
          options={bloodGroupOptions}
          value={formData.bloodGroup}
          onChange={(val) => handleChange('bloodGroup', val)}
        />
      </div>

      <div className="border-t-2 border-black pt-8 mt-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center px-4 py-3 border-2 border-[#0D7377] text-[#0D7377] font-bold text-ui-sm uppercase tracking-widest bg-white">
            ✓ BASIC INFO SAVED
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className={saveStatus === 'error' ? 'border-[#FF3000] text-[#FF3000]' : ''}
          >
            {isSaving ? 'SAVING...' : saveStatus === 'error' ? 'SAVE FAILED — TRY AGAIN' : 'SAVE BASIC INFO →'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BasicInfoTab;
