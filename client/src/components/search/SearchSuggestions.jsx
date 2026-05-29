import React, { useState, useEffect } from 'react';
import { Hospital, User, MapPin, Search } from 'lucide-react';
import { getSearchSuggestions } from '../../api/search.api';

const SearchSuggestions = ({ query, onSelect, visible }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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
          // Standard successResponse maps payload to data key
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
        return <Hospital className="h-4 w-4 text-primary" />;
      case 'doctor':
        return <User className="h-4 w-4 text-emerald-500" />;
      case 'city':
        return <MapPin className="h-4 w-4 text-amber-500" />;
      default:
        return <Search className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-80 overflow-y-auto transform origin-top transition-all duration-150">
      {isLoading && (
        <div className="px-4 py-3 text-sm text-slate-400 flex items-center gap-2">
          <span className="inline-block animate-spin">⏳</span> Searching options...
        </div>
      )}

      {!isLoading && suggestions.map((s, i) => (
        <button
          key={i}
          type="button"
          onMouseDown={(e) => {
            // Use onMouseDown instead of onClick to fire before the input's onBlur hides the container!
            e.preventDefault();
            onSelect(s);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 text-left border-b border-slate-50 last:border-0 transition-colors"
        >
          <div className="p-2 bg-slate-50 rounded-lg flex-shrink-0 group-hover:bg-white transition-colors">
            {getIcon(s.type)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate">{s.label}</p>
            <p className="text-xs text-slate-400 truncate mt-0.5">{s.subLabel}</p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions;
