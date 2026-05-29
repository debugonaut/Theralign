import React, { useState, useEffect } from 'react';
import { getSpecializationsAPI } from '../../api/discovery.api';
import SectionHeader from '../common/SectionHeader';
import Button from '../common/Button';

const FilterSidebar = ({ initialFilters, onApply, onClear }) => {
  const [specializations, setSpecializations] = useState([]);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  // Filter States
  const [specialization, setSpecialization] = useState(initialFilters.specialization || '');
  const [city, setCity] = useState(initialFilters.city || '');
  const [minFee, setMinFee] = useState(initialFilters.minFee || '');
  const [maxFee, setMaxFee] = useState(initialFilters.maxFee || '');
  const [availability, setAvailability] = useState(
    initialFilters.nearby ? 'ANY TIME' : 'ANY TIME' // default
  );

  // Segmented control state
  const [activeAvailability, setActiveAvailability] = useState('ANY TIME');

  // Load specializations
  useEffect(() => {
    const loadSpecs = async () => {
      try {
        const res = await getSpecializationsAPI();
        if (res.success && res.data?.specializations) {
          setSpecializations(res.data.specializations);
        }
      } catch (err) {
        console.error('Failed to load filter specializations:', err);
      }
    };
    loadSpecs();
  }, []);

  // Sync state with incoming initialFilters on change
  useEffect(() => {
    setSpecialization(initialFilters.specialization || '');
    setCity(initialFilters.city || '');
    setMinFee(initialFilters.minFee || '');
    setMaxFee(initialFilters.maxFee || '');
  }, [initialFilters]);

  const handleApply = () => {
    onApply({
      specialization,
      city,
      minFee: minFee ? Number(minFee) : '',
      maxFee: maxFee ? Number(maxFee) : '',
      availability: activeAvailability,
    });
  };

  const handleClear = () => {
    setSpecialization('');
    setCity('');
    setMinFee('');
    setMaxFee('');
    setActiveAvailability('ANY TIME');
    onClear();
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Punishing Pune coordinates to simple City text or trigger listing proximity
        setCity('Pune');
      },
      (error) => {
        console.warn('Geolocation failed:', error);
      }
    );
  };

  const visibleSpecs = showAllSpecs ? specializations : specializations.slice(0, 6);

  return (
    <div className="w-full flex flex-col gap-6 select-none bg-swiss-white border-r-2 border-swiss-black pr-6 py-2">
      {/* Sidebar Section Header - No bottom rule or number */}
      <SectionHeader title="FILTERS" ruled={false} className="mb-0" />

      {/* 1. SPECIALIZATION FILTER */}
      <div className="flex flex-col gap-3 pt-4 border-t border-swiss-gray-200">
        <span className="swiss-label text-swiss-red block font-black">
          SPECIALIZATION
        </span>
        <div className="flex flex-col gap-2">
          {specializations.length === 0 ? (
            <span className="text-ui-xs text-swiss-gray-400 font-bold uppercase">Loading...</span>
          ) : (
            visibleSpecs.map((spec) => {
              const isSelected = specialization === spec.name;
              return (
                <button
                  key={spec.name}
                  type="button"
                  onClick={() => setSpecialization(isSelected ? '' : spec.name)}
                  className="flex items-center gap-3 w-full hover:bg-swiss-gray-100 py-1 transition-colors text-left font-medium select-none cursor-pointer rounded-none"
                >
                  {/* Custom square checkbox indicator */}
                  <div className={`w-4 h-4 border-2 border-swiss-black shrink-0 transition-colors rounded-none
                    ${isSelected ? 'bg-swiss-black' : 'bg-swiss-white'}
                  `} />
                  <span className="text-ui-md text-swiss-black capitalize">
                    {spec.name.toLowerCase()}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {specializations.length > 6 && (
          <button
            type="button"
            onClick={() => setShowAllSpecs(!showAllSpecs)}
            className="text-ui-xs font-black text-swiss-black hover:text-swiss-red uppercase tracking-widest text-left select-none cursor-pointer border-0 bg-transparent mt-1"
          >
            {showAllSpecs ? '— SHOW LESS' : '+ SHOW MORE'}
          </button>
        )}
      </div>

      {/* 2. LOCATION FILTER */}
      <div className="flex flex-col gap-3 pt-4 border-t border-swiss-gray-200 text-left">
        <span className="swiss-label text-swiss-red block font-black">
          LOCATION
        </span>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="ENTER CITY"
          className="w-full h-10 px-4 bg-swiss-white border-2 border-swiss-black text-ui-sm font-bold uppercase tracking-wider text-swiss-black placeholder-swiss-gray-400 focus:border-4 focus:ring-0 transition-all rounded-none"
        />
        <button
          type="button"
          onClick={handleGeolocation}
          className="text-ui-xs font-black text-swiss-red hover:underline uppercase tracking-widest text-left select-none cursor-pointer border-0 bg-transparent mt-0.5"
        >
          NEAR ME →
        </button>
      </div>

      {/* 3. AVAILABILITY FILTER */}
      <div className="flex flex-col gap-3 pt-4 border-t border-swiss-gray-200 text-left">
        <span className="swiss-label text-swiss-red block font-black">
          AVAILABILITY
        </span>
        {/* Segmented controls */}
        <div className="flex flex-col gap-2">
          {['ANY TIME', 'TODAY', 'THIS WEEK'].map((opt) => {
            const isActive = activeAvailability === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setActiveAvailability(opt)}
                className={`h-10 border-2 border-swiss-black font-bold uppercase tracking-wider text-ui-sm flex items-center justify-center transition-colors rounded-none cursor-pointer select-none
                  ${isActive 
                    ? 'bg-swiss-black text-swiss-white' 
                    : 'bg-swiss-white text-swiss-black hover:bg-swiss-gray-100'
                  }
                `}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FEE RANGE FILTER */}
      <div className="flex flex-col gap-3 pt-4 border-t border-swiss-gray-200 text-left">
        <span className="swiss-label text-swiss-red block font-black">
          FEE RANGE
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block mb-1">
              MIN ₹
            </span>
            <input
              type="number"
              value={minFee}
              onChange={(e) => setMinFee(e.target.value)}
              className="w-full h-10 px-3 bg-swiss-white border-2 border-swiss-black text-ui-sm font-bold text-swiss-black rounded-none focus:border-4"
            />
          </div>
          <span className="text-swiss-gray-400 self-end mb-2.5 font-bold">—</span>
          <div className="flex-1">
            <span className="text-[10px] font-black text-swiss-gray-400 uppercase tracking-widest block mb-1">
              MAX ₹
            </span>
            <input
              type="number"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              className="w-full h-10 px-3 bg-swiss-white border-2 border-swiss-black text-ui-sm font-bold text-swiss-black rounded-none focus:border-4"
            />
          </div>
        </div>
      </div>

      {/* 5. ACTION BUTTONS */}
      <div className="flex flex-col gap-2 pt-6 border-t border-swiss-gray-200">
        <Button onClick={handleApply} variant="primary" className="w-full">
          APPLY FILTERS
        </Button>
        <Button onClick={handleClear} variant="secondary" className="w-full">
          RESET ALL
        </Button>
      </div>
    </div>
  );
};

export default FilterSidebar;
