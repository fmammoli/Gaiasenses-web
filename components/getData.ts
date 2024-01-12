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
    // This will activate the closest `error.js` Error Boundary

    throw new Error(
      `Failed to fetch data: https://satellite-fetcher.up.railway.app/${endpoint}?lat=${lat}&lon=${lon}${
        dist ? `&dist=${dist}` : ""
      }`
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

export async function getWeather(
  lat: string,
  lon: string
): Promise<RainfallResponseData> {
  return getData("rainfall", lat, lon);
}

export async function getLightning(
  lat: string,
  lon: string,
  dist: number
): Promise<LightningResponseData> {
  return getData("lightning", lat, lon, dist);
}

export async function getBrightness(
  lat: string,
  lon: string
): Promise<BrightnessResponseData> {
  return getData("brightness", lat, lon);
}