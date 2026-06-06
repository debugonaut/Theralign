import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const LifestyleTab = ({ profile, formData, onChange, onSaveSuccess, onSaveDraft, onNext }) => {
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

  const handleChange = (field, value) => {
    onChange({ [field]: value });
  };

  const isDirty =
    formData.occupation !== (profile?.lifestyle?.occupation || '') ||
    formData.activityLevel !== (profile?.lifestyle?.activityLevel || '') ||
    formData.smoking !== (profile?.lifestyle?.smoking ?? null) ||
    formData.alcohol !== (profile?.lifestyle?.alcohol ?? null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const payload = {
        lifestyle: {
          occupation: formData.occupation,
          activityLevel: formData.activityLevel,
          smoking: formData.smoking,
          alcohol: formData.alcohol
        }
      };
      const updatedProfile = await patientProfileService.updateProfile(payload);
      setSaveStatus('success');
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
        <label className="block text-ui-xs font-bold text-neutral-400 uppercase tracking-widest mb-3">
          Activity Level
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {activityLevelOptions.map((opt) => {
            const isSelected = formData.activityLevel === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('activityLevel', opt.value)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex items-center justify-between border border-neutral-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="text-ui-md font-bold text-neutral-700 uppercase tracking-wide">Smoking</div>
          <div className="flex gap-2">
            {[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
            ].map((opt) => {
              const isSelected = formData.smoking === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleChange('smoking', opt.value)}
                  className={`
                    px-4 py-1.5 font-bold text-xs rounded-full border select-none transition-all duration-300
                    ${isSelected
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400'
                    }
                  `}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between border border-neutral-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="text-ui-md font-bold text-neutral-700 uppercase tracking-wide">Alcohol</div>
          <div className="flex gap-2">
            {[
              { value: true, label: 'Yes' },
              { value: false, label: 'No' },
            ].map((opt) => {
              const isSelected = formData.alcohol === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleChange('alcohol', opt.value)}
                  className={`
                    px-4 py-1.5 font-bold text-xs rounded-full border select-none transition-all duration-300
                    ${isSelected
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-400'
                    }
                  `}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-6 mt-4 flex items-center gap-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary/20 bg-primary-light text-primary font-bold text-ui-sm uppercase tracking-widest rounded-md">
            <Check size={14} /> Lifestyle Saved
          </div>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              className={`h-10 px-6 font-bold ${saveStatus === 'error' ? 'border-danger text-danger bg-danger/5' : ''}`}
            >
              {isSaving ? 'Saving...' : saveStatus === 'error' ? 'Save Failed — Try Again' : 'Save Lifestyle →'}
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

export default LifestyleTab;
