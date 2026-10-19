
const GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search";

export async function searchLocations(query, signal) {
  const name = query.trim();

  if (name.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    name,
    count: "10",
    language: "en",
    format: "json",
  });

  const response = await fetch(`${GEOCODING_URL}?${params}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`Geocoding failed: HTTP ${response.status}`);
  }

  const data = await response.json();

  console.log("Location search results:", data.results);

  return data.results ?? [];
}
