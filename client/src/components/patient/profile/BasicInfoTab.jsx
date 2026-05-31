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

      <div className="mb-8 w-full">
        <label className="block text-ui-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Blood Group
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 max-w-2xl">
          {bloodGroupOptions.map((opt) => {
            const isSelected = formData.bloodGroup === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('bloodGroup', opt.value)}
                className={`
                  py-2.5 text-center font-bold text-sm transition-all duration-300 rounded-lg border select-none
                  ${isSelected
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                  }
                `}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-8 mt-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center px-4 py-2 border border-primary/20 bg-primary-light text-primary font-bold text-ui-sm uppercase tracking-widest rounded-md">
            ✓ Basic Info Saved
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className={`h-10 px-6 font-bold ${saveStatus === 'error' ? 'border-danger text-danger bg-danger/5' : ''}`}
          >
            {isSaving ? 'Saving...' : saveStatus === 'error' ? 'Save Failed — Try Again' : 'Save Basic Info →'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default BasicInfoTab;
