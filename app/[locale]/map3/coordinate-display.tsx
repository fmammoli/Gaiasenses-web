type CoordinateDisplayProps = {
  lat: number;
  lng: number;
};

export default function CoordinateDisplay({
  lat,
  lng,
}: CoordinateDisplayProps) {
  return (
    <div className="absolute top-0 z-[1]">
      <div className="m-4 bg-gray-400 bg-opacity-50 text-white p-2 rounded-sm flex justify-evenly sm:max-w-[240px] md:max-w-[400px]">
        <p className="w-24 text-sm">Lat: {lat.toFixed(5)}</p>
        <p className="w-4 text-xs">|</p>
        <p className="w-28 text-sm">Lng: {lng.toFixed(5)}</p>
      </div>
    </div>
  );
}
