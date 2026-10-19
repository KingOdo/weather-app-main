import { useEffect, useRef, useState } from "react";
import { getCurrentWeather } from "./api/weatherApi";
import { searchLocations } from "./api/geocodingApi";
import { transformWeatherData } from "./utils/weatherUtils";
import "./App.css";

// These files should be in public/assets/images/.
const imagePath = "/assets/images/";
const images = {
  logo: `${imagePath}logo.svg`,
  sunny: `${imagePath}icon-sunny.webp`,
  rainy: `${imagePath}icon-rain.webp`,
  cloudy: `${imagePath}icon-overcast.webp`,
  partlyCloudy: `${imagePath}icon-partly-cloudy.webp`,
  drizzle: `${imagePath}icon-drizzle.webp`,
  fog: `${imagePath}icon-fog.webp`,
  snow: `${imagePath}icon-snow.webp`,
  storm: `${imagePath}icon-storm.webp`,
  search: `${imagePath}icon-search.svg`,
  units: `${imagePath}icon-units.svg`,
  dropdown: `${imagePath}icon-dropdown.svg`,
  checkmark: `${imagePath}icon-checkmark.svg`,
  loading: `${imagePath}icon-loading.svg`,
  error: `${imagePath}icon-error.svg`,
  retry: `${imagePath}icon-retry.svg`,
};

// Starting location only. Search results now come from geocoding.
const defaultLocation = {
  name: "Berlin",
  country: "Germany",
  latitude: 52.52,
  longitude: 13.41,
};

function locationLabel(place) {
  return [place.name, place.admin1, place.country]
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(", ");
}

const initialWeather = {
  city: "Berlin, Germany",
  date: "Loading current weather...",
  temperature: 20,
  condition: "sunny",
  feelsLike: 18,
  humidity: 46,
  wind: 14,
  precipitation: 0,
  daily: [],
  hourlyByDate: {},
};

function App() {
  // All state is declared before effects that use its setters.
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [searchingLocations, setSearchingLocations] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weather, setWeather] = useState(initialWeather);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unitsOpen, setUnitsOpen] = useState(false);
  const [daysOpen, setDaysOpen] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState("C");
  const [windUnit, setWindUnit] = useState("km/h");
  const [precipitationUnit, setPrecipitationUnit] = useState("mm");
  const [selectedDay, setSelectedDay] = useState("");

  const [hasLoadedWeather, setHasLoadedWeather] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Identify newer requests, so an older search cannot overwrite them.
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;
    let cancelled = false;

    async function loadBerlin() {
    setLoading(true);
    setError("");

    try {
      const data = await getCurrentWeather(
        defaultLocation.latitude,
        defaultLocation.longitude
      );

      const result = transformWeatherData(
        data,
        locationLabel(defaultLocation)
      );

      if (cancelled || id !== requestId.current) return;

      setWeather(result);
      setSelectedDay(result.daily[0]?.date ?? "");
      setHasLoadedWeather(true);
    } catch (err) {
      if (cancelled || id !== requestId.current) return;

      console.error("Weather API error:", err);
      setError(
        "We couldn't connect to the server (API error). Please try again in a few moments."
      );
    } finally {
      if (!cancelled && id === requestId.current) {
        setLoading(false);
      }
    }
  }

  loadBerlin();

  
  return () => {
    cancelled = true;
  };
}, [retryCount]);


