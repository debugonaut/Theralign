import React, { useState } from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import EmptyState from '../../common/EmptyState';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const MedicalHistoryTab = ({ profile, onSaveSuccess, onUnsavedChanges }) => {
  const [conditions, setConditions] = useState(profile?.medicalHistory?.conditions || []);
  const [medications, setMedications] = useState(profile?.medicalHistory?.medications || []);
  const [surgeries, setSurgeries] = useState(profile?.medicalHistory?.surgeries || []);

  const [newCondition, setNewCondition] = useState({ conditionName: '', year: '', notes: '' });
  const [newMedication, setNewMedication] = useState('');
  const [newSurgery, setNewSurgery] = useState({ surgeryName: '', year: '', description: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const { showToast } = useToast();

  const handleAddCondition = () => {
    if (!newCondition.conditionName || !newCondition.year) return;
    setConditions([...conditions, newCondition]);
    setNewCondition({ conditionName: '', year: '', notes: '' });
    onUnsavedChanges(true);
  };

  const handleRemoveCondition = (index) => {
    const newArr = [...conditions];
    newArr.splice(index, 1);
    setConditions(newArr);
    onUnsavedChanges(true);
  };

  const handleAddMedication = () => {
    if (!newMedication.trim()) return;
    setMedications([...medications, newMedication.trim()]);
    setNewMedication('');
    onUnsavedChanges(true);
  };

  const handleRemoveMedication = (index) => {
    const newArr = [...medications];
    newArr.splice(index, 1);
    setMedications(newArr);
    onUnsavedChanges(true);
  };

  const handleAddSurgery = () => {
    if (!newSurgery.surgeryName || !newSurgery.year) return;
    setSurgeries([...surgeries, newSurgery]);
    setNewSurgery({ surgeryName: '', year: '', description: '' });
    onUnsavedChanges(true);
  };

  const handleRemoveSurgery = (index) => {
    const newArr = [...surgeries];
    newArr.splice(index, 1);
    setSurgeries(newArr);
    onUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const updatedProfile = await patientProfileService.updateProfile({
        medicalHistory: { conditions, medications, surgeries }
      });
      setSaveStatus('success');
      onUnsavedChanges(false);
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
          <span className="text-ui-xs text-[#FF3000] font-bold uppercase tracking-widest mb-2">CONDITIONS</span>
          <div className="h-[2px] bg-black w-full"></div>
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
            <Button variant="ghost" onClick={handleAddCondition}>ADD CONDITION →</Button>
          </div>
        </div>

        {/* List */}
        {conditions.length === 0 ? (
          <EmptyState title="NO CONDITIONS ADDED" description="Add any existing conditions so your physiotherapist can prepare." />
        ) : (
          <div className="flex flex-col space-y-2">
            {conditions.map((cond, idx) => (
              <div key={idx} className="h-16 border-2 border-black px-4 flex items-center">
                <div className="w-1/2 font-bold text-ui-md uppercase truncate pr-4">{cond.conditionName}</div>
                <div className="w-[15%] text-ui-sm text-gray-500">{cond.year}</div>
                <div className="w-[30%] text-ui-sm text-gray-500 italic truncate pr-4" title={cond.notes}>{cond.notes}</div>
                <button type="button" onClick={() => handleRemoveCondition(idx)} className="w-[5%] text-ui-xs text-[#FF3000] font-bold uppercase tracking-widest hover:underline text-right">
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MEDICATIONS */}
      <section>
        <div className="flex flex-col mb-4">
          <span className="text-ui-xs text-[#FF3000] font-bold uppercase tracking-widest mb-2">MEDICATIONS</span>
          <div className="h-[2px] bg-black w-full"></div>
        </div>

        <div className="flex items-end gap-4 mb-6">
          <div className="flex-1">
            <Input label="MEDICATION NAME" value={newMedication} onChange={(e) => setNewMedication(e.target.value)} />
          </div>
          <div className="pb-1">
            <Button variant="ghost" onClick={handleAddMedication}>ADD →</Button>
          </div>
        </div>

        {medications.length > 0 && (
          <div className="flex flex-col space-y-2">
            {medications.map((med, idx) => (
              <div key={idx} className="h-12 border-2 border-black px-4 flex items-center justify-between">
                <div className="font-bold text-ui-md uppercase truncate">{med}</div>
                <button type="button" onClick={() => handleRemoveMedication(idx)} className="text-ui-xs text-[#FF3000] font-bold uppercase tracking-widest hover:underline">
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SURGERIES */}
      <section>
        <div className="flex flex-col mb-4">
          <span className="text-ui-xs text-[#FF3000] font-bold uppercase tracking-widest mb-2">PAST SURGERIES</span>
          <div className="h-[2px] bg-black w-full"></div>
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
            <Button variant="ghost" onClick={handleAddSurgery}>ADD SURGERY →</Button>
          </div>
        </div>

        {surgeries.length > 0 && (
          <div className="flex flex-col space-y-2">
            {surgeries.map((surg, idx) => (
              <div key={idx} className="h-16 border-2 border-black px-4 flex items-center">
                <div className="w-1/2 font-bold text-ui-md uppercase truncate pr-4">{surg.surgeryName}</div>
                <div className="w-[15%] text-ui-sm text-gray-500">{surg.year}</div>
                <div className="w-[30%] text-ui-sm text-gray-500 italic truncate pr-4" title={surg.description}>{surg.description}</div>
                <button type="button" onClick={() => handleRemoveSurgery(idx)} className="w-[5%] text-ui-xs text-[#FF3000] font-bold uppercase tracking-widest hover:underline text-right">
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="border-t-2 border-black pt-8 mt-4">
        {saveStatus === 'success' ? (
          <div className="inline-flex items-center px-4 py-3 border-2 border-[#0D7377] text-[#0D7377] font-bold text-ui-sm uppercase tracking-widest bg-white">
            ✓ MEDICAL HISTORY SAVED
          </div>
        ) : (
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            className={saveStatus === 'error' ? 'border-[#FF3000] text-[#FF3000]' : ''}
          >
            {isSaving ? 'SAVING...' : saveStatus === 'error' ? 'SAVE FAILED — TRY AGAIN' : 'SAVE MEDICAL HISTORY →'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MedicalHistoryTab;
