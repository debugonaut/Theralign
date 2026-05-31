import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';

const LiveDoctorMap = ({ doctors = [], city = '' }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);

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

  // ─── 1. Load Leaflet CSS and JS Dynamically via CDN ───
  useEffect(() => {
    // Inject CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inject CSS dynamic animation styles
    if (!document.getElementById('leaflet-animation-css')) {
      const style = document.createElement('style');
      style.id = 'leaflet-animation-css';
      style.innerHTML = `
        @keyframes ping {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .custom-patient-icon, .custom-doctor-icon {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
          border: 1px solid #e5e7eb !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Inject JS
    if (window.L) {
      setMapLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setMapLoaded(true);
      document.body.appendChild(script);
    }
  }, []);

  // ─── 2. Initialize and Update Leaflet Map Instance ───
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.L) return;

    const L = window.L;

    // Destruct older instance if any to support dynamic city hot-reloading
    if (leafletInstance.current) {
      leafletInstance.current.remove();
      leafletInstance.current = null;
    }

    // Initialize Map Viewport centered on patient
    const map = L.map(mapRef.current, {
      zoomControl: false,
      scrollWheelZoom: true
    }).setView([center.lat, center.lng], 13);

    leafletInstance.current = map;

    // Add standard zoom control at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Apply Premium Architectural CartoDB Positron minimal tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // ─── 3. Add Pulse Patient Location Icon ───
    const patientIcon = L.divIcon({
      className: 'custom-patient-icon',
      html: `
        <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: rgba(20, 184, 166, 0.4); animation: ping 1.5s infinite; left: -6px; top: -6px;"></div>
          <div style="width: 14px; height: 14px; background-color: #14b8a6; border: 2px solid white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    L.marker([center.lat, center.lng], { icon: patientIcon })
      .addTo(map)
      .bindPopup('<b style="font-family: inherit; font-size: 11px;">MY LOCATION</b><br/><span style="font-family: inherit; font-size: 10px; color: #666;">Patient active GPS coordinate center.</span>');

    // ─── 4. Add Seeded Doctor Coordinates Markers & Heatmaps ───
    doctors.forEach((doc) => {
      let lat = center.lat;
      let lng = center.lng;

      if (doc.clinicLocation && Array.isArray(doc.clinicLocation.coordinates) && doc.clinicLocation.coordinates.length === 2) {
        lng = doc.clinicLocation.coordinates[0];
        lat = doc.clinicLocation.coordinates[1];
      }

      // Add heatmap circle indicator
      L.circle([lat, lng], {
        color: '#0c4a6e',
        fillColor: '#0c4a6e',
        fillOpacity: 0.05,
        stroke: false,
        radius: 800 // 800 meters range
      }).addTo(map);

      // Custom Doctor Marker
      const doctorIcon = L.divIcon({
        className: 'custom-doctor-icon',
        html: `
          <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #0c4a6e; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.15); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-top: -1px;"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; width: 175px; padding: 4px;">
          <h5 style="margin: 0 0 2px 0; font-size: 12px; font-weight: 800; color: #171717; text-transform: uppercase;">
            Dr. ${doc.user?.name ? doc.user.name.replace(/^Dr\.\s+/i, '') : 'Physiotherapist'}
          </h5>
          <p style="margin: 0 0 6px 0; font-size: 9px; font-weight: 800; color: #FF3000; text-transform: uppercase; tracking-wider;">
            ${Array.isArray(doc.specialization) ? doc.specialization[0] : doc.specialization || 'Clinical Specialist'}
          </p>
          <div style="height: 1px; background-color: #f5f5f5; margin-bottom: 6px;"></div>
          <div style="display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: #525252;">
            <span style="display: flex; align-items: center; gap: 2px;">★ ${(doc.averageRating || 5).toFixed(1)}</span>
            <span>₹${doc.consultationFee} / Session</span>
          </div>
        </div>
      `;

      L.marker([lat, lng], { icon: doctorIcon })
        .addTo(map)
        .bindPopup(popupHtml);
    });

    // Automatically fit map bounds to show patient and all doctors beautifully
    if (doctors.length > 0) {
      const points = [[center.lat, center.lng], ...doctors.map((doc) => {
        if (doc.clinicLocation && Array.isArray(doc.clinicLocation.coordinates)) {
          return [doc.clinicLocation.coordinates[1], doc.clinicLocation.coordinates[0]];
        }
        return [center.lat, center.lng];
      })];
      map.fitBounds(points, { padding: [40, 40] });
    }

  }, [mapLoaded, doctors, center]);

  return (
    <div className="w-full flex-grow flex flex-col border border-neutral-200 bg-white rounded-xl shadow-sm p-5 relative overflow-hidden select-none" style={{ minHeight: '380px' }}>
      {/* Map Header Status Bar */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[10px] font-black text-neutral-900 uppercase tracking-widest font-swiss">
            Realtime Specialist Radar
          </span>
        </div>
        <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
          GPS Center: {center.lat.toFixed(4)}°, {center.lng.toFixed(4)}° ({center.name})
        </div>
      </div>

      {/* Actual Live Map Div */}
      <div 
        ref={mapRef} 
        className="flex-1 w-full border border-neutral-200/80 rounded-lg relative overflow-hidden shadow-inner bg-slate-50 z-0"
      >
        {/* Loading Spinner overlay */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
            <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-wider">Acquiring Satellites...</h5>
          </div>
        )}

        {/* Empty specialists warning status indicator overlay */}
        {mapLoaded && doctors.length === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
            <ShieldAlert className="w-8 h-8 text-neutral-400 mb-2" />
            <h5 className="text-xs font-black text-neutral-700 uppercase tracking-wider">No Clinics Found Nearby</h5>
            <p className="text-[10px] text-neutral-500 mt-1 max-w-[200px]">Modify your location or search filter queries to see specialists.</p>
          </div>
        )}
      </div>

      {/* Map Footer status */}
      {doctors.length > 0 && (
        <div className="mt-3 shrink-0 flex items-center justify-between text-[9px] text-neutral-400 font-bold uppercase tracking-wider border-t border-neutral-100 pt-2.5">
          <span>Patient GPS Active</span>
          <span>{doctors.length} clinics mapped in {activeCityName}</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(LiveDoctorMap);
