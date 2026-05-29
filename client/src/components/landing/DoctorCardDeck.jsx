import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getNearbyDoctorsAPI } from '../../api/discovery.api';
import VerifiedBadge from '../common/VerifiedBadge';

// Premium Unsplash medical avatars & details as high-quality default fallbacks
const DEFAULT_DOCTORS = [
  {
    id: 'doc_1',
    name: 'Dr. Priya Sharma',
    specialty: 'Orthopedic Physiotherapy',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 142,
    verificationStatus: 'verified',
    distance: '1.4'
  },
  {
    id: 'doc_2',
    name: 'Dr. John Smith',
    specialty: 'Sports Injury Rehab',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
    rating: 4.8,
    reviewCount: 98,
    verificationStatus: 'verified',
    distance: '2.8'
  },
  {
    id: 'doc_3',
    name: 'Dr. Sarah Jenkins',
    specialty: 'Neurological Care',
    avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=300',
    rating: 4.7,
    reviewCount: 115,
    verificationStatus: 'verified',
    distance: '3.5'
  },
  {
    id: 'doc_4',
    name: 'Dr. Marcus Vance',
    specialty: 'Geriatric Rehab',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=300',
    rating: 4.9,
    reviewCount: 76,
    verificationStatus: 'verified',
    distance: '4.1'
  }
];

const CARD_STACK_CONFIG = [
  { zIndex: 30, x: 0,   y: 0,   scale: 1.00, opacity: 1.00 },
  { zIndex: 20, x: 8,   y: 8,   scale: 0.97, opacity: 0.90 },
  { zIndex: 10, x: 16,  y: 16,  scale: 0.94, opacity: 0.75 },
];

