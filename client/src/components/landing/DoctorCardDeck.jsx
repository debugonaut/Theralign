import React, { useState } from 'react';
import { MapPin, Check } from 'lucide-react';
import { getNearbyDoctorsAPI } from '../../api/discovery.api';
import VerifiedBadge from '../common/VerifiedBadge';

// Premium local doctor avatars matching user-supplied images exactly
const DEFAULT_DOCTORS = [
  {
    id: 'doc_1',
    name: 'Dr. Priya Sharma',
    specialty: 'Orthopedic Physiotherapy',
    avatar: '/images/doc1.jpg',
    rating: 4.9,
    reviewCount: 142,
    verificationStatus: 'verified',
    distance: '1.4'
  },
  {
    id: 'doc_2',
    name: 'Dr. Nupoor Deshpande',
    specialty: 'Sports Injury Rehab',
    avatar: '/images/doc2.jpg',
    rating: 4.8,
    reviewCount: 98,
    verificationStatus: 'verified',
    distance: '2.8'
  },
  {
    id: 'doc_3',
    name: 'Dr. Manoj Mishra',
    specialty: 'Neurological Care',
    avatar: '/images/doc3.jpg',
    rating: 4.7,
    reviewCount: 115,
    verificationStatus: 'verified',
    distance: '3.5'
  },
  {
    id: 'doc_4',
    name: 'Dr. Veronica Powell',
    specialty: 'Geriatric Rehab',
    avatar: '/images/doc4.webp',
    rating: 4.9,
    reviewCount: 76,
    verificationStatus: 'verified',
    distance: '4.1'
  },
  {
    id: 'doc_5',
    name: 'Dr. Lee Chong Mei',
    specialty: 'Pediatric Physiotherapy',
    avatar: '/images/doc5.jpg',
    rating: 4.8,
    reviewCount: 122,
    verificationStatus: 'verified',
    distance: '5.0'
  }
];

// Staggered 5-card config. Top card is index 0.
const CARD_STACK_CONFIG = [
  { zIndex: 50, x: 0,   y: 0,   scale: 1.00, opacity: 1.00 },
  { zIndex: 40, x: 8,   y: 8,   scale: 0.97, opacity: 0.95 },
  { zIndex: 30, x: 16,  y: 16,  scale: 0.94, opacity: 0.85 },
  { zIndex: 20, x: 24,  y: 24,  scale: 0.91, opacity: 0.70 },
  { zIndex: 10, x: 32,  y: 32,  scale: 0.88, opacity: 0.50 },
];

