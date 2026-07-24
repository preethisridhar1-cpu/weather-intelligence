import React from 'react';
import {
  ActivityType,
  TimeframeType,
} from '../types';
import {
  Footprints,
  Bike,
  Plane,
  CalendarDays,
  Palmtree,
  Mountain,
  Sparkles,
  Briefcase,
} from 'lucide-react';

interface ActivitySelectorProps {
  selectedActivity: ActivityType;
  onSelectActivity: (act: ActivityType) => void;
  customPrompt: string;
  onChangeCustomPrompt: (val: string) => void;
  timeframe: TimeframeType;
  onChangeTimeframe: (tf: TimeframeType) => void;
  onSynthesize: () => void;
  isSynthesizing: boolean;
}

const ACTIVITIES: Array<{
  type: ActivityType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    type: 'running',
    label: 'Running / Jogging',
    icon: Footprints,
    description: 'Pacing, hydration, heat stress & AQI',
  },
  {
    type: 'commuting',
    label: 'Bicycle & Commute',
    icon: Bike,
    description: 'Wind, wet roads, transit visibility',
  },
  {
    type: 'travel',
    label: 'Travel & Flying',
    icon: Plane,
    description: 'Airport delays, cross-city weather',
  },
  {
    type: 'event',
    label: 'Outdoor Event',
    icon: CalendarDays,
    description: 'Weddings, concerts, shelter needs',
  },
  {
    type: 'beach',
    label: 'Beach & Coastal',
    icon: Palmtree,
    description: 'UV radiation, sea breeze & tides',
  },
  {
    type: 'hiking',
    label: 'Hiking & Trails',
    icon: Mountain,
    description: 'Mountain wind, rain risk, thermal shifts',
  },
  {
    type: 'custom',
    label: 'Custom Inquiry',
    icon: Sparkles,
    description: 'Ask AeroSight any weather query',
  },
];

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  selectedActivity,
  onSelectActivity,
  customPrompt,
  onChangeCustomPrompt,
  timeframe,
  onChangeTimeframe,
  onSynthesize,
  isSynthesizing,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-cyan-400" />
            Select Activity & Context
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AeroSight synthesizes weather metrics into tailored advisories for your specific plans.
          </p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/80 self-start sm:self-auto">
          {(['today', 'tomorrow', 'weekend'] as TimeframeType[]).map((tf) => (
            <button
              key={tf}
              onClick={() => onChangeTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                timeframe === tf
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf === 'today' ? 'Today' : tf === 'tomorrow' ? 'Tomorrow' : 'Weekend'}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {ACTIVITIES.map((act) => {
          const Icon = act.icon;
          const isSelected = selectedActivity === act.type;
          return (
            <button
              key={act.type}
              onClick={() => onSelectActivity(act.type)}
              className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all text-xs font-medium group ${
                isSelected
                  ? 'bg-gradient-to-b from-cyan-950/60 to-blue-950/60 border-cyan-500/80 text-cyan-200 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-500/50'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-600'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-transform group-hover:scale-110 ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-700/80 text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="font-semibold line-clamp-1">{act.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Inquiry Prompt or Activity Refinement */}
      {selectedActivity === 'custom' && (
        <div className="pt-1">
          <label className="block text-xs font-semibold text-cyan-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Specify Your Inquiry:
          </label>
          <input
            type="text"
            value={customPrompt}
            onChange={(e) => onChangeCustomPrompt(e.target.value)}
            placeholder="e.g., '10k marathon pacing at 7 AM', 'Car wash at 3 PM', 'Family picnic in the park'..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end pt-1">
        <button
          onClick={onSynthesize}
          disabled={isSynthesizing}
          className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-95"
        >
          <Sparkles className={`w-4 h-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
          {isSynthesizing ? 'Synthesizing Intelligence...' : 'Generate AI Advisory Report'}
        </button>
      </div>
    </div>
  );
};
