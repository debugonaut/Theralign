import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { getDoctorPublicProfileAPI } from '../../api/discovery.api';
import useAuthStore from '../../store/authStore';
import SectionHeader from '../../components/common/SectionHeader';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import Button from '../../components/common/Button';
import SlotPicker from '../../components/booking/SlotPicker';

const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getInitials = (name) => {
  if (!name) return 'PT';
  const cleanName = name.replace(/^Dr\.\s+/i, '').trim();
  const parts = cleanName.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
  return cleanName.charAt(0).toUpperCase();
};

const formatReviewerName = (fullName) => {
  if (!fullName) return 'Anonymous';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
};

const getRelativeTimeString = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [aiSummary, setAiSummary] = useState(null);

  const [bioExpanded, setBioExpanded] = useState(false);
  const [reviewsExpanded, setReviewsExpanded] = useState(false);
  const [showMobileBooking, setShowMobileBooking] = useState(false);

  // Fetch Doctor Profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setAiSummary(null);
      try {
        const res = await getDoctorPublicProfileAPI(id);
        if (res.success && res.data) {
          const p = res.data.profile;
          setProfile(p);
          setReviews(res.data.reviews || []);
          // Use cached summary from profile if available, skip AI call
          if (p.aiSummary) {
            setAiSummary(p.aiSummary);
          }
        } else {
          setError('DOCTOR PROFILE NOT FOUND.');
        }
      } catch (err) {
        console.error(err);
        setError('FAILED TO LOAD DOCTOR DETAILS.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (profile) {
      document.title = `Dr. ${toTitleCase(profile.user?.name || 'Physiotherapist')} — Theralign`;
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="max-w-page mx-auto py-12 px-6 animate-pulse space-y-8 select-none">
        <div className="h-6 bg-neutral-100 w-24 rounded-md" />
        <div className="h-48 bg-neutral-100 w-full rounded-md" />
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-7 space-y-6">
            <div className="h-10 bg-neutral-100 w-3/4 rounded-md" />
            <div className="h-6 bg-neutral-100 w-1/2 rounded-md" />
            <div className="h-32 bg-neutral-100 w-full rounded-md" />
          </div>
          <div className="col-span-5 h-64 bg-neutral-100 rounded-md" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-left flex flex-col gap-4 select-none">
        <h2 className="text-display-sm font-black text-danger uppercase tracking-tighter leading-none">
          Profile Unavailable
        </h2>
        <p className="text-ui-md text-neutral-700 font-medium">{error || 'This doctor profile is currently offline.'}</p>
        <Button onClick={() => navigate('/doctors')} variant="primary" className="self-start">
          ← Back To Search
        </Button>
      </div>
    );
  }

  const doctorName = toTitleCase(profile.user?.name || 'Physiotherapist');
  const formattedDrName = doctorName.toLowerCase().startsWith('dr.')
    ? doctorName
    : `Dr. ${doctorName}`;

  // Format spec
  const specText = Array.isArray(profile.specialization)
    ? profile.specialization.join(', ')
    : profile.specialization || 'General Physiotherapy';

  const formattedSpecText = toTitleCase(specText);

  // Biography truncation
  const bioText = profile.bio || '';
  const paragraphs = bioText.split('\n\n').filter(Boolean);
  const showBioToggle = paragraphs.length > 2;
  const displayedBio = bioExpanded ? bioText : paragraphs.slice(0, 2).join('\n\n');

  // Review limits
  const visibleReviews = reviewsExpanded ? reviews : reviews.slice(0, 3);

  // Pune coordinates or simple map search link
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    profile.clinicAddress
  )}`;

  return (
    <div className="max-w-[1280px] mx-auto py-12 px-6 flex flex-col select-none bg-neutral-50 page-fade-in">
      {/* Back to Discovery */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/doctors')}
          className="inline-flex items-center gap-2 text-ui-xs font-bold text-neutral-500 hover:text-neutral-900 uppercase tracking-widest cursor-pointer select-none bg-transparent border-0"
        >
          <ArrowLeft size={16} />
          ← Back To Doctor Discovery
        </button>
      </div>

      {/* Asymmetric 7:5 layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-8 text-left pr-4">
          
          {/* Identity Section */}
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-6">
              {/* Doctor Avatar */}
              <div className="w-28 h-28 rounded-full bg-primary flex items-center justify-center overflow-hidden shrink-0 border-2 border-neutral-200 shadow-level-1">
                {profile.user?.profileImage ? (
                  <img
                    src={profile.user.profileImage}
                    alt={formattedDrName}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
                    }}
                  />
                ) : (
                  <span className="font-extrabold text-[48px] text-white tracking-[-0.02em]">
                    {getInitials(formattedDrName)}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 pt-2">
                <h1 className="text-display-md font-black text-neutral-900 tracking-tighter leading-none normal-case">
                  {formattedDrName}
                </h1>
                <span className="text-ui-xs font-bold text-accent tracking-widest uppercase block">
                  {formattedSpecText}
                </span>
              </div>
            </div>
            <div className="h-[1px] bg-neutral-200 w-full mt-4" />
          </div>

          {/* Key Statistics row */}
          <div className="grid grid-cols-3 gap-0 border-y border-neutral-200 py-6 bg-white rounded-lg shadow-level-1">
            <div className="text-center border-r border-neutral-200">
              <span className="text-display-xs font-black text-neutral-900 block leading-none mb-2">
                {profile.experience}
              </span>
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">
                Years Experience
              </span>
            </div>
            <div className="text-center border-r border-neutral-200">
              <span className="text-display-xs font-black text-neutral-900 block leading-none mb-2">
                {profile.totalAppointmentsCount || '400+'}
              </span>
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">
                Sessions Completed
              </span>
            </div>
            <div className="text-center">
              <span className="text-display-xs font-black text-neutral-900 block leading-none mb-2">
                {(profile.averageRating || 0).toFixed(1)}
              </span>
              <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider block">
                Patient Rating
              </span>
            </div>
          </div>

          {/* Verified Specialist Badge and Clinic Location */}
          <div className="flex items-center gap-4 mt-2">
            {profile.verificationStatus === 'verified' && (
              <VerifiedBadge size="sm" />
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-neutral-200 flex items-center justify-center rounded-md bg-white shadow-sm">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <span className="text-ui-sm font-semibold text-neutral-700 normal-case tracking-normal">
                {toTitleCase(profile.clinicName)} · {toTitleCase(profile.clinicAddress.split(',').pop().trim())}
              </span>
            </div>
          </div>

          {/* AI Summary Section Card */}
          {aiSummary && (
            <div className="p-6 bg-white border border-neutral-200/50 rounded-lg shadow-level-1 text-left flex flex-col gap-4 mt-4 transition-warm">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <span className="text-ui-xs font-bold text-accent tracking-widest uppercase">
                  ✨ AI Summary
                </span>
                <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider">
                  Synthesized Profile
                </span>
              </div>
              <p className="text-ui-lg text-neutral-900 font-medium leading-relaxed italic">
                "{aiSummary}"
              </p>
              <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mt-2 block">
                Generated from verified professional information
              </span>
            </div>
          )}

          {/* Biography/About */}
          <div className="mt-4">
            <SectionHeader title="ABOUT" size="sm" ruled={true} className="mb-6" />
            <p className="text-ui-lg text-neutral-700 leading-relaxed font-medium whitespace-pre-line text-left">
              {displayedBio}
            </p>
            {showBioToggle && (
              <button
                type="button"
                onClick={() => setBioExpanded(!bioExpanded)}
                className="text-ui-xs font-bold text-neutral-900 hover:text-accent uppercase tracking-widest text-left select-none cursor-pointer border-0 bg-transparent mt-3 block"
              >
                {bioExpanded ? '— Read Less' : 'Read More →'}
              </button>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <SectionHeader title="PATIENT REVIEWS" size="sm" ruled={true} className="mb-6" />

            {/* Rating Summary Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border border-neutral-200/50 p-6 rounded-lg bg-white gap-6 mb-6 shadow-level-1 transition-warm">
              <div className="flex items-baseline gap-2">
                <h2 className="text-display-sm font-black text-neutral-900 tracking-tighter leading-none">
                  {(profile.averageRating || 0).toFixed(1)}
                </h2>
                <span className="text-ui-xs font-bold text-neutral-400 uppercase tracking-wider">
                  out of 5
                </span>
                <span className="text-ui-xs font-bold text-neutral-400 uppercase tracking-wider ml-2">
                  ({profile.totalReviews || 0} reviews)
                </span>
              </div>

              {/* Segmented rating bar */}
              <div className="flex items-center gap-1 shrink-0 h-6">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const ratingVal = idx + 1;
                  const isFilled = ratingVal <= Math.round(profile.averageRating || 0);
                  return (
                    <div
                      key={idx}
                      className={`w-8 h-4 border border-neutral-200 rounded-sm
                        ${isFilled ? 'bg-primary' : 'bg-neutral-50'}
                      `}
                    />
                  );
                })}
              </div>
            </div>

            {/* Reviews Stack */}
            {reviews.length === 0 ? (
              <div className="border border-neutral-200 border-dashed p-6 text-center rounded-lg text-ui-xs font-bold text-neutral-500 uppercase tracking-wider">
                No patient reviews filed yet.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {visibleReviews.map((rev) => {
                  const reviewerName = formatReviewerName(rev.patient?.name);
                  const revDate = getRelativeTimeString(rev.createdAt);
                  return (
                    <div
                      key={rev._id}
                      className="bg-white border border-neutral-200/50 p-6 rounded-lg relative text-left shadow-level-1 transition-warm"
                    >
                      {/* Rating stars */}
                      <div className="absolute top-6 right-6 flex items-center gap-0.5 select-none">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <span
                            key={idx}
                            className={`text-ui-md ${idx < rev.rating ? 'text-amber-500' : 'text-neutral-200'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <span className="text-display-sm text-accent font-black block leading-none mb-1 select-none">
                        “
                      </span>
                      <p className="text-ui-lg text-neutral-900 font-medium italic leading-relaxed mb-4 -mt-2">
                        {rev.comment}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        <span>{reviewerName}</span>
                        <span>·</span>
                        <span>{revDate}</span>
                      </div>
                    </div>
                  );
                })}

                {reviews.length > 3 && (
                  <Button
                    onClick={() => setReviewsExpanded(!reviewsExpanded)}
                    variant="secondary"
                    className="w-full font-bold mt-2"
                  >
                    {reviewsExpanded ? 'Show Fewer Reviews' : `Show All Reviews (${reviews.length}) →`}
                  </Button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Sticky Booking Column (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 lg:sticky lg:top-24 border-l border-neutral-200 pl-8 flex-col gap-6 z-10">
          <SlotPicker
            doctorId={profile._id}
            doctorName={profile.user?.name}
            consultationFee={profile.consultationFee}
          />
        </div>

      </div>

      {/* Mobile Fixed Bottom CTA Bar (lg:hidden) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-between z-40">
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">
            CONSULTATION FEE
          </span>
          <span className="text-ui-md font-black text-neutral-900 leading-none">
            ₹{new Intl.NumberFormat('en-IN').format(profile.consultationFee)} <span className="text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">/ session</span>
          </span>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowMobileBooking(true)}
          className="h-10 px-6 font-black text-ui-xs tracking-widest"
        >
          BOOK NOW →
        </Button>
      </div>

      {/* Mobile Bottom Booking Sheet */}
      {showMobileBooking && (
        <>
          {/* Dark Backdrop overlay */}
          <div 
            className="lg:hidden fixed inset-0 bg-neutral-900/60 z-[9998] transition-opacity duration-200" 
            onClick={() => setShowMobileBooking(false)}
          />
          {/* Bottom Sheet wrapper (covers lower 75% of view) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[75vh] bg-white rounded-t-[16px] border-t-2 border-neutral-900 z-[9999] flex flex-col transition-all duration-200 ease-swiss overflow-hidden shadow-level-3">
            {/* Drawer pill/bar drag handle and header */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-200">
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black text-accent tracking-widest uppercase">SELECT APPOINTMENT SLOT</span>
                <h3 className="text-ui-md font-bold text-neutral-900 uppercase">{formattedDrName}</h3>
              </div>
              <button 
                onClick={() => setShowMobileBooking(false)}
                className="text-neutral-500 hover:text-danger p-1 cursor-pointer focus:outline-none text-ui-lg font-bold"
              >
                ✕
              </button>
            </div>
            {/* Scrollable SlotPicker body */}
            <div className="flex-grow overflow-y-auto p-6">
              <SlotPicker
                doctorId={profile._id}
                doctorName={profile.user?.name}
                consultationFee={profile.consultationFee}
              />
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default DoctorDetailPage;
