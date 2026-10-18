const API_URL= "https://api.open-meteo.com/v1/forecast";

export async function getCurrentWeather() {
    const params= new URLSearchParams({
        latitude: "52.52",
        longitude: "13.41",
        current: "temperature_2m",
        timezone: "auto",
  });

  const response= await fetch(`${API_URL}?${params}`);

    if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }

    const data = await response.json();

  console.log("Weather API response:", data);

  return data;
}