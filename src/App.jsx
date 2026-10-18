import {useEffect,useState} from "react";
import { getCurrentWeather } from "./api/weatherApi";
import "./App.css";

//path for the icons & images
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
};

//demonstration data, replace with API data in the future
const cities = [
  "Berlin, Germany",
  "Monrovia, Liberia",
  "Lagos, Nigeria",
  "London, United Kingdom",
  "New York, United States",
  "Tokyo, Japan",
  "Paris, France",
];

const weatherData = {
  city: "Berlin, Germany",
  date: "Tuesday, Aug 5, 2025",
  temperature: 20,
  condition: "sunny",
  feelsLike: 18,
  humidity: 46,
  wind: 14,
  precipitation: 0,

  daily: [
    { day: "Tue", icon: "rainy", high: 20, low: 14 },
    { day: "Wed", icon: "drizzle", high: 21, low: 15 },
    { day: "Thu", icon: "sunny", high: 24, low: 14 },
    { day: "Fri", icon: "partlyCloudy", high: 25, low: 13 },
    { day: "Sat", icon: "storm", high: 21, low: 15 },
    { day: "Sun", icon: "snow", high: 25, low: 16 },
    { day: "Mon", icon: "fog", high: 24, low: 15 },
  ],

  hourly: [
    { time: "3 PM", icon: "cloudy", temperature: 20 },
    { time: "4 PM", icon: "partlyCloudy", temperature: 20 },
    { time: "5 PM", icon: "sunny", temperature: 20 },
    { time: "6 PM", icon: "cloudy", temperature: 19 },
    { time: "7 PM", icon: "snow", temperature: 18 },
    { time: "8 PM", icon: "fog", temperature: 18 },
    { time: "9 PM", icon: "rainy", temperature: 17 },
    { time: "10 PM", icon: "cloudy", temperature: 17 },
  ],
};


