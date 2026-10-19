
// Convert weather codes into our existing image keys.
export function getWeatherIcon(code, isDay = true) {
  if (code === 0) {
    return isDay ? "sunny" : "cloudy";
  }

  if (code === 1 || code === 2) {
    return "partlyCloudy";
  }

  if (code === 3) {
    return "cloudy";
  }

  if (code === 45 || code === 48) {
    return "fog";
  }

  if ([51, 53, 55, 56, 57].includes(code)) {
    return "drizzle";
  }

  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return "rainy";
  }

  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "snow";
  }

  if ([95, 96, 99].includes(code)) {
    return "storm";
  }

  return "cloudy";
}

// Format local API dates without converting timezones.
export function formatWeatherDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

// Convert hours like 15:00 into 3 PM.
export function formatHour(timeString) {
  const hour = Number(timeString.slice(11, 13));
  const displayHour = hour % 12 || 12;
  const period = hour >= 12 ? "PM" : "AM";

  return `${displayHour} ${period}`;
}

// Transform the Open-Meteo response into
// the structure used by our React components.
export function transformWeatherData(data, cityName) {
  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;

  if (!current || !daily || !hourly) {
    throw new Error("The weather response is incomplete.");
  }

  // Each hourly index represents the same point in time
  // across all the hourly arrays.
  const hourlyByDate = {};

  hourly.time.forEach((time, index) => {
    const date = time.slice(0, 10);

    if (!hourlyByDate[date]) {
      hourlyByDate[date] = [];
    }

    hourlyByDate[date].push({
      time: formatHour(time),
      icon: getWeatherIcon(
        hourly.weather_code[index],
        hourly.is_day[index] === 1
      ),
      temperature: hourly.temperature_2m[index],
    });
  });

  const forecastDays = daily.time.map((date, index) => ({
    date,
    day: new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`)),
    icon: getWeatherIcon(daily.weather_code[index]),
    high: daily.temperature_2m_max[index],
    low: daily.temperature_2m_min[index],
  }));

  return {
    city: cityName,
    date: formatWeatherDate(current.time.slice(0, 10)),
    temperature: current.temperature_2m,
    condition: getWeatherIcon(
      current.weather_code,
      current.is_day === 1
    ),
    feelsLike: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    wind: current.wind_speed_10m,
    precipitation: current.precipitation,

    daily: forecastDays,
    hourlyByDate,
  };
}
