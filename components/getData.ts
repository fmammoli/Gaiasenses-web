export default async function getData(
  endpoint: string,
  lat: string,
  lon: string,
  dist?: number
) {
  const res = await fetch(
    `https://satellite-fetcher.up.railway.app/${endpoint}?lat=${lat}&lon=${lon}${
      dist ? `&dist=${dist}` : ""
    }`
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
