export default function InfoPanel({ lat, lng }: { lat: number; lng: number }) {
  return (
    <div className="maboxgl-control-container">
      <div className="mapboxgl-ctrl-top-left">
        <div className="mapboxgl-ctrl mapboxgl-ctrl-group max-w-[250px] md:max-w-[100%]">
          <p className="text-lg px-2 ">
            Latitude: {lat.toFixed(6)} | Longitude: {lng.toFixed(6)}
          </p>
          <p className="px-2 text-md font-semibold ">
            Arraste o Marcador para descobrir novas composições
          </p>
        </div>
      </div>
    </div>
  );
}
