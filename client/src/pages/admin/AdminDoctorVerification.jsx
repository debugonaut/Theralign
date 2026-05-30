import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Eye, ExternalLink, ShieldAlert, Award } from 'lucide-react';

import {
  getPendingDoctorsAPI,
  verifyDoctorAPI,
  rejectDoctorAPI,
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
  const fetchQueue = async () => {
    try {
      setLoadingQueue(true);
      const res = await getPendingDoctorsAPI();
      const list = res.data?.profiles || res.data || [];
      setPendingQueue(list);
    } catch (err) {
      toast.error('Failed to load pending applications queue');
    } finally {
      setLoadingQueue(false);
    }
  };

  // 2. Fetch full directory (paginated, searchable, filterable)
  const fetchDirectory = useCallback(async () => {
    try {
      setLoadingDirectory(true);
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await getAllDoctorsAdminAPI(params);
      const data = res.data?.data || res.data || {};
      setDirectory(data.doctors || []);
      setDirectoryTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error('Failed to load doctor directory ledger');
    } finally {
      setLoadingDirectory(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchQueue();
  }, []);

  useEffect(() => {
    fetchDirectory();
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
    <div className="space-y-12 select-none text-swiss-black">
      {/* Header */}
      <SectionHeader
        title="DOCTORS"
        subtitle="CLINICAL CREDENTIAL VERIFICATION AND PLATFORM PRACTITIONER LEDGER CONTROL."
      />

      {/* Control bar - Search, filters, and Export action */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-2 border-swiss-black p-4 bg-swiss-white">
        {/* Real-time search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-swiss-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="FILTER BY NAME, EMAIL, REGISTRATION..."
            value={search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-swiss-white border-2 border-swiss-black text-xs font-bold uppercase placeholder-swiss-gray-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Status segmented controls */}
        <div className="flex border-2 border-swiss-black">
          {['all', 'verified', 'pending', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilter(status)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-colors border-r-2 last:border-r-0 border-swiss-black cursor-pointer ${
                statusFilter === status
                  ? 'bg-swiss-black text-swiss-white font-black'
                  : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Export secondary button */}
        <button
          onClick={handleExport}
          className="px-6 py-2.5 bg-swiss-white border-2 border-swiss-black text-[11px] font-black uppercase tracking-widest text-swiss-black hover:bg-swiss-black hover:text-swiss-white transition-all cursor-pointer"
        >
          EXPORT →
        </button>
      </div>

      {/* ─── 1. Verification Queue Section ─── */}
      {!loadingQueue && pendingQueue.length > 0 && (
        <div className="border-t-4 border-swiss-amber border-2 border-swiss-black p-6 bg-swiss-white">
          <div className="flex items-center gap-3 pb-4 border-b border-swiss-gray-200 mb-6">
            <span className="text-[11px] font-bold text-swiss-amber uppercase tracking-widest block">
              ⚠️ PENDING APPLICATIONS
            </span>
            <span className="border border-swiss-amber bg-swiss-white text-swiss-amber text-[10px] px-1.5 py-0.5 font-bold">
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
                  className={`border-2 border-swiss-black transition-all ${
                    isExpanded ? 'bg-swiss-gray-100' : 'bg-swiss-white hover:bg-swiss-gray-50'
                  }`}
                >
                  {/* Row Summary — 80px tall layout */}
                  <div 
                    onClick={() => {
                      setExpandedQueueRow(isExpanded ? null : doc._id);
                      setRejectingQueueRow(null);
                    }}
                    className="h-20 px-6 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      {/* Name initial circle */}
                      <div className="w-10 h-10 rounded-full bg-swiss-black text-swiss-white flex items-center justify-center font-bold text-sm uppercase shrink-0">
                        {docName[0]}
                      </div>
                      
                      <div className="text-left">
                        <span className="font-black text-xs uppercase text-swiss-black tracking-wide block">
                          Dr. {docName}
                        </span>
                        <span className="text-[10px] text-swiss-gray-400 font-mono block mt-0.5">
                          {doc.user?.email} · REG: {doc.registrationNumber || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-swiss-gray-400 font-bold block uppercase tracking-wider">
                          EXPERIENCE / APPLIED
                        </span>
                        <span className="text-xs font-bold text-swiss-black block uppercase mt-0.5">
                          {doc.experience} YEARS · {createdDate}
                        </span>
                      </div>

                      <button
                        className="px-4 py-2 border-2 border-swiss-black text-[10px] font-black uppercase tracking-widest bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white transition-all shrink-0"
                      >
                        {isExpanded ? 'CLOSE' : 'REVIEW'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded block */}
                  {isExpanded && (
                    <div className="border-t border-swiss-black p-6 bg-swiss-white text-left space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        {/* Profile Info (7 cols) */}
                        <div className="md:col-span-7 space-y-4">
                          <div>
                            <span className="text-[10px] font-bold text-swiss-gray-400 uppercase tracking-widest block mb-1">
                              CLINIC ADDRESS
                            </span>
                            <span className="font-bold text-swiss-black text-xs uppercase">
                              {doc.clinicName?.toUpperCase()} · {doc.clinicAddress?.toUpperCase()}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-swiss-gray-400 uppercase tracking-widest block mb-1">
                              QUALIFICATIONS
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {doc.specialization?.map(spec => (
                                <Badge key={spec} variant="neutral" label={spec} size="sm" />
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-swiss-gray-400 uppercase tracking-widest block mb-1">
                              PRACTITIONER BIOGRAPHY
                            </span>
                            <p className="text-xs text-swiss-gray-600 leading-relaxed font-medium bg-swiss-gray-50 border p-4">
                              {doc.bio || 'No biography uploaded.'}
                            </p>
                          </div>
                        </div>

                        {/* Documents Zoom list (5 cols) */}
                        <div className="md:col-span-5 space-y-3">
                          <span className="text-[10px] font-bold text-swiss-gray-400 uppercase tracking-widest block mb-1">
                            VERIFICATION FILES
                          </span>
                          
                          {/* Degree Document Thumbnail */}
                          {doc.degreeDocument ? (
                            <a
                              href={doc.degreeDocument}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between border-2 border-swiss-black p-4 hover:bg-swiss-gray-50 transition-colors"
                            >
                              <div className="text-left">
                                <span className="font-bold text-xs uppercase tracking-wider block text-swiss-black">
                                  DEGREE CERTIFICATE
                                </span>
                                <span className="text-[9px] text-swiss-gray-400 font-bold block mt-0.5">
                                  VERIFIED FILE ATTACHED
                                </span>
                              </div>
                              <ExternalLink size={14} className="text-swiss-gray-400 group-hover:text-swiss-red transition-colors" />
                            </a>
                          ) : (
                            <div className="border border-dashed p-4 text-center text-swiss-gray-400 text-xs font-bold uppercase tracking-wider">
                              DEGREE MISSING
                            </div>
                          )}

                          {/* License Document Thumbnail */}
                          {doc.licenseDocument ? (
                            <a
                              href={doc.licenseDocument}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between border-2 border-swiss-black p-4 hover:bg-swiss-gray-50 transition-colors"
                            >
                              <div className="text-left">
                                <span className="font-bold text-xs uppercase tracking-wider block text-swiss-black">
                                  PRACTITIONER LICENSE
                                </span>
                                <span className="text-[9px] text-swiss-gray-400 font-bold block mt-0.5">
                                  VERIFIED FILE ATTACHED
                                </span>
                              </div>
                              <ExternalLink size={14} className="text-swiss-gray-400 group-hover:text-swiss-red transition-colors" />
                            </a>
                          ) : (
                            <div className="border border-dashed p-4 text-center text-swiss-gray-400 text-xs font-bold uppercase tracking-wider">
                              LICENSE MISSING
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Twin Action CTAs */}
                      <div className="border-t border-swiss-gray-200 pt-6 flex flex-col gap-4">
                        <div className="flex gap-4">
                          <button
                            onClick={() => handleApprove(doc._id)}
                            disabled={actionLoading}
                            className="px-6 py-2.5 bg-swiss-white border-2 border-swiss-teal text-[11px] font-black uppercase tracking-widest text-swiss-teal hover:bg-swiss-teal hover:text-swiss-white transition-all cursor-pointer disabled:opacity-40"
                          >
                            APPROVE VERIFICATION →
                          </button>
                          
                          <button
                            onClick={() => {
                              setRejectingQueueRow(isRejecting ? null : doc._id);
                              setRejectionReason('');
                            }}
                            disabled={actionLoading}
                            className="px-6 py-2.5 bg-swiss-white border-2 border-swiss-red text-[11px] font-black uppercase tracking-widest text-swiss-red hover:bg-swiss-red hover:text-swiss-white transition-all cursor-pointer disabled:opacity-40"
                          >
                            {isRejecting ? 'CANCEL REJECTION' : 'REJECT APPLICATION →'}
                          </button>
                        </div>

                        {/* Inline Rejection Note — NO modals! */}
                        {isRejecting && (
                          <form 
                            onSubmit={(e) => handleRejectSubmit(e, doc._id)}
                            className="border-2 border-swiss-red p-6 bg-swiss-gray-50 flex flex-col gap-4 animate-fade-in text-left"
                          >
                            <div>
                              <label className="block text-[10px] font-black text-swiss-red uppercase tracking-widest mb-1.5">
                                REQUIRED REASON FOR REJECTION (MINIMUM 15 CHARACTERS)
                              </label>
                              <textarea
                                required
                                placeholder="e.g. YOUR REGISTRATION FILE CANNOT BE OPENED. PLEASE UPLOAD A HIGH-RESOLUTION JPEG SHOWING THE ENTIRE CERTIFICATE."
                                rows={3}
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-4 py-2.5 bg-swiss-white border-2 border-swiss-black rounded-none text-xs font-bold uppercase placeholder-swiss-gray-400 focus:outline-none focus:border-swiss-red transition-all"
                              />
                              <div className="flex justify-between items-center mt-2 text-[9px] font-bold">
                                <span className="text-swiss-gray-400">PROVIDE CLEAR EXPLANATION</span>
                                <span className={rejectionReason.trim().length < 15 ? 'text-swiss-red' : 'text-swiss-teal'}>
                                  {rejectionReason.trim().length} CHARACTERS
                                </span>
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={rejectionReason.trim().length < 15 || actionLoading}
                              className="px-6 py-2 bg-swiss-red text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed select-none cursor-pointer self-start"
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
      <div className="bg-swiss-white border-2 border-swiss-black rounded-none shadow-none text-left">
        <div className="p-6 border-b border-swiss-gray-200">
          <span className="text-[11px] font-bold text-swiss-gray-400 uppercase tracking-widest block mb-1">
            PLATFORM LEDGER
          </span>
          <h3 className="text-ui-lg font-black text-swiss-black uppercase tracking-tight">
            PRACTITIONER DIRECTORY
          </h3>
        </div>

        {loadingDirectory ? (
          <div className="p-12 text-center">
            <span className="inline-block animate-spin mr-2">⏳</span>
            <span className="text-xs font-bold uppercase tracking-wider text-swiss-gray-400">RETRIEVING DIRECTORY DATA...</span>
          </div>
        ) : directory.length === 0 ? (
          <div className="p-12 text-center text-swiss-gray-400 text-ui-sm font-bold uppercase tracking-wider">
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
                    className="border-b border-swiss-gray-200 hover:bg-swiss-gray-50 transition-colors"
                  >
                    {/* Doctor with initial circle */}
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-swiss-black text-swiss-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {docName[0]}
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-swiss-black uppercase tracking-wide text-xs block">
                            Dr. {docName}
                          </span>
                          <span className="text-[10px] text-swiss-gray-400 font-mono block">
                            {doc.user?.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Specialization */}
                    <td className="px-4 py-4 align-middle font-bold text-swiss-gray-600 text-xs uppercase tracking-wide">
                      {Array.isArray(doc.specialization) ? doc.specialization[0] : doc.specialization || 'GENERAL'}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 align-middle">
                      <Badge variant={badgeVariant} size="sm" />
                    </td>

                    {/* Joined */}
                    <td className="px-4 py-4 align-middle text-swiss-gray-500 font-mono text-xs">
                      {createdDate}
                    </td>

                    {/* Appointments count */}
                    <td className="px-4 py-4 align-middle text-right font-bold text-swiss-black swiss-numeric">
                      {doc.appointmentsCount || 0}
                    </td>

                    {/* Earnings right-aligned monospace */}
                    <td className="px-4 py-4 align-middle text-right font-black text-swiss-black swiss-numeric">
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
          <span className="text-swiss-gray-400">
            PAGE {page} OF {totalPages} · {directoryTotal} TOTAL DOCTORS
          </span>
          <div className="flex gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border-2 border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white disabled:opacity-40 disabled:hover:bg-swiss-white disabled:hover:text-swiss-black transition-all shrink-0 cursor-pointer"
            >
              ← PREV
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border-2 border-swiss-black bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white disabled:opacity-40 disabled:hover:bg-swiss-white disabled:hover:text-swiss-black transition-all shrink-0 cursor-pointer"
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
