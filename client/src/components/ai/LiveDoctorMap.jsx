import React, { useState } from 'react';
import { MapPin, Navigation, Star, ShieldAlert } from 'lucide-react';

const LiveDoctorMap = ({ doctors = [], city = '' }) => {
  const [hoveredDoctor, setHoveredDoctor] = useState(null);

  // Coordinate centers for seeded cities
  const cityCoordinates = {
    mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
    pune: { lat: 18.5204, lng: 73.8567, name: 'Pune' },
    bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
    delhi: { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
    hyderabad: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  };

  const activeCityName = city || 'Pune';
  const center = cityCoordinates[activeCityName.toLowerCase()] || cityCoordinates.pune;

  // Scale factor to map lat/lng deltas to 15% - 85% range inside the container
  const getRelativePosition = (doctorLat, doctorLng) => {
    const lat = doctorLat || center.lat;
    const lng = doctorLng || center.lng;

    const latDelta = lat - center.lat;
    const lngDelta = lng - center.lng;

    // Scale coordinates so a +/- 0.08 degree difference beautifully maps within the grid bounds
    const scale = 400; 
    const x = 50 + lngDelta * scale;
    const y = 50 - latDelta * scale;

    return {
      x: Math.max(12, Math.min(88, x)),
      y: Math.max(12, Math.min(88, y))
    };
  };

  // Group doctors by approximate coordinates to find density clusters for heatmaps
  const clusters = [];
  doctors.forEach((doc) => {
    const pos = getRelativePosition(doc.latitude, doc.longitude);
    const existing = clusters.find(
      (c) => Math.abs(c.x - pos.x) < 15 && Math.abs(c.y - pos.y) < 15
    );
    if (existing) {
      existing.count += 1;
    } else {
      clusters.push({ x: pos.x, y: pos.y, count: 1 });
    }
  });

  return (
    <div className="w-full flex-grow flex flex-col border border-neutral-200 bg-white rounded-xl shadow-sm p-5 relative overflow-hidden select-none" style={{ minHeight: '380px' }}>
      {/* Map Header Status Bar */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest font-swiss">
            Realtime Clinic Heatmap
          </span>
        </div>
        <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
          GPS Center: {center.lat.toFixed(4)}°, {center.lng.toFixed(4)}° ({center.name})
        </div>
      </div>

      {/* Interactive Map Grid Container */}
      <div className="flex-1 w-full bg-[#f8fafc] border border-neutral-200/80 rounded-lg relative overflow-hidden shadow-inner flex flex-col justify-center items-center">
        {/* Architect blueprint gridlines background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Vector compass marker */}
        <div className="absolute bottom-4 right-4 w-12 h-12 border border-neutral-300 bg-white/60 rounded-full flex items-center justify-center pointer-events-none shadow-sm z-0">
          <Navigation className="w-5 h-5 text-neutral-400 transform -rotate-45" />
          <span className="absolute -top-1.5 text-[8px] font-bold text-neutral-400">N</span>
        </div>

        {/* Dynamic Glowing Density Heatmap Circular Clouds */}
        {clusters.map((c, i) => {
          // Only show heatmaps around clusters with multiple specialists
          if (c.count < 2) return null;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-primary/8 blur-2xl pointer-events-none transition-all duration-500 animate-pulse"
              style={{
                left: `${c.x}%`,
                top: `${c.y}%`,
                width: `${c.count * 45}px`,
                height: `${c.count * 45}px`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}

        {/* Pulsating Patient/User Pin at the active city coordinate center */}
        <div 
          className="absolute z-20 group/patient cursor-pointer"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          {/* Cyan pulsing radar ring */}
          <div className="absolute inset-0 rounded-full bg-teal-400 animate-ping opacity-60 w-8 h-8 -left-2 -top-2" />
          {/* Main location core indicator */}
          <div className="w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow-md flex items-center justify-center relative">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          {/* Location details label */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[9px] font-black uppercase tracking-wider py-1 px-2 rounded shadow-level-2 pointer-events-none opacity-0 group-hover/patient:opacity-100 transition-opacity duration-300 whitespace-nowrap z-30">
            My Location (Patient Center)
          </div>
        </div>

        {/* Active Doctors Pin Map */}
        {doctors.map((doc) => {
          const pos = getRelativePosition(doc.latitude, doc.longitude);
          const isHovered = hoveredDoctor && hoveredDoctor._id === doc._id;

          return (
            <div
              key={doc._id}
              className="absolute z-30"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: 'translate(-50%, -100%)',
              }}
              onMouseEnter={() => setHoveredDoctor(doc)}
              onMouseLeave={() => setHoveredDoctor(null)}
            >
              {/* Doctor Pin marker */}
              <button
                type="button"
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 shadow-md focus:outline-none cursor-pointer
                  ${isHovered 
                    ? 'bg-primary border-white scale-125 z-40' 
                    : 'bg-white border-primary scale-100'
                  }
                `}
              >
                <MapPin className={`w-4 h-4 transition-colors ${isHovered ? 'text-white' : 'text-primary'}`} />
              </button>

              {/* Specialist Floating Popover Tooltip */}
              {isHovered && (
                <div 
                  className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white border border-neutral-200 p-3 rounded-lg shadow-level-3 pointer-events-none z-50 flex flex-col gap-1.5 w-48 text-left transition-all duration-300 page-fade-in"
                  style={{ transform: 'translate(-50%, -4px)' }}
                >
                  {/* Micro Header */}
                  <div>
                    <h5 className="font-bold text-[12px] text-neutral-900 truncate leading-none mb-1">
                      {doc.user?.name ? (doc.user.name.toLowerCase().startsWith('dr.') ? doc.user.name : `Dr. ${doc.user.name}`) : 'Physiotherapist'}
                    </h5>
                    <p className="text-[9px] text-accent font-black uppercase tracking-wider truncate">
                      {Array.isArray(doc.specialization) ? doc.specialization[0] : doc.specialization || 'Clinical Specialist'}
                    </p>
                  </div>

                  <div className="h-[1px] bg-neutral-100 w-full" />

                  {/* Micro Specs */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-neutral-600 uppercase tracking-wide">
                    <div className="flex items-center gap-0.5 text-neutral-900">
                      <Star className="w-3 h-3 text-warning fill-warning" />
                      <span>{(doc.averageRating || 5).toFixed(1)}</span>
                    </div>
                    <div>₹{doc.consultationFee} / Session</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty specialists warning status indicator overlay */}
        {doctors.length === 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center z-10">
            <ShieldAlert className="w-8 h-8 text-neutral-400 mb-2 animate-bounce" />
            <h5 className="text-xs font-black text-neutral-700 uppercase tracking-wider">No Clinics Found Nearby</h5>
            <p className="text-[10px] text-neutral-500 mt-1 max-w-[200px]">Modify your location or search filter queries to see specialists.</p>
          </div>
        )}
      </div>

      {/* Map Footer status */}
      {doctors.length > 0 && (
        <div className="mt-3 shrink-0 flex items-center justify-between text-[9px] text-neutral-400 font-bold uppercase tracking-wider border-t border-neutral-100 pt-2.5">
          <span>Patient Radar Active</span>
          <span>{doctors.length} clinics mapped in {activeCityName}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(LiveDoctorMap);
