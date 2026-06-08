import React, { useState } from 'react';
import { Activity, Pill, Stethoscope, ClipboardList, Info, Check } from 'lucide-react';
import { patientProfileService } from '../../../api/patientProfile.api';
import { useToast } from '../../common/Toast';

const MedicalHistoryTab = ({ profile, formData, onChange, onSaveSuccess, onSaveDraft, completedSteps, onBack, onNext }) => {
  const [newCondition, setNewCondition] = useState({ conditionName: '', year: '', notes: '' });
  const [newMedication, setNewMedication] = useState('');
  const [newSurgery, setNewSurgery] = useState({ surgeryName: '', year: '', description: '' });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const { showToast } = useToast();

  // Field validation and shake state
  const [errors, setErrors] = useState({
    conditionName: false,
    conditionYear: false,
    medicationName: false,
    surgeryName: false,
    surgeryYear: false
  });

  const triggerShake = (field) => {
    setErrors(prev => ({ ...prev, [field]: true }));
    setTimeout(() => {
      setErrors(prev => ({ ...prev, [field]: false }));
    }, 300);
  };

  const handleAddCondition = () => {
    let hasError = false;
    if (!newCondition.conditionName) {
      triggerShake('conditionName');
      hasError = true;
    }
    if (!newCondition.year) {
      triggerShake('conditionYear');
      hasError = true;
    }
    if (hasError) return;

    onChange({ conditions: [...formData.conditions, newCondition] });
    setNewCondition({ conditionName: '', year: '', notes: '' });
  };

  const handleRemoveCondition = (index) => {
    const newArr = [...formData.conditions];
    newArr.splice(index, 1);
    onChange({ conditions: newArr });
  };

  const handleAddMedication = () => {
    if (!newMedication.trim()) {
      triggerShake('medicationName');
      return;
    }
    onChange({ medications: [...formData.medications, newMedication.trim()] });
    setNewMedication('');
  };

  const handleRemoveMedication = (index) => {
    const newArr = [...formData.medications];
    newArr.splice(index, 1);
    onChange({ medications: newArr });
  };

  const handleAddSurgery = () => {
    let hasError = false;
    if (!newSurgery.surgeryName) {
      triggerShake('surgeryName');
      hasError = true;
    }
    if (!newSurgery.year) {
      triggerShake('surgeryYear');
      hasError = true;
    }
    if (hasError) return;

    onChange({ surgeries: [...formData.surgeries, newSurgery] });
    setNewSurgery({ surgeryName: '', year: '', description: '' });
  };

  const handleRemoveSurgery = (index) => {
    const newArr = [...formData.surgeries];
    newArr.splice(index, 1);
    onChange({ surgeries: newArr });
  };

  const handleDraftClick = () => {
    onSaveDraft();
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
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
        },
        completedSteps: Array.from(new Set([...completedSteps, 1])) // Step 2 is index 1
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

  const renderCountChip = (count) => {
    if (count === 0) {
      return (
        <div className="bg-[#F7F9FB] rounded-[4px] px-[10px] py-[3px] text-[#A8B8C8] text-[12px] font-bold font-sans">
          0 added
        </div>
      );
    }
    return (
      <div className="bg-[#E8F4F8] rounded-[4px] px-[10px] py-[3px] text-[#0B4F6C] text-[12px] font-bold font-sans animate-slide-in">
        {count} added
      </div>
    );
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

      {/* Part 2 — The Page Title For This Tab */}
      <div className="flex justify-between items-center mb-2 mt-4 font-sans">
        <div>
          <span className="text-[10px] font-bold text-[#F4845F] tracking-[0.1em] uppercase block mb-1">
            STEP 2 OF 5
          </span>
          <h2 className="text-[22px] font-bold text-[#1C2B3A] tracking-[-0.02em] leading-tight">
            Medical History
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
        Help your physiotherapist understand your medical background before your first session.
      </p>
      <div className="h-[1px] bg-[#EEF2F6] w-full mb-6" />

      {/* Part 3 — Sub-Section Architecture */}
      <div className="flex flex-col gap-5 mb-24 font-sans">
        {/* CONDITIONS CARD */}
        <div className="bg-white border border-[#EEF2F6] rounded-[12px] overflow-hidden shadow-sm">
          {/* Zone A: Header */}
          <div className="bg-[#FAFBFC] border-b border-[#EEF2F6] px-6 py-[18px] flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-[#0B4F6C]">
                <Activity size={16} />
                <h3 className="text-[13px] font-bold text-[#1C2B3A] uppercase tracking-[0.06em]">
                  Conditions
                </h3>
              </div>
              <p className="text-[11px] text-[#6B7C93] mt-0.5">
                Existing diagnoses and chronic conditions
              </p>
            </div>
            {renderCountChip(formData.conditions.length)}
          </div>

          {/* Zone B: Body */}
          <div className="p-6">
            {/* Add Form */}
            <div className="flex items-end gap-3 w-full">
              <div className="w-[45%]">
                <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                  Condition Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension"
                  value={newCondition.conditionName}
                  onChange={(e) => setNewCondition({ ...newCondition, conditionName: e.target.value })}
                  className={`w-full border rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] placeholder-[#A8B8C8] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C] transition-all duration-200 ${
                    errors.conditionName ? 'border-[#C0392B] animate-shake' : 'border-[#DDE3EA]'
                  }`}
                />
              </div>
              <div className="w-[20%]">
                <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                  Year
                </label>
                <input
                  type="number"
                  placeholder="2024"
                  value={newCondition.year}
                  onChange={(e) => setNewCondition({ ...newCondition, year: e.target.value })}
                  className={`w-full border rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] placeholder-[#A8B8C8] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C] transition-all duration-200 ${
                    errors.conditionYear ? 'border-[#C0392B] animate-shake' : 'border-[#DDE3EA]'
                  }`}
                />
              </div>
              <div className="w-[25%]">
                <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={newCondition.notes}
                  onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                  className="w-full border border-[#DDE3EA] rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] placeholder-[#A8B8C8] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C]"
                />
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={handleAddCondition}
                  className="w-full h-[38px] bg-[#0B4F6C] hover:bg-[#083A52] text-white text-[11px] font-bold uppercase tracking-[0.06em] rounded-[6px] transition-colors duration-200"
                >
                  ADD →
                </button>
              </div>
            </div>

            <div className="h-[1px] bg-[#EEF2F6] w-full my-4" />

            {/* List */}
            {formData.conditions.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-[#FAFBFC] border border-dashed border-[#DDE3EA] rounded-[8px]">
                <ClipboardList size={24} className="text-[#DDE3EA] mb-2" />
                <h4 className="text-[13px] font-medium text-[#A8B8C8] mb-0.5">
                  No conditions added
                </h4>
                <p className="text-[11px] text-[#C5CDD5]">
                  Add any existing diagnoses above
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {formData.conditions.map((cond, idx) => (
                  <div
                    key={idx}
                    className={`h-[52px] flex items-center justify-between pl-3 pr-2 border-b border-[#F5F7FA] last:border-0 animate-slide-in`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Left accent strip */}
                      <div className="w-[3px] h-[28px] rounded-[2px] bg-[#E8F4F8] shrink-0" />
                      
                      {/* Segment 1: Condition Name */}
                      <div className="w-[45%] font-semibold text-[13px] text-[#1C2B3A] truncate pr-3">
                        {cond.conditionName}
                      </div>

                      {/* Segment 2: Year */}
                      <div className="w-[20%]">
                        <span className="bg-[#F7F9FB] border border-[#EEF2F6] rounded-[4px] px-2 py-0.5 text-[#6B7C93] text-[11px] font-medium">
                          {cond.year}
                        </span>
                      </div>

                      {/* Segment 3: Notes */}
                      <div className="w-[25%] text-[12px] text-[#6B7C93] italic truncate pr-3" title={cond.notes}>
                        {cond.notes || '—'}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveCondition(idx)}
                      className="text-[11px] font-semibold text-[#C0392B] uppercase tracking-[0.06em] hover:underline cursor-pointer select-none"
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* MEDICATIONS CARD */}
        <div className="bg-white border border-[#EEF2F6] rounded-[12px] overflow-hidden shadow-sm">
          {/* Zone A: Header */}
          <div className="bg-[#FAFBFC] border-b border-[#EEF2F6] px-6 py-[18px] flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-[#0B4F6C]">
                <Pill size={16} />
                <h3 className="text-[13px] font-bold text-[#1C2B3A] uppercase tracking-[0.06em]">
                  Current Medications
                </h3>
              </div>
              <p className="text-[11px] text-[#6B7C93] mt-0.5">
                Medications you are currently taking
              </p>
            </div>
            {renderCountChip(formData.medications.length)}
          </div>

          {/* Zone B: Body */}
          <div className="p-6">
            {/* Add Form */}
            <div className="flex items-end gap-3 w-full">
              <div className="w-[80%]">
                <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                  Medication Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lisinopril 10mg"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  className={`w-full border rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] placeholder-[#A8B8C8] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C] transition-all duration-200 ${
                    errors.medicationName ? 'border-[#C0392B] animate-shake' : 'border-[#DDE3EA]'
                  }`}
                />
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="w-full h-[38px] bg-[#0B4F6C] hover:bg-[#083A52] text-white text-[11px] font-bold uppercase tracking-[0.06em] rounded-[6px] transition-colors duration-200"
                >
                  ADD →
                </button>
              </div>
            </div>

            <div className="h-[1px] bg-[#EEF2F6] w-full my-4" />

            {/* List */}
            {formData.medications.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-[#FAFBFC] border border-dashed border-[#DDE3EA] rounded-[8px]">
                <Pill size={24} className="text-[#DDE3EA] mb-2" />
                <h4 className="text-[13px] font-medium text-[#A8B8C8] mb-0.5">
                  No medications added
                </h4>
                <p className="text-[11px] text-[#C5CDD5]">
                  Add any current medications above
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {formData.medications.map((med, idx) => (
                  <div
                    key={idx}
                    className={`h-[48px] flex items-center justify-between pl-3 pr-2 border-b border-[#F5F7FA] last:border-0 animate-slide-in`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Left accent strip */}
                      <div className="w-[3px] h-[28px] rounded-[2px] bg-[#E8F4F8] shrink-0" />
                      
                      {/* Segment 1: Medication Name */}
                      <div className="w-[80%] font-semibold text-[13px] text-[#1C2B3A] flex items-center gap-2 truncate">
                        <span>{med}</span>
                        <Pill size={12} className="text-[#A8B8C8] shrink-0" />
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(idx)}
                      className="text-[11px] font-semibold text-[#C0392B] uppercase tracking-[0.06em] hover:underline cursor-pointer select-none"
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PAST SURGERIES CARD */}
        <div className="bg-white border border-[#EEF2F6] rounded-[12px] overflow-hidden shadow-sm">
          {/* Zone A: Header */}
          <div className="bg-[#FAFBFC] border-b border-[#EEF2F6] px-6 py-[18px] flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-[#0B4F6C]">
                <Stethoscope size={16} />
                <h3 className="text-[13px] font-bold text-[#1C2B3A] uppercase tracking-[0.06em]">
                  Past Surgeries
                </h3>
              </div>
              <p className="text-[11px] text-[#6B7C93] mt-0.5">
                Previous surgical procedures and interventions
              </p>
            </div>
            {renderCountChip(formData.surgeries.length)}
          </div>

          {/* Zone B: Body */}
          <div className="p-6">
            {/* Add Form */}
            <div className="flex items-end gap-3 w-full">
              <div className="w-[40%]">
                <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                  Surgery Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Appendectomy"
                  value={newSurgery.surgeryName}
                  onChange={(e) => setNewSurgery({ ...newSurgery, surgeryName: e.target.value })}
                  className={`w-full border rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] placeholder-[#A8B8C8] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C] transition-all duration-200 ${
                    errors.surgeryName ? 'border-[#C0392B] animate-shake' : 'border-[#DDE3EA]'
                  }`}
                />
              </div>
              <div className="w-[18%]">
                <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                  Year
                </label>
                <input
                  type="number"
                  placeholder="2018"
                  value={newSurgery.year}
                  onChange={(e) => setNewSurgery({ ...newSurgery, year: e.target.value })}
                  className={`w-full border rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] placeholder-[#A8B8C8] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C] transition-all duration-200 ${
                    errors.surgeryYear ? 'border-[#C0392B] animate-shake' : 'border-[#DDE3EA]'
                  }`}
                />
              </div>
              <div className="w-[28%]">
                <label className="text-[10px] font-semibold text-[#6B7C93] uppercase tracking-[0.07em] mb-1.5 block">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Optional details"
                  value={newSurgery.description}
                  onChange={(e) => setNewSurgery({ ...newSurgery, description: e.target.value })}
                  className="w-full border border-[#DDE3EA] rounded-[6px] h-[38px] px-3 text-[13px] text-[#1C2B3A] placeholder-[#A8B8C8] focus:outline-none focus:border-[#0B4F6C] focus:ring-1 focus:ring-[#0B4F6C]"
                />
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={handleAddSurgery}
                  className="w-full h-[38px] bg-[#0B4F6C] hover:bg-[#083A52] text-white text-[11px] font-bold uppercase tracking-[0.06em] rounded-[6px] transition-colors duration-200"
                >
                  ADD →
                </button>
              </div>
            </div>

            <div className="h-[1px] bg-[#EEF2F6] w-full my-4" />

            {/* List */}
            {formData.surgeries.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-[#FAFBFC] border border-dashed border-[#DDE3EA] rounded-[8px]">
                <Stethoscope size={24} className="text-[#DDE3EA] mb-2" />
                <h4 className="text-[13px] font-medium text-[#A8B8C8] mb-0.5">
                  No surgeries recorded
                </h4>
                <p className="text-[11px] text-[#C5CDD5]">
                  Add any past surgical procedures above
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {formData.surgeries.map((surg, idx) => (
                  <div
                    key={idx}
                    className={`h-[64px] flex items-center justify-between pl-3 pr-2 border-b border-[#F5F7FA] last:border-0 animate-slide-in`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {/* Left accent strip */}
                      <div className="w-[3px] h-[28px] rounded-[2px] bg-[#E8F4F8] shrink-0" />
                      
                      {/* Segment 1: Surgery Name & Description */}
                      <div className="w-[40%] flex flex-col min-w-0 pr-3">
                        <span className="font-semibold text-[13px] text-[#1C2B3A] truncate">
                          {surg.surgeryName}
                        </span>
                        <span className="text-[11px] text-[#6B7C93] italic truncate">
                          {surg.description || 'No description provided'}
                        </span>
                      </div>

                      {/* Segment 2: Year */}
                      <div className="w-[18%]">
                        <span className="bg-[#F7F9FB] border border-[#EEF2F6] rounded-[4px] px-2 py-0.5 text-[#6B7C93] text-[11px] font-medium">
                          {surg.year}
                        </span>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveSurgery(idx)}
                      className="text-[11px] font-semibold text-[#C0392B] uppercase tracking-[0.06em] hover:underline cursor-pointer select-none"
                    >
                      REMOVE
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Part 7 — The Bottom Action Bar */}
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

export default MedicalHistoryTab;
