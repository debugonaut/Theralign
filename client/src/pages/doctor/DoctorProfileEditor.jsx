import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ChevronRight,
  ChevronLeft,
  Save,
  MapPin,
  Sparkles,
  Stethoscope,
  Info,
  AlertTriangle,
} from 'lucide-react';

import Button from '../../components/common/Button';
import FileUploadZone from '../../components/common/FileUploadZone';
import { onboardDoctorAPI, getDoctorProfileAPI } from '../../api/doctor.api';
import useAuthStore from '../../store/authStore';

const COMMON_SPECIALIZATIONS = [
  'Sports Injury Rehab',
  'Orthopedic Physiotherapy',
  'Neurological Rehabilitation',
  'Geriatric Care',
  'Pediatric Physiotherapy',
  'Cardiopulmonary Rehab',
  'Dry Needling',
  'Manual Therapy',
  'Vestibular Rehabilitation',
];

const DoctorProfileEditor = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);

  // ─── Form State ────────────────────────────────────────────────────────────
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [specializations, setSpecializations] = useState([]);
  const [customSpecialization, setCustomSpecialization] = useState('');

  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [latitude, setLatitude] = useState('12.9716'); // Default Bangalore coordinates
  const [longitude, setLongitude] = useState('77.5946');
  const [consultationFee, setConsultationFee] = useState('');

  const [degreeFile, setDegreeFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  // Fetch existing profile if any
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getDoctorProfileAPI();
        if (res.success && res.data.profile) {
          const profile = res.data.profile;
          setExistingProfile(profile);

          // Populate text fields
          setBio(profile.bio || '');
          setExperience(profile.experience ? profile.experience.toString() : '');
          setRegistrationNumber(profile.registrationNumber || '');
          setSpecializations(profile.specialization || []);
          setClinicName(profile.clinicName || '');
          setClinicAddress(profile.clinicAddress || '');
          setConsultationFee(profile.consultationFee ? profile.consultationFee.toString() : '');

          if (profile.clinicLocation && profile.clinicLocation.coordinates) {
            setLongitude(profile.clinicLocation.coordinates[0].toString());
            setLatitude(profile.clinicLocation.coordinates[1].toString());
          }
        }
      } catch (err) {
        console.error('Failed to load existing doctor profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const handleToggleSpecialization = (spec) => {
    if (specializations.includes(spec)) {
      setSpecializations(specializations.filter((s) => s !== spec));
    } else {
      setSpecializations([...specializations, spec]);
    }
  };

  const handleAddCustomSpecialization = (e) => {
    e.preventDefault();
    const formatted = customSpecialization.trim();
    if (!formatted) return;

    if (!specializations.includes(formatted)) {
      setSpecializations([...specializations, formatted]);
    }
    setCustomSpecialization('');
  };

  const handleRemoveSpecialization = (spec) => {
    setSpecializations(specializations.filter((s) => s !== spec));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    toast.loading('Fetching GPS coordinates...', { id: 'gps' });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        toast.success('Location fetched successfully!', { id: 'gps' });
      },
      (error) => {
        console.error('GPS error:', error);
        toast.error('Unable to fetch your location automatically.', { id: 'gps' });
      }
    );
  };

  // ─── Step Validations ──────────────────────────────────────────────────────
  const isStepValid = () => {
    if (currentStep === 1) {
      return (
        bio.trim().length >= 50 &&
        experience.trim() !== '' &&
        !isNaN(parseInt(experience)) &&
        registrationNumber.trim() !== '' &&
        specializations.length > 0
      );
    }
    if (currentStep === 2) {
      return (
        clinicName.trim() !== '' &&
        clinicAddress.trim() !== '' &&
        latitude.trim() !== '' &&
        !isNaN(parseFloat(latitude)) &&
        longitude.trim() !== '' &&
        !isNaN(parseFloat(longitude)) &&
        consultationFee.trim() !== '' &&
        !isNaN(parseFloat(consultationFee))
      );
    }
    if (currentStep === 3) {
      // For updates, they might keep existing documents
      if (existingProfile) return true;
      return degreeFile !== null && licenseFile !== null;
    }
    return false;
  };

  const handleNext = () => {
    if (isStepValid()) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    } else {
      toast.error('Please fill all required fields correctly before moving to the next step.');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo(0, 0);
  };

  // ─── Final Submit ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isStepValid()) {
      toast.error('Form contains incomplete fields.');
      return;
    }

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('experience', experience);
    formData.append('registrationNumber', registrationNumber);
    formData.append('specialization', JSON.stringify(specializations));
    formData.append('clinicName', clinicName);
    formData.append('clinicAddress', clinicAddress);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('consultationFee', consultationFee);

    if (degreeFile) {
      formData.append('degreeDocument', degreeFile);
    }
    if (licenseFile) {
      formData.append('licenseDocument', licenseFile);
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting your professional profile...');

    try {
      const res = await onboardDoctorAPI(formData);
      if (res.success) {
        toast.success('Onboarding profile submitted for review!', { id: toastId });
        navigate('/doctor/dashboard');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Submission failed. Please check your inputs.', {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-slate-500 font-medium">Loading profile details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* ─── Breadcrumbs Header ──────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Complete Professional Onboarding</h1>
        <p className="text-slate-500 mt-2">
          Verify your physical clinic details and professional medical license to begin accepting bookings.
        </p>
      </div>

      {/* ─── Warning Banner for Verified Profiles ────────────────────────── */}
      {existingProfile?.verificationStatus === 'verified' && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold">Security Warning</p>
            <p className="text-sm text-amber-700/90 mt-1">
              Your professional profile is currently **Verified**. If you modify credentials, upload new documents,
              or change key medical fields, your verification status will be reset to **Pending Review** to prevent credential abuse.
            </p>
          </div>
        </div>
      )}

      {/* ─── Stepper Indicators ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-10 bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              currentStep === 1
                ? 'bg-primary text-white ring-4 ring-blue-100'
                : currentStep > 1
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            1
          </div>
          <span
            className={`text-sm font-semibold ${
              currentStep === 1 ? 'text-primary' : 'text-slate-500'
            }`}
          >
            Professional Details
          </span>
        </div>

        <div className="h-0.5 flex-1 bg-slate-100 mx-4 max-w-[80px]" />

        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              currentStep === 2
                ? 'bg-primary text-white ring-4 ring-blue-100'
                : currentStep > 2
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            2
          </div>
          <span
            className={`text-sm font-semibold ${
              currentStep === 2 ? 'text-primary' : 'text-slate-500'
            }`}
          >
            Clinic Location & Fees
          </span>
        </div>

        <div className="h-0.5 flex-1 bg-slate-100 mx-4 max-w-[80px]" />

        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              currentStep === 3
                ? 'bg-primary text-white ring-4 ring-blue-100'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            3
          </div>
          <span
            className={`text-sm font-semibold ${
              currentStep === 3 ? 'text-primary' : 'text-slate-500'
            }`}
          >
            Credentials & Uploads
          </span>
        </div>
      </div>

      {/* ─── Form Card ───────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8">
        {/* ─── Step 1: Professional Details ─── */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="text-primary" size={22} />
              Professional Background
            </h2>

            {/* Registration License Number */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Medical License Registration Number *
              </label>
              <input
                type="text"
                placeholder="e.g. MCI-REG-123456"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all font-mono"
              />
              <p className="text-xs text-slate-400 mt-1">
                This is your official state/national medical council registration number.
              </p>
            </div>

            {/* Years of Experience */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Years of Active Practice Experience *
              </label>
              <input
                type="number"
                placeholder="e.g. 8"
                min="0"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Specializations selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Specializations *
              </label>

              {/* Tag Pill lists */}
              <div className="flex flex-wrap gap-2 mb-4">
                {COMMON_SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleToggleSpecialization(spec)}
                    className={`text-xs px-3.5 py-2 rounded-full font-semibold border transition-all ${
                      specializations.includes(spec)
                        ? 'bg-blue-50 text-primary border-primary'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>

              {/* Add custom tag */}
              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Add custom specialization..."
                  value={customSpecialization}
                  onChange={(e) => setCustomSpecialization(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all text-sm"
                />
                <Button
                  onClick={handleAddCustomSpecialization}
                  variant="secondary"
                  size="sm"
                  className="shrink-0"
                >
                  Add tag
                </Button>
              </div>

              {/* Custom tags rendered */}
              {specializations.some((s) => !COMMON_SPECIALIZATIONS.includes(s)) && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {specializations
                    .filter((s) => !COMMON_SPECIALIZATIONS.includes(s))
                    .map((spec) => (
                      <span
                        key={spec}
                        className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-medium"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(spec)}
                          className="text-slate-400 hover:text-slate-600 font-bold ml-0.5"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>

            {/* Biography */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Professional Biography *
              </label>
              <textarea
                placeholder="Share your expertise, treatment philosophy, academic achievements, and patient care approach... (Minimum 50 characters)"
                rows={5}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all text-sm leading-relaxed"
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-slate-400">
                  Must be between 50 and 1000 characters.
                </span>
                <span
                  className={`text-xs font-semibold ${
                    bio.trim().length < 50
                      ? 'text-rose-500'
                      : bio.trim().length > 1000
                      ? 'text-rose-500'
                      : 'text-emerald-500'
                  }`}
                >
                  {bio.trim().length} chars
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 2: Clinic Location & Fees ─── */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="text-primary" size={22} />
              Clinic Details & Fees
            </h2>

            {/* Clinic Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Clinic / Hospital Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Apex Sports & Ortho Rehabilitation"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Clinic Address */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Physical Address *
              </label>
              <input
                type="text"
                placeholder="e.g. 452, 100 Feet Road, Indiranagar, Bangalore"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Consultation Fee (₹) *
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                min="0"
                value={consultationFee}
                onChange={(e) => setConsultationFee(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            {/* Clinic Coordinates for proximity searches */}
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-700">Geospatial Clinic Coordinates</h3>
                  <p className="text-xs text-slate-400">
                    Required for Patients to find your clinic in proximity-based searches.
                  </p>
                </div>
                <Button
                  onClick={handleGetLocation}
                  variant="secondary"
                  size="sm"
                  className="inline-flex gap-1.5 items-center font-bold text-xs"
                >
                  <MapPin size={14} className="text-primary animate-pulse" />
                  Auto-Detect GPS
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              {/* Map Placement Box */}
              <div className="mt-4 h-32 rounded-lg bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                <span className="text-sm font-semibold text-slate-500">Theralign Spatial Locator</span>
                <span className="text-xs max-w-sm">
                  Proximity search queries will index your location at latitude: {latitude}, longitude: {longitude}.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Step 3: Credentials & Uploads ─── */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="text-primary" size={22} />
              Medical Credentials Upload
            </h2>

            <p className="text-sm text-slate-500">
              Please upload high-resolution images (JPEG/PNG) or PDFs of your official certificates.
              Our admin review board will manually verify these credentials.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadZone
                label="Educational Degree Certificate *"
                accept="image/*,application/pdf"
                maxSizeMB={5}
                onFileSelect={(file) => setDegreeFile(file)}
                selectedFile={degreeFile}
                previewUrl={existingProfile?.degreeDocument}
              />

              <FileUploadZone
                label="Medical Council Practice License *"
                accept="image/*,application/pdf"
                maxSizeMB={5}
                onFileSelect={(file) => setLicenseFile(file)}
                selectedFile={licenseFile}
                previewUrl={existingProfile?.licenseDocument}
              />
            </div>

            <div className="p-4 bg-blue-50 border border-blue-100 text-blue-800 rounded-xl flex items-start gap-2.5 mt-4 text-xs leading-relaxed">
              <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
              <span>
                By submitting this form, you verify that all provided credentials, licenses, and clinic locations are correct.
                Falsifying information will result in permanent platform suspension.
              </span>
            </div>
          </div>
        )}

        {/* ─── Control Buttons ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-slate-100 mt-10 pt-6">
          {currentStep > 1 ? (
            <Button
              onClick={handleBack}
              variant="secondary"
              className="inline-flex items-center gap-1"
              disabled={isSubmitting}
            >
              <ChevronLeft size={16} /> Back
            </Button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              className="inline-flex items-center gap-1"
            >
              Next <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid()}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md font-bold focus:ring-emerald-500"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Save size={16} /> Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileEditor;
