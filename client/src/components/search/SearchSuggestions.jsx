import React, { useState, useEffect } from 'react';
import { Hospital, User, MapPin, Search, Loader2 } from 'lucide-react';
import { getSearchSuggestions } from '../../api/search.api';

const SearchSuggestions = ({ query, onSelect, visible }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [flashingIndex, setFlashingIndex] = useState(null);

  // Debounce API calls by 300ms to reduce database load on rapid typing
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await getSearchSuggestions(query);
        if (res.data?.success) {
          setSuggestions(res.data.data?.suggestions || res.data.suggestions || []);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.warn('Silent suggestions fetch failure:', err.message);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!visible || (!isLoading && suggestions.length === 0)) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'specialization':
        return <Hospital className="h-4 w-4 text-neutral-900" />;
      case 'doctor':
        return <User className="h-4 w-4 text-neutral-900" />;
      case 'city':
        return <MapPin className="h-4 w-4 text-neutral-900" />;
      default:
        return <Search className="h-4 w-4 text-neutral-900" />;
    }
  };

  const handleRowClick = (s, index) => {
    setFlashingIndex(index);
    setTimeout(() => {
      onSelect(s);
      setFlashingIndex(null);
    }, 150);
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-neutral-900 z-50 overflow-hidden max-min-h-0 overflow-y-auto rounded-none shadow-none animate-none">
      {isLoading && (
        <div className="px-4 py-3 text-ui-xs font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
          <Loader2 className="animate-spin h-4 w-4" /> SEARCHING OPTIONS...
        </div>
      )}

      {!isLoading && suggestions.map((s, i) => {
        const isFlashing = flashingIndex === i;
        return (
          <button
            key={i}
            type="button"
            onMouseDown={(e) => {
              // Use onMouseDown instead of onClick to fire before the input's onBlur hides the container!
              e.preventDefault();
              handleRowClick(s, i);
            }}
            className={`w-full flex items-center gap-4 px-4 py-3 text-left border-b border-neutral-200 last:border-0 transition-colors duration-fast select-none cursor-pointer rounded-none
              ${isFlashing 
                ? 'bg-neutral-900 text-white' 
                : 'bg-white text-neutral-900 hover:bg-neutral-100'
              }
            `}
          >
            {/* Bordered square category indicator on the left */}
            <div className={`w-8 h-8 border-2 shrink-0 flex items-center justify-center rounded-none
              ${isFlashing ? 'border-white bg-white' : 'border-neutral-900 bg-white'}
            `}>
              {getIcon(s.type)}
            </div>
            
            <div className="min-w-0 flex-1">
              <p className="text-ui-sm font-black uppercase tracking-wider truncate">
                {s.label}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest truncate mt-0.5 text-neutral-500">
                {s.subLabel}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SearchSuggestions;
