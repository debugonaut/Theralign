import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, MapPin, Navigation, Compass, AlertCircle, HelpCircle } from 'lucide-react';

import {
  getDiscoveryListingAPI,
  getNearbyDoctorsAPI,
  searchDoctorsAPI,
} from '../../api/discovery.api';

import FilterSidebar from '../../components/doctor/FilterSidebar';
import DoctorCard from '../../components/doctor/DoctorCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import SymptomSearchBox from '../../components/ai/SymptomSearchBox';
import SearchSuggestions from '../../components/search/SearchSuggestions';

const DoctorListingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination metadata
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  // Local Geolocation states
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10000); // 10km default

  // Temporary local search state to avoid query trigger on every character keystroke
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSuggestionSelect = (suggestion) => {
    setShowSuggestions(false);
    setLocalSearch(suggestion.value);

    const params = new URLSearchParams(searchParams);
    
    if (suggestion.type === 'specialization') {
      params.set('specialization', suggestion.value);
      params.delete('q'); // Clear text query to rely on strict filter
    } else if (suggestion.type === 'city') {
      params.set('city', suggestion.value);
      params.delete('q');
    } else if (suggestion.type === 'doctor') {
      params.set('q', suggestion.value);
      params.delete('nearby');
    }

    params.set('page', '1');
    setSearchParams(params);
  };

  // Sync localSearch if query param changes externally
  useEffect(() => {
    setLocalSearch(searchParams.get('q') || '');
  }, [searchParams]);

  // Read active filter states from URL query parameters
  const currentFilters = {
    specialization: searchParams.get('specialization') || '',
    minFee: searchParams.get('minFee') || '',
    maxFee: searchParams.get('maxFee') || '',
    minRating: searchParams.get('minRating') || '',
    minExperience: searchParams.get('minExperience') || '',
    sortBy: searchParams.get('sortBy') || 'rating',
    page: Number(searchParams.get('page')) || 1,
    search: searchParams.get('q') || '',
    nearby: searchParams.get('nearby') === 'true',
  };

  // ─── Core Data Fetcher ─────────────────────────────────────────────────────
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      let result;

      // Decide which endpoint to call based on location toggle / search query
      if (currentFilters.nearby && userLocation) {
        result = await getNearbyDoctorsAPI({
          latitude: userLocation.lat,
          longitude: userLocation.lng,
          maxDistance: searchRadius,
          specialization: currentFilters.specialization,
          page: currentFilters.page,
          limit: 12,
        });
      } else if (currentFilters.search) {
        result = await searchDoctorsAPI({
          q: currentFilters.search,
          specialization: currentFilters.specialization,
          page: currentFilters.page,
          limit: 12,
        });
      } else {
        result = await getDiscoveryListingAPI({
          ...currentFilters,
          limit: 12,
        });
      }

      if (result.success && result.data) {
        setDoctors(result.data.doctors || []);
        setPagination({
          total: result.data.total || 0,
          page: result.data.page || 1,
          totalPages: result.data.totalPages || 1,
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch doctor listings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Set browser title on mount
  useEffect(() => {
    document.title = 'Find Doctors — PhysioConnect';
  }, []);

  // Re-fetch whenever the URL parameters or user coordinates change
  useEffect(() => {
    fetchDoctors();
  }, [searchParams, userLocation, searchRadius]);

  // ─── Geolocation Handler ───────────────────────────────────────────────────
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocationLoading(true);
    const toastId = toast.loading('Locating clinic search boundaries...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast.success('Position located successfully!', { id: toastId });
        setLocationLoading(false);
        
        // Update URL to trigger proximity search mode
        const params = new URLSearchParams(searchParams);
        params.set('nearby', 'true');
        params.delete('q'); // Clear name query to avoid conflict
        params.set('page', '1');
        setSearchParams(params);
      },
      (error) => {
        console.error('Proximity GPS error:', error);
        let errorMsg = 'Could not fetch your coordinates.';
        if (error.code === 1) {
          errorMsg = 'Location permission denied. Please allow location access in your browser settings.';
        } else if (error.code === 2) {
          errorMsg = 'Location signal unavailable. Try again.';
        }
        
        toast.error(errorMsg, { id: toastId });
        setLocationLoading(false);

        // Reset proximity toggle in URL if failed
        const params = new URLSearchParams(searchParams);
        params.delete('nearby');
        setSearchParams(params);
      },
      { timeout: 10000, maximumAge: 300000 } // 5 minutes cache
    );
  };

  // ─── Filter State Synchronization ──────────────────────────────────────────
  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1'); // Reset to page 1 on any filter criteria changes
    setSearchParams(params);
  };

  const applySidebarFilters = (sidebarData) => {
    const params = new URLSearchParams(searchParams);
    
    Object.keys(sidebarData).forEach((key) => {
      const val = sidebarData[key];
      if (val !== undefined && val !== '') {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });

    params.set('page', '1');
    setSearchParams(params);
  };

  const handleClearAll = () => {
    setSearchParams({ page: '1' });
    setLocalSearch('');
    setUserLocation(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (localSearch.trim()) {
      params.set('q', localSearch.trim());
      params.delete('nearby'); // Proximity mode is disabled once text query executes
    } else {
      params.delete('q');
    }
    
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleNearbyToggle = () => {
    if (currentFilters.nearby) {
      // Toggle off
      const params = new URLSearchParams(searchParams);
      params.delete('nearby');
      params.set('page', '1');
      setSearchParams(params);
      setUserLocation(null);
    } else {
      // Toggle on
      requestUserLocation();
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col gap-6 select-none">
      
      {/* Dynamic Header Titles */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight text-left mb-1">
          Explore Certified Physiotherapists
        </h1>
        <p className="text-sm text-slate-500 font-medium text-left">
          Discover verified clinic practitioners, filter by session fees, and check direct geospatial distances.
        </p>
      </div>

      {/* AI Symptom Triage Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-md text-slate-200">
        <SymptomSearchBox
          onSpecializationFound={(specialization) => {
            updateFilter('specialization', specialization);
            window.scrollTo({ top: 400, behavior: 'smooth' });
          }}
        />
      </div>

      {/* ─── Search & Proximity Interactive Banner ─────────────────────────────── */}
      <div className="bg-white border border-slate-100 shadow-card rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Text Input Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <input
              type="text"
              placeholder="Search physiotherapists, specializations, clinic names..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
              className="w-full pl-11 pr-24 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700 text-sm"
              autoComplete="off"
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <button
              type="submit"
              className="absolute right-2.5 top-2 bg-primary hover:bg-primary-dark text-white text-xs font-extrabold px-4 py-2 rounded-lg shadow-sm transition-colors cursor-pointer select-none"
            >
              Search
            </button>
            
            <SearchSuggestions
              query={localSearch}
              onSelect={handleSuggestionSelect}
              visible={showSuggestions}
            />
          </form>

          {/* Location / Geolocation Switch */}
          <button
            type="button"
            onClick={handleNearbyToggle}
            className={`px-5 py-3 rounded-xl border font-bold text-sm inline-flex items-center gap-2 select-none transition-all cursor-pointer ${
              currentFilters.nearby
                ? 'bg-accent/10 border-accent text-accent font-extrabold shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {locationLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent" />
            ) : (
              <Navigation size={18} className={currentFilters.nearby ? 'animate-pulse' : ''} />
            )}
            {currentFilters.nearby ? 'Proximity Mode: ON' : 'Search Near Me'}
          </button>
        </div>

        {/* Nearby Radius Slide Control (Visible only when proximity search is ON) */}
        {currentFilters.nearby && userLocation && (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-accent/5 p-4 rounded-xl border border-accent/15 mt-1 animate-fadeIn">
            <div className="shrink-0 flex items-center gap-2">
              <Compass className="text-accent" size={20} />
              <div className="text-left">
                <p className="text-xs font-extrabold text-accent uppercase tracking-wider">Coordinates Locked</p>
                <p className="text-[10px] font-mono text-slate-500">Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}</p>
              </div>
            </div>
            
            <div className="flex-1 w-full flex items-center gap-4">
              <span className="text-xs text-slate-500 font-bold shrink-0">Radius Range:</span>
              <input
                type="range"
                min="2000"
                max="50000"
                step="2000"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <span className="text-xs text-accent font-extrabold shrink-0 w-16 text-right">
                {(searchRadius / 1000).toFixed(0)} km
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─── Grid Listing & Filter Layout ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Column: Filter Sidebar */}
        <div className="lg:col-span-1 lg:sticky lg:top-6">
          <FilterSidebar
            initialFilters={currentFilters}
            onApply={applySidebarFilters}
            onClear={handleClearAll}
          />
        </div>

        {/* Right Column: Cards Grid */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Results Summary & Sorting Bar */}
          <div className="bg-white border border-slate-100 rounded-xl px-5 py-3 flex items-center justify-between shadow-sm">
            <span className="text-xs font-bold text-slate-500">
              {loading ? 'Searching...' : `${pagination.total} physiotherapists discovered`}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Sort By:</span>
              <select
                value={currentFilters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 px-2.5 py-1.5 focus:outline-none focus:border-primary select-none cursor-pointer"
              >
                <option value="rating">Top Rated</option>
                <option value="experience">Years of Experience</option>
                <option value="fee_asc">Consultation Fee: Low to High</option>
                <option value="fee_desc">Consultation Fee: High to Low</option>
              </select>
            </div>
          </div>

          {/* Core Results display */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200/50 rounded-2xl p-8 text-center flex flex-col items-center gap-3">
              <AlertCircle className="text-danger" size={40} />
              <h3 className="text-base font-bold text-slate-800">Operational Query Failure</h3>
              <p className="text-xs text-slate-500 max-w-sm">{error}</p>
              <Button size="sm" onClick={fetchDoctors}>Retry Query</Button>
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-2xl py-20 px-8 text-center flex flex-col items-center gap-4 shadow-sm">
              <div className="text-5xl animate-bounce">🔍</div>
              <h3 className="text-lg font-bold text-slate-800">No physiotherapists found</h3>
              <p className="text-xs text-slate-500 max-w-md">
                We couldn't find any doctor profiles matching your exact filter combination. Try clearing some selections, or expanding the proximity search radius!
              </p>
              <button
                onClick={handleClearAll}
                className="text-xs font-bold text-primary hover:underline hover:text-primary-dark cursor-pointer mt-2"
              >
                Clear all active search filters
              </button>
            </div>
          ) : (
            <>
              {/* Doctor Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map((doc) => (
                  <DoctorCard key={doc._id} doctor={doc} />
                ))}
              </div>

              {/* Paging Footer */}
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => updateFilter('page', p.toString())}
              />
            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default DoctorListingPage;
