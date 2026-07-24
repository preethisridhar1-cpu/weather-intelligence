import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Weather Code mapping helper for WMO codes
function decodeWeatherCode(code: number): string {
  switch (code) {
    case 0: return 'Clear Sky';
    case 1: return 'Mainly Clear';
    case 2: return 'Partly Cloudy';
    case 3: return 'Overcast';
    case 45: return 'Foggy';
    case 48: return 'Depositing Rime Fog';
    case 51: return 'Light Drizzle';
    case 53: return 'Moderate Drizzle';
    case 55: return 'Dense Drizzle';
    case 56: return 'Light Freezing Drizzle';
    case 57: return 'Dense Freezing Drizzle';
    case 61: return 'Slight Rain';
    case 63: return 'Moderate Rain';
    case 65: return 'Heavy Rain';
    case 66: return 'Light Freezing Rain';
    case 67: return 'Heavy Freezing Rain';
    case 71: return 'Slight Snow Fall';
    case 73: return 'Moderate Snow Fall';
    case 75: return 'Heavy Snow Fall';
    case 77: return 'Snow Grains';
    case 80: return 'Slight Rain Showers';
    case 81: return 'Moderate Rain Showers';
    case 82: return 'Violent Rain Showers';
    case 85: return 'Slight Snow Showers';
    case 86: return 'Heavy Snow Showers';
    case 95: return 'Thunderstorm';
    case 96: return 'Thunderstorm with Light Hail';
    case 99: return 'Thunderstorm with Heavy Hail';
    default: return 'Varied Conditions';
  }
}

function getAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

