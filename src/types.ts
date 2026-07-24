export type ActivityType = 
  | 'running'
  | 'commuting'
  | 'travel'
  | 'event'
  | 'cycling'
  | 'beach'
  | 'hiking'
  | 'custom';

export type TimeframeType = 'today' | 'tomorrow' | 'weekend' | 'this_week';

export type UnitSystem = 'metric' | 'imperial';

export interface LocationData {
  id?: string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface HourlyForecast {
  time: string; // ISO string or 'HH:00'
  tempC: number;
  tempF: number;
  feelsLikeC: number;
  feelsLikeF: number;
  humidity: number;
  precipProb: number;
  windSpeedKmh: number;
  windSpeedMph: number;
  uvIndex: number;
  weatherCode: number;
  conditionText: string;
}

export interface DailyForecast {
  date: string;
  conditionText: string;
  weatherCode: number;
  maxTempC: number;
  maxTempF: number;
  minTempC: number;
  minTempF: number;
  uvMax: number;
  precipProbMax: number;
}

export interface WeatherTelemetry {
  location: LocationData;
  timeframe: string;
  current: {
    tempC: number;
    tempF: number;
    feelsLikeC: number;
    feelsLikeF: number;
    humidity: number;
    uvIndex: number;
    aqi: number;
    aqiCategory: string; // 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy'
    windSpeedKmh: number;
    windSpeedMph: number;
    windDirectionDeg: number;
    precipProb: number;
    pressureHpa: number;
    conditionText: string;
    weatherCode: number;
    pollenLevel?: string;
  };
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  timestamp: string;
}

export interface AeroSightReport {
  rawMarkdown: string;
  snapshot: {
    locationAndTime: string;
    condition: string;
    temperature: string;
    keyMetricsSummary: string;
  };
  personalImpact: {
    outfitRecommendation: string;
    healthNotice: string;
    activityFeasibility: 'Excellent' | 'Moderate' | 'Poor';
    feasibilityScore: number; // 0 - 100
    activityName: string;
  };
  optimalTimeWindows: Array<{
    timeRange: string;
    label: string;
    status: 'optimal' | 'acceptable' | 'avoid';
    note: string;
  }>;
  weatherRisk: {
    potentialRisks: string;
    suggestedAction: string;
    hasSevereAlert: boolean;
    alertHeadline?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'aerosight';
  text: string;
  timestamp: string;
}