function DoctorCard({ doctor, style, isTop, onClick }) {
  const docName = doctor.name || 'Physiotherapist';
  const specialtyText = Array.isArray(doctor.specialty)
    ? doctor.specialty[0]
    : doctor.specialty || 'General Physiotherapy';

  const initial = docName.replace('Dr. ', '').charAt(0).toUpperCase();

  // Dynamic distance color styling: green if close (< 2.0 km), yellow if middle (2.0 - 4.0 km), red if far (> 4.0 km)
  const distVal = parseFloat(doctor.distance || 0);
  let distColor = 'bg-[#10B981] text-white border-[#0F766E]'; // close -> green
  if (distVal > 4.0) {
    distColor = 'bg-accent text-white border-[#B91C1C]'; // far -> red
  } else if (distVal >= 2.0) {
    distColor = 'bg-[#EAB308] text-neutral-900 border-[#A16207]'; // middle -> yellow
  }

  return (
    <div
      onClick={isTop ? onClick : undefined}
      className={`absolute top-0 left-0 w-full transition-all duration-[300ms] ease-swiss ${
        isTop ? 'cursor-pointer hover:-translate-x-1.5 hover:-translate-y-1.5' : 'cursor-default pointer-events-none'
      }`}
      style={style}
    >
      {/* Polaroid Frame Container */}
      <div
        className="bg-white border-2 border-neutral-900 p-4 rounded-none text-left select-none relative flex flex-col justify-between"
        style={{
          minHeight: '420px',
        }}
      >
        {/* Centered Image (Polaroid Photo Aspect) */}
        <div className="relative w-full h-[260px] border-2 border-neutral-900 bg-neutral-50 flex items-center justify-center overflow-hidden mb-4">
          {doctor.avatar ? (
            <div className="relative w-full h-full">
              <img
                src={doctor.avatar}
                alt={docName}
                className="w-full h-full object-cover absolute inset-0 z-10"
                onError={(e) => {
                  e.target.style.opacity = '0';
                }}
              />
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center font-black text-3xl text-neutral-900 select-none absolute inset-0 z-0">
                {initial}
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center font-black text-3xl text-neutral-900 select-none">
              {initial}
            </div>
          )}
        </div>
        
        {/* Polaroid Lip Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-2">
              <p className="font-black text-neutral-900 text-[16px] uppercase tracking-tight truncate leading-none">
                {docName.startsWith('Dr. ') ? docName : `DR. ${docName}`}
              </p>
              {doctor.verificationStatus === 'verified' && (
                <VerifiedBadge size="xs" className="shrink-0" />
              )}
            </div>
            <p className="text-[10px] text-accent font-black uppercase tracking-widest truncate mt-1.5">
              {specialtyText}
            </p>
          </div>

          <div className="flex justify-between items-end mt-4 pt-2 border-t border-neutral-200">
            <p className="text-ui-xs font-bold text-swiss-gray-650 uppercase tracking-wider leading-none">
              ★ {Number(doctor.rating || 0).toFixed(1)} <span className="text-neutral-500">({doctor.reviewCount || 0} reviews)</span>
            </p>

            {doctor.distance && (
              <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 border border-neutral-900 leading-none ${distColor}`}>
                {doctor.distance} KM AWAY
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DoctorCardDeck() {
  const [doctors, setDoctors] = useState(DEFAULT_DOCTORS);
  const [topIndex, setTopIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [locationState, setLocationState] = useState('idle'); 
  // States: 'idle' | 'requesting' | 'loading' | 'success' | 'denied' | 'error'

  const requestNearbyDoctors = async () => {
    if (!navigator.geolocation) {
      setLocationState('error');
      return;
    }

    setLocationState('requesting');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationState('loading');
        const { latitude, longitude } = position.coords;

        try {
          const res = await getNearbyDoctorsAPI({
            latitude,
            longitude,
            maxDistance: 5000,
            limit: 5,
          });

          const rawDocs = res?.data?.doctors || res?.doctors || [];

          if (rawDocs.length === 0) {
            setLocationState('idle');
            return;
          }

          // Map MongoDB schema to local component representation
          const mapped = rawDocs.map((doc, idx) => ({
            id: doc._id || `nearby_${idx}`,
            name: doc.user?.name || 'Physiotherapist',
            specialty: Array.isArray(doc.specialization) ? doc.specialization.join(', ') : doc.specialization,
            avatar: doc.user?.profileImage || null,
            rating: doc.rating || 5.0,
            reviewCount: doc.reviewCount || 10,
            verificationStatus: doc.verificationStatus || 'verified',
            distance: doc.distanceKm ? doc.distanceKm.toFixed(1) : '1.0',
          }));

          setDoctors(mapped);
          setTopIndex(0); // reset deck
          setLocationState('success');
        } catch (err) {
          console.error('Nearby fetch failed:', err);
          setLocationState('error');
          setDoctors(DEFAULT_DOCTORS);
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState('denied');
        } else {
          setLocationState('error');
        }
        setDoctors(DEFAULT_DOCTORS);
      },
      {
        timeout: 8000,
        maximumAge: 300000,
        enableHighAccuracy: false,
      }
    );
  };

  // We render 6 items in the buffer loop so the shuffle transition is flawless
  const visibleDoctors = Array.from({ length: 6 }).map((_, i) => {
    return doctors[(topIndex + i) % doctors.length];
  });

  const handleShuffle = () => {
    if (isShuffling || doctors.length <= 1) return;
    setIsShuffling(true);

    setTimeout(() => {
      setTopIndex(prev => (prev + 1) % doctors.length);
      setIsShuffling(false);
    }, 300); // 300ms transition sync
  };

  const labels = {
    idle:       'Show doctors near me',
    requesting: 'Waiting for location...',
    loading:    'Finding nearby doctors...',
    success:    'Showing doctors near you',
    denied:     'Location access denied',
    error:      'Could not get location',
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[480px] mx-auto select-none">
      
      {/* 3D Staggered Cards container */}
      <div className="relative w-full h-[460px] select-none">
        {visibleDoctors.map((doc, idx) => {
          // Render order: bottom-to-top so elements overlap correctly
          const stackIdx = 5 - idx;
          if (stackIdx < 0 || stackIdx > 5) return null;

          const currentDoc = visibleDoctors[stackIdx];

          // Compute visual card parameters based on shuffling states
          let style = {};
          if (isShuffling) {
            if (stackIdx === 0) {
              // Shuffling out to the left
              style = {
                zIndex: 60,
                transform: 'translate(-280px, 40px) rotate(-8deg) scale(1.00)',
                opacity: 0,
              };
            } else if (stackIdx === 5) {
              // Fades in at the very bottom
              style = {
                zIndex: 5,
                transform: 'translate(40px, 40px) scale(0.85)',
                opacity: 0,
              };
            } else {
              // Standard slide-up
              const config = CARD_STACK_CONFIG[stackIdx - 1];
              style = {
                zIndex: config.zIndex,
                transform: `translate(${config.x}px, ${config.y}px) scale(${config.scale})`,
                opacity: config.opacity,
              };
            }
          } else {
            if (stackIdx === 5) {
              // Hide the extra 6th buffer card when idle
              style = {
                zIndex: 5,
                transform: 'translate(40px, 40px) scale(0.85)',
                opacity: 0,
              };
            } else {
              const config = CARD_STACK_CONFIG[stackIdx];
              style = {
                zIndex: config.zIndex,
                transform: `translate(${config.x}px, ${config.y}px) scale(${config.scale})`,
                opacity: config.opacity,
              };
            }
          }

          return (
            <DoctorCard
              key={`${currentDoc.id}_${stackIdx}`}
              doctor={currentDoc}
              style={style}
              isTop={stackIdx === 0}
              onClick={handleShuffle}
            />
          );
        })}
      </div>

      {/* Geolocation Loading Trigger */}
      <div className="w-full flex justify-center mt-2">
        <button
          onClick={locationState === 'idle' || locationState === 'error' || locationState === 'denied' ? requestNearbyDoctors : undefined}
          disabled={['requesting', 'loading'].includes(locationState)}
          className={`
            text-[11px] font-black uppercase tracking-widest py-2.5 px-4
            border-2 border-neutral-900 rounded-none transition-all duration-fast select-none
            flex items-center justify-center gap-1.5
            ${locationState === 'success'
              ? 'bg-neutral-900 text-white cursor-default'
              : ['requesting', 'loading'].includes(locationState)
                ? 'bg-neutral-100 text-neutral-500 opacity-60 cursor-not-allowed'
                : 'bg-white text-neutral-900 hover:bg-neutral-900 hover:text-white cursor-pointer active:scale-[0.98]'
            }
          `}
        >
          {locationState === 'idle' && <MapPin className="w-3.5 h-3.5" />}
          {locationState === 'success' && <Check className="w-3.5 h-3.5" />}
          {labels[locationState]}
        </button>
      </div>
    </div>
  );
}