// 1. Weather Geocoding Search
app.get('/api/weather/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query || query.trim().length < 2) {
      return res.json({ results: [] });
    }
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=8&language=en&format=json`
    );
    const data = await response.json();
    if (!data.results) {
      return res.json({ results: [] });
    }
    const mapped = data.results.map((item: any) => ({
      id: `${item.latitude}_${item.longitude}`,
      name: item.name,
      country: item.country || '',
      admin1: item.admin1 || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto',
    }));
    return res.json({ results: mapped });
  } catch (error: any) {
    console.error('Error in /api/weather/search:', error);
    return res.status(500).json({ error: 'Failed to search location' });
  }
});

// 2. Weather Data Telemetry Fetcher
app.get('/api/weather/data', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 37.7749; // default San Francisco
    const lng = parseFloat(req.query.lng as string) || -122.4194;
    const name = (req.query.name as string) || 'San Francisco';
    const country = (req.query.country as string) || 'USA';
    const timeframe = (req.query.timeframe as string) || 'today';

    // Fetch Weather Forecast
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,showers,snowfall,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,visibility,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max&timezone=auto`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    // Fetch Air Quality Data
    let aqi = 32;
    let aqiCategory = 'Good';
    try {
      const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lng}&current=us_aqi&timezone=auto`;
      const aqiRes = await fetch(aqiUrl);
      const aqiData = await aqiRes.json();
      if (aqiData.current?.us_aqi !== undefined) {
        aqi = Math.round(aqiData.current.us_aqi);
        aqiCategory = getAqiCategory(aqi);
      }
    } catch (e) {
      console.warn('AQI fetch failed, using fallback:', e);
    }

    const current = weatherData.current || {};
    const hourly = weatherData.hourly || {};
    const daily = weatherData.daily || {};

    // Map Hourly Data (next 24 hours)
    const hourlyList = (hourly.time || []).slice(0, 24).map((timeStr: string, idx: number) => {
      const tempC = hourly.temperature_2m?.[idx] ?? current.temperature_2m ?? 20;
      const feelsLikeC = hourly.apparent_temperature?.[idx] ?? tempC;
      const windSpeed = hourly.wind_speed_10m?.[idx] ?? 10;
      const weatherCode = hourly.weather_code?.[idx] ?? 0;
      return {
        time: timeStr,
        tempC: Math.round(tempC),
        tempF: Math.round((tempC * 9) / 5 + 32),
        feelsLikeC: Math.round(feelsLikeC),
        feelsLikeF: Math.round((feelsLikeC * 9) / 5 + 32),
        humidity: hourly.relative_humidity_2m?.[idx] ?? 50,
        precipProb: hourly.precipitation_probability?.[idx] ?? 0,
        windSpeedKmh: Math.round(windSpeed),
        windSpeedMph: Math.round(windSpeed * 0.621371),
        uvIndex: hourly.uv_index?.[idx] ?? 0,
        weatherCode,
        conditionText: decodeWeatherCode(weatherCode),
      };
    });

    // Map Daily Data
    const dailyList = (daily.time || []).map((dateStr: string, idx: number) => {
      const maxC = daily.temperature_2m_max?.[idx] ?? 20;
      const minC = daily.temperature_2m_min?.[idx] ?? 10;
      const code = daily.weather_code?.[idx] ?? 0;
      return {
        date: dateStr,
        conditionText: decodeWeatherCode(code),
        weatherCode: code,
        maxTempC: Math.round(maxC),
        maxTempF: Math.round((maxC * 9) / 5 + 32),
        minTempC: Math.round(minC),
        minTempF: Math.round((minC * 9) / 5 + 32),
        uvMax: daily.uv_index_max?.[idx] ?? 5,
        precipProbMax: daily.precipitation_probability_max?.[idx] ?? 0,
      };
    });

    const currTempC = current.temperature_2m ?? 18;
    const currFeelsC = current.apparent_temperature ?? currTempC;
    const currWind = current.wind_speed_10m ?? 12;
    const currCode = current.weather_code ?? 0;

    const telemetry = {
      location: {
        name,
        country,
        latitude: lat,
        longitude: lng,
        timezone: weatherData.timezone || 'auto',
      },
      timeframe,
      current: {
        tempC: Math.round(currTempC),
        tempF: Math.round((currTempC * 9) / 5 + 32),
        feelsLikeC: Math.round(currFeelsC),
        feelsLikeF: Math.round((currFeelsC * 9) / 5 + 32),
        humidity: current.relative_humidity_2m ?? 55,
        uvIndex: current.uv_index ?? 3,
        aqi,
        aqiCategory,
        windSpeedKmh: Math.round(currWind),
        windSpeedMph: Math.round(currWind * 0.621371),
        windDirectionDeg: current.wind_direction_10m ?? 180,
        precipProb: hourlyList[0]?.precipProb ?? 0,
        pressureHpa: Math.round(current.surface_pressure ?? 1013),
        conditionText: decodeWeatherCode(currCode),
        weatherCode: currCode,
      },
      hourly: hourlyList,
      daily: dailyList,
      timestamp: new Date().toISOString(),
    };

    return res.json(telemetry);
  } catch (error: any) {
    console.error('Error fetching weather data:', error);
    return res.status(500).json({ error: 'Failed to fetch weather telemetry' });
  }
});

// 3. AI Weather Intelligence Engine Endpoint
app.post('/api/ai/synthesize', async (req, res) => {
  try {
    const { telemetry, activityType, customPrompt, timeframe, unit } = req.body;

    if (!telemetry) {
      return res.status(400).json({ error: 'Telemetry data is required' });
    }

    const locName = `${telemetry.location.name}${telemetry.location.country ? `, ${telemetry.location.country}` : ''}`;
    const activityDesc = activityType === 'custom' && customPrompt ? customPrompt : (activityType || 'outdoor activity');
    const isImperial = unit === 'imperial';
    const tempUnit = isImperial ? '°F' : '°C';
    const speedUnit = isImperial ? 'mph' : 'km/h';

    const currentTemp = isImperial ? telemetry.current.tempF : telemetry.current.tempC;
    const feelsLike = isImperial ? telemetry.current.feelsLikeF : telemetry.current.feelsLikeC;
    const windSpeed = isImperial ? telemetry.current.windSpeedMph : telemetry.current.windSpeedKmh;

    const hourlySummary = (telemetry.hourly || []).slice(0, 12).map((h: any) => {
      const time = new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const temp = isImperial ? h.tempF : h.tempC;
      return `${time}: ${temp}${tempUnit}, Rain ${h.precipProb}%, UV ${h.uvIndex}, Wind ${isImperial ? h.windSpeedMph : h.windSpeedKmh} ${speedUnit}, ${h.conditionText}`;
    }).join('\n');

    const prompt = `You are AeroSight, an AI Weather Intelligence Engine.
Analyze the following live weather metrics for location "${locName}" and activity request "${activityDesc}" during timeframe "${timeframe}".

Weather Metrics:
- Location: ${locName}
- Timeframe: ${timeframe}
- Condition: ${telemetry.current.conditionText}
- Current Temp: ${currentTemp}${tempUnit} (Feels like ${feelsLike}${tempUnit})
- Humidity: ${telemetry.current.humidity}%
- UV Index: ${telemetry.current.uvIndex}/11
- AQI: ${telemetry.current.aqi} (${telemetry.current.aqiCategory})
- Wind Speed: ${windSpeed} ${speedUnit}
- Precip Probability: ${telemetry.current.precipProb}%
- Barometric Pressure: ${telemetry.current.pressureHpa} hPa

12-Hour Forecast Breakdown:
${hourlySummary}

MANDATORY INSTRUCTIONS:
1. You MUST generate output containing the exact strict structure below:

#### 🌤️ Weather Snapshot
* **Location & Time**: [City / Timeframe]
* **Condition**: [e.g., Partly Cloudy, Heavy Rain]
* **Temperature**: [Current] (Feels like [Temp])
* **Key Metrics**: UV Index: [X/11] | AQI: [X] | Humidity: [X%] | Wind: [X ${speedUnit}]

