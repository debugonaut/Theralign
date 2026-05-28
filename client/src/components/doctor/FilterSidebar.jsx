import React, { useState, useEffect } from 'react';
import { getSpecializationsAPI } from '../../api/discovery.api';
import { Star, SlidersHorizontal, RefreshCw } from 'lucide-react';
import Button from '../common/Button';

const FilterSidebar = ({ initialFilters, onApply, onClear }) => {
  const [specializations, setSpecializations] = useState([]);
  const [specialization, setSpecialization] = useState(initialFilters.specialization || '');
  const [minFee, setMinFee] = useState(initialFilters.minFee || '');
  const [maxFee, setMaxFee] = useState(initialFilters.maxFee || '');
  const [minRating, setMinRating] = useState(initialFilters.minRating || '');
  const [minExperience, setMinExperience] = useState(initialFilters.minExperience || '');

  // Load specializations with real doctor counts
  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const res = await getSpecializationsAPI();
        if (res.success && res.data.specializations) {
          setSpecializations(res.data.specializations);
        }
      } catch (err) {
        console.error('Failed to load filter specializations:', err);
      }
    };
    loadSpecs();
  }, []);

  // Sync state with incoming initialFilters on change (e.g. from browser back/refresh)
  useEffect(() => {
    setSpecialization(initialFilters.specialization || '');
    setMinFee(initialFilters.minFee || '');
    setMaxFee(initialFilters.maxFee || '');
    setMinRating(initialFilters.minRating || '');
    setMinExperience(initialFilters.minExperience || '');
  }, [initialFilters]);

  // Preset Fee handlers
  const handleFeePreset = (min, max) => {
    setMinFee(min);
    setMaxFee(max);
  };

  const handleApply = () => {
    onApply({
      specialization,
      minFee: minFee ? Number(minFee) : '',
      maxFee: maxFee ? Number(maxFee) : '',
      minRating: minRating ? Number(minRating) : '',
      minExperience: minExperience ? Number(minExperience) : '',
    });
  };

  const handleClear = () => {
    setSpecialization('');
    setMinFee('');
    setMaxFee('');
    setMinRating('');
    setMinExperience('');
    onClear();
  };

  return (
    <div className="bg-white rounded-card border border-slate-100 shadow-card p-6 flex flex-col gap-6 w-full shrink-0">
      {/* Sidebar Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary" />
          Filter Criteria
        </h2>
        <button
          onClick={handleClear}
          className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <RefreshCw size={12} />
          Reset All
        </button>
      </div>

      {/* 1. Specializations counts */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Specialization
          </h3>
          {specialization && (
            <button
              onClick={() => setSpecialization('')}
              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {specializations.length === 0 ? (
            <div className="text-xs text-slate-400 py-2">Loading categories...</div>
          ) : (
            specializations.map((spec) => (
              <button
                key={spec.name}
                type="button"
                onClick={() => setSpecialization(specialization === spec.name ? '' : spec.name)}
                className={`flex items-center justify-between text-xs px-2.5 py-2 rounded-lg font-medium select-none cursor-pointer transition-all ${
                  specialization === spec.name
                    ? 'bg-blue-50 text-primary font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="truncate pr-2">{spec.name}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  specialization === spec.name
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {spec.count}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 2. Fee Range & Presets */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
          Consultation Fee
        </h3>
        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 mb-1">
          <button
            type="button"
            onClick={() => handleFeePreset('', 500)}
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-primary hover:bg-blue-50/20 cursor-pointer select-none transition-colors"
          >
            Under ₹500
          </button>
          <button
            type="button"
            onClick={() => handleFeePreset(500, 1000)}
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-primary hover:bg-blue-50/20 cursor-pointer select-none transition-colors"
          >
            ₹500 - ₹1000
          </button>
          <button
            type="button"
            onClick={() => handleFeePreset(1000, '')}
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:border-primary hover:bg-blue-50/20 cursor-pointer select-none transition-colors"
          >
            ₹1000+
          </button>
        </div>

        {/* Inputs */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
            <input
              type="number"
              placeholder="Min"
              value={minFee}
              onChange={(e) => setMinFee(e.target.value)}
              className="w-full pl-6 pr-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-xs font-medium"
            />
          </div>
          <span className="text-slate-400 text-xs">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
            <input
              type="number"
              placeholder="Max"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              className="w-full pl-6 pr-2.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-primary text-xs font-medium"
            />
          </div>
        </div>
      </div>

      {/* 3. Minimum Rating */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
          Minimum Rating
        </h3>
        <div className="flex flex-col gap-1.5">
          {[4, 3, 0].map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => setMinRating(stars || '')}
              className={`flex items-center gap-2 text-xs px-2.5 py-2 rounded-lg font-medium transition-all ${
                (minRating === stars || (stars === 0 && !minRating))
                  ? 'bg-blue-50 text-primary font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {stars > 0 ? (
                <>
                  <div className="flex text-amber-400 fill-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                      />
                    ))}
                  </div>
                  <span>{stars}.0 & Above</span>
                </>
              ) : (
                <span>Any Rating</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Experience */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
          Experience Range
        </h3>
        <div className="flex flex-col gap-1.5">
          {[
            { label: 'Any Experience', value: '' },
            { label: '2+ Years', value: '2' },
            { label: '5+ Years', value: '5' },
            { label: '10+ Years', value: '10' },
          ].map((exp) => (
            <label
              key={exp.value}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                minExperience === exp.value
                  ? 'bg-blue-50/60 text-primary font-bold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="experience"
                checked={minExperience === exp.value}
                onChange={() => setMinExperience(exp.value)}
                className="text-primary focus:ring-primary w-3.5 h-3.5"
              />
              <span>{exp.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 5. Action Buttons */}
      <div className="mt-2 flex flex-col gap-2">
        <Button onClick={handleApply} className="w-full py-2.5 text-xs font-bold">
          Apply Search Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
