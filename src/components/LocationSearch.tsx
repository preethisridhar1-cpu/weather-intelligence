import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Globe } from 'lucide-react';
import { LocationData } from '../types';

interface LocationSearchProps {
  onSelectLocation: (location: LocationData) => void;
  currentLocationName: string;
}

const PRESET_CITIES: LocationData[] = [
  { name: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 },
  { name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278 },
  { name: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { name: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
];

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelectLocation,
  currentLocationName,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/weather/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Failed to search locations:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (location: LocationData) => {
    onSelectLocation(location);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="w-full" ref={containerRef}>
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
            placeholder="Search city, district or region (e.g., Tokyo, Austin, Munich)..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all shadow-inner"
          />
          {isSearching && (
            <Loader2 className="w-4 h-4 absolute right-3.5 text-cyan-400 animate-spin" />
          )}
        </div>

        {/* Search Results Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-slate-800">
            {results.map((loc, idx) => (
              <button
                key={`${loc.latitude}_${loc.longitude}_${idx}`}
                onClick={() => handleSelect(loc)}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-800/90 flex items-center justify-between text-sm transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <span className="font-medium text-slate-200">{loc.name}</span>
                  {loc.admin1 && <span className="text-xs text-slate-400">, {loc.admin1}</span>}
                  {loc.country && <span className="text-xs text-slate-400">({loc.country})</span>}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Preset Location Chips */}
      <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0">
          <Globe className="w-3.5 h-3.5 text-slate-500" /> Quick City:
        </span>
        {PRESET_CITIES.map((city) => {
          const isSelected = currentLocationName.toLowerCase().includes(city.name.toLowerCase());
          return (
            <button
              key={city.name}
              onClick={() => handleSelect(city)}
              className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-semibold'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
