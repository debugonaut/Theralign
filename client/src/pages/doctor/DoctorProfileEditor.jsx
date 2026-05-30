import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDoctorProfileAPI, onboardDoctorAPI } from '../../api/doctor.api';
import useAuthStore from '../../store/authStore';
import SectionHeader from '../../components/common/SectionHeader';
import Button from '../../components/common/Button';

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
      }
    } catch (err) {
      console.error(err);
      toast.error('FAILED TO FETCH PROFILE SETTINGS.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'MY PROFILE — KINETIQ';
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
  
  const isDirty = !!(
    profile && (
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
    )
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
      
      // Keep default coordinates or parse if needed
      formData.append('latitude', '12.9716');
      formData.append('longitude', '77.5946');

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
      <div className="py-24 text-center text-ui-xs font-bold text-swiss-gray-400 uppercase tracking-widest bg-swiss-white">
        LOADING PRACTITIONER SETTINGS PANELS...
      </div>
    );
  }

  const isVerified = profile?.verificationStatus === 'verified';

  return (
    <div className="flex flex-col gap-12 select-none text-left bg-swiss-white pb-32">
      
      {/* ── Page Header ── */}
      <div>
        <SectionHeader title="MY PROFILE" size="lg" ruled={true} className="mb-0" />
        <p className="text-ui-sm text-swiss-gray-600 font-bold uppercase tracking-wide mt-3">
          Configure your professional clinical parameters, update coordinates, set fee charts, and submit license files.
        </p>
      </div>

      {/* ── PERSONAL INFORMATION ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="PERSONAL INFORMATION" size="sm" ruled={true} className="mb-0" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              FULL NAME *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-swiss-white border-2 border-swiss-black px-4 py-2.5 text-ui-sm font-bold uppercase tracking-wider text-swiss-black focus:border-4 focus:ring-0 transition-all rounded-none"
              required
            />
          </div>

          {/* Email (Disabled, Read-only) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
                EMAIL ADDRESS
              </label>
              <span className="text-[9px] font-black text-swiss-gray-400 uppercase tracking-widest bg-swiss-gray-100 px-1 py-0.5 rounded-none select-none">
                CANNOT BE CHANGED
              </span>
            </div>
            <input
              type="email"
              value={profile?.user?.email || ''}
              disabled
              className="bg-swiss-gray-100 border-2 border-swiss-gray-200 px-4 py-2.5 text-ui-sm font-bold uppercase tracking-wider text-swiss-gray-400 cursor-not-allowed rounded-none"
            />
          </div>
        </div>

        {/* Phone Input with Internal prefix line */}
        <div className="flex flex-col gap-1.5 w-full md:w-1/2">
          <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            PHONE NUMBER *
          </label>
          <div className="flex border-2 border-swiss-black rounded-none bg-swiss-white focus-within:border-4 transition-all h-11">
            <div className="bg-swiss-gray-100 px-3.5 border-r border-swiss-black font-black text-ui-sm text-swiss-black flex items-center select-none shrink-0">
              +91
            </div>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="e.g. 9876543210"
              className="flex-1 px-4 text-ui-sm font-bold uppercase tracking-wider text-swiss-black focus:outline-none bg-transparent border-0"
              required
            />
          </div>
        </div>
      </div>

      {/* ── PROFESSIONAL DETAILS ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="PROFESSIONAL DETAILS" size="sm" ruled={true} className="mb-0" />
        
        {/* Specialization Comma field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            SPECIALIZATION (SEPARATE MULTIPLE WITH COMMAS) *
          </label>
          <input
            type="text"
            value={specializationText}
            onChange={(e) => setSpecializationText(e.target.value)}
            placeholder="E.G. SPORTS PHYSIOTHERAPY, MANUAL THERAPY, DRY NEEDLING"
            className="bg-swiss-white border-2 border-swiss-black px-4 py-2.5 text-ui-sm font-bold uppercase tracking-wider text-swiss-black focus:border-4 focus:ring-0 transition-all rounded-none"
            required
          />
        </div>

        {/* Years experience narrow input */}
        <div className="flex flex-col gap-1.5 w-[240px]">
          <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            YEARS OF PRACTICE EXPERIENCE *
          </label>
          <input
            type="number"
            min="0"
            max="60"
            value={experience}
            onChange={(e) => setExperience(e.target.value.replace(/\D/g, ''))}
            className="bg-swiss-white border-2 border-swiss-black px-4 py-2.5 text-ui-sm font-bold uppercase tracking-wider text-swiss-black focus:border-4 focus:ring-0 transition-all rounded-none"
            required
          />
        </div>

        {/* Professional Bio with char counter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            PROFESSIONAL BIO *
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="Describe your treatment philosophy, academic experience, and physiotherapist patient care methods..."
            className="w-full bg-swiss-white border-2 border-swiss-black px-4 py-3 text-ui-sm font-bold uppercase tracking-wider text-swiss-black placeholder-swiss-gray-400 focus:border-4 focus:ring-0 transition-all rounded-none resize-none"
            required
          />
          <span className="text-[9px] font-black text-swiss-gray-400 text-right uppercase tracking-widest">
            {bio.length} / 1000 CHARACTERS (MINIMUM 50 CHARS)
          </span>
        </div>
      </div>

      {/* ── CLINIC DETAILS ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="CLINIC DETAILS" size="sm" ruled={true} className="mb-0" />
        
        {/* Clinic Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            CLINIC NAME *
          </label>
          <input
            type="text"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            className="bg-swiss-white border-2 border-swiss-black px-4 py-2.5 text-ui-sm font-bold uppercase tracking-wider text-swiss-black focus:border-4 focus:ring-0 transition-all rounded-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* City */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              CITY *
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="bg-swiss-white border-2 border-swiss-black px-4 py-2.5 text-ui-sm font-bold uppercase tracking-wider text-swiss-black focus:border-4 focus:ring-0 transition-all rounded-none"
              required
            />
          </div>

          {/* State */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
              STATE *
            </label>
            <input
              type="text"
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              className="bg-swiss-white border-2 border-swiss-black px-4 py-2.5 text-ui-sm font-bold uppercase tracking-wider text-swiss-black focus:border-4 focus:ring-0 transition-all rounded-none"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            STREET ADDRESS *
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full h-20 bg-swiss-white border-2 border-swiss-black px-4 py-3 text-ui-sm font-bold uppercase tracking-wider text-swiss-black placeholder-swiss-gray-400 focus:border-4 focus:ring-0 transition-all rounded-none resize-none"
            required
          />
        </div>
      </div>

      {/* ── CONSULTATION FEE ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="CONSULTATION FEE" size="sm" ruled={true} className="mb-0" />
        
        <div className="flex flex-col gap-1.5 w-[240px]">
          <label className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            CONSULTATION FEE PER SESSION *
          </label>
          <div className="flex border-2 border-swiss-black rounded-none bg-swiss-white focus-within:border-4 transition-all h-11">
            <div className="bg-swiss-gray-100 px-3.5 border-r border-swiss-black font-black text-ui-sm text-swiss-black flex items-center select-none shrink-0">
              ₹
            </div>
            <input
              type="number"
              min="0"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value.replace(/\D/g, ''))}
              className="flex-1 px-4 text-ui-sm font-bold uppercase tracking-wider text-swiss-black focus:outline-none bg-transparent border-0"
              required
            />
          </div>
        </div>
        <p className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider">
          This amount is shown to patients on your profile and at booking. You can update it at any time.
        </p>
      </div>

      {/* ── PROFILE PHOTO ── */}
      <div className="flex flex-col gap-6">
        <SectionHeader title="PROFILE PHOTO" size="sm" ruled={true} className="mb-0" />
        
        <div className="flex items-center gap-6">
          {/* Bordered Square Preview 120x120 */}
          <div className="w-[120px] h-[120px] border-2 border-swiss-black rounded-none overflow-hidden shrink-0 bg-swiss-gray-100 flex items-center justify-center">
            {profilePhotoPreview ? (
              <img
                src={profilePhotoPreview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-ui-xs font-black text-swiss-gray-400 uppercase">NO PHOTO</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="h-10 px-4 border-2 border-swiss-black text-swiss-black hover:bg-swiss-black hover:text-swiss-white font-black text-ui-xs flex items-center justify-center uppercase tracking-widest transition-colors select-none rounded-none cursor-pointer w-max">
              UPLOAD PHOTO →
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUploadChange}
                className="hidden"
              />
            </label>
            <span className="text-[9px] text-swiss-gray-400 font-bold uppercase tracking-widest block">
              JPG or PNG · Max 5MB
            </span>
          </div>
        </div>
      </div>

      {/* ── VERIFICATION DOCUMENTS (Visible Only if NOT verified) ── */}
      {!isVerified && (
        <div className="flex flex-col gap-6 select-none">
          <SectionHeader title="VERIFICATION DOCUMENTS" size="sm" ruled={true} className="mb-0" />
          
          <div className="w-full p-6 bg-swiss-gray-100 border-2 border-swiss-black rounded-none swiss-diagonal select-none text-left flex flex-col gap-4">
            
            <div className="flex flex-col gap-3">
              {/* Degree status */}
              <div className="flex items-center justify-between bg-swiss-white border border-swiss-gray-200 p-4 rounded-none h-14">
                <div className="flex flex-col">
                  <span className="text-ui-xs font-black text-swiss-black uppercase">
                    DEGREE CERTIFICATE
                  </span>
                  <span className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider mt-0.5">
                    {profile?.degreeDocument ? 'DEGREE FILE SUBMITTED ✓' : 'NOT UPLOADED'}
                  </span>
                </div>
                <label className="text-[10px] font-black text-swiss-black border-2 border-swiss-black px-3 py-1 hover:bg-swiss-black hover:text-swiss-white transition-colors cursor-pointer select-none rounded-none">
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
              <div className="flex items-center justify-between bg-swiss-white border border-swiss-gray-200 p-4 rounded-none h-14">
                <div className="flex flex-col">
                  <span className="text-ui-xs font-black text-swiss-black uppercase">
                    PRACTITIONER LICENSE DOCUMENT
                  </span>
                  <span className="text-[10px] text-swiss-gray-400 font-bold uppercase tracking-wider mt-0.5">
                    {profile?.licenseDocument ? 'LICENSE FILE SUBMITTED ✓' : 'NOT UPLOADED'}
                  </span>
                </div>
                <label className="text-[10px] font-black text-swiss-black border-2 border-swiss-black px-3 py-1 hover:bg-swiss-black hover:text-swiss-white transition-colors cursor-pointer select-none rounded-none">
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

            {/* Uploaded state indicator */}
            {(degreeFile || licenseFile) && (
              <div className="bg-swiss-white border border-swiss-black p-3.5 select-none rounded-none">
                <span className="text-[10px] font-black text-swiss-teal uppercase tracking-widest block mb-1">
                  PENDING UPLOADS ATTACHED
                </span>
                <div className="space-y-1">
                  {degreeFile && (
                    <p className="text-ui-xs font-bold text-swiss-black uppercase">
                      DEGREE: {degreeFile.name} (READY TO SAVE)
                    </p>
                  )}
                  {licenseFile && (
                    <p className="text-ui-xs font-bold text-swiss-black uppercase">
                      LICENSE: {licenseFile.name} (READY TO SAVE)
                    </p>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Persistent Bottom Save Changes Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-swiss-white border-t-2 border-swiss-black p-4 select-none shadow-none">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest hidden sm:inline-block">
            {isDirty ? 'UNSAVED PROFILE CHANGES DETECTED.' : 'PROFILE IS IN SYNC.'}
          </span>
          
          <div className="flex items-center gap-3 ml-auto">
            {isDirty && (
              <button
                type="button"
                onClick={handleDiscard}
                disabled={isSaving}
                className="px-4 py-2 border-2 border-transparent text-swiss-gray-400 hover:text-swiss-black font-black text-ui-xs uppercase tracking-widest transition-colors select-none rounded-none cursor-pointer disabled:opacity-50"
              >
                DISCARD CHANGES
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="h-10 px-6 bg-swiss-black hover:bg-swiss-red border-2 border-swiss-black text-swiss-white font-black text-ui-xs flex items-center uppercase tracking-widest transition-colors select-none shrink-0 rounded-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'SAVING CHANGES...' : 'SAVE CHANGES →'}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DoctorProfileEditor;
