import React, { useState, useEffect } from 'react';
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
import AIRecommendationCard from '../../components/ai/AIRecommendationCard';

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

  // AI Symptom Search state
  const [aiSymptomQuery, setAiSymptomQuery] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

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
    document.title = 'FIND DOCTORS — KINETIQ';
  }, []);

  // Fetch listing data
  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      let result;
      const apiFilters = {
        specialization: currentFilters.specialization,
        city: currentFilters.city,
        minFee: currentFilters.minFee,
        maxFee: currentFilters.maxFee,
        sortBy: currentFilters.sortBy,
        page: currentFilters.page,
        limit: 12,
      };

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
      setError('FAILED TO DISCOVER PHYSICIANS. PLEASE RETRY QUERY.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search on params change
  useEffect(() => {
    fetchDoctors();
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

  // Handle AI Symptom Search submit
  const handleAISymptomSubmit = async (e) => {
    if (e) e.preventDefault();
    const trimmed = aiSymptomQuery.trim();
    if (trimmed.length < 5) {
      toast.error('PLEASE DESCRIBE SYMPTOMS IN GREATER DETAIL.');
      return;
    }
    setAiLoading(true);
    setAiResult(null);
    try {
      const res = await interpretSymptomsAPI(trimmed);
      if (res.success && res.data?.aiAvailable) {
        setAiResult(res.data);
      } else {
        setError('AI recommendation temporarily unavailable.');
      }
    } catch (err) {
      console.error('AI symptom search failed:', err);
    } finally {
      setAiLoading(false);
    }
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
    setAiSymptomQuery('');
    setAiResult(null);
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
    <div className="max-w-page mx-auto px-6 py-12 flex flex-col select-none bg-swiss-white">
      {/* ─── D3.2 Page Header / Search Bar ─── */}
      <div className="flex flex-col gap-6 w-full">
        {/* Main Search Bar frame with left square icon and right attached button */}
        <div className="w-full relative">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full bg-swiss-white border-2 border-swiss-black rounded-none">
            {/* Left Bordered Icon Square */}
            <div className="w-12 h-12 shrink-0 border-r-2 border-swiss-black flex items-center justify-center rounded-none bg-swiss-white">
              <Search className="h-5 w-5 text-swiss-black" />
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
              className="flex-grow h-12 px-4 bg-swiss-white text-ui-sm font-bold uppercase tracking-wider text-swiss-black placeholder-swiss-gray-400 focus:outline-none focus:ring-0 rounded-none border-0"
              autoComplete="off"
            />

            <Button
              type="submit"
              variant="primary"
              className="h-12 border-0 border-l-2 border-swiss-black px-8 font-black shrink-0"
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

        {/* AI Symptom Search secondary path below */}
        <div className="flex flex-col md:flex-row items-center gap-4 py-2 border-t-2 border-swiss-black">
          <span className="text-ui-xs font-black text-swiss-red tracking-widest uppercase shrink-0">
            OR DESCRIBE YOUR SYMPTOMS →
          </span>
          <form onSubmit={handleAISymptomSubmit} className="flex-grow w-full">
            <input
              type="text"
              value={aiSymptomQuery}
              onChange={(e) => setAiSymptomQuery(e.target.value)}
              placeholder="DESCRIBE HOW YOU FEEL (E.G. SHARP PAIN IN KNEE POST RUNNING)..."
              className="w-full h-10 px-4 bg-swiss-white border border-swiss-gray-200 text-ui-sm font-bold uppercase tracking-wider text-swiss-black placeholder-swiss-gray-400 focus:border-swiss-black focus:border-2 focus:ring-0 transition-all rounded-none"
              disabled={aiLoading}
            />
          </form>
        </div>

        {/* AI Recommendation Amber Card */}
        {aiLoading && (
          <div className="w-full p-6 border-2 border-swiss-amber bg-swiss-white rounded-none animate-pulse text-left font-black uppercase text-ui-xs text-swiss-amber tracking-wider">
            🚨 ANALYZING SYMPTOM DATA WITH CLINICAL AI...
          </div>
        )}
        {!aiLoading && aiResult && (
          <AIRecommendationCard
            result={aiResult}
            onViewDoctors={() => {
              handleApplyFilters({ specialization: aiResult.suggestedSpecialization });
              setAiResult(null);
            }}
          />
        )}
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest">
            ACTIVE FILTERS:
          </span>
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-2 px-3 py-1 bg-swiss-white border-2 border-swiss-black text-[10px] font-black uppercase tracking-widest select-none rounded-none"
            >
              {chip.label}
              <button
                type="button"
                onClick={() => removeFilterChip(chip.key)}
                className="text-swiss-black hover:text-swiss-red font-black"
              >
                ×
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAll}
            className="text-[10px] font-black text-swiss-red hover:underline uppercase tracking-widest"
          >
            CLEAR ALL
          </button>
        </div>
      )}

      {/* Main split content: left filter panel, right results area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start mt-8 pt-8 border-t-2 border-swiss-black">
        
        {/* Left Filter Panel (Width 280px via layout classes) */}
        <div className="lg:col-span-1 lg:sticky lg:top-24 z-10">
          <FilterSidebar
            initialFilters={currentFilters}
            onApply={handleApplyFilters}
            onClear={handleClearAll}
          />
        </div>

        {/* Right Results Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Results Summary & Sort controls header bar */}
          <div className="border-b-2 border-swiss-black pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <span className="text-ui-lg font-black text-swiss-black uppercase tracking-wider">
              {loading ? 'DISCOVERING CLINICIANS...' : `${pagination.total} SPECIALISTS FOUND`}
            </span>

            {/* Segmented control sort */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest mr-2">
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
                    className={`px-3 py-1.5 border-2 border-swiss-black text-[10px] font-black uppercase tracking-widest transition-colors rounded-none cursor-pointer select-none
                      ${isActive 
                        ? 'bg-swiss-black text-swiss-white' 
                        : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-100'
                      }
                    `}
                  >
                    {opt.label}
                  </button>
                );
              })}
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
            <div className="bg-swiss-white border-2 border-swiss-red p-8 text-left flex flex-col gap-3">
              <h3 className="text-ui-xl font-black text-swiss-red uppercase tracking-tighter">
                QUERY DISRUPTION
              </h3>
              <p className="text-ui-md text-swiss-gray-600 font-medium">{error}</p>
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
                {doctors.map((doc) => (
                  <DoctorCard key={doc._id} doctor={doc} />
                ))}
              </div>

              {/* D3.6 Explicit Pagination row (Left-aligned) */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-4 mt-8 pt-6 border-t border-swiss-gray-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={pagination.page === 1}
                    onClick={() => handleApplyFilters({ page: (pagination.page - 1).toString() })}
                  >
                    ← PREVIOUS
                  </Button>
                  <span className="text-ui-xs font-black text-swiss-gray-400 uppercase tracking-widest">
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
