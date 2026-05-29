import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { getDoctorPublicProfileAPI } from '../../api/discovery.api';
import { getDoctorAISummaryAPI } from '../../api/ai.api';
import useAuthStore from '../../store/authStore';
import SectionHeader from '../../components/common/SectionHeader';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import Button from '../../components/common/Button';
import SlotPicker from '../../components/booking/SlotPicker';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [aiSummary, setAiSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Read bio read-more state
  const [bioExpanded, setBioExpanded] = useState(false);

  // Reviews expansion
  const [reviewsExpanded, setReviewsExpanded] = useState(false);

  // Fetch Doctor Profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setAiSummary(null);
      try {
        const res = await getDoctorPublicProfileAPI(id);
        if (res.success && res.data) {
          setProfile(res.data.profile);
          setReviews(res.data.reviews || []);
          fetchAISummary(res.data.profile._id);
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

    const fetchAISummary = async (doctorId) => {
      setSummaryLoading(true);
      try {
        const res = await getDoctorAISummaryAPI(doctorId);
        if (res.success && res.data?.aiSummary) {
          setAiSummary(res.data.aiSummary);
        }
      } catch (err) {
        console.warn('AI summary fetch failed:', err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  useEffect(() => {
    if (profile) {
      document.title = `DR. ${profile.user?.name || 'PHYSIOTHERAPIST'} — KINETIQ`;
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="max-w-page mx-auto py-12 px-6 animate-pulse space-y-8 select-none">
        <div className="h-6 bg-swiss-gray-100 w-24 rounded-none" />
        <div className="h-48 bg-swiss-gray-100 w-full rounded-none" />
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-7 space-y-6">
            <div className="h-10 bg-swiss-gray-100 w-3/4 rounded-none" />
            <div className="h-6 bg-swiss-gray-100 w-1/2 rounded-none" />
            <div className="h-32 bg-swiss-gray-100 w-full rounded-none" />
          </div>
          <div className="col-span-5 h-64 bg-swiss-gray-100 rounded-none" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-left flex flex-col gap-4 select-none">
        <h2 className="text-display-sm font-black text-swiss-red uppercase tracking-tighter leading-none">
          PROFILE UNAVAILABLE
        </h2>
        <p className="text-ui-md text-swiss-gray-600 font-medium">{error || 'This doctor profile is currently offline.'}</p>
        <Button onClick={() => navigate('/doctors')} variant="primary" className="self-start">
          ← BACK TO SEARCH
        </Button>
      </div>
    );
  }

  const doctorName = profile.user?.name || 'Physiotherapist';

  // Format spec
  const specText = Array.isArray(profile.specialization)
    ? profile.specialization.join(', ')
    : profile.specialization || 'GENERAL PHYSIOTHERAPY';

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
    <div className="max-w-page mx-auto py-12 px-6 flex flex-col select-none bg-swiss-white">
      {/* Back to Discovery */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/doctors')}
          className="inline-flex items-center gap-2 text-ui-xs font-black text-swiss-gray-400 hover:text-swiss-black uppercase tracking-widest cursor-pointer select-none bg-transparent border-0"
        >
          <ArrowLeft size={16} />
          ← BACK TO DOCTOR DISCOVERY
        </button>
      </div>

      {/* ─── D3.3 Asymmetric 7:5 layout split ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-8 text-left pr-4">
          
          {/* Identity Section */}
          <div className="flex flex-col gap-3">
            <h1 className="text-display-md font-black text-swiss-black uppercase tracking-tighter leading-none mb-1">
              DR. {doctorName}
            </h1>
            <span className="text-ui-xs font-black text-swiss-red tracking-widest uppercase block">
              {specText}
            </span>
            <div className="h-[1px] bg-swiss-gray-200 w-full mt-4" />
          </div>

          {/* Key Statistics row divided by thin vertical lines */}
          <div className="grid grid-cols-3 gap-0 border-y-2 border-swiss-black py-6">
            <div className="text-center border-r-2 border-swiss-gray-200">
              <span className="text-display-xs font-black text-swiss-black block leading-none mb-2">
                {profile.experience}
              </span>
              <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block">
                YEARS EXPERIENCE
              </span>
            </div>
            <div className="text-center border-r-2 border-swiss-gray-200">
              <span className="text-display-xs font-black text-swiss-black block leading-none mb-2">
                {profile.totalAppointmentsCount || '400+'}
              </span>
              <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block">
                SESSIONS COMPLETED
              </span>
            </div>
            <div className="text-center">
              <span className="text-display-xs font-black text-swiss-black block leading-none mb-2">
                {(profile.averageRating || 0).toFixed(1)}
              </span>
              <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block">
                PATIENT RATING
              </span>
            </div>
          </div>

          {/* Verified Specialist Badge and Clinic Location */}
          <div className="flex items-center gap-4 mt-2">
            {profile.verificationStatus === 'verified' && (
              <VerifiedBadge size="sm" />
            )}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-swiss-black flex items-center justify-center rounded-none bg-swiss-white">
                <MapPin className="h-4 w-4 text-swiss-black" />
              </div>
              <span className="text-ui-sm font-bold text-swiss-gray-600 uppercase tracking-wider">
                {profile.clinicName.toUpperCase()} · {profile.clinicAddress.split(',').pop().trim().toUpperCase()}
              </span>
            </div>
          </div>

          {/* AI Summary Section Card with diagonal pattern */}
          {(summaryLoading || aiSummary) && (
            <div className="p-6 bg-swiss-gray-100 border-2 border-swiss-black rounded-none shadow-none text-left flex flex-col gap-4 swiss-diagonal mt-4">
              <div className="flex items-center justify-between pb-2 border-b border-swiss-gray-200">
                <span className="text-ui-xs font-black text-swiss-red uppercase tracking-widest">
                  ✨ AI SUMMARY
                </span>
                <span className="text-[9px] font-bold text-swiss-gray-400 uppercase tracking-widest">
                  SYNTHESIZED PROFILE
                </span>
              </div>
              {summaryLoading ? (
                <div className="h-12 w-full animate-pulse bg-swiss-gray-200 rounded-none" />
              ) : (
                <p className="text-ui-lg text-swiss-black font-medium leading-relaxed italic">
                  "{aiSummary}"
                </p>
              )}
              <span className="text-[9px] font-bold text-swiss-gray-400 uppercase tracking-widest mt-2 block">
                Generated from verified professional information
              </span>
            </div>
          )}

          {/* Biography/About */}
          <div className="mt-4">
            <SectionHeader title="ABOUT" size="sm" ruled={true} className="mb-6" />
            <p className="text-ui-lg text-swiss-gray-600 leading-relaxed font-medium whitespace-pre-line text-left">
              {displayedBio}
            </p>
            {showBioToggle && (
              <button
                type="button"
                onClick={() => setBioExpanded(!bioExpanded)}
                className="text-ui-xs font-black text-swiss-black hover:text-swiss-red uppercase tracking-widest text-left select-none cursor-pointer border-0 bg-transparent mt-3 block"
              >
                {bioExpanded ? '— READ LESS' : 'READ MORE →'}
              </button>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <SectionHeader title="PATIENT REVIEWS" size="sm" ruled={true} className="mb-6" />

            {/* Rating Summary Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-2 border-swiss-black p-6 rounded-none bg-swiss-white gap-6 mb-6">
              <div className="flex items-baseline gap-2">
                <h2 className="text-display-sm font-black text-swiss-black tracking-tighter leading-none">
                  {(profile.averageRating || 0).toFixed(1)}
                </h2>
                <span className="text-ui-xs font-black text-swiss-gray-400 uppercase tracking-widest">
                  OUT OF 5
                </span>
                <span className="text-ui-xs font-black text-swiss-gray-400 uppercase tracking-widest ml-2">
                  ({profile.totalReviews || 0} REVIEWS)
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
                      className={`w-8 h-4 border-2 border-swiss-black rounded-none
                        ${isFilled ? 'bg-swiss-black' : 'bg-swiss-white'}
                      `}
                    />
                  );
                })}
              </div>
            </div>

            {/* Reviews Stack */}
            {reviews.length === 0 ? (
              <div className="border-2 border-swiss-black border-dashed p-10 text-center rounded-none text-ui-xs font-bold text-swiss-gray-400 uppercase tracking-widest">
                NO PATIENT REVIEWS FILED YET.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {visibleReviews.map((rev) => {
                  const reviewerName = rev.patient?.name || 'Anonymous';
                  const revDate = new Date(rev.createdAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    year: 'numeric',
                  });
                  return (
                    <div
                      key={rev._id}
                      className="bg-swiss-white border-2 border-swiss-black p-6 rounded-none relative text-left"
                    >
                      {/* Rating square in top-right corner */}
                      <div className="absolute top-6 right-6 w-8 h-8 border-2 border-swiss-black flex items-center justify-center text-ui-sm font-black text-swiss-black bg-swiss-white rounded-none select-none">
                        {rev.rating}
                      </div>

                      <span className="text-display-sm text-swiss-red font-black block leading-none mb-1 select-none">
                        “
                      </span>
                      <p className="text-ui-lg text-swiss-black font-medium italic leading-relaxed mb-4 -mt-2">
                        {rev.comment}
                      </p>

                      <div className="flex items-center gap-2 text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
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
                    className="w-full font-black mt-2"
                  >
                    {reviewsExpanded ? 'SHOW FEWER REVIEWS' : `SHOW ALL REVIEWS (${reviews.length}) →`}
                  </Button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Sticky Booking Column (5 Columns) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 border-t-2 border-swiss-black lg:border-t-0 lg:border-l-2 lg:border-swiss-black lg:pl-12 pt-8 lg:pt-0 z-10 flex flex-col gap-6">
          <SlotPicker
            doctorId={profile._id}
            doctorName={profile.user?.name}
            consultationFee={profile.consultationFee}
          />
        </div>

      </div>
    </div>
  );
};

export default DoctorDetailPage;
