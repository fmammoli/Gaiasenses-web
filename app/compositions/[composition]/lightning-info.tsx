import { getLightning } from "@/components/compositions/zigzag/zigzag";

export default async function LightningInfo({
  lat,
  lon,
}: {
  lat: string;
  lon: string;
}) {
  const data = await getLightning(lat.toString(), lon.toString(), 100);

  const weatherInfo = {
    lightnings: `${data.count === 0 ? "None" : data.count} (100km radius)`,
  };

  const distances = data.events
    .map((item) => item.dist)
    .filter((item) => {
      if (item !== undefined) return item;
    }) as number[];
  const closer = distances.length > 0 ? Math.min(...distances) : null;

  return (
    <>
      {data.count > 0 && (
        <>
          <div className="mt-2 mb-0 flex items-center justify-between">
            <p className="uppercase text-sm leading-tight font-bold !my-0">
              Lightnings
            </p>
            <p className="text-sm font-medium leading-relaxed !my-0">
              Total:
              <span className=" text-sm leading-relaxed text-kandinsky-blue font-mdeium">
                {`  ${weatherInfo.lightnings}`}
              </span>
            </p>
          </div>

          <div className="my-0">
            <p className="text-sm font-medium leading-relaxed !my-0 text-right">
              Closer:
              <span className="text-sm leading-relaxed text-kandinsky-blue font-medium">
                {`  ${closer}km`}
              </span>
            </p>
          </div>
        </>
      )}
    </>
  );
}
