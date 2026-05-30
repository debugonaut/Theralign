import React, { useState } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import SegmentedControl from '../../common/SegmentedControl';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const LifestyleTab = ({ profile, onSaveSuccess, onUnsavedChanges }) => {
  const [formData, setFormData] = useState({
    occupation: profile?.lifestyle?.occupation || '',
    activityLevel: profile?.lifestyle?.activityLevel || '',
    smoking: profile?.lifestyle?.smoking ?? null,
    alcohol: profile?.lifestyle?.alcohol ?? null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const { showToast } = useToast();

  const activityLevelOptions = [
    { value: 'SEDENTARY', label: 'SEDENTARY' },
    { value: 'LIGHT', label: 'LIGHT' },
    { value: 'MODERATE', label: 'MODERATE' },
    { value: 'ACTIVE', label: 'ACTIVE' },
    { value: 'VERY ACTIVE', label: 'VERY ACTIVE' },
  ];

  const booleanOptions = [
    { value: true, label: 'YES' },
    { value: false, label: 'NO' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    onUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const updatedProfile = await patientProfileService.updateProfile({ lifestyle: formData });
      setSaveStatus('success');
      onUnsavedChanges(false);
      onSaveSuccess(updatedProfile.data.profile);
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      showToast('error', error.response?.data?.message || 'Failed to save lifestyle info');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col space-y-8">
      <div>
        <Input 
          label="CURRENT OCCUPATION" 
          value={formData.occupation} 
          onChange={(e) => handleChange('occupation', e.target.value)} 
        />
      </div>

      <div>
        <label className="block text-ui-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
          ACTIVITY LEVEL
        </label>
        <SegmentedControl
          options={activityLevelOptions}
          value={formData.activityLevel}
          onChange={(val) => handleChange('activityLevel', val)}
          optionClassName="text-[10px] md:text-ui-xs"
        />
      </div>

      <div className="flex gap-8">
        <div className="w-1/2 flex items-center">
          <div className="w-1/2 text-ui-md font-bold uppercase tracking-widest">SMOKING</div>
          <div className="w-1/2">
            <SegmentedControl
              options={booleanOptions}
              value={formData.smoking}
              onChange={(val) => handleChange('smoking', val)}
            />
          </div>
        </div>
        <div className="w-1/2 flex items-center">
          <div className="w-1/2 text-ui-md font-bold uppercase tracking-widest">ALCOHOL</div>
          <div className="w-1/2">
            <SegmentedControl
              options={booleanOptions}
              value={formData.alcohol}
              onChange={(val) => handleChange('alcohol', val)}
            />
          </div>
        </div>
      </div>

      <div className="border-t-2 border-black pt-8 mt-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center px-4 py-3 border-2 border-[#0D7377] text-[#0D7377] font-bold text-ui-sm uppercase tracking-widest bg-white">
            ✓ LIFESTYLE SAVED
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className={saveStatus === 'error' ? 'border-[#FF3000] text-[#FF3000]' : ''}
          >
            {isSaving ? 'SAVING...' : saveStatus === 'error' ? 'SAVE FAILED — TRY AGAIN' : 'SAVE LIFESTYLE →'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default LifestyleTab;
