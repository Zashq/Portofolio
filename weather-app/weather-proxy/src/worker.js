// src/worker.js
export default {
  async fetch(request, env) {
    const url = new URL(request.url);


    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        }
      });
    }


    if (url.pathname !== "/api/weather") {
      return new Response("Not found", { status: 404 });
    }

    const city = url.searchParams.get("city")?.trim();
    if (!city) return json({ error: "city required" }, 400);

    const key = env.WEATHER_KEY; 
    if (!key) return json({ error: "missing WEATHER_KEY" }, 500);

    const api = new URL("https://api.openweathermap.org/data/2.5/weather");
    api.searchParams.set("q", city);
    api.searchParams.set("units", "metric");
    api.searchParams.set("appid", key);

    try {

      const resp = await fetch(api.toString(), { cf: { cacheTtl: 60 } });
      if (!resp.ok) {
        const txt = await resp.text();
        return json({ error: txt || resp.statusText }, resp.status, { "Access-Control-Allow-Origin": "*" });
      }
      const d = await resp.json();

      return json({
        city: d.name,
        country: d.sys?.country,
        temp: d.main?.temp,
        feels_like: d.main?.feels_like,
        humidity: d.main?.humidity,
        weather: d.weather?.[0]?.main,
        description: d.weather?.[0]?.description,
        wind: d.wind?.speed,
        icon: d.weather?.[0]?.icon
      }, 200, { "Access-Control-Allow-Origin": "*" });
    } catch (e) {
      return json({ error: e.message || "fetch error" }, 500, { "Access-Control-Allow-Origin": "*" });
    }
  }
};

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders }
  });
}
