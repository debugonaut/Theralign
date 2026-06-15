import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Eye, ExternalLink, ShieldAlert, Award, AlertTriangle, Hourglass } from 'lucide-react';

import {
  getPendingDoctorsAPI,
  verifyDoctorAPI,
  rejectDoctorAPI,
  resetDemoFlowAPI,
} from '../../api/admin.api';

import {
  getAllDoctorsAdminAPI,
  suspendDoctorAPI,
  reconsiderDoctorAPI,
} from '../../api/analytics.api';

import SectionHeader from '../../components/common/SectionHeader';
import Table, { ActionLink } from '../../components/common/Table';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const getSafeDocumentUrl = (url) => {
  if (!url) return '';
  // For PDFs stored in Cloudinary, use fl_attachment to force direct download/open
  // rather than mangling the extension which causes 404s
  if (url.includes('res.cloudinary.com') && url.toLowerCase().endsWith('.pdf')) {
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  return url;
};

const AdminDoctorVerification = () => {
  const navigate = useNavigate();

  // State Management
  const [pendingQueue, setPendingQueue] = useState([]);
  const [directory, setDirectory] = useState([]);
  const [directoryTotal, setDirectoryTotal] = useState(0);
  const [loadingQueue, setLoadingQueue] = useState(true);
  const [loadingDirectory, setLoadingDirectory] = useState(true);

  // Filter & Search Controls
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Queue Expansion & Operations State
  const [expandedQueueRow, setExpandedQueueRow] = useState(null);
  const [rejectingQueueRow, setRejectingQueueRow] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const LIMIT = 10;

  // 1. Fetch verification queue
  const fetchQueue = async (silent = false) => {
    try {
      if (!silent) setLoadingQueue(true);
      const res = await getPendingDoctorsAPI();
      const list = res.data?.profiles || res.data || [];
      setPendingQueue(list);
    } catch (err) {
      if (!silent) toast.error('Failed to load pending applications queue');
    } finally {
      if (!silent) setLoadingQueue(false);
    }
  };

  // 2. Fetch full directory (paginated, searchable, filterable)
  const fetchDirectory = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoadingDirectory(true);
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await getAllDoctorsAdminAPI(params);
      const data = res.data?.data || res.data || {};
      setDirectory(data.doctors || []);
      setDirectoryTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      if (!silent) toast.error('Failed to load doctor directory ledger');
    } finally {
      if (!silent) setLoadingDirectory(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchQueue(false);
  }, []);

  useEffect(() => {
    fetchDirectory(false);
  }, [fetchDirectory]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchQueue(true);
      fetchDirectory(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchDirectory]);

  // Handle Search Input Change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Handle Status Tab Change
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  // Export to CSV
  const handleExport = () => {
    if (directory.length === 0) {
      toast.error('No doctor data available for export');
      return;
    }
    const headers = ['NAME', 'EMAIL', 'SPECIALIZATION', 'EXPERIENCE', 'STATUS', 'EARNINGS'];
    const rows = directory.map(d => [
      d.user?.name || '',
      d.user?.email || '',
      Array.isArray(d.specialization) ? d.specialization.join('; ') : d.specialization || '',
      `${d.experience || 0} Years`,
      d.verificationStatus || '',
      `Rs. ${d.totalEarnings || 0}`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `theralign_doctors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Doctor ledger exported to CSV successfully');
  };

  // Reset Demo Flow
  const handleResetDemo = async () => {
    if (!window.confirm('Reset demo doctor back to pending state?')) return;
    const toastId = toast.loading('Resetting demo flow...');
    try {
      await resetDemoFlowAPI();
      toast.success('Demo flow reset successfully', { id: toastId });
      await Promise.all([fetchQueue(), fetchDirectory()]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset demo flow', { id: toastId });
    }
  };

  // ─── Actions ───────────────────────────────────────────────────────────────

  // Approve Doctor Application
  const handleApprove = async (profileId) => {
    if (!window.confirm('Verify this clinician profile?')) return;
    setActionLoading(true);
    const toastId = toast.loading('Approving clinician credentials...');
    try {
      const res = await verifyDoctorAPI(profileId);
      if (res.success || res.message) {
        toast.success('Clinician profile verified successfully', { id: toastId });
        setExpandedQueueRow(null);
        setRejectingQueueRow(null);
        // Refresh queue & directory
        await Promise.all([fetchQueue(), fetchDirectory()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification approval failed', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Rejection Reason
  const handleRejectSubmit = async (e, profileId) => {
    e.preventDefault();
    if (rejectionReason.trim().length < 15) {
      toast.error('Constructive feedback must contain at least 15 characters.');
      return;
    }
    setActionLoading(true);
    const toastId = toast.loading('Submitting application rejection...');
    try {
      const res = await rejectDoctorAPI(profileId, rejectionReason);
      if (res.success) {
        toast.success('Clinician onboarding rejected & feedback sent.', { id: toastId });
        setExpandedQueueRow(null);
        setRejectingQueueRow(null);
        setRejectionReason('');
        await Promise.all([fetchQueue(), fetchDirectory()]);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection submit failed', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Suspend Status
  const handleToggleSuspend = async (doc) => {
    const isSuspended = doc.verificationStatus === 'suspended';
    if (isSuspended) {
      if (!window.confirm(`Reconsider & lift suspension for Dr. ${doc.user?.name}?`)) return;
      const toastId = toast.loading('Reconsidering account state...');
      try {
        const res = await reconsiderDoctorAPI(doc._id);
        if (res.success || res.data) {
          toast.success('Clinician account reactivated successfully', { id: toastId });
          await fetchDirectory();
        }
      } catch (err) {
        toast.error('Reconsideration action failed', { id: toastId });
      }
    } else {
      const reason = window.prompt(`Enter suspension explanation reason for Dr. ${doc.user?.name}:`);
      if (reason === null) return; // user cancelled
      if (reason.trim().length < 10) {
        toast.error('Suspension explanation must contain at least 10 characters.');
        return;
      }
      const toastId = toast.loading('Suspending clinician account...');
      try {
        const res = await suspendDoctorAPI(doc._id, reason);
        if (res.success || res.data) {
          toast.success('Clinician account suspended successfully', { id: toastId });
          await fetchDirectory();
        }
      } catch (err) {
        toast.error('Suspension action failed', { id: toastId });
      }
    }
  };

  return (
    <div className="space-y-8 select-none text-neutral-900">
      {/* Header */}
      <SectionHeader
        title="DOCTORS"
        subtitle="CLINICAL CREDENTIAL VERIFICATION AND PLATFORM PRACTITIONER LEDGER CONTROL."
      />

      {/* Control bar - Search, filters, and Export action */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-2 border-neutral-900 p-4 bg-white">
        {/* Real-time search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
          <input
            type="text"
            placeholder="FILTER BY NAME, EMAIL, REGISTRATION..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-white border-2 border-neutral-900 text-xs font-bold uppercase placeholder-neutral-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Status segmented controls */}
        <div className="flex border-2 border-neutral-900">
          {['all', 'verified', 'pending', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors border-r-2 last:border-r-0 border-neutral-900 cursor-pointer ${
                statusFilter === status
                  ? 'bg-neutral-900 text-white font-black'
                  : 'bg-white text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Export & Reset Demo buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleResetDemo}
            className="px-6 py-2.5 bg-white border-2 border-accent text-[11px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all cursor-pointer"
          >
            RESET DEMO
          </button>
          <button
            onClick={handleExport}
            className="px-6 py-2.5 bg-white border-2 border-neutral-900 text-[11px] font-black uppercase tracking-widest text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all cursor-pointer"
          >
            EXPORT →
          </button>
        </div>
      </div>

      {/* ─── 1. Verification Queue Section ─── */}
      {!loadingQueue && pendingQueue.length > 0 && (
        <div className="border-t-4 border-warning border-2 border-neutral-900 p-6 bg-white">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-200 mb-6">
            <span className="text-[11px] font-bold text-warning uppercase tracking-widest flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> PENDING APPLICATIONS
            </span>
            <span className="border border-warning bg-white text-warning text-[10px] px-1.5 py-0.5 font-bold">
              {pendingQueue.length} WAITING
            </span>
          </div>

          <div className="space-y-4">
            {pendingQueue.map((doc) => {
              const isExpanded = expandedQueueRow === doc._id;
              const isRejecting = rejectingQueueRow === doc._id;
              const docName = doc.user?.name || 'Physiotherapist';
              const createdDate = new Date(doc.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              });

              return (
                <div 
                  key={doc._id}
                  className={`border-2 border-neutral-900 transition-all ${
                    isExpanded ? 'bg-neutral-100' : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  {/* Row Summary — 80px tall layout */}
                  <div 
                    onClick={() => {
                      setExpandedQueueRow(isExpanded ? null : doc._id);
                      setRejectingQueueRow(null);
                    }}
                    className="h-14 px-6 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Name initial circle */}
                      {doc.user?.profileImage ? (
                        <img 
                          src={doc.user.profileImage} 
                          alt={docName} 
                          className="w-10 h-10 rounded-full object-cover border border-neutral-200 shrink-0"
                          onError={(e) => {
                            e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                          {docName[0]}
                        </div>
                      )}
                      
                      <div className="text-left">
                        <span className="font-black text-xs uppercase text-neutral-900 tracking-wide block">
                          Dr. {docName}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                          {doc.user?.email} · REG: {doc.registrationNumber || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-neutral-500 font-bold block uppercase tracking-wider">
                          EXPERIENCE / APPLIED
                        </span>
                        <span className="text-xs font-bold text-neutral-900 block uppercase mt-0.5">
                          {doc.experience} YEARS · {createdDate}
                        </span>
                      </div>

                      <button
                        className="px-4 py-2 border-2 border-neutral-900 text-[10px] font-black uppercase tracking-widest bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all shrink-0"
                      >
                        {isExpanded ? 'CLOSE' : 'REVIEW'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded block */}
                  {isExpanded && (
                    <div className="border-t border-neutral-900 p-6 bg-white text-left space-y-6">
                      {/* Junior Doctor Verification Note Banner */}
                      {doc.verificationNote && (
                        <div className="p-4 bg-[#FEF3E2] border border-[#B45309]/20 text-[#B45309] rounded-md text-xs font-bold mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{doc.verificationNote}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        {/* Profile Info (7 cols) */}
                        <div className="md:col-span-7 space-y-4">
                          <div>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                              CLINIC ADDRESS
                            </span>
                            <span className="font-bold text-neutral-900 text-xs uppercase">
                              {doc.clinicName?.toUpperCase()} · {doc.clinicAddress?.toUpperCase()}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                              QUALIFICATIONS
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {doc.specialization?.map(spec => (
                                <Badge key={spec} variant="neutral" label={spec} size="sm" />
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                              PRACTITIONER BIOGRAPHY
                            </span>
                            <p className="text-xs text-neutral-700 leading-relaxed font-medium bg-neutral-50 border p-4">
                              {doc.bio || 'No biography uploaded.'}
                            </p>
                          </div>
                        </div>

                        {/* Documents Zoom list (5 cols) */}
                        <div className="md:col-span-5 space-y-3">
                          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
                            VERIFICATION FILES
                          </span>
                          
                          {/* Degree Document Thumbnail */}
                          {doc.degreeDocument ? (
                            <a
                              href={getSafeDocumentUrl(doc.degreeDocument)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between border-2 border-neutral-900 p-4 hover:bg-neutral-50 transition-colors"
                            >
                              <div className="text-left">
                                <span className="font-bold text-xs uppercase tracking-wider block text-neutral-900">
                                  DEGREE CERTIFICATE
                                </span>
                                <span className="text-[9px] text-neutral-500 font-bold block mt-0.5">
                                  VERIFIED FILE ATTACHED
                                </span>
                              </div>
                              <ExternalLink size={14} className="text-neutral-500 group-hover:text-accent transition-colors" />
                            </a>
                          ) : (
                            <div className="border border-dashed p-4 text-center text-neutral-500 text-xs font-bold uppercase tracking-wider">
                              DEGREE MISSING
                            </div>
                          )}

                          {/* License Document Thumbnail */}
                          {doc.licenseDocument ? (
                            <a
                              href={getSafeDocumentUrl(doc.licenseDocument)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between border-2 border-neutral-900 p-4 hover:bg-neutral-50 transition-colors"
                            >
                              <div className="text-left">
                                <span className="font-bold text-xs uppercase tracking-wider block text-neutral-900">
                                  PRACTITIONER LICENSE
                                </span>
                                <span className="text-[9px] text-neutral-500 font-bold block mt-0.5">
                                  VERIFIED FILE ATTACHED
                                </span>
                              </div>
                              <ExternalLink size={14} className="text-neutral-500 group-hover:text-accent transition-colors" />
                            </a>
                          ) : (
                            <div className="border border-dashed p-4 text-center text-neutral-500 text-xs font-bold uppercase tracking-wider">
                              LICENSE MISSING
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Twin Action CTAs */}
                      <div className="border-t border-neutral-200 pt-6 flex flex-col gap-4">
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleApprove(doc._id)}
                            disabled={actionLoading}
                            className="px-6 py-2.5 bg-white border-2 border-success text-[11px] font-black uppercase tracking-widest text-success hover:bg-success hover:text-white transition-all cursor-pointer disabled:opacity-40"
                          >
                            APPROVE VERIFICATION →
                          </button>
                          
                          <button
                            onClick={() => {
                              setRejectingQueueRow(isRejecting ? null : doc._id);
                              setRejectionReason('');
                            }}
                            disabled={actionLoading}
                            className="px-6 py-2.5 bg-white border-2 border-accent text-[11px] font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all cursor-pointer disabled:opacity-40"
                          >
                            {isRejecting ? 'CANCEL REJECTION' : 'REJECT APPLICATION →'}
                          </button>
                        </div>

                        {/* Inline Rejection Note — NO modals! */}
                        {isRejecting && (
                          <form 
                            onSubmit={(e) => handleRejectSubmit(e, doc._id)}
                            className="border-2 border-accent p-6 bg-neutral-50 flex flex-col gap-4 animate-fade-in text-left"
                          >
                            <div>
                              <label className="block text-[10px] font-black text-accent uppercase tracking-widest mb-1.5">
                                REQUIRED REASON FOR REJECTION (MINIMUM 15 CHARACTERS)
                              </label>
                              <textarea
                                required
                                placeholder="e.g. YOUR REGISTRATION FILE CANNOT BE OPENED. PLEASE UPLOAD A HIGH-RESOLUTION JPEG SHOWING THE ENTIRE CERTIFICATE."
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border-2 border-neutral-900 rounded-none text-xs font-bold uppercase placeholder-neutral-500 focus:outline-none focus:border-accent transition-all"
                              />
                              <div className="flex justify-between items-center mt-2 text-[9px] font-bold">
                                <span className="text-neutral-500">PROVIDE CLEAR EXPLANATION</span>
                                <span className={rejectionReason.trim().length < 15 ? 'text-accent' : 'text-success'}>
                                  {rejectionReason.trim().length} CHARACTERS
                                </span>
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={rejectionReason.trim().length < 15 || actionLoading}
                              className="px-6 py-2 bg-accent text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer self-start"
                            >
                              SUBMIT REJECTION →
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 2. Main Directory Table ─── */}
      <div className="bg-white border-2 border-neutral-900 rounded-none shadow-none text-left">
        <div className="p-6 border-b border-neutral-200">
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest block mb-1">
            PLATFORM LEDGER
          </span>
          <h3 className="text-ui-lg font-black text-neutral-900 uppercase tracking-tight">
            PRACTITIONER DIRECTORY
          </h3>
        </div>

        {loadingDirectory ? (
          <div className="p-6 text-center flex items-center justify-center gap-2">
            <Hourglass className="w-4 h-4 animate-spin text-neutral-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">RETRIEVING DIRECTORY DATA...</span>
          </div>
        ) : directory.length === 0 ? (
          <div className="p-6 text-center text-neutral-500 text-ui-sm font-bold uppercase tracking-wider">
            NO PRACTITIONERS MATCH FILTERS
          </div>
        ) : (
          <Table>
            <Table.Head>
              <Table.Row>
                <Table.Header>Doctor</Table.Header>
                <Table.Header>Specialization</Table.Header>
                <Table.Header>Status</Table.Header>
                <Table.Header>Joined</Table.Header>
                <Table.Header numeric={true}>Appointments</Table.Header>
                <Table.Header numeric={true}>Earnings</Table.Header>
                <Table.Header actions={true} className="w-[180px]">Actions</Table.Header>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {directory.map((doc) => {
                const docName = doc.user?.name || 'Physiotherapist';
                const createdDate = new Date(doc.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                });
                
                let badgeVariant = 'pending';
                if (doc.verificationStatus === 'verified') badgeVariant = 'verified';
                if (doc.verificationStatus === 'suspended') badgeVariant = 'suspended';

                return (
                  <tr 
                    key={doc._id}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-colors"
                  >
                    {/* Doctor with initial circle */}
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        {doc.user?.profileImage ? (
                          <img 
                            src={doc.user.profileImage} 
                            alt={docName} 
                            className="w-8 h-8 rounded-full object-cover border border-neutral-200 shrink-0"
                            onError={(e) => {
                              e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                            }}
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {docName[0]}
                          </div>
                        )}
                        <div className="text-left">
                          <span className="font-bold text-neutral-900 uppercase tracking-wide text-xs block">
                            Dr. {docName}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono block">
                            {doc.user?.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Specialization */}
                    <td className="px-4 py-4 align-middle font-bold text-neutral-700 text-xs uppercase tracking-wide">
                      {Array.isArray(doc.specialization) ? doc.specialization[0] : doc.specialization || 'GENERAL'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant={badgeVariant} size="sm" />
                        {doc.doctorType === 'senior' && (
                          <span 
                            className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ background: '#E8F4F8', color: '#0B4F6C' }}
                          >
                            SENIOR
                          </span>
                        )}
                        {doc.doctorType === 'junior' && (
                          <span 
                            className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ background: '#FEF3E2', color: '#B45309' }}
                          >
                            JUNIOR
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-4 align-middle text-neutral-500 font-mono text-xs">
                      {createdDate}
                    </td>

                    {/* Appointments count */}
                    <td className="px-4 py-4 align-middle text-right font-bold text-neutral-900 swiss-numeric">
                      {doc.appointmentsCount || 0}
                    </td>

                    {/* Earnings right-aligned monospace */}
                    <td className="px-4 py-4 align-middle text-right font-black text-neutral-900 swiss-numeric">
                      ₹{(doc.totalEarnings || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Actions links: VIEW (text) and SUSPEND (red text link) */}
                    <td className="px-4 py-4 align-middle text-right">
                      <div className="flex items-center justify-end gap-4">
                        <ActionLink 
                          onClick={() => navigate(`/admin/doctors/${doc._id}`)}
                          className="hover:underline"
                        >
                          VIEW
                        </ActionLink>
                        
                        <ActionLink 
                          onClick={() => handleToggleSuspend(doc)}
                          destructive={doc.verificationStatus !== 'suspended'}
                          className="hover:underline"
                        >
                          {doc.verificationStatus === 'suspended' ? 'RECONSIDER' : 'SUSPEND'}
                        </ActionLink>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider pt-2 select-none">
          <span className="text-neutral-500">
            PAGE {page} OF {totalPages} · {directoryTotal} TOTAL DOCTORS
          </span>
          <div className="flex gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-900 transition-all shrink-0 cursor-pointer"
            >
              ← PREV
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border-2 border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-neutral-900 transition-all shrink-0 cursor-pointer"
            >
              NEXT →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDoctorVerification;
