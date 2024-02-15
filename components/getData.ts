export type FireSpotsResponseData = {
  city: string;
  count: number;
  events: {
    dist: number;
    lat: number;
    lon: number;
  }[];
  state: string;
};

export type RainfallResponseData = {
  city: string;
  clouds: number;
  lat: number;
  lon: number;
  main: {
    feels_like: number;
    grnd_level: number;
    humidity: number;
    pressure: number;
    temp: number;
  };
  rain: { "1h": number } | {};
  state: string;
  visibility: number;
  weather: [
    {
      description: string;
      icon: string;
      main: string;
    }
  ];
  wind: {
    deg: number;
    gust: number;
    speed: number;
  };
};

export type LightningResponseData = {
  city: string;
  count: number;
  events: { lat: string; lon: string; dist?: number }[];
  state: string;
};

export type BrightnessResponseData = {
  city: string;
  state: string;
  temp: number;
};

export default async function getData(
  endpoint: string,
  lat: string,
  lon: string,
  dist?: number
) {
  const res = await fetch(
    `https://satellite-fetcher.up.railway.app/${endpoint}?lat=${lat}&lon=${lon}${
      dist ? `&dist=${dist}` : ""
    }`,
    { next: { revalidate: 7200 } }
  );

  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    //This will activate the closest `error.js` Error Boundary

    if (res.status === 503) {
      console.log(
        `Failed to fetch data from https://satellite-fetcher.up.railway.app/${endpoint}?lat=${lat}&lon=${lon}${
          dist ? `&dist=${dist}` : ""
        } Got status ${res.status}: ${res.statusText}`
      );
    }
    throw new Error(
      `Failed to fetch data from https://satellite-fetcher.up.railway.app/${endpoint}?lat=${lat}&lon=${lon}${
        dist ? `&dist=${dist}` : ""
      } got status ${res.status}; ${res.statusText}`
    );
  }

  return res.json();
}

export async function getFireSpots(
  lat: string,
  lon: string,
  dist?: number
): Promise<FireSpotsResponseData> {
  return await getData("fire", lat, lon, dist);
}

async function openWeather(
  lat: string,
  lon: string
): Promise<RainfallResponseData> {
  const part = "minutely,hourly,daily,alerts";

  const res = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=${part}&appid=${process.env.OPEN_WEATHER_API_KEY}&units=metric`,
    { next: { revalidate: 7200 } }
  );

  const data = await res.json();
  //console.log(data.current.w);
  const transformedData = {
    city: "Open Weather API",
    clouds: data.current.clounds,
    lat: data.lat,
    lon: data.lon,
    main: {
      feels_like: data.current.feels_like,
      humidity: data.current.humidity,
      pressure: data.current.pressure,
      temp: data.current.temp,
      grnd_level: 0,
    },
    rain: data.current.rain ? { "1h": data.current.rain["1h"] } : {},
    state: "Open weather API",

    visibility: data.current.visibility,
    weather: data.current.weather,
    wind: {
      deg: data.current.wind_deg,
      gust: data.current.wind_gust,
      speed: data.current.wind_speed,
    },
  };
  return transformedData;
}

export async function getWeather(
  lat: string,
  lon: string
): Promise<RainfallResponseData> {
  //this is the old fetch, using satellite-fetcher API
  //return getData("rainfall", lat, lon);
  return openWeather(lat, lon);
}

export async function getLightning(
  lat: string,
  lon: string,
  dist: number
): Promise<LightningResponseData> {
  try {
    const res = await getData("lightning", lat, lon, dist);
    return res;
  } catch (error) {
    return {
      city: "Test",
      count: 1,
      events: [{ lat: lat, lon: lon, dist: dist }],
      state: "This is mock data in case of server error.",
    };
  }
}

export async function getBrightness(
  lat: string,
  lon: string
): Promise<BrightnessResponseData> {
  return getData("brightness", lat, lon);
}
