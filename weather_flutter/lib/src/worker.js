export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS + preflight
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

    // endpoint: /api/weather?city=Budapest
    if (url.pathname !== "/api/weather") {
      return new Response("Not found", { status: 404 });
    }

    const city = url.searchParams.get("city")?.trim();
    if (!city) {
      return json({ error: "city parameter required" }, 400);
    }

    const apiKey = env.WEATHER_KEY; // <- SECRET. nincs a frontendben
    if (!apiKey) {
      return json({ error: "missing WEATHER_KEY" }, 500, {
        "Access-Control-Allow-Origin": "*"
      });
    }

    // kérés az OpenWeather Map-hez
    const weatherUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
    weatherUrl.searchParams.set("q", city);
    weatherUrl.searchParams.set("units", "metric");
    weatherUrl.searchParams.set("appid", apiKey);

    try {
      const r = await fetch(weatherUrl.toString(), {
        cf: { cacheTtl: 60 } // edge cache 60 mp-ig, hogy olcsóbb legyen
      });

      if (!r.ok) {
        const text = await r.text();
        return json({ error: text || r.statusText }, r.status, {
          "Access-Control-Allow-Origin": "*"
        });
      }

      const data = await r.json();

      // tisztított response a frontendnek
      return json({
        city: data.name,
        country: data.sys?.country,
        temp: data.main?.temp,
        feels_like: data.main?.feels_like,
        humidity: data.main?.humidity,
        weather: data.weather?.[0]?.main,
        description: data.weather?.[0]?.description,
        wind: data.wind?.speed,
        icon: data.weather?.[0]?.icon
      }, 200, {
        "Access-Control-Allow-Origin": "*"
      });

    } catch (err) {
      return json({ error: err.message || "fetch error" }, 500, {
        "Access-Control-Allow-Origin": "*"
      });
    }
  }
};

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    }
  });
}
