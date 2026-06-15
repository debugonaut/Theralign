import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDoctorProfileAPI, onboardDoctorAPI } from '../../api/doctor.api';
import useAuthStore from '../../store/authStore';
import SectionHeader from '../../components/common/SectionHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import HorizontalStepper from '../../components/common/HorizontalStepper';

const DRAFT_KEY = 'physio_doctor_profile_draft';

const DOCTOR_STEPS_UNVERIFIED = [
  { key: 'personal', label: 'PERSONAL INFO' },
  { key: 'professional', label: 'PROFESSIONAL DETAILS' },
  { key: 'clinic', label: 'CLINIC DETAILS' },
  { key: 'documents', label: 'VERIFICATION' },
  { key: 'practice', label: 'PRACTICE STRUCTURE' }
];

const DOCTOR_STEPS_VERIFIED = [
  { key: 'personal', label: 'PERSONAL INFO' },
  { key: 'professional', label: 'PROFESSIONAL DETAILS' },
  { key: 'clinic', label: 'CLINIC DETAILS' },
  { key: 'practice', label: 'PRACTICE STRUCTURE' }
];

const DOCTOR_STEPS_JUNIOR = [
  { key: 'personal', label: 'PERSONAL INFO' },
  { key: 'professional', label: 'PROFESSIONAL DETAILS' }
];

const getDoctorCompletedSteps = (prof) => {
  const completed = [];
  if (!prof) return completed;
  
  const activeSteps = prof.doctorType === 'junior' 
    ? DOCTOR_STEPS_JUNIOR 
    : (prof.verificationStatus === 'verified' ? DOCTOR_STEPS_VERIFIED : DOCTOR_STEPS_UNVERIFIED);
    
  activeSteps.forEach((step, idx) => {
    if (step.key === 'personal') {
      if (prof.user?.name && prof.user?.phone) completed.push(idx);
    } else if (step.key === 'professional') {
      if (prof.doctorType === 'junior') {
        if (prof.bio) completed.push(idx);
      } else {
        if (prof.specialization?.length > 0 && prof.experience && prof.bio) completed.push(idx);
      }
    } else if (step.key === 'clinic') {
      if (prof.clinicName && prof.clinicAddress && prof.consultationFee) completed.push(idx);
    } else if (step.key === 'documents') {
      if (prof.degreeDocument && prof.licenseDocument) completed.push(idx);
    } else if (step.key === 'practice') {
      completed.push(idx);
    }
  });
  return completed;
};

