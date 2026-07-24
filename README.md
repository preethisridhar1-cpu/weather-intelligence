# AeroSight - AI Weather Intelligence Engine

AeroSight is an AI-powered activity weather intelligence and personal impact advisory engine. It synthesizes real-time weather telemetry—temperature, feels-like index, UV radiation, Air Quality Index (AQI), wind speed, precipitation probability, humidity, and barometric pressure—into contextual, actionable insights for outdoor activities, daily commuting, travel, and event planning.

---

## 🌟 Key Features

* **Strict Response Format**: Generates AI weather advisory reports formatted according to strict structure:
  * 🌤️ **Weather Snapshot** (Location, Condition, Temp & Feels Like, Key Metrics)
  * 💡 **Personal Impact & Advisory** (Outfit Recommendations, Health & Safety Notices, Activity Feasibility)
  * ⏱️ **Optimal Time Windows** (Best hours for outdoor efforts)
  * ⚠️ **Weather Risk & Mitigation** (Potential Risks & Suggested Actions)
* **Activity & Context Selector**: Tailors intelligence for Running, Biking, Travel, Outdoor Events, Beach/Coastal, Hiking, or Custom user inquiries.
* **Live Weather & Air Quality Telemetry**: Integrated Open-Meteo geocoding, multi-sensor forecast, and US AQI endpoints.
* **Hourly Forecast Timeline**: 24-hour horizontal forecast stream tracking temperature, rain probability, UV index, and wind.
* **Interactive AI Assistant**: Gemini-driven Q&A interface for follow-up questions, schedule shifts, and clothing choices.
* **Unit System Support**: Seamless toggle between Metric (°C, km/h) and Imperial (°F, mph) units.
* **Geolocation & Search**: Instant location search with global geocoding and current location detection.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React Icons, Motion
* **Backend**: Express.js server bundled with `esbuild`
* **AI Engine**: `@google/genai` TypeScript SDK utilizing `gemini-3.6-flash`
* **Data Sources**: Open-Meteo Geocoding & Weather API, Open-Meteo Air Quality API

---

## 🚀 Getting Started

### Environment Setup

Create a `.env` file based on `.env.example`:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server (Express + Vite)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📋 Response Format Specification

Every synthesized advisory strictly conforms to the following layout:

```markdown
#### 🌤️ Weather Snapshot
* **Location & Time**: [City / Timeframe]
* **Condition**: [e.g., Partly Cloudy, Heavy Rain]
* **Temperature**: [Current] (Feels like [Temp])
* **Key Metrics**: UV Index: [X/11] | AQI: [X] | Humidity: [X%] | Wind: [X km/h]

#### 💡 Personal Impact & Advisory
* **Outfit Recommendation**: [Specific attire recommendations]
* **Health & Safety Notice**: [UV protection, hydration, allergy, or pollution warnings]
* **Activity Feasibility**: [Rating: Excellent / Moderate / Poor for specified activity]

#### ⏱️ Optimal Time Windows
* [Highlight best hours for outdoor activities or travel]

#### ⚠️ Weather Risk & Mitigation
* **Potential Risks**: [e.g., Rain starting at 4 PM, high pollen count]
* **Suggested Action**: [e.g., Carry an umbrella, shift run to morning]
```
