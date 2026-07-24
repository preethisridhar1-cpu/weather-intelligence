import { useState, useEffect, useCallback } from 'react';
import {
  ActivityType,
  TimeframeType,
  UnitSystem,
  LocationData,
  WeatherTelemetry,
  AeroSightReport,
} from './types';
import { Header } from './components/Header';
import { LocationSearch } from './components/LocationSearch';
import { ActivitySelector } from './components/ActivitySelector';
import { MetricsGrid } from './components/MetricsGrid';
import { HourlyTimeline } from './components/HourlyTimeline';
import { AeroSightReportCard } from './components/AeroSightReportCard';
import { FollowUpChat } from './components/FollowUpChat';
import { CloudSun, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [currentLocation, setCurrentLocation] = useState<LocationData>({
    name: 'San Francisco',
    country: 'United States',
    latitude: 37.7749,
    longitude: -122.4194,
  });

  const [selectedActivity, setSelectedActivity] = useState<ActivityType>('running');
  const [customPrompt, setCustomPrompt] = useState('');
  const [timeframe, setTimeframe] = useState<TimeframeType>('today');

  const [telemetry, setTelemetry] = useState<WeatherTelemetry | null>(null);
  const [report, setReport] = useState<AeroSightReport | null>(null);

  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch Weather Telemetry
  const fetchWeather = useCallback(
    async (loc: LocationData, tf: TimeframeType) => {
      setIsLoadingWeather(true);
      setErrorMsg(null);
      try {
        const url = `/api/weather/data?lat=${loc.latitude}&lng=${loc.longitude}&name=${encodeURIComponent(
          loc.name
        )}&country=${encodeURIComponent(loc.country || '')}&timeframe=${tf}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch weather data');
        const data: WeatherTelemetry = await res.json();
        setTelemetry(data);
        return data;
      } catch (err: any) {
        console.error('Weather fetch error:', err);
        setErrorMsg('Failed to load live weather telemetry. Please try searching another location.');
        return null;
      } finally {
        setIsLoadingWeather(false);
      }
    },
    []
  );

  // Synthesize AI Intelligence Report
  const synthesizeReport = useCallback(
    async (
      currTelemetry: WeatherTelemetry | null,
      act: ActivityType,
      prompt: string,
      tf: TimeframeType,
      u: UnitSystem
    ) => {
      if (!currTelemetry) return;
      setIsSynthesizing(true);
      setErrorMsg(null);
      try {
        const res = await fetch('/api/ai/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telemetry: currTelemetry,
            activityType: act,
            customPrompt: prompt,
            timeframe: tf,
            unit: u,
          }),
        });
        if (!res.ok) throw new Error('AI Synthesis request failed');
        const data = await res.json();
        setReport(data.report);
      } catch (err: any) {
        console.error('Synthesis error:', err);
        setErrorMsg('AI Engine synthesis temporarily unavailable. Retrying...');
      } finally {
        setIsSynthesizing(false);
      }
    },
    []
  );

  // Initial Load
  useEffect(() => {
    (async () => {
      const data = await fetchWeather(currentLocation, timeframe);
      if (data) {
        await synthesizeReport(data, selectedActivity, customPrompt, timeframe, unit);
      }
    })();
  }, []);

  const handleSelectLocation = async (loc: LocationData) => {
    setCurrentLocation(loc);
    const data = await fetchWeather(loc, timeframe);
    if (data) {
      await synthesizeReport(data, selectedActivity, customPrompt, timeframe, unit);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setIsLoadingWeather(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const loc: LocationData = {
          name: 'My Current Location',
          country: '',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        setCurrentLocation(loc);
        const data = await fetchWeather(loc, timeframe);
        if (data) {
          await synthesizeReport(data, selectedActivity, customPrompt, timeframe, unit);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLoadingWeather(false);
        setErrorMsg('Unable to retrieve location. Please search for your city manually.');
      }
    );
  };

  const handleSynthesizeClick = () => {
    if (telemetry) {
      synthesizeReport(telemetry, selectedActivity, customPrompt, timeframe, unit);
    } else {
      fetchWeather(currentLocation, timeframe).then((data) => {
        if (data) synthesizeReport(data, selectedActivity, customPrompt, timeframe, unit);
      });
    }
  };

  const handleToggleUnit = (newUnit: UnitSystem) => {
    setUnit(newUnit);
    if (telemetry) {
      synthesizeReport(telemetry, selectedActivity, customPrompt, timeframe, newUnit);
    }
  };

  const handleChangeTimeframe = async (newTf: TimeframeType) => {
    setTimeframe(newTf);
    const data = await fetchWeather(currentLocation, newTf);
    if (data) {
      await synthesizeReport(data, selectedActivity, customPrompt, newTf, unit);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Top Header */}
      <Header
        unit={unit}
        onToggleUnit={handleToggleUnit}
        onUseCurrentLocation={handleUseCurrentLocation}
        onRefresh={handleSynthesizeClick}
        isLoading={isLoadingWeather || isSynthesizing}
        locationName={currentLocation.name}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 space-y-6">
        {/* Error Banner */}
        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-500/50 rounded-xl p-4 flex items-center gap-3 text-xs text-rose-200">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Location Search Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
          <LocationSearch
            onSelectLocation={handleSelectLocation}
            currentLocationName={currentLocation.name}
          />
        </div>

        {/* Activity & Context Selector */}
        <ActivitySelector
          selectedActivity={selectedActivity}
          onSelectActivity={(act) => setSelectedActivity(act)}
          customPrompt={customPrompt}
          onChangeCustomPrompt={setCustomPrompt}
          timeframe={timeframe}
          onChangeTimeframe={handleChangeTimeframe}
          onSynthesize={handleSynthesizeClick}
          isSynthesizing={isSynthesizing}
        />

        {/* Weather Telemetry Grid */}
        {telemetry && <MetricsGrid telemetry={telemetry} unit={unit} />}

        {/* Main AI Weather Intelligence Report */}
        {isSynthesizing && !report ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-6 h-6 animate-spin" />
            </div>
            <h3 className="text-base font-bold text-white">
              AeroSight Engine Synthesizing Intelligence...
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Analyzing temperature gradients, UV radiation risks, precipitation timelines, AQI safety indices, and activity feasibility.
            </p>
          </div>
        ) : (
          report && <AeroSightReportCard report={report} />
        )}

        {/* Hourly Forecast Timeline */}
        {telemetry && <HourlyTimeline hourly={telemetry.hourly} unit={unit} />}

        {/* Interactive Q&A Assistant */}
        <FollowUpChat telemetry={telemetry} currentReport={report} />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">AeroSight Engine</span>
            <span>— AI Weather Intelligence & Personal Impact Advisory</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Powered by Open-Meteo & Gemini 3.6 Flash
          </p>
        </div>
      </footer>
    </div>
  );
}
