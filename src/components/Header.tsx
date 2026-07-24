import React from 'react';
import { CloudSun, Compass, RefreshCw, MapPin } from 'lucide-react';
import { UnitSystem } from '../types';

interface HeaderProps {
  unit: UnitSystem;
  onToggleUnit: (unit: UnitSystem) => void;
  onUseCurrentLocation: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  locationName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  unit,
  onToggleUnit,
  onUseCurrentLocation,
  onRefresh,
  isLoading,
  locationName,
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 sticky top-0 z-30 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand Identification */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <CloudSun className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                AeroSight
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-widest">
                AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Activity Weather Intelligence & Advisory System
            </p>
          </div>
        </div>

        {/* Location & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          {locationName && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs font-medium text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[160px]">{locationName}</span>
            </div>
          )}

          <button
            onClick={onUseCurrentLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            title="Locate Me"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline">My Location</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Unit Toggle */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onToggleUnit('metric')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                unit === 'metric'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °C / km/h
            </button>
            <button
              onClick={() => onToggleUnit('imperial')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                unit === 'imperial'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              °F / mph
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