const DoctorProfileEditor = () => {
  const navigate = useNavigate();
  const { user, setCredentials } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Stepper states
  const [editorStep, setEditorStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [animatingStepIdx, setAnimatingStepIdx] = useState(null);
  const [dirtyStep, setDirtyStep] = useState(null);

  // Practice structure states
  const [isSupervising, setIsSupervising] = useState('no');
  const [practiceName, setPracticeName] = useState('');
  const [maxJuniorDoctors, setMaxJuniorDoctors] = useState(2);

  // ─── Form States ───
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [specializationText, setSpecializationText] = useState('');
  const [specDropdownOpen, setSpecDropdownOpen] = useState(false);
  const specDropdownRef = useRef(null);
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [address, setAddress] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isManualCoordinates, setIsManualCoordinates] = useState(false);
  const [draftToRestore, setDraftToRestore] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Physical files states
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [degreeFile, setDegreeFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);

  const SPECIALIZATION_OPTIONS = [
    'Orthopedic Physiotherapy',
    'Sports Physiotherapy',
    'Neurological Physiotherapy',
    'Pediatric Physiotherapy',
    'Geriatric Physiotherapy',
    'Cardiopulmonary Physiotherapy',
    'Women\'s Health Physiotherapy',
    'Manual Therapy',
    'Dry Needling',
    'Vestibular Rehabilitation',
    'Post-Surgical Rehabilitation',
    'Pain Management',
    'Occupational Physiotherapy',
    'Aquatic Physiotherapy',
  ];

  const selectedSpecs = specializationText
    ? specializationText.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const toggleSpec = (option) => {
    const current = selectedSpecs;
    const updated = current.includes(option)
      ? current.filter((s) => s !== option)
      : [...current, option];
    setSpecializationText(updated.join(', '));
  };

  const handleUseMyLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      toast.error('GEOLOCATION NOT SUPPORTED.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        setLatitude(lat.toString());
        setLongitude(lng.toString());
        toast.success('COORDINATES UPDATED SUCCESSFULLY.');
      },
      (error) => {
        console.error('Geolocation error:', error);
        let msg = 'Failed to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Please enable location access in browser settings.';
        }
        setLocationError(msg);
        toast.error('LOCATION ACCESS DENIED OR FAILED.');
      }
    );
  };

  const handleRestoreDraft = () => {
    if (!draftToRestore) return;
    setName(draftToRestore.name ?? draftToRestore.initialValues.name);
    setPhone(draftToRestore.phone ?? draftToRestore.initialValues.phone);
    setBio(draftToRestore.bio ?? draftToRestore.initialValues.bio);
    setExperience(draftToRestore.experience ?? draftToRestore.initialValues.experience);
    setRegistrationNumber(draftToRestore.registrationNumber ?? draftToRestore.initialValues.registrationNumber);
    setSpecializationText(draftToRestore.specializationText ?? draftToRestore.initialValues.specializationText);
    setClinicName(draftToRestore.clinicName ?? draftToRestore.initialValues.clinicName);
    setCity(draftToRestore.city ?? draftToRestore.initialValues.city);
    setStateName(draftToRestore.stateName ?? draftToRestore.initialValues.stateName);
    setAddress(draftToRestore.address ?? draftToRestore.initialValues.address);
    setLatitude(draftToRestore.latitude ?? draftToRestore.initialValues.latitude);
    setLongitude(draftToRestore.longitude ?? draftToRestore.initialValues.longitude);
    setConsultationFee(draftToRestore.consultationFee ?? draftToRestore.initialValues.consultationFee);
    setIsSupervising(draftToRestore.isSupervising ?? draftToRestore.initialValues.isSupervising ?? 'no');
    setPracticeName(draftToRestore.practiceName ?? draftToRestore.initialValues.practiceName ?? '');
    setMaxJuniorDoctors(draftToRestore.maxJuniorDoctors ?? draftToRestore.initialValues.maxJuniorDoctors ?? 2);
    if (typeof draftToRestore.editorStep === 'number') {
      setEditorStep(draftToRestore.editorStep);
    }
    setProfilePhotoPreview(draftToRestore.initialValues.profilePhotoPreview);
    setCompletedSteps(getDoctorCompletedSteps(profile));
    setDraftToRestore(null);
    toast.success('DRAFT RESTORED SUCCESSFULLY.');
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraftToRestore(null);
    toast.success('DRAFT DISCARDED.');
    fetchProfileData();
  };

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const res = await getDoctorProfileAPI();
      let p = null;
      if (res.success && res.data?.profile) {
        p = res.data.profile;
        setProfile(p);
      }

      // 1. Construct initial values from database profile (or defaults)
      const initialValues = {
        name: p?.user?.name || user?.name || '',
        phone: (p?.user?.phone || user?.phone || '').replace('+91', '').trim(),
        bio: p?.bio || '',
        experience: p?.experience ? p.experience.toString() : '',
        registrationNumber: p?.registrationNumber || '',
        specializationText: p?.specialization ? p.specialization.join(', ') : '',
        clinicName: p?.clinicName || '',
        consultationFee: p?.consultationFee ? p.consultationFee.toString() : '',
        address: '',
        city: '',
        stateName: '',
        profilePhotoPreview: p?.user?.profileImage || user?.profileImage || '',
        latitude: p?.clinicLocation?.coordinates ? p.clinicLocation.coordinates[1].toString() : '',
        longitude: p?.clinicLocation?.coordinates ? p.clinicLocation.coordinates[0].toString() : '',
        isSupervising: (p?.doctorType === 'senior' || (p?.maxJuniorDoctors && p.maxJuniorDoctors > 0)) ? 'yes' : 'no',
        practiceName: p?.practiceName || '',
        maxJuniorDoctors: p?.maxJuniorDoctors || 2,
      };

      if (p?.clinicAddress) {
        const parts = p.clinicAddress.split(',').map((s) => s.trim());
        if (parts.length >= 3) {
          initialValues.stateName = parts.pop();
          initialValues.city = parts.pop();
          initialValues.address = parts.join(', ');
        } else {
          initialValues.address = p.clinicAddress;
        }
      }

      // 2. Check for draft in localStorage
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed) {
            setDraftToRestore({
              ...parsed,
              initialValues
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error('Failed to parse draft', e);
        }
      }

      // Set initial values if no draft
      setName(initialValues.name);
      setPhone(initialValues.phone);
      setBio(initialValues.bio);
      setExperience(initialValues.experience);
      setRegistrationNumber(initialValues.registrationNumber);
      setSpecializationText(initialValues.specializationText);
      setClinicName(initialValues.clinicName);
      setCity(initialValues.city);
      setStateName(initialValues.stateName);
      setAddress(initialValues.address);
      setLatitude(initialValues.latitude);
      setLongitude(initialValues.longitude);
      setConsultationFee(initialValues.consultationFee);
      setProfilePhotoPreview(initialValues.profilePhotoPreview);
      setIsSupervising(initialValues.isSupervising);
      setPracticeName(initialValues.practiceName);
      setMaxJuniorDoctors(initialValues.maxJuniorDoctors);
      
      const dbCompleted = getDoctorCompletedSteps(p);
      setCompletedSteps(dbCompleted);

      // Restore first incomplete step if profile exists
      if (p) {
        const isVerified = p.verificationStatus === 'verified';
        const activeSteps = p.doctorType === 'junior' ? DOCTOR_STEPS_JUNIOR : (isVerified ? DOCTOR_STEPS_VERIFIED : DOCTOR_STEPS_UNVERIFIED);
        let firstIncomplete = 0;
        for (let i = 0; i < activeSteps.length; i++) {
          if (!dbCompleted.includes(i)) {
            firstIncomplete = i;
            break;
          }
        }
        setEditorStep(firstIncomplete);
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

  useEffect(() => {
    if (!specDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (specDropdownRef.current && !specDropdownRef.current.contains(e.target)) {
        setSpecDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [specDropdownOpen]);

  const handleSaveDraft = () => {
    const draftPayload = {
      name,
      phone,
      bio,
      experience,
      registrationNumber,
      specializationText,
      clinicName,
      city,
      stateName,
      address,
      latitude,
      longitude,
      consultationFee,
      isSupervising,
      practiceName,
      maxJuniorDoctors,
      editorStep,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));
    toast.success('DRAFT SAVED LOCALLY.');
  };

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

      setLatitude(profile.clinicLocation?.coordinates ? profile.clinicLocation.coordinates[1].toString() : '');
      setLongitude(profile.clinicLocation?.coordinates ? profile.clinicLocation.coordinates[0].toString() : '');

      setProfilePhotoPreview(profile.user?.profileImage || '');
      setProfilePhotoFile(null);
      setDegreeFile(null);
      setLicenseFile(null);
      setIsSupervising((profile.doctorType === 'senior' || (profile.maxJuniorDoctors && profile.maxJuniorDoctors > 0)) ? 'yes' : 'no');
      setPracticeName(profile.practiceName || '');
      setMaxJuniorDoctors(profile.maxJuniorDoctors || 2);
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
    latitude.trim() !== '' ||
    longitude.trim() !== '' ||
    profilePhotoFile !== null ||
    degreeFile !== null ||
    licenseFile !== null ||
    isSupervising !== 'no' ||
    practiceName.trim() !== '' ||
    maxJuniorDoctors !== 2
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
    latitude !== (profile.clinicLocation?.coordinates ? profile.clinicLocation.coordinates[1].toString() : '') ||
    longitude !== (profile.clinicLocation?.coordinates ? profile.clinicLocation.coordinates[0].toString() : '') ||
    profilePhotoFile !== null ||
    degreeFile !== null ||
    licenseFile !== null ||
    isSupervising !== ((profile.doctorType === 'senior' || (profile.maxJuniorDoctors && profile.maxJuniorDoctors > 0)) ? 'yes' : 'no') ||
    practiceName !== (profile.practiceName || '') ||
    maxJuniorDoctors !== (profile.maxJuniorDoctors || 2)
  );

  const isStepDirty = (stepIdx) => {
    if (!profile) return false;
    const isVerified = profile.verificationStatus === 'verified';
    const activeSteps = profile.doctorType === 'junior' ? DOCTOR_STEPS_JUNIOR : (isVerified ? DOCTOR_STEPS_VERIFIED : DOCTOR_STEPS_UNVERIFIED);
    const stepKey = activeSteps[stepIdx]?.key;
    if (stepKey === 'personal') {
      return (
        name !== (profile.user?.name || '') ||
        phone !== (profile.user?.phone || '').replace('+91', '').trim() ||
        profilePhotoFile !== null
      );
    }
    if (stepKey === 'professional') {
      return (
        bio !== (profile.bio || '') ||
        experience !== (profile.experience?.toString() || '') ||
        registrationNumber !== (profile.registrationNumber || '') ||
        specializationText !== (profile.specialization?.join(', ') || '')
      );
    }
    if (stepKey === 'clinic') {
      const dbClinicAddress = profile.clinicAddress || '';
      const currentClinicAddress = `${address}${city ? `, ${city}` : ''}${stateName ? `, ${stateName}` : ''}`;
      return (
        clinicName !== (profile.clinicName || '') ||
        currentClinicAddress !== dbClinicAddress ||
        consultationFee !== (profile.consultationFee?.toString() || '') ||
        latitude !== (profile.clinicLocation?.coordinates ? profile.clinicLocation.coordinates[1].toString() : '') ||
        longitude !== (profile.clinicLocation?.coordinates ? profile.clinicLocation.coordinates[0].toString() : '')
      );
    }
    if (stepKey === 'documents') {
      return degreeFile !== null || licenseFile !== null;
    }
    if (stepKey === 'practice') {
      const dbIsSupervising = (profile.doctorType === 'senior' || (profile.maxJuniorDoctors && profile.maxJuniorDoctors > 0)) ? 'yes' : 'no';
      return (
        isSupervising !== dbIsSupervising ||
        practiceName !== (profile.practiceName || '') ||
        maxJuniorDoctors !== (profile.maxJuniorDoctors || 2)
      );
    }
    return false;
  };

  const handleStepChange = (targetStepIdx) => {
    if (targetStepIdx === editorStep) return;
    if (isStepDirty(editorStep)) {
      setDirtyStep(editorStep);
    }
    setEditorStep(targetStepIdx);
  };

  const handleSaveDirtyStep = async (stepIdx) => {
    const isVerified = profile?.verificationStatus === 'verified';
    const activeSteps = profile?.doctorType === 'junior' ? DOCTOR_STEPS_JUNIOR : (isVerified ? DOCTOR_STEPS_VERIFIED : DOCTOR_STEPS_UNVERIFIED);
    const stepKey = activeSteps[stepIdx]?.key;
    const isJunior = profile?.doctorType === 'junior';

    if (stepKey === 'personal') {
      if (!name.trim()) {
        toast.error('FULL NAME IS REQUIRED.');
        return;
      }
      if (!phone.trim()) {
        toast.error('PHONE NUMBER IS REQUIRED.');
        return;
      }
      if (phone.trim().length !== 10) {
        toast.error('PHONE NUMBER MUST BE 10 DIGITS.');
        return;
      }
    }
    if (stepKey === 'professional') {
      if (!isJunior) {
        if (!specializationText.trim()) {
          toast.error('SPECIALIZATION FIELD IS REQUIRED.');
          return;
        }
        if (!experience.trim() || isNaN(parseInt(experience))) {
          toast.error('EXPERIENCE YEARS MUST BE A VALID NUMBER.');
          return;
        }
        if (!registrationNumber.trim()) {
          toast.error('REGISTRATION NUMBER IS REQUIRED.');
          return;
        }
      }
      if (bio.trim().length < 50) {
        toast.error('PROFESSIONAL BIO MUST BE AT LEAST 50 CHARACTERS.');
        return;
      }
    }
    if (stepKey === 'clinic') {
      if (!clinicName.trim()) {
        toast.error('CLINIC NAME IS REQUIRED.');
        return;
      }
      if (!city.trim() || !stateName.trim() || !address.trim()) {
        toast.error('COMPLETE CLINIC ADDRESS IS REQUIRED.');
        return;
      }
      if (!latitude || !longitude) {
        toast.error('GEOLOCATION COORDINATES ARE REQUIRED. USE LOCATION OR ENTER MANUALLY.');
        return;
      }
      if (!consultationFee.trim() || isNaN(parseFloat(consultationFee))) {
        toast.error('CONSULTATION FEE MUST BE A VALID NUMBER.');
        return;
      }
    }
    if (stepKey === 'documents' && profile?.verificationStatus !== 'verified') {
      if (!degreeFile && !profile?.degreeDocument) {
        toast.error('DEGREE CERTIFICATE IS REQUIRED.');
        return;
      }
      if (!licenseFile && !profile?.licenseDocument) {
        toast.error('PRACTITIONER LICENSE DOCUMENT IS REQUIRED.');
        return;
      }
    }

    const success = await handleSave(false);
    if (success) {
      setDirtyStep(null);
    }
  };

  const discardStepChanges = (stepIdx) => {
    if (!profile) return;
    const isVerified = profile?.verificationStatus === 'verified';
    const activeSteps = profile?.doctorType === 'junior' ? DOCTOR_STEPS_JUNIOR : (isVerified ? DOCTOR_STEPS_VERIFIED : DOCTOR_STEPS_UNVERIFIED);
    const stepKey = activeSteps[stepIdx]?.key;

    if (stepKey === 'personal') {
      setName(profile.user?.name || '');
      let rawPhone = profile.user?.phone || '';
      if (rawPhone.startsWith('+91')) {
        rawPhone = rawPhone.replace('+91', '').trim();
      }
      setPhone(rawPhone);
      setProfilePhotoPreview(profile.user?.profileImage || '');
      setProfilePhotoFile(null);
    }
    if (stepKey === 'professional') {
      setBio(profile.bio || '');
      setExperience(profile.experience ? profile.experience.toString() : '');
      setRegistrationNumber(profile.registrationNumber || '');
      setSpecializationText(profile.specialization ? profile.specialization.join(', ') : '');
    }
    if (stepKey === 'clinic') {
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
      setLatitude(profile.clinicLocation?.coordinates ? profile.clinicLocation.coordinates[1].toString() : '');
      setLongitude(profile.clinicLocation?.coordinates ? profile.clinicLocation.coordinates[0].toString() : '');
    }
    if (stepKey === 'documents') {
      setDegreeFile(null);
      setLicenseFile(null);
    }
    if (stepKey === 'practice') {
      setIsSupervising((profile.doctorType === 'senior' || (profile.maxJuniorDoctors && profile.maxJuniorDoctors > 0)) ? 'yes' : 'no');
      setPracticeName(profile.practiceName || '');
      setMaxJuniorDoctors(profile.maxJuniorDoctors || 2);
    }
    setDirtyStep(null);
    toast.success(`CHANGES IN ${activeSteps[stepIdx]?.label} DISCARDED.`);
  };

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

  const handleSave = async (isFinalStep = false) => {
    // Validations based on steps reached so far
    // Step 0 validations:
    if (!name.trim()) {
      toast.error('FULL NAME IS REQUIRED.');
      return false;
    }
    if (!phone.trim()) {
      toast.error('PHONE NUMBER IS REQUIRED.');
      return false;
    }
    if (phone.trim().length !== 10) {
      toast.error('PHONE NUMBER MUST BE 10 DIGITS.');
      return false;
    }

    // Step 1 validations (only if on Step 1, later steps, or is final submit):
    const professionalStepIdx = activeSteps.findIndex(s => s.key === 'professional');
    const isJunior = profile?.doctorType === 'junior';
    if (professionalStepIdx !== -1 && (editorStep >= professionalStepIdx || isFinalStep)) {
      if (!isJunior) {
        if (!specializationText.trim()) {
          toast.error('SPECIALIZATION FIELD IS REQUIRED.');
          return false;
        }
        if (!experience.trim() || isNaN(parseInt(experience))) {
          toast.error('EXPERIENCE YEARS MUST BE A VALID NUMBER.');
          return false;
        }
        if (!registrationNumber.trim()) {
          toast.error('REGISTRATION NUMBER IS REQUIRED.');
          return false;
        }
      }
      if (bio.trim().length < 50) {
        toast.error('PROFESSIONAL BIO MUST BE AT LEAST 50 CHARACTERS.');
        return false;
      }
    }

    // Step 2 validations (only if on Step 2, later steps, or is final submit):
    const clinicStepIdx = activeSteps.findIndex(s => s.key === 'clinic');
    if (clinicStepIdx !== -1 && (editorStep >= clinicStepIdx || isFinalStep)) {
      if (!clinicName.trim()) {
        toast.error('CLINIC NAME IS REQUIRED.');
        return false;
      }
      if (!city.trim() || !stateName.trim() || !address.trim()) {
        toast.error('COMPLETE CLINIC ADDRESS IS REQUIRED.');
        return false;
      }
      if (!latitude || !longitude) {
        toast.error('GEOLOCATION COORDINATES ARE REQUIRED. USE LOCATION OR ENTER MANUALLY.');
        return false;
      }
      if (!consultationFee.trim() || isNaN(parseFloat(consultationFee))) {
        toast.error('CONSULTATION FEE MUST BE A VALID NUMBER.');
        return false;
      }
    }

    // Step 3 validations (only if is final submit and user is not verified):
    const documentsStepIdx = activeSteps.findIndex(s => s.key === 'documents');
    if (documentsStepIdx !== -1 && (editorStep >= documentsStepIdx || isFinalStep) && profile?.verificationStatus !== 'verified') {
      if (!degreeFile && !profile?.degreeDocument) {
        toast.error('DEGREE CERTIFICATE IS REQUIRED.');
        return false;
      }
      if (!licenseFile && !profile?.licenseDocument) {
        toast.error('PRACTITIONER LICENSE DOCUMENT IS REQUIRED.');
        return false;
      }
    }

    setIsSaving(true);
    const toastId = toast.loading('SAVING CLINICAL PROFILE CHANGES...');

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      
      const cleanPhone = phone.trim();
      formData.append('phone', cleanPhone ? `+91 ${cleanPhone}` : '');
      
      const finalOnboarded = isFinalStep || profile?.isOnboarded || false;
      formData.append('isOnboarded', finalOnboarded ? 'true' : 'false');

      if (bio.trim() !== '') {
        formData.append('bio', bio.trim());
      }
      if (!isJunior) {
        if (experience.trim() !== '') {
          formData.append('experience', parseInt(experience, 10));
        }
        if (registrationNumber.trim() !== '') {
          formData.append('registrationNumber', registrationNumber.trim());
        }

        if (specializationText.trim() !== '') {
          const specList = specializationText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
          formData.append('specialization', JSON.stringify(specList));
        }

        if (clinicName.trim() !== '') {
          formData.append('clinicName', clinicName.trim());
        }
        if (currentClinicAddress.trim() !== '') {
          formData.append('clinicAddress', currentClinicAddress);
        }
        if (city.trim() !== '') {
          formData.append('city', city.trim());
        }
        
        if (latitude && longitude) {
          formData.append('latitude', parseFloat(latitude));
          formData.append('longitude', parseFloat(longitude));
        }

        if (consultationFee.trim() !== '') {
          formData.append('consultationFee', parseFloat(consultationFee));
        }
      }

      if (profilePhotoFile) {
        formData.append('profileImage', profilePhotoFile);
      }
      if (!isJunior) {
        if (degreeFile) {
          formData.append('degreeDocument', degreeFile);
        }
        if (licenseFile) {
          formData.append('licenseDocument', licenseFile);
        }
        
        formData.append('maxJuniorDoctors', isSupervising === 'yes' ? maxJuniorDoctors : 0);
        formData.append('practiceName', isSupervising === 'yes' ? practiceName.trim() : '');
      }

      const res = await onboardDoctorAPI(formData);
      if (res.success && res.data?.profile) {
        toast.success(finalOnboarded ? 'PROFILE SUBMITTED AND AWAITING REVIEW.' : 'PROGRESS SAVED SUCCESSFULLY.', { id: toastId });
        
        // Clear draft on successful save
        localStorage.removeItem(DRAFT_KEY);

        // Sync Zustand Auth Store credentials
        const updatedUser = res.data.profile.user;
        const storedToken = localStorage.getItem('theralign_token');
        if (storedToken && updatedUser) {
          setCredentials(updatedUser, storedToken);
        }

        fetchProfileData();
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'FAILED TO SAVE PROFILE CHANGES.', { id: toastId });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStep = async () => {
    const isVerified = profile?.verificationStatus === 'verified';
    const activeSteps = profile?.doctorType === 'junior' ? DOCTOR_STEPS_JUNIOR : (isVerified ? DOCTOR_STEPS_VERIFIED : DOCTOR_STEPS_UNVERIFIED);
    const isFinalStep = editorStep === activeSteps.length - 1;
    const currentStepKey = activeSteps[editorStep]?.key;
    const isJunior = profile?.doctorType === 'junior';

    // Validations based on the current step
    if (currentStepKey === 'personal') {
      if (!name.trim()) {
        toast.error('FULL NAME IS REQUIRED.');
        return;
      }
      if (!phone.trim()) {
        toast.error('PHONE NUMBER IS REQUIRED.');
        return;
      }
      if (phone.trim().length !== 10) {
        toast.error('PHONE NUMBER MUST BE 10 DIGITS.');
        return;
      }
    }
    if (currentStepKey === 'professional') {
      if (!isJunior) {
        if (!specializationText.trim()) {
          toast.error('SPECIALIZATION FIELD IS REQUIRED.');
          return;
        }
        if (!experience.trim() || isNaN(parseInt(experience))) {
          toast.error('EXPERIENCE YEARS MUST BE A VALID NUMBER.');
          return;
        }
        if (!registrationNumber.trim()) {
          toast.error('REGISTRATION NUMBER IS REQUIRED.');
          return;
        }
      }
      if (bio.trim().length < 50) {
        toast.error('PROFESSIONAL BIO MUST BE AT LEAST 50 CHARACTERS.');
        return;
      }
    }
    if (currentStepKey === 'clinic') {
      if (!clinicName.trim()) {
        toast.error('CLINIC NAME IS REQUIRED.');
        return;
      }
      if (!city.trim() || !stateName.trim() || !address.trim()) {
        toast.error('COMPLETE CLINIC ADDRESS IS REQUIRED.');
        return;
      }
      if (!latitude || !longitude) {
        toast.error('GEOLOCATION COORDINATES ARE REQUIRED. USE LOCATION OR ENTER MANUALLY.');
        return;
      }
      if (!consultationFee.trim() || isNaN(parseFloat(consultationFee))) {
        toast.error('CONSULTATION FEE MUST BE A VALID NUMBER.');
        return;
      }
    }
    if (currentStepKey === 'documents' && !isVerified) {
      if (!degreeFile && !profile?.degreeDocument) {
        toast.error('DEGREE CERTIFICATE IS REQUIRED.');
        return;
      }
      if (!licenseFile && !profile?.licenseDocument) {
        toast.error('PRACTITIONER LICENSE DOCUMENT IS REQUIRED.');
        return;
      }
    }

    if (!isDirty) {
      // Just advance step without saving if not dirty
      if (editorStep < activeSteps.length - 1) {
        setEditorStep((prev) => prev + 1);
      } else {
        toast.success('PRACTITIONER PROFILE COMPLETE!');
      }
      return;
    }

    const success = await handleSave(isFinalStep);
    if (success) {
      // Add current step to completed steps
      if (!completedSteps.includes(editorStep)) {
        setCompletedSteps((prev) => [...prev, editorStep]);
      }

      // Trigger ticking animation
      setAnimatingStepIdx(editorStep);

      // Advance after 1000ms
      setTimeout(() => {
        setAnimatingStepIdx(null);
        if (editorStep < activeSteps.length - 1) {
          const nextStep = editorStep + 1;
          setEditorStep(nextStep);
          // Update draft key with next step and current database values
          const draftPayload = {
            name,
            phone,
            bio,
            experience,
            registrationNumber,
            specializationText,
            clinicName,
            city,
            stateName,
            address,
            latitude,
            longitude,
            consultationFee,
            isSupervising,
            practiceName,
            maxJuniorDoctors,
            editorStep: nextStep,
            savedAt: new Date().toISOString()
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draftPayload));
        } else {
          toast.success('PRACTITIONER PROFILE COMPLETED!');
          localStorage.removeItem(DRAFT_KEY);
        }
      }, 1000);
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
  let activeStatusStep = 0;
  if (profile?.isOnboarded) {
    if (currentStatus === 'pending') activeStatusStep = 1;
    if (currentStatus === 'verified') activeStatusStep = 3;
  }

  const statusStepsList = [
    { key: 'submitted', label: 'Submitted', desc: 'Application received and registered.' },
    { key: 'review', label: 'Under Review', desc: 'Credential verification in progress.' },
    { key: 'approved', label: 'Approved', desc: 'Credentials verified successfully.' },
    { key: 'active', label: 'Active', desc: 'Profile live in search directory.' },
  ];

  const activeSteps = profile?.doctorType === 'junior' ? DOCTOR_STEPS_JUNIOR : (isVerified ? DOCTOR_STEPS_VERIFIED : DOCTOR_STEPS_UNVERIFIED);
  const showUnsavedBanner = dirtyStep !== null && isStepDirty(dirtyStep);

  return (
    <div className="flex flex-col gap-6 select-none text-left bg-neutral-50 page-fade-in">
      
      {/* Draft Restore Banner */}
      {draftToRestore && (
        <div className="bg-[#E8F4F8] border border-[#0B4F6C]/25 text-[#0B4F6C] p-4 rounded-lg flex items-center justify-between shadow-sm animate-fade-in font-sans mb-4">
          <div className="flex flex-col text-left">
            <span className="text-[12px] font-black uppercase tracking-wider">
              Saved Draft Found
            </span>
            <span className="text-[11px] text-neutral-600 mt-0.5">
              You have a saved draft from your previous session
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRestoreDraft}
              className="px-4 py-2 bg-[#0B4F6C] text-white font-bold text-[11px] uppercase tracking-wider rounded-md hover:bg-[#083A52] transition-colors cursor-pointer select-none"
            >
              Continue
            </button>
            <button
              onClick={handleDiscardDraft}
              className="px-4 py-2 bg-white border border-neutral-300 text-neutral-600 font-bold text-[11px] uppercase tracking-wider rounded-md hover:bg-neutral-50 transition-colors cursor-pointer select-none"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      {/* Unsaved changes warning banner */}
      {showUnsavedBanner && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 p-4 rounded-lg flex items-center justify-between shadow-sm animate-fade-in font-sans mb-4 max-w-4xl w-full">
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] font-bold uppercase tracking-wider">
              UNSAVED CHANGES IN {activeSteps[dirtyStep]?.label}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSaveDirtyStep(dirtyStep)}
              className="px-4 py-2 bg-amber-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-md hover:bg-amber-700 transition cursor-pointer select-none border-0"
            >
              SAVE NOW
            </button>
            <button
              onClick={() => discardStepChanges(dirtyStep)}
              className="px-4 py-2 bg-white border border-amber-300 text-amber-700 font-bold text-[11px] uppercase tracking-wider rounded-md hover:bg-amber-100 transition cursor-pointer select-none"
            >
              DISCARD
            </button>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="max-w-4xl w-full">
        <SectionHeader title="My Profile" size="lg" ruled={true} className="mb-0" />
        <p className="text-ui-sm text-neutral-500 font-semibold uppercase tracking-wider mt-3">
          Configure your professional clinical parameters, update coordinates, set fee charts, and submit license files.
        </p>
      </div>

      {/* Stepper Navigation */}
      <div className="max-w-4xl w-full">
        <HorizontalStepper
          steps={activeSteps}
          activeStep={editorStep}
          completedSteps={completedSteps}
          animatingStepIdx={animatingStepIdx}
          onStepClick={handleStepChange}
        />
      </div>


      {/* ── PERSONAL INFORMATION (Step 0) ── */}
      {activeSteps[editorStep]?.key === 'personal' && (
        <div className="max-w-3xl w-full flex flex-col gap-6">
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
        </div>
      )}

      {/* ── PROFESSIONAL DETAILS (Step 1) ── */}
      {activeSteps[editorStep]?.key === 'professional' && (
        <div className="max-w-3xl w-full flex flex-col gap-6">
          <SectionHeader title="Professional Details" size="sm" ruled={true} className="mb-0" />
          
          {/* Specialization Multi-Select Dropdown */}
          <div className="flex flex-col gap-1.5" ref={specDropdownRef}>
            <label className="text-[12px] font-semibold text-neutral-700">Specialization *</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => !isJunior && setSpecDropdownOpen((o) => !o)}
                disabled={isJunior}
                className={`w-full h-10 px-3 border border-neutral-200 rounded-md text-left flex items-center justify-between shadow-sm transition-all focus:outline-none ${
                  isJunior 
                    ? 'bg-neutral-50 text-neutral-500 cursor-not-allowed border-neutral-200 shadow-none' 
                    : 'bg-white hover:border-primary focus:ring-3 focus:ring-primary/12 focus:border-primary'
                }`}
              >
                <span className={`text-ui-sm font-semibold truncate ${selectedSpecs.length === 0 ? 'text-neutral-400' : 'text-neutral-900'}`}>
                  {selectedSpecs.length === 0 ? 'Select specializations...' : selectedSpecs.join(', ')}
                </span>
                {isJunior ? (
                  <svg className="w-3.5 h-3.5 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${specDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                )}
              </button>

              {specDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg max-h-56 overflow-y-auto">
                  {SPECIALIZATION_OPTIONS.map((option) => {
                    const isSelected = selectedSpecs.includes(option);
                    return (
                      <div
                        key={option}
                        onClick={() => toggleSpec(option)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-neutral-50 transition-colors select-none ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className={`w-4 h-4 border-2 rounded-sm shrink-0 flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-primary border-primary' : 'border-neutral-300 bg-white'
                        }`}>
                          {isSelected && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className={`text-ui-sm font-semibold ${isSelected ? 'text-neutral-900' : 'text-neutral-600'}`}>{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedSpecs.length > 0 && (
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {selectedSpecs.length} selected
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Years experience narrow input */}
            <Input
              type="number"
              label="Years of Practice Experience *"
              min="0"
              max="60"
              value={experience}
              onChange={(e) => setExperience(e.target.value.replace(/\D/g, ''))}
              required
              placeholder="e.g. 5"
              disabled={isJunior}
              showLock={isJunior}
            />
            {/* Medical registration number */}
            <Input
              type="text"
              label="Medical Registration Number *"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              required
              placeholder="e.g. MCI-12345"
              disabled={isJunior}
              showLock={isJunior}
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
      )}

      {/* ── CLINIC DETAILS (Step 2) ── */}
      {activeSteps[editorStep]?.key === 'clinic' && (
        <div className="max-w-3xl w-full flex flex-col gap-6">
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

            {/* Geolocation Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <Input
                type="text"
                label="Latitude *"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 18.5204"
                disabled={!isManualCoordinates}
                required
              />
              <Input
                type="text"
                label="Longitude *"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 73.8567"
                disabled={!isManualCoordinates}
                required
              />
            </div>
            
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleUseMyLocation}
                className="h-10 px-5 bg-[#0B4F6C] hover:bg-[#083A52] text-white rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors flex-1 cursor-pointer select-none"
              >
                USE MY LOCATION →
              </button>
              <button
                type="button"
                onClick={() => setIsManualCoordinates(!isManualCoordinates)}
                className="h-10 px-4 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-md text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer select-none bg-white"
              >
                {isManualCoordinates ? 'Lock Coordinates' : 'Edit Manually'}
              </button>
            </div>
            {locationError && (
              <span className="text-[11px] text-[#C0392B] font-bold mt-1">
                {locationError}
              </span>
            )}
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
        </div>
      )}

      {/* ── VERIFICATION DOCUMENTS & STATUS (Step 3) ── */}
      {activeSteps[editorStep]?.key === 'documents' && !isVerified && (
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 select-none">
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

          {/* Verification status timeline */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <SectionHeader title="Verification Status" size="sm" ruled={true} className="mb-0" />
            <div className="flex flex-col gap-6 bg-white border border-neutral-200 rounded-lg p-6 shadow-level-1 select-none">
              <div className="flex flex-col gap-0">
                {statusStepsList.map((step, idx) => {
                  const isTimelineCompleted = idx < activeStatusStep;
                  const isTimelineActive = idx === activeStatusStep;
                  const isTimelineFuture = idx > activeStatusStep;
                  
                  return (
                    <div key={step.key} className="flex gap-4 items-start relative pb-6 last:pb-0">
                      {/* Left line segment */}
                      {idx < statusStepsList.length - 1 && (
                        <div className={`absolute left-2.5 top-5 bottom-0 w-0.5 border-l-2
                          ${idx < activeStatusStep ? 'border-success border-solid' : 'border-neutral-200 border-dashed'}
                        `} />
                      )}
                      
                      {/* Indicator dot */}
                      <div className={`rounded-full border-2 flex items-center justify-center shrink-0 z-10
                        ${isTimelineCompleted ? 'bg-[#E8F8F5] border-success text-success' : ''}
                        ${isTimelineActive ? 'bg-[#E8F4F8] border-primary text-primary animate-pulse' : ''}
                        ${isTimelineFuture ? 'bg-white border-neutral-200 text-neutral-400' : ''}
                      `} style={{ width: '22px', height: '22px' }}>
                        {isTimelineCompleted ? (
                          <span className="text-[10px] font-black">✓</span>
                        ) : (
                          <span className="text-[9px] font-bold">{idx + 1}</span>
                        )}
                      </div>
                      
                      <div className="flex flex-col text-left">
                        <span className={`text-[10px] font-black tracking-wider uppercase leading-tight
                          ${isTimelineActive ? 'text-primary' : ''}
                          ${isTimelineCompleted ? 'text-success' : ''}
                          ${isTimelineFuture ? 'text-neutral-400' : ''}
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

      {/* ── PRACTICE STRUCTURE (Step key 'practice') ── */}
      {activeSteps[editorStep]?.key === 'practice' && (
        <div className="max-w-3xl w-full flex flex-col gap-6 animate-fade-in text-left">
          <SectionHeader title="Practice Structure" size="sm" ruled={true} className="mb-0" />
          
          <div className="flex flex-col gap-3">
            <span className="text-[12px] font-semibold text-neutral-700">
              Do you supervise junior physiotherapists?
            </span>
            <span className="text-[11px] text-neutral-500 mt-0.5">
              If yes, you can invite them to your practice after registration.
            </span>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Tile A — Independent */}
              <div
                onClick={() => {
                  setIsSupervising('no');
                }}
                className={`border-2 rounded-lg p-5 cursor-pointer text-center transition-all duration-150 flex flex-col items-center gap-3 select-none ${
                  isSupervising === 'no'
                    ? 'border-[#0B4F6C] bg-[#E8F4F8]'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <svg className={`w-7 h-7 transition-colors ${isSupervising === 'no' ? 'text-[#0B4F6C]' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-neutral-900">Independent</span>
                  <span className="text-[12px] text-neutral-500 mt-1">Solo practice</span>
                </div>
              </div>

              {/* Tile B — Senior Doctor */}
              <div
                onClick={() => {
                  setIsSupervising('yes');
                }}
                className={`border-2 rounded-lg p-5 cursor-pointer text-center transition-all duration-150 flex flex-col items-center gap-3 select-none ${
                  isSupervising === 'yes'
                    ? 'border-[#0B4F6C] bg-[#E8F4F8]'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <svg className={`w-7 h-7 transition-colors ${isSupervising === 'yes' ? 'text-[#0B4F6C]' : 'text-neutral-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-bold text-[14px] text-neutral-900">Senior Doctor</span>
                  <span className="text-[12px] text-neutral-500 mt-1">With junior doctors</span>
                </div>
              </div>
            </div>

            {isSupervising === 'yes' && (
              <div className="flex flex-col gap-6 mt-4 text-left animate-fade-in">
                {/* Practice Name */}
                <Input
                  type="text"
                  label="Practice Name (Optional)"
                  value={practiceName}
                  onChange={(e) => setPracticeName(e.target.value)}
                  placeholder="e.g. Sharma Physiotherapy Clinic"
                  maxLength={100}
                />

                {/* Maximum Junior Doctors selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-semibold text-neutral-700">
                    Maximum Junior Doctors
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMaxJuniorDoctors((prev) => Math.max(1, prev - 1))}
                      disabled={maxJuniorDoctors <= 1}
                      className="w-7 h-7 border border-neutral-200 rounded-md text-neutral-600 bg-white flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 select-none cursor-pointer"
                    >
                      −
                    </button>
                    <span className="font-bold text-[15px] text-neutral-900 w-8 text-center">
                      {maxJuniorDoctors}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMaxJuniorDoctors((prev) => Math.min(10, prev + 1))}
                      disabled={maxJuniorDoctors >= 10}
                      className="w-7 h-7 border border-neutral-200 rounded-md text-neutral-600 bg-white flex items-center justify-center hover:bg-neutral-50 disabled:opacity-50 select-none cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1">
                    You can change this later in your practice settings.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Persistent Bottom Save Changes Bar ── */}
      <div className="sticky bottom-0 z-50 bg-white border-t border-neutral-200 p-4 select-none shadow-level-3 -mx-6 -mb-6 mt-8">
        <div className="max-w-[1440px] mx-auto px-6 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {editorStep > 0 && (
              <button
                type="button"
                onClick={() => handleStepChange(editorStep - 1)}
                disabled={isSaving}
                className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold text-ui-xs uppercase tracking-widest transition-all select-none rounded-md cursor-pointer disabled:opacity-50"
              >
                ← Back
              </button>
            )}
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest hidden sm:inline-block">
              {isDirty ? 'Unsaved profile changes detected.' : 'Profile settings are in sync.'}
            </span>
          </div>
          
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

            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="px-4 py-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold text-ui-xs uppercase tracking-widest transition-all select-none rounded-md cursor-pointer disabled:opacity-50 bg-white"
            >
              Save Draft
            </button>

            <Button
              onClick={handleSaveStep}
              disabled={isSaving}
              variant="primary"
              className="h-10 px-6 font-bold"
            >
              {isSaving 
                ? 'Saving changes...' 
                : isDirty 
                  ? (editorStep === activeSteps.length - 1 ? 'Save & Complete ✓' : 'Save & Next →') 
                  : (editorStep === activeSteps.length - 1 ? 'Complete ✓' : 'Next Step →')
              }
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default DoctorProfileEditor;
