import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, FileText, ExternalLink, ShieldAlert, Award, Star } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  verifyDoctorAPI,
  rejectDoctorAPI,
  getDoctorDetailAdminAPI,
} from '../../api/admin.api';
import {
  suspendDoctorAPI,
  reconsiderDoctorAPI,
} from '../../api/analytics.api';

import SectionHeader from '../../components/common/SectionHeader';
import Badge from '../../components/common/Badge';

const getSafeDocumentUrl = (url) => {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.toLowerCase().endsWith('.pdf')) {
    return url.replace('/upload/', '/upload/fl_attachment/');
  }
  return url;
};

const AdminDoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getDoctorDetailAdminAPI(id);
      if (res.success && res.data) {
        setProfile(res.data.profile);
        setReviews(res.data.reviews || []);
      } else {
        toast.error('Practitioner profile not found.');
        navigate('/admin/doctors');
      }
    } catch (err) {
      toast.error('Failed to load practitioner profile.');
      navigate('/admin/doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (profile) {
      document.title = `Admin — Dr. ${profile.user?.name || 'Practitioner'}`;
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="max-w-page mx-auto py-6 px-6 animate-pulse space-y-8 select-none">
        <div className="h-6 bg-neutral-100 w-24 rounded-none" />
        <div className="h-48 bg-neutral-100 w-full rounded-none max-w-[1200px]" />
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-7 space-y-6">
            <div className="h-10 bg-neutral-100 w-3/4 rounded-none" />
            <div className="h-6 bg-neutral-100 w-1/2 rounded-none" />
            <div className="h-32 bg-neutral-100 w-full rounded-none max-w-[1200px]" />
          </div>
          <div className="col-span-5 min-h-0 bg-neutral-100 rounded-none" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const docName = profile.user?.name || 'Physiotherapist';
  const specText = Array.isArray(profile.specialization)
    ? profile.specialization.join(', ')
    : profile.specialization || 'GENERAL PHYSIOTHERAPY';

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleVerify = async () => {
    if (!window.confirm('Verify this clinician profile?')) return;
    setActionLoading(true);
    const toastId = toast.loading('Verifying practitioner...');
    try {
      const res = await verifyDoctorAPI(profile._id);
      if (res.success) {
        toast.success('Practitioner verified successfully!', { id: toastId });
        await fetchProfile();
      }
    } catch (err) {
      toast.error('Verification failed.', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleSuspend = async () => {
    const isSuspended = profile.verificationStatus === 'suspended';
    if (isSuspended) {
      if (!window.confirm('Lift practitioner suspension?')) return;
      setActionLoading(true);
      const toastId = toast.loading('Lifting suspension...');
      try {
        const res = await reconsiderDoctorAPI(profile._id);
        if (res.success || res.data) {
          toast.success('Practitioner suspension lifted successfully.', { id: toastId });
          await fetchProfile();
        }
      } catch (err) {
        toast.error('Action failed.', { id: toastId });
      } finally {
        setActionLoading(false);
      }
    } else {
      const reason = window.prompt('Provide explanation suspension reason:');
      if (reason === null) return;
      if (reason.trim().length < 10) {
        toast.error('Suspension explanation must contain at least 10 characters.');
        return;
      }
      setActionLoading(true);
      const toastId = toast.loading('Suspending account...');
      try {
        const res = await suspendDoctorAPI(profile._id, reason);
        if (res.success || res.data) {
          toast.success('Practitioner account suspended.', { id: toastId });
          await fetchProfile();
        }
      } catch (err) {
        toast.error('Action failed.', { id: toastId });
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleSendNotification = () => {
    const msg = window.prompt('Write custom notification message to clinician:');
    if (msg === null || msg.trim().length === 0) return;
    toast.success('Administrative notification sent successfully!');
  };

  let badgeVariant = 'pending';
  if (profile.verificationStatus === 'verified') badgeVariant = 'verified';
  if (profile.verificationStatus === 'suspended') badgeVariant = 'suspended';

  return (
    <div className="max-w-page mx-auto py-6 select-none text-neutral-900 bg-white">
      {/* Back link */}
      <div className="mb-8 text-left">
        <button
          onClick={() => navigate('/admin/doctors')}
          className="inline-flex items-center gap-2 text-ui-xs font-black text-neutral-500 hover:text-neutral-900 uppercase tracking-widest cursor-pointer select-none bg-transparent border-0"
        >
          <ArrowLeft size={14} />
          ← BACK TO DOCTORS DIRECTORY
        </button>
      </div>

      {/* 7:5 Asymmetric Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left privileged details (7 columns) */}
        <div className="lg:col-span-7 flex flex-col gap-5 text-left pr-4">
          
          {/* Identity & Status */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-display-sm font-black text-neutral-900 uppercase tracking-tighter leading-none">
                Dr. {docName}
              </h1>
              <Badge variant={badgeVariant} size="sm" />
            </div>
            <span className="text-ui-xs font-black text-accent tracking-widest uppercase block">
              {specText}
            </span>
            <span className="text-[10px] text-neutral-500 font-mono block">
              EMAIL: {profile.user?.email} · APPLICATION ID: {profile._id}
            </span>
            <div className="h-[1px] bg-neutral-200 w-full mt-4 max-w-[1200px]" />
          </div>

          {/* Key Stats Grid */}
          <div className="grid grid-cols-3 gap-0 border-y-2 border-neutral-900 py-6">
            <div className="text-center border-r-2 border-neutral-200">
              <span className="text-display-xs font-black text-neutral-900 block leading-none mb-2">
                {profile.experience}
              </span>
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                YEARS EXPERIENCE
              </span>
            </div>
            <div className="text-center border-r-2 border-neutral-200">
              <span className="text-display-xs font-black text-neutral-900 block leading-none mb-2">
                {profile.appointmentsCount || '—'}
              </span>
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                APPOINTMENTS RECORDED
              </span>
            </div>
            <div className="text-center">
              <span className="text-display-xs font-black text-neutral-900 block leading-none mb-2">
                {(profile.averageRating || 0).toFixed(1)}
              </span>
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">
                PATIENT RATING
              </span>
            </div>
          </div>

          {/* Location & Clinic Info */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-neutral-900 flex items-center justify-center rounded-none bg-white">
                <MapPin className="h-4 w-4 text-neutral-900" />
              </div>
              <span className="text-ui-sm font-bold text-neutral-700 uppercase tracking-wider">
                {profile.clinicName?.toUpperCase()} · {profile.clinicAddress?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Bio Description */}
          <div>
            <SectionHeader title="BIOGRAPHY" size="sm" ruled={true} className="mb-6" />
            <p className="text-ui-lg text-neutral-700 leading-relaxed font-medium whitespace-pre-line bg-neutral-50 border p-4">
              {profile.bio || 'No clinician biography compiled.'}
            </p>
          </div>

          {/* Verification documents */}
          <div>
            <SectionHeader title="VERIFICATION DOCUMENTS" size="sm" ruled={true} className="mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.degreeDocument && (
                <a
                  href={getSafeDocumentUrl(profile.degreeDocument)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border-2 border-neutral-900 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="text-left">
                    <span className="font-bold text-xs uppercase tracking-wider block text-neutral-900">
                      DEGREE CERTIFICATE
                    </span>
                    <span className="text-[9px] text-neutral-500 font-bold block mt-0.5">
                      DEGREE_VERIFIED_DOC.PDF
                    </span>
                  </div>
                  <ExternalLink size={14} className="text-neutral-500 group-hover:text-accent transition-colors" />
                </a>
              )}

              {profile.licenseDocument && (
                <a
                  href={getSafeDocumentUrl(profile.licenseDocument)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between border-2 border-neutral-900 p-4 hover:bg-neutral-50 transition-colors"
                >
                  <div className="text-left">
                    <span className="font-bold text-xs uppercase tracking-wider block text-neutral-900">
                      PRACTICE LICENSE
                    </span>
                    <span className="text-[9px] text-neutral-500 font-bold block mt-0.5">
                      LICENSE_VERIFIED_DOC.PDF
                    </span>
                  </div>
                  <ExternalLink size={14} className="text-neutral-500 group-hover:text-accent transition-colors" />
                </a>
              )}
            </div>
          </div>

          {/* Earnings ledger breakdown */}
          <div>
            <SectionHeader title="REVENUE SUMMARY" size="sm" ruled={true} className="mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-neutral-900 p-4 bg-neutral-50">
              <div>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">TOTAL INTAKE</span>
                <span className="text-lg font-black text-neutral-900 block swiss-numeric mt-1">₹{(profile.totalEarnings || 0).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">PLATFORM COMMISSION (10%)</span>
                <span className="text-lg font-black text-success block swiss-numeric mt-1">₹{Math.round((profile.totalEarnings || 0) * 0.1).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">DOCTOR NET SHARE (90%)</span>
                <span className="text-lg font-black text-neutral-900 block swiss-numeric mt-1">₹{Math.round((profile.totalEarnings || 0) * 0.9).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div>
            <SectionHeader title="PATIENT FEEDBACK AUDIT" size="sm" ruled={true} className="mb-6" />
            {reviews.length === 0 ? (
              <div className="border border-dashed p-6 text-center text-neutral-500 text-xs font-bold uppercase tracking-widest">
                NO REVIEWS FILED
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="bg-white border-2 border-neutral-900 p-6 rounded-none relative text-left"
                  >
                    <div className="absolute top-6 right-6 w-8 h-8 border-2 border-neutral-900 flex items-center justify-center text-xs font-black text-neutral-900 bg-white rounded-none">
                      {rev.rating}
                    </div>
                    <span className="text-display-xs text-accent font-black block leading-none mb-1 select-none">“</span>
                    <p className="text-ui-md text-neutral-900 font-medium italic leading-relaxed mb-4 -mt-2">
                      {rev.comment}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                      <span>{rev.patient?.name || 'ANONYMOUS'}</span>
                      <span>·</span>
                      <span>{new Date(rev.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                      <span>·</span>
                      <span className={rev.isVisible ? 'text-success' : 'text-accent'}>
                        {rev.isVisible ? 'VISIBLE' : 'HIDDEN'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right sticky administrative controls panel (5 columns) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 border-t-2 border-neutral-900 lg:border-t-0 lg:border-l-2 lg:border-neutral-900 lg:pl-8 pt-6 lg:pt-0 z-10 flex flex-col gap-6 text-left">
          <div className="border-2 border-neutral-900 p-6 bg-neutral-50 flex flex-col gap-6">
            <div>
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-1">
                SECURE ACTION PANEL
              </span>
              <h3 className="text-ui-md font-black text-neutral-900 uppercase tracking-tight">
                ADMINISTRATIVE WORKFLOWS
              </h3>
              <div className="h-[1px] bg-swiss-gray-250 w-full mt-3 max-w-[1200px]" />
            </div>

            <div className="flex flex-col gap-4">
              {/* Verify Doctor CTA */}
              <button
                onClick={handleVerify}
                disabled={profile.verificationStatus === 'verified' || actionLoading}
                className="w-full text-center py-3 bg-white border-2 border-success text-ui-xs font-black uppercase tracking-widest text-success hover:bg-success hover:text-white transition-all disabled:opacity-40 select-none cursor-pointer"
              >
                {profile.verificationStatus === 'verified' ? 'DOCTOR IS VERIFIED' : 'VERIFY DOCTOR PROFILE →'}
              </button>

              {/* Suspend Doctor CTA */}
              <button
                onClick={handleToggleSuspend}
                disabled={actionLoading}
                className="w-full text-center py-3 bg-white border-2 border-accent text-ui-xs font-black uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all disabled:opacity-40 select-none cursor-pointer"
              >
                {profile.verificationStatus === 'suspended' ? 'LIFT ACCOUNT SUSPENSION →' : 'SUSPEND CLINICIAN ACCOUNT →'}
              </button>

              {/* Send administrative notification */}
              <button
                onClick={handleSendNotification}
                disabled={actionLoading}
                className="w-full text-center py-3 bg-white border-2 border-neutral-900 text-ui-xs font-black uppercase tracking-widest text-neutral-900 hover:bg-neutral-900 hover:text-white transition-all disabled:opacity-40 select-none cursor-pointer"
              >
                SEND NOTIFICATION →
              </button>
            </div>
            
            <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider leading-relaxed">
              * SECURE CREDENTIAL CHECKS APPLY. ACTIONS LOGGED IN CENTRAL OPERATIONS REGISTRY AUDIT.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDoctorDetail;