function DoctorCard({ doctor, stackIndex, isTop, onClick }) {
  const config = CARD_STACK_CONFIG[stackIndex] || CARD_STACK_CONFIG[CARD_STACK_CONFIG.length - 1];

  const specialtyText = Array.isArray(doctor.specialty)
    ? doctor.specialty[0]
    : doctor.specialty || 'General Physiotherapy';

  const docName = doctor.name || 'Physiotherapist';
  const initial = docName.replace('Dr. ', '').charAt(0).toUpperCase();

  return (
    <motion.div
      onClick={isTop ? onClick : undefined}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: config.zIndex,
        cursor: isTop ? 'pointer' : 'default',
        width: '100%',
      }}
      animate={{
        x: config.x,
        y: config.y,
        scale: config.scale,
        opacity: config.opacity,
      }}
      whileHover={isTop ? { x: -6, y: -6 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div
        className="bg-swiss-white border-2 border-swiss-black p-5 rounded-none text-left select-none relative"
        style={{
          minHeight: '170px',
        }}
      >
        {/* Verified Badge */}
        {doctor.verificationStatus === 'verified' && (
          <div className="absolute top-4 right-4 z-10">
            <VerifiedBadge size="xs" />
          </div>
        )}

        <div className="flex gap-4 items-start pr-12">
          {doctor.avatar ? (
            <img
              src={doctor.avatar}
              alt={docName}
              className="w-14 h-14 object-cover border-2 border-swiss-black rounded-none shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-none bg-swiss-black text-swiss-white flex items-center justify-center font-black text-lg select-none shrink-0 border-2 border-swiss-black">
              {initial}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <p className="font-black text-swiss-black text-ui-md uppercase tracking-tight truncate leading-none mb-1">
              {docName.startsWith('Dr. ') ? docName : `DR. ${docName}`}
            </p>
            <p className="text-[10px] text-swiss-red font-black uppercase tracking-widest truncate mb-2">
              {specialtyText}
            </p>
            <p className="text-ui-xs font-bold text-swiss-gray-600 uppercase tracking-wider mb-2">
              ★ {Number(doctor.rating || 0).toFixed(1)} <span className="text-swiss-gray-400">({doctor.reviewCount || 0} reviews)</span>
            </p>

            {doctor.distance && (
              <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-swiss-black text-swiss-white">
                {doctor.distance} KM AWAY
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DoctorCardDeck() {
  const [doctors, setDoctors] = useState(DEFAULT_DOCTORS);
  const [topIndex, setTopIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [exitingCard, setExitingCard] = useState(null);
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

  // Safe bounds check in case API returns fewer than 3 docs
  const stackSize = Math.min(doctors.length, 3);
  const visibleDoctors = Array.from({ length: stackSize }).map((_, i) => {
    return doctors[(topIndex + i) % doctors.length];
  });

  const handleShuffle = () => {
    if (isShuffling || doctors.length <= 1) return;
    setIsShuffling(true);
    setExitingCard(visibleDoctors[0]);

    setTimeout(() => {
      setTopIndex(prev => (prev + 1) % doctors.length);
      setExitingCard(null);
      setIsShuffling(false);
    }, 250);
  };

  const labels = {
    idle:       '📍 Show doctors near me',
    requesting: 'Waiting for location...',
    loading:    'Finding nearby doctors...',
    success:    '✓ Showing doctors near you',
    denied:     'Location access denied',
    error:      'Could not get location',
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-[360px] mx-auto select-none">
      
      {/* 3D Staggered Cards container */}
      <div className="relative w-full h-[210px] select-none">
        
        {/* Animate exit fly-off for front-most card */}
        <AnimatePresence>
          {exitingCard && (
            <motion.div
              key={exitingCard.id}
              initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
              animate={{ x: -280, rotate: -8, opacity: 0 }}
              exit={{}}
              transition={{ duration: 0.25, ease: 'easeIn' }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 40,
              }}
            >
              <div
                className="bg-swiss-white border-2 border-swiss-black p-5 rounded-none text-left relative"
                style={{ minHeight: '170px' }}
              >
                {exitingCard.verificationStatus === 'verified' && (
                  <div className="absolute top-4 right-4 z-10">
                    <VerifiedBadge size="xs" />
                  </div>
                )}
                <div className="flex gap-4 items-start pr-12">
                  {exitingCard.avatar ? (
                    <img
                      src={exitingCard.avatar}
                      alt={exitingCard.name}
                      className="w-14 h-14 object-cover border-2 border-swiss-black rounded-none shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-none bg-swiss-black text-swiss-white flex items-center justify-center font-black text-lg select-none shrink-0 border-2 border-swiss-black" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-swiss-black text-ui-md uppercase tracking-tight truncate leading-none mb-1">
                      {exitingCard.name.startsWith('Dr. ') ? exitingCard.name : `DR. ${exitingCard.name}`}
                    </p>
                    <p className="text-[10px] text-swiss-red font-black uppercase tracking-widest truncate mb-2">
                      {Array.isArray(exitingCard.specialty) ? exitingCard.specialty[0] : exitingCard.specialty}
                    </p>
                    <p className="text-ui-xs font-bold text-swiss-gray-600 uppercase tracking-wider mb-2">
                      ★ {Number(exitingCard.rating || 0).toFixed(1)} <span className="text-swiss-gray-400">({exitingCard.reviewCount || 0} reviews)</span>
                    </p>
                    {exitingCard.distance && (
                      <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-swiss-black text-swiss-white">
                        {exitingCard.distance} KM AWAY
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back-to-front rendering of remaining cards so front sits on top in DOM order */}
        {visibleDoctors.map((doc, idx) => {
          const stackIdx = visibleDoctors.length - 1 - idx;
          const currentDoc = visibleDoctors[stackIdx];
          
          // Do not render the card in deck if it is currently executing exit animation
          if (exitingCard && currentDoc.id === exitingCard.id) return null;

          return (
            <DoctorCard
              key={currentDoc.id}
              doctor={currentDoc}
              stackIndex={stackIdx}
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
            border-2 border-swiss-black rounded-none transition-all duration-fast select-none
            ${locationState === 'success'
              ? 'bg-swiss-black text-swiss-white cursor-default'
              : ['requesting', 'loading'].includes(locationState)
                ? 'bg-swiss-gray-100 text-swiss-gray-400 opacity-60 cursor-not-allowed'
                : 'bg-swiss-white text-swiss-black hover:bg-swiss-black hover:text-swiss-white cursor-pointer active:scale-[0.98]'
            }
          `}
        >
          {labels[locationState]}
        </button>
      </div>
    </div>
  );
}