#### 💡 Personal Impact & Advisory
* **Outfit Recommendation**: [Specific attire recommendations]
* **Health & Safety Notice**: [UV protection, hydration, allergy, or pollution warnings]
* **Activity Feasibility**: [Rating: Excellent / Moderate / Poor for specified activity]

#### ⏱️ Optimal Time Windows
* [Highlight best hours for outdoor activities or travel]

#### ⚠️ Weather Risk & Mitigation
* **Potential Risks**: [e.g., Rain starting at 4 PM, high pollen count]
* **Suggested Action**: [e.g., Carry an umbrella, shift run to morning]

2. You must also return structured JSON fields in a JSON code block or JSON response schema so that the frontend can render dynamic interactive widgets alongside the markdown text.

Format your response as a valid JSON object matching this schema:
{
  "markdownReport": "...", // The complete strict markdown structure required
  "activityFeasibility": "Excellent" | "Moderate" | "Poor",
  "feasibilityScore": 85, // Number 0-100 score
  "outfitTags": ["Light moisture-wicking tee", "Sunglasses", "Breathing windbreaker"],
  "healthWarnings": ["UV protection recommended between 11 AM - 3 PM", "Stay hydrated"],
  "optimalTimeWindows": [
    {"timeRange": "07:00 AM - 10:00 AM", "label": "Ideal Window", "status": "optimal", "note": "Coolest temps and low UV"},
    {"timeRange": "04:00 PM - 06:00 PM", "label": "Secondary Window", "status": "acceptable", "note": "Passing light breeze"}
  ],
  "risks": {
    "potentialRisks": "Rising UV Index reaching 8 by noon; light rain chance at 5 PM.",
    "suggestedAction": "Apply SPF 50+ before heading out; shift high-intensity outdoor efforts to early morning.",
    "hasSevereAlert": false,
    "alertHeadline": null
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse Gemini JSON output, forming fallback structure:', e);
      parsedData = {
        markdownReport: responseText,
        activityFeasibility: 'Moderate',
        feasibilityScore: 70,
        outfitTags: ['Comfortable outdoor attire', 'Hydration pack'],
        healthWarnings: ['Check local weather conditions before long outings.'],
        optimalTimeWindows: [
          { timeRange: 'Morning (07:00 - 10:00)', label: 'Best Window', status: 'optimal', note: 'Mild conditions' }
        ],
        risks: {
          potentialRisks: 'Variable conditions later in the day.',
          suggestedAction: 'Keep weather radar handy.',
          hasSevereAlert: false
        }
      };
    }

    return res.json({
      report: {
        rawMarkdown: parsedData.markdownReport || responseText,
        snapshot: {
          locationAndTime: `${locName} / ${timeframe}`,
          condition: telemetry.current.conditionText,
          temperature: `${currentTemp}${tempUnit} (Feels like ${feelsLike}${tempUnit})`,
          keyMetricsSummary: `UV Index: ${telemetry.current.uvIndex}/11 | AQI: ${telemetry.current.aqi} | Humidity: ${telemetry.current.humidity}% | Wind: ${windSpeed} ${speedUnit}`,
        },
        personalImpact: {
          outfitRecommendation: (parsedData.outfitTags || []).join(', ') || 'Standard layered attire',
          healthNotice: (parsedData.healthWarnings || []).join('; ') || 'Standard safety precautions apply.',
          activityFeasibility: parsedData.activityFeasibility || 'Moderate',
          feasibilityScore: parsedData.feasibilityScore || 75,
          activityName: activityDesc,
        },
        optimalTimeWindows: parsedData.optimalTimeWindows || [],
        weatherRisk: parsedData.risks || {
          potentialRisks: 'None reported.',
          suggestedAction: 'Enjoy your outdoor activities safely.',
          hasSevereAlert: false,
        },
      },
      parsedJson: parsedData,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/synthesize:', error);
    return res.status(500).json({ error: 'AI Weather Synthesis failed' });
  }
});

// 4. Follow-up Q&A Assistant Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, telemetry, currentReport } = req.body;

    const systemInstruction = `You are AeroSight AI, an intelligent, empathetic, and scannable Weather Intelligence Assistant.
You have context on the location: ${telemetry?.location?.name} and the recent report: ${currentReport?.snapshot?.condition || 'N/A'}.
Provide concise, actionable, and safety-focused answers to follow-up questions about weather, scheduling shifts, apparel, and trip planning.
Maintain an empathetic, scannable, and professional tone. Keep responses under 150 words unless detailed analysis is asked.`;

    const contents = (messages || []).map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({ error: 'Chat response failed' });
  }
});

// Vite & Static file serving middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AeroSight Express Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
