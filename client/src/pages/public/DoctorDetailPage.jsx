import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  IndianRupee,
  Calendar,
  Languages,
  Award,
  BookOpen,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Shield,
  FileText
} from 'lucide-react';

import { getDoctorPublicProfileAPI } from '../../api/discovery.api';
import useAuthStore from '../../store/authStore';
import StarRating from '../../components/common/StarRating';
import VerifiedBadge from '../../components/common/VerifiedBadge';
import Button from '../../components/common/Button';
import SlotPicker from '../../components/booking/SlotPicker';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Fetch Doctor Detail Profile ──────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getDoctorPublicProfileAPI(id);
        if (res.success && res.data) {
          setProfile(res.data.profile);
          setReviews(res.data.reviews || []);
        } else {
          setError('Doctor profile not found.');
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 404) {
          setError('This doctor profile is not available or does not exist.');
        } else {
          setError('Failed to load doctor profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-pulse space-y-8 select-none">
        <div className="h-6 bg-slate-200 rounded w-24" />
        <div className="bg-white border border-slate-100 rounded-2xl p-8 flex flex-col md:flex-row gap-6 shadow-sm">
          <div className="w-28 h-28 bg-slate-200 rounded-full shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-2/3" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="h-28 bg-slate-200 rounded" />
            <div className="h-20 bg-slate-200 rounded" />
          </div>
          <div className="h-48 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center flex flex-col items-center gap-4 select-none">
        <div className="text-6xl text-slate-300">🏥</div>
        <h2 className="text-xl font-bold text-slate-800">Profile Unavailable</h2>
        <p className="text-xs text-slate-500">{error || 'This doctor detail profile could not be loaded.'}</p>
        <Button onClick={() => navigate('/doctors')} size="sm" className="mt-2 inline-flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to Listings
        </Button>
      </div>
    );
  }

  const doctorName = profile.user?.name || 'Physiotherapist';
  const avatarUrl = profile.user?.profileImage || '/default-avatar.png';

  // Dynamic Google Maps link from clinic address
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    profile.clinicAddress
  )}`;

  // ─── Booking CTA Trigger ───────────────────────────────────────────────────
  const handleBookAppointment = () => {
    const slotPickerElement = document.getElementById('clinical-slot-picker');
    if (slotPickerElement) {
      slotPickerElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      toast.info('Availability slots are not available for booking.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6 select-none pb-24 md:pb-8">
      {/* ─── Back Button Navigation ────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => navigate('/doctors')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors cursor-pointer select-none"
        >
          <ArrowLeft size={16} />
          Back to Physiotherapists Search
        </button>
      </div>

      {/* ─── Hero section (Cover + Identity Profile) ────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-card flex flex-col md:flex-row gap-6 relative overflow-hidden">
        {/* Absolute Background Shimmer Bubble */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative shrink-0 mx-auto md:mx-0">
          <img
            src={avatarUrl}
            alt={doctorName}
            className="w-28 h-28 rounded-full object-cover border-4 border-slate-50 shadow-sm"
            onError={(e) => {
              e.target.src = 'https://res.cloudinary.com/demo/image/upload/v1/doctor_docs/default-avatar.png';
            }}
          />
          {profile.isAvailable && (
            <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-3">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 justify-center md:justify-start">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Dr. {doctorName}
            </h1>
            {profile.verificationStatus === 'verified' && (
              <div className="self-center">
                <VerifiedBadge size="md" />
              </div>
            )}
          </div>

          {/* Star Rating details */}
          <div className="flex justify-center md:justify-start">
            <StarRating rating={profile.rating} count={profile.reviewCount} size="md" />
          </div>

          {/* Specialization List */}
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
            {profile.specialization.map((spec) => (
              <span
                key={spec}
                className="text-xs font-bold bg-blue-50 text-primary border border-blue-100 px-3 py-1 rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Trust Chips row */}
          <div className="flex flex-wrap gap-3 pt-2 justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200/50 px-3 py-1.5 rounded-xl">
              <Briefcase size={14} className="text-slate-400" />
              {profile.experience} Years Experience
            </span>

            {profile.languages?.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200/50 px-3 py-1.5 rounded-xl">
                <Languages size={14} className="text-slate-400" />
                Speaks: {profile.languages.join(', ')}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200/50 px-3 py-1.5 rounded-xl">
              <MessageSquare size={14} className="text-slate-400" />
              {profile.reviewCount} Total Reviews
            </span>
          </div>
        </div>

        {/* Verification Certificate File links (Admin/Doctor Own visibility check) */}
        {(user?.role === 'admin' || user?.id === profile.user?._id) && (
          <div className="absolute bottom-4 right-4 animate-pulse flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[10px] px-2.5 py-1 rounded-full">
            <Shield size={12} />
            Privileged View
          </div>
        )}
      </div>

      {/* ─── Body Details Grid (2 column) ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column (About, Qualifications, Sensitive Documents) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Scheduling / Slot Picker Section */}
          <div id="clinical-slot-picker">
            {profile.verificationStatus === 'verified' && (
              <SlotPicker
                doctorId={profile._id}
                doctorName={profile.user?.name}
                consultationFee={profile.consultationFee}
              />
            )}
          </div>
          
          {/* About Doctor */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2">
              <BookOpen size={20} className="text-primary" />
              Professional Biography
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium">
              {profile.bio}
            </p>
          </div>

          {/* Academic Qualifications details */}
          {profile.qualifications?.length > 0 && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
              <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2">
                <Award size={20} className="text-primary" />
                Degrees & Certifications
              </h2>
              <div className="flex flex-col gap-3">
                {profile.qualifications.map((qual, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="mt-1 bg-blue-100 text-primary p-1 rounded-full shrink-0">
                      <CheckCircle2 size={12} />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{qual}</p>
                      <p className="text-xs text-slate-400">Certified Professional Medical Board</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sensitive Verification Documents (Visible only to Admin or Doctor self) */}
          {(user?.role === 'admin' || user?.id === profile.user?._id) && (
            <div className="bg-rose-50/30 border border-rose-100 rounded-3xl p-6 text-left">
              <h2 className="text-base font-bold text-rose-800 mb-4 pb-2 border-b border-rose-100/50 flex items-center gap-2">
                <Shield size={18} className="text-rose-600" />
                Sensitive Credentials (Admin/Owner View Only)
              </h2>
              <p className="text-xs text-rose-600/90 mb-4 font-medium">
                These sensitive verification files are restricted from public patients.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.degreeDocument && (
                  <a
                    href={profile.degreeDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white border border-rose-200 rounded-xl p-3.5 hover:border-rose-400 transition-colors shadow-sm"
                  >
                    <FileText className="text-rose-500" size={24} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">Educational Degree</p>
                      <p className="text-[10px] text-slate-400 font-medium">Click to view document</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 ml-auto shrink-0" />
                  </a>
                )}

                {profile.licenseDocument && (
                  <a
                    href={profile.licenseDocument}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white border border-rose-200 rounded-xl p-3.5 hover:border-rose-400 transition-colors shadow-sm"
                  >
                    <FileText className="text-rose-500" size={24} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate">Medical License</p>
                      <p className="text-[10px] text-slate-400 font-medium">Click to view document</p>
                    </div>
                    <ExternalLink size={14} className="text-slate-400 ml-auto shrink-0" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Patient Reviews section (Phase 7 placeholder) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm text-left">
            <h2 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2">
              <MessageSquare size={20} className="text-primary" />
              Patient Experiences
            </h2>
            {profile.reviewCount === 0 ? (
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-8 text-center flex flex-col items-center gap-2">
                <span className="text-3xl">⭐</span>
                <p className="text-sm font-bold text-slate-700">No Patient Reviews Yet</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Treatments are starting soon. Be the first to share your experience once appointments complete!
                </p>
              </div>
            ) : (
              <div className="text-xs text-slate-500 bg-slate-50/50 p-6 rounded-2xl text-center border border-dashed border-slate-200 font-medium">
                Reviews will appear dynamically here after clinical bookings are completed.
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Clinic Location Card, Fee Summary, Book CTA) */}
        <div className="lg:col-span-1 lg:sticky lg:top-6 flex flex-col gap-6">
          
          {/* Clinic & Scheduling Card */}
          <div className="bg-white border border-slate-100 shadow-card rounded-3xl p-6 text-left flex flex-col gap-5">
            <h2 className="text-base font-bold text-slate-800 pb-2.5 border-b border-slate-50 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Clinic Logistics
            </h2>

            {/* Fee */}
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100/50">
              <div className="flex items-center gap-2">
                <IndianRupee size={16} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Consultation Fee</span>
              </div>
              <span className="text-base font-extrabold text-slate-800">
                ₹{profile.consultationFee}
              </span>
            </div>

            {/* Clinic details */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Hospital Clinic Location</p>
              
              <div className="flex items-start gap-2.5 text-xs text-slate-600 font-medium leading-relaxed">
                <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-800">{profile.clinicName}</p>
                  <p className="text-slate-500 mt-1">{profile.clinicAddress}</p>
                </div>
              </div>
            </div>

            {/* Google Maps link */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-xs font-extrabold text-primary hover:underline transition-all cursor-pointer self-start"
            >
              View Clinic on Google Maps
              <ExternalLink size={12} />
            </a>

            {/* Primary Action Booking Button */}
            <Button
              onClick={handleBookAppointment}
              className="w-full py-3 font-extrabold shadow-md flex items-center justify-center gap-2 text-sm shrink-0"
            >
              <Calendar size={16} />
              Book Clinical Appointment
            </Button>

            <div className="text-[10px] text-slate-400 text-center font-medium leading-relaxed">
              * Platforms secure 10% processing commission fees. Zero cancellation penalties up to 24 hours in advance.
            </div>
          </div>

          {/* Proximity / Spatial Locator Note (Geospatial metadata preview) */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100/30 border border-slate-200/60 rounded-3xl p-5 text-left flex items-start gap-3">
            <Sparkles className="text-primary shrink-0 mt-0.5" size={16} />
            <div>
              <p className="text-xs font-bold text-slate-700">Theralign Proximity Index</p>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-medium">
                Clinic verified at geospatial position <b>[{profile.clinicLocation.coordinates.join(', ')}]</b>. Matches local Pune neighborhoods correctly.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ─── Sticky Bottom Bar (Mobile Screens Friendly Booking) ───────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200/80 px-5 py-4 flex items-center justify-between shadow-2xl md:hidden z-40 select-none animate-slideUp">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Consult Fee</p>
          <p className="text-base font-extrabold text-slate-800">₹{profile.consultationFee}</p>
        </div>
        <Button onClick={handleBookAppointment} size="sm" className="font-extrabold shadow-md px-6">
          Book Appointment
        </Button>
      </div>

    </div>
  );
};

export default DoctorDetailPage;