function App() {
//test api with console log
  useEffect(() => {
  getCurrentWeather().catch((error) => {
    console.error("API error:", error);
  });
}, []);


    //Search State
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    //Weather State
    const [weather, setWeather] = useState(weatherData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    //dropdown optionn state
    const [unitsOpen, setUnitsOpen] = useState(false);
    const [daysOpen, setDaysOpen] = useState(false);

    //Units
    const [temperatureUnit, setTemperatureUnit] = useState("C");
    const [windUnit, setWindUnit] = useState("km/h");
    const [precipitationUnit, setPrecipitationUnit] = useState("mm");

    //selected forcast days
    const [selectedDay, setSelectedDay] = useState(true);

//We create some helper functions to aid in conversions
const convertTemperature = (temperature) => {
  if (temperatureUnit === "F") {
    return Math.round((temperature * 9) / 5 + 32);
}
      return Math.round(temperature);
};

const windSpeedConversion = (speed) => {
  if (windUnit === "mph") {
    return Math.round(speed * 0.621371);

  }
    return Math.round(speed); 
};

const convertPrecipitation = (amount) => {
  if (precipitationUnit === "in") {
    return (amount / 25.4).toFixed(1);
  }

  return amount;
};
const switchUnits = (system) => {
  if (system === "imperial") {
    setTemperatureUnit("F");
    setWindUnit("mph");
    setPrecipitationUnit("in");
  } else {
    setTemperatureUnit("C");
    setWindUnit("km/h");
    setPrecipitationUnit("mm");
  }
};



  //search functions
  const filteredCities = searchQuery.trim()
    ? cities.filter((city) =>
        city.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];
    const handleSearch = (e) => {
      e.preventDefault();

      const city= searchQuery.trim();

      if(!city){
        setError("Please enter a city name.");
        return;
      }

      const selectedCity = cities.find((item) => item.toLowerCase() === city.toLowerCase());
      if(!selectedCity){
        setError("City not found. Please try again.");
        setShowSuggestions(false);
        return;
      }
      setError("");
      setLoading(true);
      setShowSuggestions(false);
      setUnitsOpen(false);
      setDaysOpen(false);

      //generate random data and replace with API requests later

        setTimeout(() => {
      setWeather({
        ...weatherData,
        city: selectedCity,
      });

      setSelectedDay("Tue");
      setLoading(false);
    }, 1200);
  };

  const selectCity = (city) => {
    setSearchQuery(city);
    setShowSuggestions(false);
    setError("");
  };


  //component build
  return (
     <div className="weather-app">
      {/* HEADER */}

      <header className="app-header">
        <img
          src={images.logo}
          alt="Weather Now"
          className="app-logo"
        />

        <div className="units-container">
          <button
            type="button"
            className="units-button"
            aria-expanded={unitsOpen}
            onClick={() => {
              setUnitsOpen(!unitsOpen);
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
                  switchUnits(
                    temperatureUnit === "C"
                      ? "imperial"
                      : "metric"
                  )
                }
              >
                Switch to{" "}
                {temperatureUnit === "C"
                  ? "Imperial"
                  : "Metric"}
              </button>

              <div className="units-group">
                <p className="units-label">Temperature</p>

                <button
                  type="button"
                  onClick={() => setTemperatureUnit("C")}
                >
                  Celsius (°C)
                  {temperatureUnit === "C" && (
                    <img src={images.checkmark} alt="Selected" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTemperatureUnit("F")}
                >
                  Fahrenheit (°F)
                  {temperatureUnit === "F" && (
                    <img src={images.checkmark} alt="Selected" />
                  )}
                </button>
              </div>

              <div className="units-group">
                <p className="units-label">Wind Speed</p>

                <button
                  type="button"
                  onClick={() => setWindUnit("km/h")}
                >
                  km/h
                  {windUnit === "km/h" && (
                    <img src={images.checkmark} alt="Selected" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setWindUnit("mph")}
                >
                  mph
                  {windUnit === "mph" && (
                    <img src={images.checkmark} alt="Selected" />
                  )}
                </button>
              </div>

              <div className="units-group">
                <p className="units-label">Precipitation</p>

                <button
                  type="button"
                  onClick={() => setPrecipitationUnit("mm")}
                >
                  Millimeters (mm)
                  {precipitationUnit === "mm" && (
                    <img src={images.checkmark} alt="Selected" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setPrecipitationUnit("in")}
                >
                  Inches (in)
                  {precipitationUnit === "in" && (
                    <img src={images.checkmark} alt="Selected" />
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}

      <main>
        <h1 className="page-title">
          How’s the sky looking today?
        </h1>

        {/* SEARCH BAR */}

        <div className="search-section">
          <form className="search-bar" onSubmit={handleSearch}>
            <div className="search-input-container">
              <img
                src={images.search}
                alt=""
                className="search-icon"
              />

              <input
                type="text"
                value={searchQuery}
                placeholder="Search for a place..."
                aria-label="Search for a place"
                autoComplete="off"
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setShowSuggestions(true);
                  setError("");
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setShowSuggestions(false);
                  }
                }}
              />

              {showSuggestions && filteredCities.length > 0 && (
                <div className="search-suggestions">
                  {filteredCities.map((city) => (
                    <button
                      type="button"
                      key={city}
                      onClick={() => selectCity(city)}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="search-button">
              Search
            </button>
          </form>

          {error && <p className="error-message" role="alert">{error}</p>}
        </div>

        {/* WEATHER CONTENT */}

        <div className="weather-layout">
          <section className="weather-main">
            {/* CURRENT WEATHER */}

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
                    <img
                      src={images[weather.condition]}
                      alt={weather.condition}
                    />

                    <span>
                      {convertTemperature(weather.temperature)}°
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* WEATHER DETAILS */}

            <div className="weather-details">
              <div className="detail-card">
                <p>Feels Like</p>
                <span>
                  {loading
                    ? "—"
                    : `${convertTemperature(weather.feelsLike)}°`}
                </span>
              </div>

              <div className="detail-card">
                <p>Humidity</p>
                <span>
                  {loading ? "—" : `${weather.humidity}%`}
                </span>
              </div>

              <div className="detail-card">
                <p>Wind</p>
                <span>
                  {loading
                    ? "—"
                    : `${windSpeedConversion(weather.wind)} ${windUnit}`}
                </span>
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

            {/* DAILY FORECAST */}

            <section className="daily-section">
              <h3>Daily forecast</h3>

              <div className="daily-forecast">
                {weather.daily.map((day) => (
                  <div
                    className={`day-card ${loading ? "skeleton" : ""}`}
                    key={day.day}
                  >
                    {!loading && (
                      <>
                        <p>{day.day}</p>

                        <img
                          src={images[day.icon]}
                          alt={`${day.day} weather`}
                          className="forecast-icon"
                        />

                        <div className="day-temperatures">
                          <span>
                            {convertTemperature(day.high)}°
                          </span>

                          <span>
                            {convertTemperature(day.low)}°
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </section>

          {/* HOURLY FORECAST */}

          <aside className="hourly-forecast">
            <div className="hourly-header">
              <h3>Hourly forecast</h3>

              <div className="days-dropdown-container">
                <button
                  type="button"
                  className="days-button"
                  aria-expanded={daysOpen}
                  onClick={() => {
                    setDaysOpen(!daysOpen);
                    setUnitsOpen(false);
                  }}
                >
                  {loading ? "—" : selectedDay}

                  <img src={images.dropdown} alt="" />
                </button>

                {daysOpen && !loading && (
                  <div className="days-menu">
                    {weather.daily.map((day) => (
                      <button
                        type="button"
                        key={day.day}
                        onClick={() => {
                          setSelectedDay(day.day);
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
              {weather.hourly.map((hour) => (
                <div
                  className={`hour-card ${loading ? "skeleton" : ""}`}
                  key={hour.time}
                >
                  {!loading && (
                    <>
                      <div className="hour-info">
                        <img
                          src={images[hour.icon]}
                          alt=""
                        />

                        <span>{hour.time}</span>
                      </div>

                      <span>
                        {convertTemperature(hour.temperature)}°
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;