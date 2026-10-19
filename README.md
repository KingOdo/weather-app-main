# ☀️ Weather Now

A responsive, real-time weather application built with **React.js and Vite**, powered by the **Open-Meteo Weather and Geocoding APIs**.

Weather Now allows users to search for locations worldwide and view current weather conditions, hourly forecasts, and 7-day forecasts through a clean, interactive interface.

## 🌤️ Features

- **Worldwide Location Search:** Search for cities and locations worldwide with live autocomplete suggestions.
- **Current Weather:** View temperature, feels-like temperature, humidity, wind speed, and precipitation.
- **7-Day Forecast:** Check daily weather conditions with maximum and minimum temperatures.
- **Hourly Forecast:** Explore hourly weather predictions for selected days.
- **Customizable Units:** Switch between Celsius and Fahrenheit, km/h and mph, and millimeters and inches.
- **Responsive Design:** Optimized for desktop, tablet, and mobile devices.
- **Dynamic Weather Icons:** Displays weather illustrations based on actual weather conditions.
- **Loading and Error States:** Includes loading animations, error handling, and retry functionality.

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend development and state management |
| JavaScript (ES6+) | Application logic and API integration |
| Vite | Development environment and production builds |
| HTML5 | Application structure |
| CSS3 | Responsive layouts and styling |
| Open-Meteo Forecast API | Current weather and forecast data |
| Open-Meteo Geocoding API | Worldwide location search |
| Git & GitHub | Version control |
| Vercel | Deployment |

## 🔗 API Integration

Weather Now uses two Open-Meteo APIs.

### 1. Geocoding API

Converts location names into geographic coordinates (latitude and longitude).

**Endpoint:**

`https://geocoding-api.open-meteo.com/v1/search`

### 2. Weather Forecast API

Retrieves current weather conditions, hourly forecasts, and daily forecasts using the selected location's coordinates.

**Endpoint:**

`https://api.open-meteo.com/v1/forecast`

### How It Works

1. A user enters a location in the search bar.
2. The Geocoding API returns matching locations.
3. The user selects a location.
4. The Forecast API retrieves weather information using its coordinates.
5. The application processes the API response and updates the interface.

The project uses `fetch()`, `async/await`, React hooks, and reusable JavaScript functions for API communication and data transformation.


## 🚀 Getting Started

### Prerequisites

- Node.js (a version supported by the project's Vite release)
- npm
- Git

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

**2. Navigate to the project directory**

```bash
cd YOUR-REPOSITORY
```

**3. Install dependencies**

```bash
npm install
```

**4. Start the development server**

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

`http://localhost:5173/`

### Production Build

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## 📚 What I Learned

I built Weather Now as a practical project to strengthen my understanding on external APIs.


