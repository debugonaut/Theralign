import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const MedicalHistoryTab = ({ profile, formData, onChange, onSaveSuccess, onSaveDraft, onNext }) => {
  const [newCondition, setNewCondition] = useState({ conditionName: '', year: '', notes: '' });
  const [newMedication, setNewMedication] = useState('');
  const [newSurgery, setNewSurgery] = useState({ surgeryName: '', year: '', description: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const { showToast } = useToast();

  const handleAddCondition = () => {
    if (!newCondition.conditionName || !newCondition.year) return;
    onChange({ conditions: [...formData.conditions, newCondition] });
    setNewCondition({ conditionName: '', year: '', notes: '' });
  };

  const handleRemoveCondition = (index) => {
    const newArr = [...formData.conditions];
    newArr.splice(index, 1);
    onChange({ conditions: newArr });
  };

  const handleAddMedication = () => {
    if (!newMedication.trim()) return;
    onChange({ medications: [...formData.medications, newMedication.trim()] });
    setNewMedication('');
  };

  const handleRemoveMedication = (index) => {
    const newArr = [...formData.medications];
    newArr.splice(index, 1);
    onChange({ medications: newArr });
  };

  const handleAddSurgery = () => {
    if (!newSurgery.surgeryName || !newSurgery.year) return;
    onChange({ surgeries: [...formData.surgeries, newSurgery] });
    setNewSurgery({ surgeryName: '', year: '', description: '' });
  };

  const handleRemoveSurgery = (index) => {
    const newArr = [...formData.surgeries];
    newArr.splice(index, 1);
    onChange({ surgeries: newArr });
  };

  const dbConditions = profile?.medicalHistory?.conditions || [];
  const dbMedications = profile?.medicalHistory?.medications || [];
  const dbSurgeries = profile?.medicalHistory?.surgeries || [];

  const isDirty = 
    JSON.stringify(formData.conditions) !== JSON.stringify(dbConditions) ||
    JSON.stringify(formData.medications) !== JSON.stringify(dbMedications) ||
    JSON.stringify(formData.surgeries) !== JSON.stringify(dbSurgeries);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const updatedProfile = await patientProfileService.updateProfile({
        medicalHistory: {
          conditions: formData.conditions,
          medications: formData.medications,
          surgeries: formData.surgeries
        }
      });
      setSaveStatus('success');
      onSaveSuccess(updatedProfile.data.profile);
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (error) {
      setSaveStatus('error');
      showToast('error', error.response?.data?.message || 'Failed to save medical history');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col space-y-12">
      {/* CONDITIONS */}
      <section>
        <div className="flex flex-col mb-4">
          <span className="text-ui-xs text-neutral-400 font-bold uppercase tracking-widest mb-2">Conditions</span>
          <div className="h-[1px] bg-neutral-200 w-full"></div>
        </div>
        
        {/* Add Form */}
        <div className="flex items-end gap-4 mb-6">
          <div className="w-1/2">
            <Input label="CONDITION NAME" value={newCondition.conditionName} onChange={(e) => setNewCondition({...newCondition, conditionName: e.target.value})} />
          </div>
          <div className="w-1/5">
            <Input label="YEAR DIAGNOSED" type="number" value={newCondition.year} onChange={(e) => setNewCondition({...newCondition, year: e.target.value})} />
          </div>
          <div className="flex-1">
            <Input label="NOTES" value={newCondition.notes} onChange={(e) => setNewCondition({...newCondition, notes: e.target.value})} />
          </div>
          <div className="pb-1">
            <Button variant="ghost" onClick={handleAddCondition} className="border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-4 py-2 font-bold text-ui-xs uppercase tracking-widest transition-all rounded-md shadow-sm">Add Condition →</Button>
          </div>
        </div>

        {/* List */}
        {formData.conditions.length === 0 ? (
          <EmptyState title="No conditions added" description="Add any existing conditions so your physiotherapist can prepare." />
        ) : (
          <div className="flex flex-col gap-3">
            {formData.conditions.map((cond, idx) => (
              <div key={idx} className="border border-neutral-200 rounded-lg p-4 bg-white flex items-center shadow-sm hover:bg-neutral-50/50 transition-all">
                <div className="w-1/2 font-bold text-ui-md uppercase truncate pr-4 text-neutral-800">{cond.conditionName}</div>
                <div className="w-[15%] text-ui-sm text-neutral-400 font-bold">{cond.year}</div>
                <div className="w-[30%] text-ui-sm text-neutral-500 italic truncate pr-4" title={cond.notes}>{cond.notes}</div>
                <button type="button" onClick={() => handleRemoveCondition(idx)} className="w-[5%] text-ui-xs text-danger font-bold uppercase tracking-widest hover:underline text-right select-none">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MEDICATIONS */}
      <section>
        <div className="flex flex-col mb-4">
          <span className="text-ui-xs text-neutral-400 font-bold uppercase tracking-widest mb-2">Ref medications</span>
          <div className="h-[1px] bg-neutral-200 w-full"></div>
        </div>

        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <Input label="MEDICATION NAME" value={newMedication} onChange={(e) => setNewMedication(e.target.value)} />
          </div>
          <div className="pb-1">
            <Button variant="ghost" onClick={handleAddMedication} className="border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-4 py-2 font-bold text-ui-xs uppercase tracking-widest transition-all rounded-md shadow-sm">Add →</Button>
          </div>
        </div>

        {formData.medications.length > 0 && (
          <div className="flex flex-col gap-3">
            {formData.medications.map((med, idx) => (
              <div key={idx} className="border border-neutral-200 rounded-lg p-4 bg-white flex items-center justify-between shadow-sm hover:bg-neutral-50/50 transition-all">
                <div className="font-bold text-ui-md uppercase truncate text-neutral-800">{med}</div>
                <button type="button" onClick={() => handleRemoveMedication(idx)} className="text-ui-xs text-danger font-bold uppercase tracking-widest hover:underline select-none">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SURGERIES */}
      <section>
        <div className="flex flex-col mb-4">
          <span className="text-ui-xs text-neutral-400 font-bold uppercase tracking-widest mb-2">Past Surgeries</span>
          <div className="h-[1px] bg-neutral-200 w-full"></div>
        </div>

        <div className="flex items-end gap-4 mb-6">
          <div className="w-1/2">
            <Input label="SURGERY NAME" value={newSurgery.surgeryName} onChange={(e) => setNewSurgery({...newSurgery, surgeryName: e.target.value})} />
          </div>
          <div className="w-1/5">
            <Input label="YEAR" type="number" value={newSurgery.year} onChange={(e) => setNewSurgery({...newSurgery, year: e.target.value})} />
          </div>
          <div className="flex-1">
            <Input label="BRIEF DESCRIPTION" value={newSurgery.description} onChange={(e) => setNewSurgery({...newSurgery, description: e.target.value})} />
          </div>
          <div className="pb-1">
            <Button variant="ghost" onClick={handleAddSurgery} className="border border-neutral-200 text-neutral-700 hover:bg-neutral-50 px-4 py-2 font-bold text-ui-xs uppercase tracking-widest transition-all rounded-md shadow-sm">Add Surgery →</Button>
          </div>
        </div>

        {formData.surgeries.length > 0 && (
          <div className="flex flex-col gap-3">
            {formData.surgeries.map((surg, idx) => (
              <div key={idx} className="border border-neutral-200 rounded-lg p-4 bg-white flex items-center shadow-sm hover:bg-neutral-50/50 transition-all">
                <div className="w-1/2 font-bold text-ui-md uppercase truncate pr-4 text-neutral-800">{surg.surgeryName}</div>
                <div className="w-[15%] text-ui-sm text-neutral-400 font-bold">{surg.year}</div>
                <div className="w-[30%] text-ui-sm text-neutral-500 italic truncate pr-4" title={surg.description}>{surg.description}</div>
                <button type="button" onClick={() => handleRemoveSurgery(idx)} className="w-[5%] text-ui-xs text-danger font-bold uppercase tracking-widest hover:underline text-right select-none">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="border-t border-neutral-200 pt-6 mt-4 flex items-center gap-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center gap-1.5 px-4 py-2 border border-primary/20 bg-primary-light text-primary font-bold text-ui-sm uppercase tracking-widest rounded-md">
            <Check size={14} /> Medical History Saved
          </div>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              className={`h-10 px-6 font-bold ${saveStatus === 'error' ? 'border-danger text-danger bg-danger/5' : ''}`}
            >
              {isSaving ? 'Saving...' : saveStatus === 'error' ? 'Save Failed — Try Again' : 'Save Medical History →'}
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

export default MedicalHistoryTab;