function handleRetry() {
  if (loading) return;

  setError("");
  setRetryCount((count) => count + 1);
}


  const convertTemperature = (value) =>
    temperatureUnit === "F"
      ? Math.round((value * 9) / 5 + 32)
      : Math.round(value);

  const convertWind = (value) =>
    windUnit === "mph" ? Math.round(value * 0.621371) : Math.round(value);

  const convertPrecipitation = (value) =>
    precipitationUnit === "in" ? (value / 25.4).toFixed(1) : value;

  function switchUnits(system) {
    const imperial = system === "imperial";
    setTemperatureUnit(imperial ? "F" : "C");
    setWindUnit(imperial ? "mph" : "km/h");
    setPrecipitationUnit(imperial ? "in" : "mm");
  }

  // Search the worldwide place index only after typing pauses.
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2 || !showSuggestions || selectedLocation) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchingLocations(true);
      setSearchError("");
      try {
        const places = await searchLocations(query, controller.signal);
        if (!controller.signal.aborted) setSuggestions(places);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Geocoding error:", err);
          setSuggestions([]);
          setSearchError("Could not search places. Try again.");
        }
      } finally {
        if (!controller.signal.aborted) setSearchingLocations(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, showSuggestions, selectedLocation]);

  async function handleSearch(event) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query.length < 2) {
      setError("Enter at least two characters for a place.");
      return;
    }

    // The chosen suggestion is the most accurate result. Otherwise,
    // resolve typed text on submission (e.g. pressing Enter).
    const id = ++requestId.current;
    setLoading(true);
    setError("");
    setShowSuggestions(false);
    setUnitsOpen(false);
    setDaysOpen(false);

    try {
      const matches = selectedLocation
        ? [selectedLocation]
        : await searchLocations(query);
      if (id !== requestId.current) return;
      if (!matches.length) {
        setError("No matching place found. Try adding a country name.");
        return;
      }
      const location = matches[0];
      const data = await getCurrentWeather(location.latitude, location.longitude);
      const result = transformWeatherData(data, locationLabel(location));
      if (id !== requestId.current) return;

      setWeather(result);
      setSelectedDay(result.daily[0]?.date ?? "");
      setSearchQuery(locationLabel(location));
      setHasLoadedWeather(true);
    } catch (err) {
      if (id !== requestId.current) return;
      console.error("Weather search error:", err);
      setError("Unable to load that location. Please try again.");
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }

  function selectCity(place) {
    setSelectedLocation(place);
    setSearchQuery(locationLabel(place));
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchError("");
    setError("");
  }

  const selectedDayLabel =
    weather.daily.find((day) => day.date === selectedDay)?.day ??
    weather.daily[0]?.day ??
    "—";
  const hourlyForecast = weather.hourlyByDate[selectedDay] ?? [];

  return (
    <div className="weather-app">
      <header className="app-header">
        <img src={images.logo} alt="Weather Now" className="app-logo" />

        <div className="units-container">
          <button
            type="button"
            className="units-button"
            aria-expanded={unitsOpen}
            onClick={() => {
              setUnitsOpen((open) => !open);
              setDaysOpen(false);
            }}
          >
            <img src={images.units} alt="" />
            <span>Units</span>
            <img src={images.dropdown} alt="" />
          </button>

          {unitsOpen && (
            <div className="units-menu">
              <button
                type="button"
                className="switch-units"
                onClick={() =>
                  switchUnits(temperatureUnit === "C" ? "imperial" : "metric")
                }
              >
                Switch to {temperatureUnit === "C" ? "Imperial" : "Metric"}
              </button>

              <div className="units-group">
                <p className="units-label">Temperature</p>
                {[
                  { label: "Celsius (°C)", value: "C" },
                  { label: "Fahrenheit (°F)", value: "F" },
                ].map((unit) => (
                  <button
                    type="button"
                    key={unit.value}
                    onClick={() => setTemperatureUnit(unit.value)}
                  >
                    {unit.label}
                    {temperatureUnit === unit.value && (
                      <img src={images.checkmark} alt="Selected" />
                    )}
                  </button>
                ))}
              </div>

              <div className="units-group">
                <p className="units-label">Wind Speed</p>
                {["km/h", "mph"].map((unit) => (
                  <button
                    type="button"
                    key={unit}
                    onClick={() => setWindUnit(unit)}
                  >
                    {unit}
                    {windUnit === unit && (
                      <img src={images.checkmark} alt="Selected" />
                    )}
                  </button>
                ))}
              </div>

              <div className="units-group">
                <p className="units-label">Precipitation</p>
                {[
                  { label: "Millimeters (mm)", value: "mm" },
                  { label: "Inches (in)", value: "in" },
                ].map((unit) => (
                  <button
                    type="button"
                    key={unit.value}
                    onClick={() => setPrecipitationUnit(unit.value)}
                  >
                    {unit.label}
                    {precipitationUnit === unit.value && (
                      <img src={images.checkmark} alt="Selected" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>

  
        {!loading && error && !hasLoadedWeather ? (
  <main className="api-error-page" role="alert">
    <img
      src={images.error}
      alt=""
      className="api-error-icon"
    />

    <h1>Something went wrong</h1>

    <p>{error}</p>

    <button
      type="button"
      className="retry-button"
      onClick={handleRetry}
    >
      <img src={images.retry} alt="" />
      <span>Retry</span>
    </button>
  </main>
) : (
  <main>


        <h1 className="page-title">How’s the sky looking today?</h1>

        <div className="search-section">
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-container">
              <img src={images.search} alt="" className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                placeholder="Search for a place..."
                aria-label="Search for a place"
                autoComplete="off"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setSelectedLocation(null);
                  setSuggestions([]);
                  setSearchingLocations(false);
                  setShowSuggestions(true);
                  setSearchError("");
                  setError("");
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") setShowSuggestions(false);
                }}
              />

              {showSuggestions && searchQuery.trim().length >= 2 && !selectedLocation && (
                <div className="search-suggestions">
                  {searchingLocations && <p className="suggestion-status">Searching places...</p>}
                  {!searchingLocations && searchError && (
                    <p className="suggestion-status" role="status">{searchError}</p>
                  )}
                  {!searchingLocations && !searchError && suggestions.length === 0 && (
                    <p className="suggestion-status">No matches yet. Try a city and country.</p>
                  )}
                  {!searchingLocations && suggestions.map((place) => (
                    <button
                      type="button"
                      key={place.id ?? `${place.name}-${place.latitude}-${place.longitude}`}
                      onClick={() => selectCity(place)}
                    >
                      {locationLabel(place)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="search-button" disabled={loading}>
              Search
            </button>
          </form>
          {error && <p className="error-message" role="alert">{error}</p>}
        </div>

        <div className="weather-layout">
          <section className="weather-main">
            <div className="current-weather">
              {loading ? (
                <div className="weather-loading" role="status">
                  <img src={images.loading} alt="" />
                  <p>Loading...</p>
                </div>
              ) : (
                <>
                  <div className="location-info">
                    <h2>{weather.city}</h2>
                    <p>{weather.date}</p>
                  </div>
                  <div className="temperature">
                    <img src={images[weather.condition]} alt={weather.condition} />
                    <span>{convertTemperature(weather.temperature)}°</span>
                  </div>
                </>
              )}
            </div>

            <div className="weather-details">
              <div className="detail-card">
                <p>Feels Like</p>
                <span>{loading ? "—" : `${convertTemperature(weather.feelsLike)}°`}</span>
              </div>
              <div className="detail-card">
                <p>Humidity</p>
                <span>{loading ? "—" : `${weather.humidity}%`}</span>
              </div>
              <div className="detail-card">
                <p>Wind</p>
                <span>{loading ? "—" : `${convertWind(weather.wind)} ${windUnit}`}</span>
              </div>
              <div className="detail-card">
                <p>Precipitation</p>
                <span>
                  {loading
                    ? "—"
                    : `${convertPrecipitation(weather.precipitation)} ${precipitationUnit}`}
                </span>
              </div>
            </div>

            <section className="daily-section">
              <h3>Daily forecast</h3>
              <div className="daily-forecast">
                {loading
                  ? Array.from({ length: 7 }, (_, index) => (
                      <div className="day-card skeleton" key={index} />
                    ))
                  : weather.daily.map((day) => (
                      <div className="day-card" key={day.date}>
                        <p>{day.day}</p>
                        <img
                          src={images[day.icon]}
                          alt={`${day.day} weather`}
                          className="forecast-icon"
                        />
                        <div className="day-temperatures">
                          <span>{convertTemperature(day.high)}°</span>
                          <span>{convertTemperature(day.low)}°</span>
                        </div>
                      </div>
                    ))}
              </div>
            </section>
          </section>

          <aside className="hourly-forecast">
            <div className="hourly-header">
              <h3>Hourly forecast</h3>
              <div className="days-dropdown-container">
                <button
                  type="button"
                  className="days-button"
                  aria-expanded={daysOpen}
                  disabled={loading || !weather.daily.length}
                  onClick={() => {
                    setDaysOpen((open) => !open);
                    setUnitsOpen(false);
                  }}
                >
                  {loading ? "—" : selectedDayLabel}
                  <img src={images.dropdown} alt="" />
                </button>
                {daysOpen && !loading && (
                  <div className="days-menu">
                    {weather.daily.map((day) => (
                      <button
                        type="button"
                        key={day.date}
                        onClick={() => {
                          setSelectedDay(day.date);
                          setDaysOpen(false);
                        }}
                      >
                        {day.day}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="hourly-list">
              {loading
                ? Array.from({ length: 8 }, (_, index) => (
                    <div className="hour-card skeleton" key={index} />
                  ))
                : hourlyForecast.map((hour, index) => (
                    <div className="hour-card" key={`${selectedDay}-${index}`}>
                      <div className="hour-info">
                        <img src={images[hour.icon]} alt="" />
                        <span>{hour.time}</span>
                      </div>
                      <span>{convertTemperature(hour.temperature)}°</span>
                    </div>
                  ))}
            </div>
          </aside>
        </div>
      </main>
)}
    </div>
  );
}

export default App;
