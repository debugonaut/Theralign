import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDoctorProfileAPI, onboardDoctorAPI } from '../../api/doctor.api';
import useAuthStore from '../../store/authStore';
import SectionHeader from '../../components/common/SectionHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const DoctorProfileEditor = () => {
  const navigate = useNavigate();
  const { user, setCredentials } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // ─── Form States ───
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [specializationText, setSpecializationText] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [address, setAddress] = useState('');
  const [consultationFee, setConsultationFee] = useState('');

  // Physical files states
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [degreeFile, setDegreeFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  // ─── City coordinate lookup ───
  const CITY_COORDS = {
    pune:      { lat: '18.5204', lng: '73.8567' },
    mumbai:    { lat: '19.0760', lng: '72.8777' },
    bangalore: { lat: '12.9716', lng: '77.5946' },
    delhi:     { lat: '28.6139', lng: '77.2090' },
    hyderabad: { lat: '17.3850', lng: '78.4867' },
  };
  const getCityCoords = (cityVal) => {
    const key = (cityVal || 'pune').toLowerCase();
    return CITY_COORDS[key] || CITY_COORDS.pune;
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const res = await getDoctorProfileAPI();
      if (res.success && res.data?.profile) {
        const p = res.data.profile;
        setProfile(p);

        // Populate Form States
        setName(p.user?.name || '');
        
        // Strip prefix if any
        let rawPhone = p.user?.phone || '';
        if (rawPhone.startsWith('+91')) {
          rawPhone = rawPhone.replace('+91', '').trim();
        }
        setPhone(rawPhone);

        setBio(p.bio || '');
        setExperience(p.experience ? p.experience.toString() : '');
        setRegistrationNumber(p.registrationNumber || '');
        setSpecializationText(p.specialization ? p.specialization.join(', ') : '');
        setClinicName(p.clinicName || '');
        setConsultationFee(p.consultationFee ? p.consultationFee.toString() : '');

        // Parse address
        const fullAddr = p.clinicAddress || '';
        const parts = fullAddr.split(',').map((s) => s.trim());
        if (parts.length >= 3) {
          setStateName(parts.pop());
          setCity(parts.pop());
          setAddress(parts.join(', '));
        } else {
          setAddress(fullAddr);
          setCity('');
          setStateName('');
        }

        setProfilePhotoPreview(p.user?.profileImage || '');
      } else {
        setName(user?.name || '');
        let rawPhone = user?.phone || '';
        if (rawPhone.startsWith('+91')) {
          rawPhone = rawPhone.replace('+91', '').trim();
        }
        setPhone(rawPhone);
        setProfilePhotoPreview(user?.profileImage || '');
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO FETCH PROFILE SETTINGS.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'MY PROFILE — Theralign';
    fetchProfileData();
  }, []);

  const handleDiscard = () => {
    // Reset all forms to database values
    if (profile) {
      setName(profile.user?.name || '');
      
      let rawPhone = profile.user?.phone || '';
      if (rawPhone.startsWith('+91')) {
        rawPhone = rawPhone.replace('+91', '').trim();
      }
      setPhone(rawPhone);

      setBio(profile.bio || '');
      setExperience(profile.experience ? profile.experience.toString() : '');
      setRegistrationNumber(profile.registrationNumber || '');
      setSpecializationText(profile.specialization ? profile.specialization.join(', ') : '');
      setClinicName(profile.clinicName || '');
      setConsultationFee(profile.consultationFee ? profile.consultationFee.toString() : '');

      const fullAddr = profile.clinicAddress || '';
      const parts = fullAddr.split(',').map((s) => s.trim());
      if (parts.length >= 3) {
        setStateName(parts.pop());
        setCity(parts.pop());
        setAddress(parts.join(', '));
      } else {
        setAddress(fullAddr);
        setCity('');
        setStateName('');
      }

      setProfilePhotoPreview(profile.user?.profileImage || '');
      setProfilePhotoFile(null);
      setDegreeFile(null);
      setLicenseFile(null);
      toast.success('CHANGES DISCARDED.');
    }
  };

  // Check Dirty State
  const dbClinicAddress = profile?.clinicAddress || '';
  const currentClinicAddress = `${address}${city ? `, ${city}` : ''}${stateName ? `, ${stateName}` : ''}`;
  
  const isDirty = !profile ? (
    name.trim() !== '' ||
    phone.trim() !== '' ||
    bio.trim() !== '' ||
    experience.trim() !== '' ||
    registrationNumber.trim() !== '' ||
    specializationText.trim() !== '' ||
    clinicName.trim() !== '' ||
    currentClinicAddress.trim() !== '' ||
    consultationFee.trim() !== '' ||
    profilePhotoFile !== null ||
    degreeFile !== null ||
    licenseFile !== null
  ) : (
    name !== (profile.user?.name || '') ||
    phone !== (profile.user?.phone || '').replace('+91', '').trim() ||
    bio !== (profile.bio || '') ||
    experience !== (profile.experience?.toString() || '') ||
    registrationNumber !== (profile.registrationNumber || '') ||
    specializationText !== (profile.specialization?.join(', ') || '') ||
    clinicName !== (profile.clinicName || '') ||
    currentClinicAddress !== dbClinicAddress ||
    consultationFee !== (profile.consultationFee?.toString() || '') ||
    profilePhotoFile !== null ||
    degreeFile !== null ||
    licenseFile !== null
  );

  const handlePhotoUploadChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        toast.error('JPG OR PNG IMAGES ONLY.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('MAXIMUM IMAGE SIZE IS 5MB.');
        return;
      }
      setProfilePhotoFile(file);
      setProfilePhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDegreeChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('DEGREE PDF SIZE CANNOT EXCEED 5MB.');
        return;
      }
      setDegreeFile(file);
    }
  };

  const handleLicenseChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('LICENSE PDF SIZE CANNOT EXCEED 5MB.');
        return;
      }
      setLicenseFile(file);
    }
  };

  const handleSave = async () => {
    // Validations
    if (!name.trim()) {
      toast.error('FULL NAME IS REQUIRED.');
      return;
    }
    if (bio.trim().length < 50) {
      toast.error('PROFESSIONAL BIO MUST BE AT LEAST 50 CHARACTERS.');
      return;
    }
    if (!experience.trim() || isNaN(parseInt(experience))) {
      toast.error('EXPERIENCE YEARS MUST BE A VALID NUMBER.');
      return;
    }
    if (!consultationFee.trim() || isNaN(parseFloat(consultationFee))) {
      toast.error('CONSULTATION FEE MUST BE A VALID NUMBER.');
      return;
    }
    if (!specializationText.trim()) {
      toast.error('SPECIALIZATION FIELD IS REQUIRED.');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('SAVING CLINICAL PROFILE CHANGES...');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      
      const cleanPhone = phone.trim();
      formData.append('phone', cleanPhone ? `+91 ${cleanPhone}` : '');
      
      formData.append('bio', bio.trim());
      formData.append('experience', parseInt(experience, 10));
      formData.append('registrationNumber', registrationNumber.trim());

      // Parse specialization text back to stringified JSON array
      const specList = specializationText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      formData.append('specialization', JSON.stringify(specList));

      formData.append('clinicName', clinicName.trim());
      formData.append('clinicAddress', currentClinicAddress);
      
      // Use actual city coordinates instead of hardcoded defaults
      const coords = getCityCoords(city);
      formData.append('latitude', coords.lat);
      formData.append('longitude', coords.lng);

      formData.append('consultationFee', parseFloat(consultationFee));

      if (profilePhotoFile) {
        formData.append('profileImage', profilePhotoFile);
      }
      if (degreeFile) {
        formData.append('degreeDocument', degreeFile);
      }
      if (licenseFile) {
        formData.append('licenseDocument', licenseFile);
      }

      const res = await onboardDoctorAPI(formData);
      if (res.success && res.data?.profile) {
        toast.success('PROFILE SAVED AND RESET TO PENDING REVIEW.', { id: toastId });
        
        // Sync Zustand Auth Store credentials
        const updatedUser = res.data.profile.user;
        const storedToken = localStorage.getItem('theralign_token');
        if (storedToken && updatedUser) {
          setCredentials(updatedUser, storedToken);
        }

        fetchProfileData();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'FAILED TO SAVE PROFILE CHANGES.', { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center text-ui-xs font-bold text-neutral-500 uppercase tracking-widest bg-white">
        LOADING PRACTITIONER SETTINGS PANELS...
      </div>
    );
  }

  const isVerified = profile?.verificationStatus === 'verified';
  const currentStatus = profile?.verificationStatus || 'pending';
  // 0: SUBMITTED, 1: UNDER REVIEW, 2: APPROVED, 3: ACTIVE
  let activeStep = 0;
  if (currentStatus === 'pending') activeStep = 1;
  if (currentStatus === 'verified') activeStep = 3;

  const steps = [
    { key: 'submitted', label: 'Submitted', desc: 'Application received and registered.' },
    { key: 'review', label: 'Under Review', desc: 'Credential verification in progress.' },
    { key: 'approved', label: 'Approved', desc: 'Credentials verified successfully.' },
    { key: 'active', label: 'Active', desc: 'Profile live in search directory.' },
  ];

  return (
    <div className="flex flex-col gap-12 select-none text-left bg-neutral-50 pb-32 px-6 py-8 page-fade-in">
      
      {/* ── Page Header ── */}
      <div>
        <SectionHeader title="My Profile" size="lg" ruled={true} className="mb-0" />
        <p className="text-ui-sm text-neutral-500 font-semibold uppercase tracking-wider mt-3">
          Configure your professional clinical parameters, update coordinates, set fee charts, and submit license files.
        </p>
      </div>

      {/* ── PERSONAL INFORMATION ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="Personal Information" size="sm" ruled={true} className="mb-0" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <Input
            type="text"
            label="Full Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Smith"
          />

          {/* Email (Disabled, Read-only) */}
          <div className="flex flex-col gap-1.5">
            <Input
              type="email"
              label="Email Address"
              value={profile?.user?.email || user?.email || ''}
              disabled={true}
              showLock={true}
              placeholder="you@example.com"
            />
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
              Email cannot be changed. Contact support if needed.
            </span>
          </div>
        </div>

        {/* Phone Input with Internal prefix line */}
        <div className="flex flex-col gap-1.5 w-full md:w-1/2">
          <label className="text-[12px] font-semibold text-neutral-700">
            Phone Number *
          </label>
          <div className="flex border border-neutral-200 rounded-md bg-white focus-within:ring-3 focus-within:ring-primary/12 focus-within:border-primary transition-all h-10 overflow-hidden shadow-sm">
            <div className="bg-neutral-100 px-3.5 border-r border-neutral-200 font-bold text-ui-sm text-neutral-500 flex items-center select-none shrink-0">
              +91
            </div>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="e.g. 9876543210"
              className="flex-1 px-3 text-ui-sm font-semibold text-neutral-900 focus:outline-none bg-transparent border-0"
              required
            />
          </div>
        </div>
      </div>

      {/* ── PROFESSIONAL DETAILS ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="Professional Details" size="sm" ruled={true} className="mb-0" />
        
        {/* Specialization Comma field */}
        <Input
          type="text"
          label="Specialization (Separate multiple with commas) *"
          value={specializationText}
          onChange={(e) => setSpecializationText(e.target.value)}
          placeholder="e.g. Sports Physiotherapy, Manual Therapy, Dry Needling"
          required
        />

        {/* Years experience narrow input */}
        <div className="w-[240px]">
          <Input
            type="number"
            label="Years of Practice Experience *"
            min="0"
            max="60"
            value={experience}
            onChange={(e) => setExperience(e.target.value.replace(/\D/g, ''))}
            required
            placeholder="e.g. 5"
          />
        </div>

        {/* Professional Bio with char counter */}
        <div className="flex flex-col gap-1.5">
          <Input
            multiline={true}
            rows={5}
            label="Professional Bio *"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={1000}
            placeholder="Describe your treatment philosophy, academic experience, and physiotherapist patient care methods..."
            required
          />
          <span className="text-[10px] font-bold text-neutral-400 text-right uppercase tracking-wider">
            {bio.length} / 1000 characters (minimum 50 chars)
          </span>
        </div>
      </div>

      {/* ── CLINIC DETAILS ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="Clinic Details" size="sm" ruled={true} className="mb-0" />
        
        {/* Clinic Name */}
        <Input
          type="text"
          label="Clinic Name *"
          value={clinicName}
          onChange={(e) => setClinicName(e.target.value)}
          placeholder="e.g. Metro Physio Clinic"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City */}
          <Input
            type="text"
            label="City *"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Pune"
            required
          />

          {/* State */}
          <Input
            type="text"
            label="State *"
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            placeholder="e.g. Maharashtra"
            required
          />
        </div>

        {/* Address */}
        <Input
          multiline={true}
          rows={3}
          label="Street Address *"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter complete clinic street address..."
          required
        />
      </div>

      {/* ── CONSULTATION FEE ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="Consultation Fee" size="sm" ruled={true} className="mb-0" />
        
        <div className="flex flex-col gap-1.5 w-[240px]">
          <label className="text-[12px] font-semibold text-neutral-700">
            Consultation Fee Per Session *
          </label>
          <div className="flex border border-neutral-200 rounded-md bg-white focus-within:ring-3 focus-within:ring-primary/12 focus-within:border-primary transition-all h-10 overflow-hidden shadow-sm">
            <div className="bg-neutral-100 px-3.5 border-r border-neutral-200 font-bold text-ui-sm text-neutral-500 flex items-center select-none shrink-0">
              ₹
            </div>
            <input
              type="number"
              min="0"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value.replace(/\D/g, ''))}
              className="flex-1 px-3 text-ui-sm font-semibold text-neutral-900 focus:outline-none bg-transparent border-0"
              required
            />
          </div>
        </div>
        <p className="text-[11px] text-neutral-500 font-medium">
          This amount is shown to patients on your profile and at booking. You can update it at any time.
        </p>
      </div>

      {/* ── PROFILE PHOTO ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="Profile Photo" size="sm" ruled={true} className="mb-0" />
        
        <div className="flex items-center gap-6">
          {/* Bordered Square Preview 120x120 */}
          <div className="w-[120px] h-[120px] border border-neutral-200 rounded-lg overflow-hidden shrink-0 bg-white shadow-level-1 flex items-center justify-center">
            {profilePhotoPreview ? (
              <img
                src={profilePhotoPreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-ui-xs font-bold text-neutral-400 uppercase">NO PHOTO</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="h-10 px-4 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold text-ui-xs flex items-center justify-center uppercase tracking-widest transition-all select-none rounded-md cursor-pointer w-max shadow-sm bg-white">
              Upload Photo →
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUploadChange}
                className="hidden"
              />
            </label>
            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
              JPG or PNG · Max 5MB
            </span>
          </div>
        </div>
      </div>

      {/* ── VERIFICATION DOCUMENTS (Visible Only if NOT verified) ── */}
      {!isVerified && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 select-none">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <SectionHeader title="Verification Documents" size="sm" ruled={true} className="mb-0" />
            
            <div className="w-full p-6 bg-white border border-neutral-200 rounded-lg shadow-level-1 text-left flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {/* Degree status */}
                <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 p-4 rounded-md h-16">
                  <div className="flex flex-col">
                    <span className="text-ui-xs font-bold text-neutral-900 uppercase">
                      Degree Certificate
                    </span>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1">
                      {profile?.degreeDocument ? 'DEGREE FILE SUBMITTED ✓' : 'NOT UPLOADED'}
                    </span>
                  </div>
                  <label className="text-[10px] font-bold text-neutral-700 border border-neutral-200 px-3 py-1.5 bg-white hover:bg-neutral-50 transition-all cursor-pointer select-none rounded-md shadow-sm">
                    {profile?.degreeDocument ? 'RE-UPLOAD →' : 'UPLOAD →'}
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleDegreeChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* License status */}
                <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200 p-4 rounded-md h-16">
                  <div className="flex flex-col">
                    <span className="text-ui-xs font-bold text-neutral-900 uppercase">
                      Practitioner License Document
                    </span>
                    <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-1">
                      {profile?.licenseDocument ? 'LICENSE FILE SUBMITTED ✓' : 'NOT UPLOADED'}
                    </span>
                  </div>
                  <label className="text-[10px] font-bold text-neutral-700 border border-neutral-200 px-3 py-1.5 bg-white hover:bg-neutral-50 transition-all cursor-pointer select-none rounded-md shadow-sm">
                    {profile?.licenseDocument ? 'RE-UPLOAD →' : 'UPLOAD →'}
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={handleLicenseChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Pending uploads banner */}
              {(degreeFile || licenseFile) && (
                <div className="bg-[#FEF3E2]/40 border border-warning/30 p-4 rounded-md">
                  <span className="text-[10px] font-black text-warning uppercase tracking-widest block mb-1">
                    Pending Uploads Attached
                  </span>
                  <div className="space-y-1">
                    {degreeFile && (
                      <p className="text-ui-xs font-bold text-neutral-700 truncate">
                        Degree: {degreeFile.name}
                      </p>
                    )}
                    {licenseFile && (
                      <p className="text-ui-xs font-bold text-neutral-700 truncate">
                        License: {licenseFile.name}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification status timeline (Part 2) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <SectionHeader title="Verification Status" size="sm" ruled={true} className="mb-0" />
            <div className="flex flex-col gap-6 bg-white border border-neutral-200 rounded-lg p-6 shadow-level-1 select-none">
              <div className="flex flex-col gap-0">
                {steps.map((step, idx) => {
                  const isCompleted = idx < activeStep;
                  const isActive = idx === activeStep;
                  const isFuture = idx > activeStep;
                  
                  return (
                    <div key={step.key} className="flex gap-4 items-start relative pb-6 last:pb-0">
                      {/* Left line segment */}
                      {idx < steps.length - 1 && (
                        <div className={`absolute left-2.5 top-5 bottom-0 w-0.5 border-l-2
                          ${idx < activeStep ? 'border-success border-solid' : 'border-neutral-200 border-dashed'}
                        `} />
                      )}
                      
                      {/* Indicator dot */}
                      <div className={`rounded-full border-2 flex items-center justify-center shrink-0 z-10
                        ${isCompleted ? 'bg-[#E8F8F5] border-success text-success' : ''}
                        ${isActive ? 'bg-[#E8F4F8] border-primary text-primary animate-pulse' : ''}
                        ${isFuture ? 'bg-white border-neutral-200 text-neutral-400' : ''}
                      `} style={{ width: '22px', height: '22px' }}>
                        {isCompleted ? (
                          <span className="text-[10px] font-black">✓</span>
                        ) : (
                          <span className="text-[9px] font-bold">{idx + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex flex-col text-left">
                        <span className={`text-[10px] font-black tracking-wider uppercase leading-tight
                          ${isActive ? 'text-primary' : ''}
                          ${isCompleted ? 'text-success' : ''}
                          ${isFuture ? 'text-neutral-400' : ''}
                        `}>
                          {step.label}
                        </span>
                        <span className="text-ui-xs text-neutral-500 mt-1">
                          {step.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Persistent Bottom Save Changes Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 p-4 select-none shadow-level-3">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest hidden sm:inline-block">
            {isDirty ? 'Unsaved profile changes detected.' : 'Profile settings are in sync.'}
          </span>
          
          <div className="flex items-center gap-3 ml-auto">
            {isDirty && (
              <button
                type="button"
                onClick={handleDiscard}
                disabled={isSaving}
                className="px-4 py-2 border-0 text-neutral-500 hover:text-neutral-900 font-bold text-ui-xs uppercase tracking-widest transition-all select-none rounded-md cursor-pointer disabled:opacity-50"
              >
                Discard Changes
              </button>
            )}

            <Button
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              variant="primary"
              className="h-10 px-6 font-bold"
            >
              {isSaving ? 'Saving changes...' : 'Save Changes →'}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DoctorProfileEditor;
