import axios from "axios";

const BASE = "https://weather-proxy.weatherapp.workers.dev/api/weather";

export async function fetchWeather(city) {
  const { data } = await axios.get(BASE, { params: { city } });
  return data;
}