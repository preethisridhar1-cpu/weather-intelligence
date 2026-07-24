import React from 'react';
import { WeatherTelemetry, UnitSystem } from '../types';
import {
  Thermometer,
  SunMedium,
  Wind,
  Droplets,
  CloudRain,
  Gauge,
  Activity,
  Eye,
} from 'lucide-react';

interface MetricsGridProps {
  telemetry: WeatherTelemetry;
  unit: UnitSystem;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ telemetry, unit }) => {
  const isImperial = unit === 'imperial';
  const tempUnit = isImperial ? '°F' : '°C';
  const speedUnit = isImperial ? 'mph' : 'km/h';

  const current = telemetry.current;
  const temp = isImperial ? current.tempF : current.tempC;
  const feelsLike = isImperial ? current.feelsLikeF : current.feelsLikeC;
  const windSpeed = isImperial ? current.windSpeedMph : current.windSpeedKmh;

  // UV Color Helper
  const getUvColor = (uv: number) => {
    if (uv <= 2) return { label: 'Low', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (uv <= 5) return { label: 'Moderate', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    if (uv <= 7) return { label: 'High', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    if (uv <= 10) return { label: 'Very High', bg: 'bg-red-500/20 text-red-400 border-red-500/30' };
    return { label: 'Extreme', bg: 'bg-purple-500/20 text-purple-400 border-purple-500/30' };
  };

  // AQI Color Helper
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (aqi <= 100) return { label: 'Moderate', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    if (aqi <= 150) return { label: 'Sensitive', bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    return { label: 'Unhealthy', bg: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const uvMeta = getUvColor(current.uvIndex);
  const aqiMeta = getAqiColor(current.aqi);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" /> Live Weather Telemetry
          </h2>
          <p className="text-xs text-slate-400">
            Real-time multi-sensor weather & air metrics for {telemetry.location.name}
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-mono border border-slate-700">
          {current.conditionText}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Temperature */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Temperature</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {temp}{tempUnit}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Feels like <span className="text-slate-200 font-semibold">{feelsLike}{tempUnit}</span>
            </div>
          </div>
        </div>

        {/* UV Index */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">UV Index</span>
            <SunMedium className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-white tracking-tight">
                {current.uvIndex}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ 11</span>
            </div>
            <span
              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${uvMeta.bg}`}
            >
              {uvMeta.label}
            </span>
          </div>
        </div>

        {/* Air Quality Index */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Air Quality (AQI)</span>
            <Eye className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {current.aqi}
            </div>
            <span
              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${aqiMeta.bg}`}
            >
              {aqiMeta.label}
            </span>
          </div>
        </div>

        {/* Wind Speed */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Wind Speed</span>
            <Wind className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {windSpeed} <span className="text-xs font-normal text-slate-400">{speedUnit}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Direction: <span className="text-slate-200 font-semibold">{current.windDirectionDeg}°</span>
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Humidity</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {current.humidity}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Rain Chance: <span className="text-slate-200 font-semibold">{current.precipProb}%</span>
            </div>
          </div>
        </div>

        {/* Barometric Pressure */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Pressure</span>
            <Gauge className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {current.pressureHpa} <span className="text-xs font-normal text-slate-400">hPa</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Barometric Index
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
