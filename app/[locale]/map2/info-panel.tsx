import CountrySelect from "./coutry-select";

export default function InfoPanel({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="maboxgl-control-container">
      <div className="mapboxgl-ctrl-top-left flex mt-[10px] ml-[10px] gap-8 h-[28px]">
        <div className="pointer-events-auto clear-both">
          <CountrySelect></CountrySelect>
        </div>
        <div className="pointer-events-auto clear-both max-w-[250px] md:max-w-[100%]">
          <div className="bg-white rounded-[4px]">
            <p className="text-lg px-2 ">
              Latitude: {lat.toFixed(6)} | Longitude: {lng.toFixed(6)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
