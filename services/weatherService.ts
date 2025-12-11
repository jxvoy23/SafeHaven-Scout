import { WeatherData } from "../types";

// Open-Meteo is a free API that requires no key.
const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";

export const getWeather = async (city: string): Promise<WeatherData | null> => {
  try {
    // 1. Get Coordinates for the city
    const geoRes = await fetch(`${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      console.warn("Weather service: City not found");
      return null;
    }

    const { latitude, longitude } = geoData.results[0];

    // 2. Get Current Weather
    const weatherRes = await fetch(
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}&current_weather=true&temperature_unit=fahrenheit&windspeed_unit=mph`
    );
    const weatherData = await weatherRes.json();

    if (!weatherData.current_weather) {
      return null;
    }

    return {
      temperature: weatherData.current_weather.temperature,
      conditionCode: weatherData.current_weather.weathercode,
      windSpeed: weatherData.current_weather.windspeed,
      isDay: weatherData.current_weather.is_day
    };

  } catch (error) {
    console.error("Failed to fetch weather:", error);
    return null; // Fail gracefully so the app doesn't crash
  }
};