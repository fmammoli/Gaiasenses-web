import { CompositionsInfoType } from "@/components/compositions/compositions-info";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Marker, MarkerDragEvent, Popup } from "react-map-gl";
import CompositionsInfo from "@/components/compositions/compositions-info";
import { Button } from "@/components/ui/button";
const initialViewState = {
  latitude: -22.82,
  longitude: -47.07,
  zoom: 1.5,
};

export default function MarkerBase() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [marker, setMarker] = useState({
    latitude: initialViewState.latitude,
    longitude: initialViewState.longitude,
  });

  const [showPopup, setShowPopup] = useState(false);

  const [composition, setComposition] = useState<
    CompositionsInfoType[keyof CompositionsInfoType] | null
  >();
  const onMarkerDragStart = useCallback((event: MarkerDragEvent) => {
    setComposition(null);

    setShowPopup(false);
  }, []);

  const onMarkerDrag = useCallback((event: MarkerDragEvent) => {
    // logEvents((_events) => ({ ..._events, onDrag: event.lngLat as LngLat }));
    setMarker({
      latitude: event.lngLat.lat,
      longitude: event.lngLat.lng,
    });
  }, []);

  const onMarkerDragEnd = useCallback(
    async (event: MarkerDragEvent) => {
      const comps = Object.entries(CompositionsInfo).filter((item) => {
        if (
          item[0] === "zigzag" ||
          item[0] === "stormEye" ||
          item[0] === "curves" ||
          item[0] === "bonfire" ||
          item[0] === "digitalOrganism" ||
          item[0] === "mudflatScatter" ||
          item[0] === "cloudBubble" ||
          item[0] === "paintBrush"
        ) {
          return item;
        }
      });

      const randomComposition =
        comps[Math.floor(Math.random() * Object.entries(comps).length)][1];

      setComposition(randomComposition);

      // logEvents((_events) => ({
      //   ..._events,
      //   onDragEnd: event.lngLat as LngLat,
      // }));
      setShowPopup(true);
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.set("lat", event.lngLat.lat.toString());
      newSearchParams.set("lon", event.lngLat.lng.toString());
      router.replace(`${pathname}?${newSearchParams.toString()}`);
    },
    [pathname, searchParams, router]
  );

  const handleClick = () => {
    setShowPopup(false);
    if (composition) {
      router.replace(
        `/map2?mode=${"composition"}&timed=${true}&compositionName=${
          composition?.name
        }&lat=${marker.latitude}&lon=${
          marker.longitude
        }&play=true&today=true&initial=false`,
        { scroll: false }
      );
    }
  };

  return (
    <Marker
      draggable
      latitude={marker.latitude}
      longitude={marker.longitude}
      onDragStart={onMarkerDragStart}
      onDrag={onMarkerDrag}
      onDragEnd={onMarkerDragEnd}
    >
      {showPopup && (
        <Popup
          offset={38}
          latitude={marker.latitude}
          longitude={marker.longitude}
          anchor="bottom"
          onClose={() => {
            setShowPopup(false);
          }}
          closeButton={false}
          maxWidth={"40rem"}
        >
          {composition ? (
            <>
              <Button
                className="text-2xl focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg px-5 py-2.5 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900"
                onClick={handleClick}
              >
                <p>
                  Clique para ver
                  <span className="capitalize"> {composition.name}</span>
                </p>
              </Button>
            </>
          ) : (
            <p className="text-xl">
              Arraste o Pin para descobrir novas composições.
            </p>
          )}
        </Popup>
      )}
    </Marker>
  );
}
