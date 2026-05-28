import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Stethoscope,
  Check,
  X,
  FileText,
  ExternalLink,
  MapPin,
  AlertCircle,
  Calendar,
  ChevronRight,
  Info,
} from 'lucide-react';

import {
  getPendingDoctorsAPI,
  verifyDoctorAPI,
  rejectDoctorAPI,
} from '../../api/admin.api';

const AdminDoctorVerification = () => {
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch pending list
  const fetchPendingQueue = async () => {
    try {
      const res = await getPendingDoctorsAPI();
      if (res.success) {
        setPendingDoctors(res.data.profiles || []);
      }
    } catch (err) {
      console.error('Failed to load pending doctor applications:', err);
      toast.error('Unable to fetch the pending verification queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingQueue();
  }, []);

  // ─── Verification Actions ──────────────────────────────────────────────────
  const handleApprove = async (profileId) => {
    if (!window.confirm('Are you sure you want to approve and verify this doctor?')) return;

    setIsActionLoading(true);
    const toastId = toast.loading('Verifying doctor credentials...');

    try {
      const res = await verifyDoctorAPI(profileId);
      if (res.success) {
        toast.success('Doctor verified successfully!', { id: toastId });
        setSelectedDoctor(null);
        // Refresh queue
        await fetchPendingQueue();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Approval failed.', { id: toastId });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleOpenRejectModal = () => {
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (rejectionReason.trim().length < 15) {
      toast.error('Rejection reason must be at least 15 characters long.');
      return;
    }

    setIsActionLoading(true);
    setIsRejectModalOpen(false);
    const toastId = toast.loading('Submitting profile rejection...');

    try {
      const res = await rejectDoctorAPI(selectedDoctor._id, rejectionReason);
      if (res.success) {
        toast.success('Doctor application rejected and feedback sent.', { id: toastId });
        setSelectedDoctor(null);
        await fetchPendingQueue();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Rejection failed.', { id: toastId });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading pending applications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-primary" size={26} />
            Doctor Verification Queue
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Review professional medical credentials and approve physiotherapist onboarding applications.
          </p>
        </div>
        <div className="bg-blue-50 text-primary px-4 py-2 rounded-xl text-sm font-bold border border-blue-100">
          Pending Applications: {pendingDoctors.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ─── Applications List (Left 2 Columns) ─────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">
          {pendingDoctors.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
              <Check className="mx-auto text-emerald-500 mb-3 bg-emerald-50 p-2.5 rounded-full" size={48} />
              <h3 className="font-bold text-slate-800 text-lg">Queue Clear!</h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                No doctor onboarding applications are currently pending verification. Good job!
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Applicant</th>
                      <th className="px-6 py-4">Reg Number</th>
                      <th className="px-6 py-4">Experience</th>
                      <th className="px-6 py-4">Submitted</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {pendingDoctors.map((doc) => (
                      <tr
                        key={doc._id}
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          selectedDoctor?._id === doc._id ? 'bg-blue-50/30' : ''
                        }`}
                        onClick={() => setSelectedDoctor(doc)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 uppercase border border-slate-200">
                              {doc.user?.name ? doc.user.name[0] : 'Dr'}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-800 block">
                                Dr. {doc.user?.name || 'Physiotherapist'}
                              </span>
                              <span className="text-xs text-slate-400 font-mono block">
                                {doc.user?.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-600">
                          {doc.registrationNumber}
                        </td>
                        <td className="px-6 py-4 font-medium">{doc.experience} Years</td>
                        <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                          {new Date(doc.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedDoctor(doc)}
                            className="inline-flex items-center gap-0.5 text-xs font-bold text-primary hover:text-primary-dark hover:underline bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Review <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ─── Review Drawer Panel (Right Column) ─────────────────────────── */}
        <div className="lg:col-span-1">
          {selectedDoctor ? (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-md space-y-6 sticky top-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-bold text-slate-800 text-lg">Dr. {selectedDoctor.user?.name}</h2>
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">
                    Application Details
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Application Details Block */}
              <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase mb-1">
                    Specializations
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedDoctor.specialization.map((spec) => (
                      <span
                        key={spec}
                        className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 block uppercase mb-0.5">
                    Clinic Details
                  </span>
                  <p className="font-semibold text-slate-800">{selectedDoctor.clinicName}</p>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-start gap-1">
                    <MapPin size={12} className="shrink-0 mt-0.5 text-slate-400" />
                    {selectedDoctor.clinicAddress}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Fee</span>
                    <span className="font-bold text-slate-800">₹{selectedDoctor.consultationFee}</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 block uppercase">Experience</span>
                    <span className="font-bold text-slate-800">{selectedDoctor.experience} Yrs</span>
                  </div>
                </div>

                {/* Uploaded Documents preview links */}
                <div className="space-y-2.5">
                  <span className="text-xs font-bold text-slate-400 block uppercase">
                    Verification Documents
                  </span>

                  {/* Degree Doc */}
                  <a
                    href={selectedDoctor.degreeDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-red-500 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 text-xs block">
                          Degree Certificate
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          PDF/Image Document
                        </span>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                  </a>

                  {/* License Doc */}
                  <a
                    href={selectedDoctor.licenseDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 border border-slate-200 p-3 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-red-500 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 text-xs block">
                          Practice License
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          PDF/Image Document
                        </span>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                  </a>
                </div>
              </div>

              {/* Action CTA Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={handleOpenRejectModal}
                  disabled={isActionLoading}
                  className="inline-flex items-center justify-center gap-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 hover:border-rose-300 py-2.5 rounded-xl font-bold text-sm transition-all"
                >
                  <X size={16} /> Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedDoctor._id)}
                  disabled={isActionLoading}
                  className="inline-flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-md"
                >
                  <Check size={16} /> Approve
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center text-slate-400 flex flex-col items-center justify-center min-h-[300px] leading-relaxed">
              <Info size={32} className="mb-2 text-slate-300" />
              <span className="font-semibold text-slate-500 text-sm">No Doctor Selected</span>
              <span className="text-xs max-w-[200px] mt-1">
                Select a doctor from the pending queue to inspect their qualifications and verification files.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Rejection Reason Modal ─────────────────────────────────────── */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 border border-slate-100 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-rose-500 animate-pulse" size={22} />
                <h3 className="font-bold text-slate-800 text-lg">Reject Onboarding Application</h3>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Provide constructive, actionable feedback explaining why this application is being rejected. The doctor will see this comment on their dashboard and can update their profile.
              </p>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Detailed Rejection Explanation *
                </label>
                <textarea
                  required
                  placeholder="e.g. Your medical license document is blurry. Please re-upload a high-resolution scan of your license certificate showing the registration number clearly."
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all text-sm leading-relaxed"
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-slate-400">
                    Minimum 15 characters required.
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      rejectionReason.trim().length < 15 ? 'text-rose-500' : 'text-emerald-500'
                    }`}
                  >
                    {rejectionReason.trim().length} chars
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectionReason.trim().length < 15}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorVerification;
