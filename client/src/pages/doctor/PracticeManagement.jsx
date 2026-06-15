import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Users, User, Mail, Building2, Settings, 
  AlertTriangle, Send, ChevronDown, ChevronUp
} from 'lucide-react';
import { 
  getJuniorDoctorsAPI, 
  inviteJuniorDoctorAPI, 
  removeJuniorDoctorAPI, 
  updatePracticeSettingsAPI,
  cancelJuniorInviteAPI
} from '../../api/junior.api';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import SectionHeader from '../../components/common/SectionHeader';

const PracticeManagement = () => {
  const [juniorDoctors, setJuniorDoctors] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [maxJuniorDoctors, setMaxJuniorDoctors] = useState(0);
  const [practiceName, setPracticeName] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [email, setEmail] = useState('');
  
  // Settings edit states
  const [settingsPracticeName, setSettingsPracticeName] = useState('');
  const [settingsMaxJunior, setSettingsMaxJunior] = useState(2);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Modal states
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [doctorToRemove, setDoctorToRemove] = useState(null);

  const loadData = async () => {
    try {
      const res = await getJuniorDoctorsAPI();
      if (res.success && res.data) {
        setJuniorDoctors(res.data.juniorDoctors || []);
        setPendingInvitations(res.data.pendingInvitations || []);
        setMaxJuniorDoctors(res.data.maxJuniorDoctors || 0);
        setPracticeName(res.data.practiceName || '');
        setSettingsPracticeName(res.data.practiceName || '');
        setSettingsMaxJunior(res.data.maxJuniorDoctors || 2);
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO FETCH PRACTICE TEAM.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'PRACTICE MANAGEMENT — Theralign';
    loadData();
  }, []);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('EMAIL ADDRESS IS REQUIRED.');
      return;
    }
    setIsSaving(true);
    const toastId = toast.loading('SENDING PRACTICE INVITATION...');
    try {
      const res = await inviteJuniorDoctorAPI({ email: email.trim() });
      if (res.success) {
        toast.success(`INVITATION SENT TO ${email.toLowerCase()}.`, { id: toastId });
        setEmail('');
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'FAILED TO SEND INVITATION.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResendInvite = async (inviteEmail) => {
    const toastId = toast.loading('RESENDING PRACTICE INVITATION...');
    try {
      const res = await inviteJuniorDoctorAPI({ email: inviteEmail });
      if (res.success) {
        toast.success(`INVITATION RESENT TO ${inviteEmail.toLowerCase()}.`, { id: toastId });
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'FAILED TO RESEND INVITATION.', { id: toastId });
    }
  };

  const handleCancelInvite = async (inviteEmail) => {
    const toastId = toast.loading('CANCELLING PRACTICE INVITATION...');
    try {
      const res = await cancelJuniorInviteAPI(inviteEmail);
      if (res.success) {
        toast.success(`INVITATION TO ${inviteEmail.toLowerCase()} CANCELLED.`, { id: toastId });
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'FAILED TO CANCEL INVITATION.', { id: toastId });
    }
  };

  const confirmRemoveDoctor = (doc) => {
    setDoctorToRemove(doc);
    setRemoveModalOpen(true);
  };

  const handleRemoveDoctor = async () => {
    if (!doctorToRemove) return;
    setIsSaving(true);
    const toastId = toast.loading('REMOVING CLINICIAN...');
    try {
      const res = await removeJuniorDoctorAPI(doctorToRemove._id);
      if (res.success) {
        toast.success(`DR. ${doctorToRemove.user?.name.toUpperCase()} REMOVED FROM PRACTICE.`, { id: toastId });
        setRemoveModalOpen(false);
        setDoctorToRemove(null);
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'FAILED TO REMOVE DOCTOR.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading('UPDATING PRACTICE SETTINGS...');
    try {
      const res = await updatePracticeSettingsAPI({
        maxJuniorDoctors: settingsMaxJunior,
        practiceName: settingsPracticeName.trim()
      });
      if (res.success) {
        toast.success('PRACTICE SETTINGS UPDATED SUCCESSFULLY.', { id: toastId });
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'FAILED TO UPDATE SETTINGS.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-ui-xs font-bold text-neutral-500 uppercase tracking-widest bg-neutral-50">
        LOADING PRACTICE STRUCTURE PANELS...
      </div>
    );
  }

  const activeCount = juniorDoctors.length;
  const pendingCount = pendingInvitations.length;
  const slotsUsed = activeCount + pendingCount;
  const isAtCapacity = slotsUsed >= maxJuniorDoctors;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6 text-left page-fade-in bg-[#F7F9FB] font-sans min-h-screen">
      
      {/* Page Header */}
      <div>
        <h1 className="text-[22px] font-bold text-neutral-900 tracking-tight font-sans">
          Practice Management
        </h1>
        <p className="text-ui-sm text-neutral-500 font-semibold uppercase tracking-wider mt-1.5">
          Manage your team of junior physiotherapists.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: TEAM SIZE */}
        <div className="bg-white rounded-xl shadow-level-1 p-5 flex flex-col justify-between h-[110px] select-none">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Team Size
          </span>
          <span className="text-[28px] font-bold text-[#0B4F6C] tracking-tight leading-none mt-2">
            {activeCount} <span className="text-[16px] text-neutral-400 font-medium">/ {maxJuniorDoctors}</span>
          </span>
          <span className="text-[11px] text-neutral-500 font-medium mt-auto">
            Active junior doctors
          </span>
        </div>

        {/* Card 2: PENDING INVITATIONS */}
        <div className="bg-white rounded-xl shadow-level-1 p-5 flex flex-col justify-between h-[110px] select-none">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Pending Invitations
          </span>
          <span className="text-[28px] font-bold text-[#B45309] tracking-tight leading-none mt-2">
            {pendingCount}
          </span>
          <span className="text-[11px] text-neutral-500 font-medium mt-auto">
            Awaiting registration
          </span>
        </div>

        {/* Card 3: PRACTICE NAME */}
        <div className="bg-white rounded-xl shadow-level-1 p-5 flex flex-col justify-between h-[110px] select-none">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Practice Name
          </span>
          <span className="text-[16px] font-bold text-neutral-900 truncate mt-2 leading-tight">
            {practiceName || '—'}
          </span>
          <span className="text-[11px] text-neutral-500 font-medium mt-auto">
            Displayed to junior doctors
          </span>
        </div>
      </div>

      {/* Invite Section Card */}
      <div className="bg-white rounded-xl shadow-level-1 p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <h2 className="text-[15px] font-bold text-neutral-900">
            Invite a Junior Doctor
          </h2>
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
            {slotsUsed} of {maxJuniorDoctors} slots used
          </span>
        </div>

        {isAtCapacity ? (
          <div className="bg-[#FEF3E2] border border-[#FEF3E2] p-4 rounded-lg flex items-center gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-[13px] font-medium text-[#B45309]">
                You have reached your maximum of {maxJuniorDoctors} junior doctors. Increase your limit in Practice Settings to invite more.
              </span>
              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="text-[12px] font-bold text-[#0B4F6C] hover:underline whitespace-nowrap text-left border-0 bg-transparent cursor-pointer"
              >
                Practice Settings →
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendInvite} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full text-left">
              <Input
                type="email"
                label="Junior Doctor Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="junior@example.com"
                required
                className="w-full"
              />
            </div>
            <Button
              type="submit"
              disabled={isSaving}
              variant="primary"
              className="h-10 px-5 flex items-center gap-2 w-full sm:w-auto"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Invitation</span>
            </Button>
          </form>
        )}
      </div>

      {/* Active Team List Table Card */}
      <div className="bg-white rounded-xl shadow-level-1 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-[15px] font-bold text-neutral-900">
            Active Junior Doctors
          </h2>
          <div className="border-b border-neutral-100 mt-4" />
        </div>

        {juniorDoctors.length === 0 ? (
          <div className="py-12 border border-dashed border-neutral-200 rounded-lg text-center bg-[#F7F9FB]/50">
            <Users className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
            <span className="text-[13px] text-[#A8B8C8] font-medium">
              No junior doctors have joined yet.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#F0F4F7] border-b border-[#DDE3EA]">
                  <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Registration No
                  </th>
                  <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Joined Date
                  </th>
                  <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0F4F7]">
                {juniorDoctors.map((doc) => {
                  const joinedDate = doc.updatedAt 
                    ? new Date(doc.updatedAt).toLocaleDateString('en-GB') 
                    : '—';
                  return (
                    <tr key={doc._id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {doc.user?.profileImage ? (
                            <img src={doc.user.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-neutral-400" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-neutral-900 leading-tight">
                            Dr. {doc.user?.name || 'Practitioner'}
                          </span>
                          <span className="text-[12px] text-neutral-500 mt-0.5">
                            {doc.user?.email || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-neutral-700">
                        {doc.registrationNumber || '—'}
                      </td>
                      <td className="px-6 py-4 text-[12px] font-semibold text-neutral-500">
                        {joinedDate}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-[#E8F8F5] text-[#0A7E6E] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase select-none">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => confirmRemoveDoctor(doc)}
                          className="px-3 py-1.5 border border-[#C0392B] text-[#C0392B] bg-transparent hover:bg-[#FDF2F2] rounded-md text-[12px] font-bold transition-all cursor-pointer select-none"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pending Invitations Table Card */}
      <div className="bg-white rounded-xl shadow-level-1 p-6 flex flex-col gap-6">
        <div>
          <h2 className="text-[15px] font-bold text-neutral-900">
            Pending Invitations
          </h2>
          <div className="border-b border-neutral-100 mt-4" />
        </div>

        {pendingInvitations.length === 0 ? (
          <div className="py-8 border border-dashed border-neutral-200 rounded-lg text-center bg-[#F7F9FB]/50">
            <Mail className="w-7 h-7 text-neutral-300 mx-auto mb-2" />
            <span className="text-[13px] text-[#A8B8C8] font-medium">
              No pending invitations.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingInvitations.map((invite) => {
              const invitedDate = invite.invitedAt 
                ? new Date(invite.invitedAt).toLocaleDateString('en-GB') 
                : '—';
              return (
                <div 
                  key={invite._id || invite.token}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg gap-3"
                >
                  <div className="flex flex-col text-left">
                    <span className="text-[13px] font-bold text-[#3D5166]">
                      {invite.email}
                    </span>
                    <span className="text-[11px] text-neutral-400 mt-0.5">
                      Invited on {invitedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="inline-block bg-[#FEF3E2] text-[#B45309] text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase select-none">
                      Pending
                    </span>
                    <button
                      type="button"
                      onClick={() => handleResendInvite(invite.email)}
                      className="text-[#0B4F6C] hover:underline font-bold text-[12px] border-0 bg-transparent cursor-pointer select-none"
                    >
                      Resend
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancelInvite(invite.email)}
                      className="text-[#C0392B] hover:underline font-bold text-[12px] border-0 bg-transparent cursor-pointer select-none"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Practice Settings Panel Card */}
      <div className="bg-white rounded-xl shadow-level-1 p-6 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex items-center justify-between w-full border-0 bg-transparent p-0 cursor-pointer text-left focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-neutral-900" />
            <h2 className="text-[14px] font-bold text-neutral-900 uppercase tracking-wide">
              Practice Settings
            </h2>
          </div>
          {settingsOpen ? (
            <ChevronUp className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          )}
        </button>

        {settingsOpen && (
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-5 border-t border-neutral-100 pt-4 mt-1 animate-fade-in text-left">
            <Input
              type="text"
              label="Practice Name"
              value={settingsPracticeName}
              onChange={(e) => setSettingsPracticeName(e.target.value)}
              placeholder="e.g. Sharma Physiotherapy Clinic"
              maxLength={100}
              className="max-w-md"
            />

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-semibold text-neutral-700">
                Maximum Junior Doctors
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSettingsMaxJunior((prev) => Math.max(activeCount, prev - 1))}
                  disabled={settingsMaxJunior <= activeCount}
                  className="w-7 h-7 border border-neutral-200 rounded-md text-neutral-600 bg-white flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 select-none cursor-pointer"
                >
                  −
                </button>
                <span className="font-bold text-[15px] text-neutral-900 w-8 text-center">
                  {settingsMaxJunior}
                </span>
                <button
                  type="button"
                  onClick={() => setSettingsMaxJunior((prev) => Math.min(10, prev + 1))}
                  disabled={settingsMaxJunior >= 10}
                  className="w-7 h-7 border border-neutral-200 rounded-md text-neutral-600 bg-white flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 select-none cursor-pointer"
                >
                  +
                </button>
              </div>
              <span className="text-[11px] text-neutral-500 mt-1">
                You cannot reduce the limit below your current active junior doctors ({activeCount}).
              </span>
            </div>

            <Button
              type="submit"
              disabled={isSaving}
              variant="primary"
              className="h-10 px-6 max-w-[150px] mt-2"
            >
              Save Settings
            </Button>
          </form>
        )}
      </div>

      {/* Confirmation Remove Modal */}
      <Modal
        isOpen={removeModalOpen}
        onClose={() => {
          setRemoveModalOpen(false);
          setDoctorToRemove(null);
        }}
        title="Remove Junior Doctor?"
        size="sm"
        footer={
          <div className="flex gap-3 justify-end w-full">
            <button
              type="button"
              onClick={() => {
                setRemoveModalOpen(false);
                setDoctorToRemove(null);
              }}
              className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 rounded-md text-[13px] font-bold uppercase tracking-wider select-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleRemoveDoctor}
              disabled={isSaving}
              className="bg-[#C0392B] hover:bg-[#A93226] text-white border-0 h-10 px-5 text-[13px] font-bold rounded-md flex items-center justify-center cursor-pointer select-none transition-colors"
            >
              {isSaving ? 'Removing...' : 'Remove Doctor'}
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-4 text-left font-sans">
          <p className="text-[13px] text-neutral-600 leading-relaxed">
            Dr. <span className="font-bold text-neutral-900">{doctorToRemove?.user?.name}</span> will lose access to your practice and will need to be re-invited to return.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PracticeManagement;
