import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';
import { getDiscoveryListingAPI, searchDoctorsAPI } from '../../api/discovery.api';

// India center for wide-radius view
const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

const CITY_CENTERS = {
  mumbai:    { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  pune:      { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
  delhi:     { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
  hyderabad: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
};

// Radius steps in km
const RADIUS_STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 3500];
const DEFAULT_RADIUS_IDX = 2; // 5 km

// Haversine distance in km
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const LiveDoctorMap = ({ city = '', specialization = '', search = '', onDoctorSelect, selectedDoctorId }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [allDoctors, setAllDoctors] = useState([]);
  const [radiusIdx, setRadiusIdx] = useState(DEFAULT_RADIUS_IDX);
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);
  const markersRef = useRef([]);

  const radius = RADIUS_STEPS[radiusIdx]; // km
  const activeCityKey = (city || 'pune').toLowerCase();
  const center = CITY_CENTERS[activeCityKey] || CITY_CENTERS.pune;

  // ─── Fetch all doctors with background polling ───
  useEffect(() => {
    const fetchAllDoctors = async () => {
      try {
        const params = { limit: 50, page: 1 };
        if (city) params.city = city;
        if (specialization) params.specialization = specialization;

        let res;
        if (search) {
          res = await searchDoctorsAPI({ q: search, ...params });
        } else {
          res = await getDiscoveryListingAPI(params);
        }

        if (res.success && res.data?.doctors) {
          setAllDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error('Failed to fetch doctors for map:', err);
      }
    };

    fetchAllDoctors();
    const interval = setInterval(fetchAllDoctors, 15000);
    return () => clearInterval(interval);
  }, [city, specialization, search]);

  // ─── Filter doctors by radius from center ───
  const visibleDoctors = radius >= 3500
    ? allDoctors
    : allDoctors.filter((doc) => {
        if (!doc.clinicLocation?.coordinates) return false;
        const [lng, lat] = doc.clinicLocation.coordinates;
        return haversine(center.lat, center.lng, lat, lng) <= radius;
      });

  // ─── Load Leaflet CSS + JS ───
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-anim-css')) {
      const style = document.createElement('style');
      style.id = 'leaflet-anim-css';
      style.innerHTML = `
        @keyframes ping { 0%{transform:scale(0.6);opacity:1} 100%{transform:scale(1.6);opacity:0} }
        .custom-patient-icon,.custom-doctor-icon{background:transparent!important;border:none!important}
        .leaflet-popup-content-wrapper{border-radius:8px!important;box-shadow:0 4px 12px rgba(0,0,0,.1)!important;border:1px solid #e5e7eb!important}
      `;
      document.head.appendChild(style);
    }
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

  const layerGroupRef = useRef(null);

  // ─── Init Map Instance (Once) ───
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.L) return;
    const L = window.L;

    if (leafletInstance.current) return;

    const mapCenter = radius >= 3500 ? INDIA_CENTER : center;
    const zoom = radius >= 3500 ? 5 : radius >= 250 ? 7 : radius >= 50 ? 9 : radius >= 10 ? 11 : 13;

    const map = L.map(mapRef.current, { zoomControl: false, scrollWheelZoom: true })
      .setView([mapCenter.lat, mapCenter.lng], zoom);
    leafletInstance.current = map;

    L.control.zoom({ position: 'topright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // Create the layer group for markers and add it to the map
    layerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
      }
    };
  }, [mapLoaded]);

  // ─── Update Map View when center/radius changes ───
  useEffect(() => {
    if (!leafletInstance.current || !window.L) return;
    const map = leafletInstance.current;
    const mapCenter = radius >= 3500 ? INDIA_CENTER : center;
    const zoom = radius >= 3500 ? 5 : radius >= 250 ? 7 : radius >= 50 ? 9 : radius >= 10 ? 11 : 13;
    map.setView([mapCenter.lat, mapCenter.lng], zoom);
  }, [center, radius]);

  // ─── Draw Markers dynamically when visibleDoctors or selectedDoctorId changes ───
  useEffect(() => {
    if (!leafletInstance.current || !layerGroupRef.current || !window.L) return;
    const L = window.L;
    const map = leafletInstance.current;
    const layerGroup = layerGroupRef.current;

    layerGroup.clearLayers();
    markersRef.current = [];

    // Patient / center marker (only when not country-wide)
    if (radius < 3500) {
      const patientIcon = L.divIcon({
        className: 'custom-patient-icon',
        html: `<div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;width:36px;height:36px;border-radius:50%;background:rgba(20,184,166,.4);animation:ping 1.5s infinite;left:-6px;top:-6px;"></div>
          <div style="width:14px;height:14px;background:#14b8a6;border:2px solid white;border-radius:50%;box-shadow:0 4px 6px -1px rgba(0,0,0,.1);"></div>
        </div>`,
        iconSize: [24, 24], iconAnchor: [12, 12],
      });
      L.marker([center.lat, center.lng], { icon: patientIcon })
        .addTo(layerGroup)
        .bindPopup(`<b style="font-size:11px;">MY LOCATION</b><br/><span style="font-size:10px;color:#666;">${center.name}</span>`);

      // Radius circle
      L.circle([center.lat, center.lng], {
        color: '#14b8a6', fillColor: '#14b8a6', fillOpacity: 0.04,
        weight: 1.5, dashArray: '4 4', radius: radius * 1000,
      }).addTo(layerGroup);
    }

    // Doctor markers
    visibleDoctors.forEach((doc) => {
      if (!doc.clinicLocation?.coordinates) return;
      const [lng, lat] = doc.clinicLocation.coordinates;
      const isSelected = doc._id === selectedDoctorId;

      const color = isSelected ? '#FF3000' : '#0c4a6e';
      const size = isSelected ? 38 : 32;

      const doctorIcon = L.divIcon({
        className: 'custom-doctor-icon',
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 4px 6px -1px rgba(0,0,0,.15);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .2s;${isSelected ? 'box-shadow:0 0 0 3px rgba(255,48,0,.3),0 4px 6px -1px rgba(0,0,0,.15);' : ''}">
          <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 18 : 16}" height="${isSelected ? 18 : 16}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size],
      });

      const name = doc.user?.name ? doc.user.name.replace(/^Dr\.\s+/i, '') : 'Physiotherapist';
      const spec = Array.isArray(doc.specialization) ? doc.specialization[0] : doc.specialization || 'Specialist';
      const distKm = radius < 3500 ? haversine(center.lat, center.lng, lat, lng).toFixed(1) : null;

      const popupHtml = `
        <div style="font-family:system-ui,sans-serif;width:185px;padding:4px;">
          <h5 style="margin:0 0 2px;font-size:15.6px;font-weight:800;color:#171717;text-transform:uppercase;">Dr. ${name}</h5>
          <p style="margin:0 0 4px;font-size:11.7px;font-weight:800;color:#FF3000;text-transform:uppercase;">${spec}</p>
          ${distKm ? `<p style="margin:0 0 4px;font-size:11.7px;color:#666;">${distKm} km away · ${doc.city || ''}</p>` : `<p style="margin:0 0 4px;font-size:11.7px;color:#666;">${doc.city || ''}</p>`}
          <div style="height:1px;background:#f5f5f5;margin-bottom:6px;"></div>
          <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700;color:#525252;">
            <span>★ ${(doc.averageRating || 5).toFixed(1)}</span>
            <span>₹${doc.consultationFee}/session</span>
          </div>
          <button onclick="window.__theralignSelectDoctor('${doc._id}')" style="margin-top:8px;width:100%;padding:5px 0;background:#0c4a6e;color:white;border:none;font-size:13px;font-weight:800;text-transform:uppercase;cursor:pointer;border-radius:3px;">
            VIEW & BOOK →
          </button>
        </div>`;

      const marker = L.marker([lat, lng], { icon: doctorIcon })
        .addTo(layerGroup)
        .bindPopup(popupHtml);

      markersRef.current.push({ marker, doc });
    });

    // Fit bounds to visible doctors
    if (visibleDoctors.length > 0 && radius >= 3500) {
      const points = visibleDoctors
        .filter((d) => d.clinicLocation?.coordinates)
        .map((d) => [d.clinicLocation.coordinates[1], d.clinicLocation.coordinates[0]]);
      if (points.length > 1) map.fitBounds(points, { padding: [40, 40] });
    }
  }, [visibleDoctors, center, radius, selectedDoctorId]);

  // ─── Global callback for popup button clicks ───
  useEffect(() => {
    window.__theralignSelectDoctor = (id) => {
      const doc = allDoctors.find((d) => d._id === id);
      if (doc && onDoctorSelect) onDoctorSelect(doc);
    };
    return () => { delete window.__theralignSelectDoctor; };
  }, [allDoctors, onDoctorSelect]);

  const radiusLabel = radius >= 3500 ? 'Entire Country' : radius >= 1000 ? `${radius / 1000}k km` : `${radius} km`;

  return (
    <div className="w-full flex-grow flex flex-col border border-neutral-200 bg-white rounded-xl shadow-sm p-5 relative overflow-hidden select-none" style={{ minHeight: '380px' }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[13px] font-black text-neutral-900 uppercase tracking-widest">
            Realtime Specialist Radar
          </span>
        </div>
        <div className="text-[13px] text-neutral-400 font-bold uppercase tracking-wider">
          {visibleDoctors.length} / {allDoctors.length} clinics
        </div>
      </div>

      {/* Radius Filter */}
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <span className="text-[11.7px] font-black text-neutral-500 uppercase tracking-widest whitespace-nowrap">
          RADIUS:
        </span>
        <input
          type="range"
          min={0}
          max={RADIUS_STEPS.length - 1}
          value={radiusIdx}
          onChange={(e) => setRadiusIdx(Number(e.target.value))}
          className="flex-1 h-1.5 accent-teal-500 cursor-pointer"
        />
        <span className="text-[13px] font-black text-teal-600 uppercase tracking-wider whitespace-nowrap min-w-[80px] text-right">
          {radiusLabel}
        </span>
      </div>

      {/* Selected doctor banner */}
      {selectedDoctorId && (
        <div className="flex items-center justify-between bg-accent/5 border border-accent/20 rounded px-3 py-1.5 mb-3 shrink-0">
          <span className="text-[13px] font-black text-accent uppercase tracking-wider">
            1 DOCTOR SELECTED — SCROLL DOWN TO BOOK
          </span>
          <button
            onClick={() => onDoctorSelect && onDoctorSelect(null)}
            className="text-[11.7px] font-black text-neutral-500 hover:text-accent uppercase tracking-wider ml-3 cursor-pointer"
          >
            CANCEL ×
          </button>
        </div>
      )}

      {/* Map */}
      <div
        ref={mapRef}
        className="flex-1 w-full border border-neutral-200/80 rounded-lg relative overflow-hidden shadow-inner bg-slate-50 z-0"
      >
        {!mapLoaded && (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center z-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
            <h5 className="text-[13px] font-black text-neutral-500 uppercase tracking-wider">Acquiring Satellites...</h5>
          </div>
        )}
        {mapLoaded && visibleDoctors.length === 0 && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center z-10 pointer-events-none">
            <ShieldAlert className="w-8 h-8 text-neutral-400 mb-2" />
            <h5 className="text-[15.6px] font-black text-neutral-700 uppercase tracking-wider">No Clinics in Radius</h5>
            <p className="text-[13px] text-neutral-500 mt-1 max-w-[200px]">Increase the radius slider to discover more specialists.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 shrink-0 flex items-center justify-between text-[11.7px] text-neutral-400 font-bold uppercase tracking-wider border-t border-neutral-100 pt-2.5">
        <span>GPS Active · {center.name}</span>
        <span>{visibleDoctors.length} clinics in {radiusLabel} radius</span>
      </div>
    </div>
  );
};

export default React.memo(LiveDoctorMap);
