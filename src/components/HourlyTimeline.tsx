import React from 'react';
import { HourlyForecast, UnitSystem } from '../types';
import { Clock, Umbrella, Sun, Wind } from 'lucide-react';

interface HourlyTimelineProps {
  hourly: HourlyForecast[];
  unit: UnitSystem;
}

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({ hourly, unit }) => {
  const isImperial = unit === 'imperial';
  const tempUnit = isImperial ? '°F' : '°C';
  const speedUnit = isImperial ? 'mph' : 'km/h';

  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Hourly Forecast Timeline (Next 24 Hours)
        </h2>
        <span className="text-xs text-slate-400">Scroll to explore →</span>
      </div>

      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-850">
        {hourly.map((item, idx) => {
          const temp = isImperial ? item.tempF : item.tempC;
          const feels = isImperial ? item.feelsLikeF : item.feelsLikeC;
          const wind = isImperial ? item.windSpeedMph : item.windSpeedKmh;
          const timeLabel = new Date(item.time).toLocaleTimeString([], {
            hour: 'numeric',
            hour12: true,
          });

          return (
            <div
              key={`${item.time}_${idx}`}
              className="min-w-[110px] bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-between shrink-0 hover:border-slate-600 transition-all group"
            >
              <span className="text-xs font-semibold text-slate-300 group-hover:text-cyan-300">
                {timeLabel}
              </span>

              <div className="my-2 flex flex-col items-center">
                <span className="text-lg font-bold text-white">
                  {temp}{tempUnit}
                </span>
                <span className="text-[10px] text-slate-500">
                  Feels {feels}{tempUnit}
                </span>
              </div>

              <div className="w-full space-y-1.5 pt-1 border-t border-slate-800/80 text-[10px]">
                {/* Rain probability */}
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Umbrella className="w-3 h-3 text-blue-400" /> Rain:
                  </span>
                  <span className={`font-semibold ${item.precipProb > 30 ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {item.precipProb}%
                  </span>
                </div>

                {/* UV Index */}
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-400" /> UV:
                  </span>
                  <span className="font-semibold text-slate-300">{item.uvIndex}</span>
                </div>

                {/* Wind */}
                <div className="flex items-center justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-slate-400" /> Wind:
                  </span>
                  <span className="font-semibold text-slate-300">{wind}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
