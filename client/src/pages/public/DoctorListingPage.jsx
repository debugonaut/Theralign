import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, X } from 'lucide-react';
import { getDiscoveryListingAPI, searchDoctorsAPI } from '../../api/discovery.api';
import { interpretSymptomsAPI } from '../../api/ai.api';

import FilterSidebar from '../../components/doctor/FilterSidebar';
import DoctorCard from '../../components/doctor/DoctorCard';
import { DoctorCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import SearchSuggestions from '../../components/search/SearchSuggestions';
import SymptomSearchBox from '../../components/ai/SymptomSearchBox';
import LiveDoctorMap from '../../components/ai/LiveDoctorMap';

const DoctorListingPage = () => {
  const navigate = useNavigate();
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

  // Local Search Input states
  const [localSearch, setLocalSearch] = useState(searchParams.get('q') || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedMapDoctor, setSelectedMapDoctor] = useState(null);
  const listingRef = useRef(null);

  // Read filters from URL
  const currentFilters = {
    specialization: searchParams.get('specialization') || '',
    city: searchParams.get('city') || '',
    minFee: searchParams.get('minFee') || '',
    maxFee: searchParams.get('maxFee') || '',
    sortBy: searchParams.get('sortBy') || 'relevance',
    page: Number(searchParams.get('page')) || 1,
    search: searchParams.get('q') || '',
  };

  // Sync title
  useEffect(() => {
    document.title = 'FIND DOCTORS — Theralign';
  }, []);

  // Fetch listing data
  const fetchDoctors = async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
      setError(null);
    }
    try {
      let result;
      const rawFilters = {
        specialization: currentFilters.specialization,
        city: currentFilters.city,
        minFee: currentFilters.minFee,
        maxFee: currentFilters.maxFee,
        sortBy: currentFilters.sortBy,
        page: currentFilters.page,
        limit: 12,
      };
      // Strip empty string params so backend validation doesn't reject them
      const apiFilters = Object.fromEntries(
        Object.entries(rawFilters).filter(([_, v]) => v !== '' && v !== undefined)
      );

      if (currentFilters.search) {
        result = await searchDoctorsAPI({
          q: currentFilters.search,
          ...apiFilters,
        });
      } else {
        result = await getDiscoveryListingAPI(apiFilters);
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
      if (!isBackground) {
        setError('FAILED TO DISCOVER PHYSICIANS. PLEASE RETRY QUERY.');
      }
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  // Trigger search on params change and set up background polling
  useEffect(() => {
    fetchDoctors(false);

    const interval = setInterval(() => {
      fetchDoctors(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [searchParams]);

  // Handle Search Input submit
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch.trim()) {
      params.set('q', localSearch.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  // Handle Autocomplete selection
  const handleSuggestionSelect = (suggestion) => {
    setShowSuggestions(false);
    setLocalSearch(suggestion.value);

    const params = new URLSearchParams(searchParams);
    if (suggestion.type === 'specialization') {
      params.set('specialization', suggestion.value);
      params.delete('q');
    } else if (suggestion.type === 'city') {
      params.set('city', suggestion.value);
      params.delete('q');
    } else {
      params.set('q', suggestion.value);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleApplyFilters = (filters) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(filters).forEach((key) => {
      const val = filters[key];
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
    setSelectedMapDoctor(null);
  };

  const handleMapDoctorSelect = (doc) => {
    setSelectedMapDoctor(doc);
    if (doc && listingRef.current) {
      setTimeout(() => {
        listingRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const removeFilterChip = (key) => {
    const params = new URLSearchParams(searchParams);
    params.delete(key);
    params.set('page', '1');
    setSearchParams(params);
  };

  const updateSort = (sortVal) => {
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', sortVal);
    params.set('page', '1');
    setSearchParams(params);
  };

  // Derive active chips
  const activeChips = [];
  if (currentFilters.specialization) activeChips.push({ key: 'specialization', label: `SPECIALTY: ${currentFilters.specialization}` });
  if (currentFilters.city) activeChips.push({ key: 'city', label: `CITY: ${currentFilters.city}` });
  if (currentFilters.minFee) activeChips.push({ key: 'minFee', label: `MIN FEE: ₹${currentFilters.minFee}` });
  if (currentFilters.maxFee) activeChips.push({ key: 'maxFee', label: `MAX FEE: ₹${currentFilters.maxFee}` });

  return (
    <div className="max-w-page mx-auto px-6 py-12 flex flex-col select-none bg-white">
      {/* ─── D3.2 Page Header / Search Bar ─── */}
      <div className="flex flex-col gap-6 w-full">
        {/* Main Search Bar frame with left square icon and right attached button */}
        <div className="w-full relative">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full bg-white border-2 border-neutral-900 rounded-none">
            {/* Left Bordered Icon Square */}
            <div className="w-12 h-12 shrink-0 border-r-2 border-neutral-900 flex items-center justify-center rounded-none bg-white">
              <Search className="h-5 w-5 text-neutral-900" />
            </div>

            <input
              type="text"
              placeholder="SEARCH PHYSIOTHERAPISTS, CLINIC NAMES, OR SPECIFIC FOCUS..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // delay to allow clicks
              className="flex-grow h-12 px-4 bg-white text-ui-sm font-bold uppercase tracking-wider text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-0 rounded-none border-0"
              autoComplete="off"
            />

            <Button
              type="submit"
              variant="primary"
              className="h-12 border-0 border-l-2 border-neutral-900 px-8 font-black shrink-0"
            >
              FIND CARE →
            </Button>
          </form>

          {/* Autocomplete smart suggestions */}
          <SearchSuggestions
            query={localSearch}
            onSelect={handleSuggestionSelect}
            visible={showSuggestions}
          />
        </div>

        {/* Split Grid: AI Symptom checker on the left, Live Map on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch border-t border-neutral-200 pt-8 mt-4">
          {/* Left: AI Symptom Triage Box */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <SymptomSearchBox onSpecializationFound={(spec) => handleApplyFilters({ specialization: spec })} />
          </div>

          {/* Right: Live Interactive Doctor Heatmap */}
          <div className="lg:col-span-6 flex">
            <LiveDoctorMap
              city={currentFilters.city}
              onDoctorSelect={handleMapDoctorSelect}
              selectedDoctorId={selectedMapDoctor?._id}
            />
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
            ACTIVE FILTERS:
          </span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white border-2 border-neutral-900 text-[10px] font-black uppercase tracking-widest select-none rounded-none"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => removeFilterChip(chip.key)}
                className="text-neutral-900 hover:text-accent font-black"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAll}
            className="text-[10px] font-black text-accent hover:underline uppercase tracking-widest"
          >
            CLEAR ALL
          </button>
        </div>
      )}

      {/* Mobile Filters Trigger */}
      <button
        type="button"
        onClick={() => setShowMobileFilters(true)}
        className="lg:hidden w-full py-3 border-2 border-neutral-900 text-ui-xs font-black uppercase tracking-widest text-center mt-6 cursor-pointer hover:bg-neutral-100 transition-colors"
      >
        FILTERS →
      </button>

      {/* Mobile Full-Screen Filters Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[9999] bg-white p-6 overflow-y-auto flex flex-col lg:hidden">
          <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-4 mb-6">
            <h2 className="text-ui-lg font-black uppercase text-neutral-900">Filters</h2>
            <button 
              onClick={() => setShowMobileFilters(false)} 
              className="text-neutral-500 hover:text-danger p-1 cursor-pointer focus:outline-none"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1">
            <FilterSidebar
              initialFilters={currentFilters}
              onApply={(f) => {
                handleApplyFilters(f);
                setShowMobileFilters(false);
              }}
              onClear={() => {
                handleClearAll();
                setShowMobileFilters(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Selected doctor from map — highlight banner */}
      {selectedMapDoctor && (
        <div ref={listingRef} className="mt-6 flex items-center justify-between bg-primary/5 border-2 border-primary px-5 py-3">
          <div>
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">MAP SELECTION: </span>
            <span className="text-[11px] font-black text-primary uppercase tracking-wider">
              Dr. {selectedMapDoctor.user?.name?.replace(/^Dr\.\s+/i, '') || 'Physiotherapist'} · {selectedMapDoctor.city}
            </span>
          </div>
          <button
            onClick={() => setSelectedMapDoctor(null)}
            className="text-[10px] font-black text-neutral-500 hover:text-accent uppercase tracking-wider cursor-pointer flex items-center gap-1"
          >
            CANCEL PREFERENCE <X size={12} />
          </button>
        </div>
      )}

      {/* Main split content: left filter panel, right results area */}
      <div ref={selectedMapDoctor ? undefined : listingRef} className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-8 pt-8 border-t-2 border-neutral-900">
        
        {/* Left Filter Panel (Width 280px via layout classes, hidden on mobile) */}
        <div className="hidden lg:block lg:col-span-1 lg:sticky lg:top-24 z-10">
          <FilterSidebar
            initialFilters={currentFilters}
            onApply={handleApplyFilters}
            onClear={handleClearAll}
          />
        </div>

        {/* Right Results Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Results Summary & Sort controls header bar */}
          <div className="border-b-2 border-neutral-900 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <span className="text-ui-lg font-black text-neutral-900 uppercase tracking-wider">
              {loading ? 'DISCOVERING CLINICIANS...' : `${pagination.total} SPECIALISTS FOUND`}
            </span>

            {/* Desktop Segmented control sort */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mr-2">
                SORT BY:
              </span>
              {[
                { label: 'RELEVANCE', val: 'relevance' },
                { label: 'RATING ↓', val: 'rating' },
                { label: 'FEE ↑', val: 'fee_asc' },
                { label: 'FEE ↓', val: 'fee_desc' },
              ].map((opt) => {
                const isActive = currentFilters.sortBy === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => updateSort(opt.val)}
                    className={`px-3 py-1.5 border-2 border-neutral-900 text-[10px] font-black uppercase tracking-widest transition-colors rounded-none cursor-pointer select-none
                      ${isActive 
                        ? 'bg-neutral-900 text-white' 
                        : 'bg-white text-neutral-900 hover:bg-neutral-100'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Sort Dropdown select */}
            <div className="flex md:hidden items-center gap-2 w-full mt-1">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest shrink-0">
                SORT BY:
              </span>
              <select
                value={currentFilters.sortBy}
                onChange={(e) => updateSort(e.target.value)}
                className="flex-grow h-10 px-3 border-2 border-neutral-900 bg-white text-[10px] font-black uppercase tracking-wider focus:outline-none"
              >
                <option value="relevance">RELEVANCE</option>
                <option value="rating">RATING ↓</option>
                <option value="fee_asc">FEE ↑</option>
                <option value="fee_desc">FEE ↓</option>
              </select>
            </div>
          </div>

          {/* Listing Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <DoctorCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white border-2 border-accent p-8 text-left flex flex-col gap-3">
              <h3 className="text-ui-xl font-black text-accent uppercase tracking-tighter">
                QUERY DISRUPTION
              </h3>
              <p className="text-ui-md text-neutral-700 font-medium">{error}</p>
              <Button size="sm" onClick={fetchDoctors} className="self-start">
                RETRY SEARCH →
              </Button>
            </div>
          ) : doctors.length === 0 ? (
            <EmptyState
              title="NO SPECIALISTS FOUND"
              description="We could not discover any clinical profiles matching your exact criteria filter. Try resetting choices."
              icon={Search}
              actionLabel="CLEAR SEARCH FILTERS"
              onAction={handleClearAll}
              actionVariant="secondary"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {(selectedMapDoctor
                  ? [selectedMapDoctor, ...doctors.filter((d) => d._id !== selectedMapDoctor._id)]
                  : doctors
                ).map((doc) => (
                  <div
                    key={doc._id}
                    className={selectedMapDoctor?._id === doc._id ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}
                  >
                    <DoctorCard doctor={doc} />
                  </div>
                ))}
              </div>

              {/* D3.6 Explicit Pagination row (Left-aligned) */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-neutral-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => handleApplyFilters({ page: (pagination.page - 1).toString() })}
                  >
                    ← PREVIOUS
                  </Button>
                  <span className="text-ui-xs font-black text-neutral-500 uppercase tracking-widest">
                    PAGE {pagination.page} OF {pagination.totalPages}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => handleApplyFilters({ page: (pagination.page + 1).toString() })}
                  >
                    NEXT →
                  </Button>
                </div>
              )}
            </>
          )}

        </div>
      </div>

    </div>
  );
};

export default DoctorListingPage;
