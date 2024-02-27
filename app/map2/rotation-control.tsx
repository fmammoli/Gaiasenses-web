import { useEffect, useState, useCallback, useRef } from "react";
import { useMap } from "react-map-gl";

// The following values can be changed to control rotation speed:

// At low zooms, complete a revolution every two minutes.
const secondsPerRevolution = 120;
// Above zoom level 5, do not rotate.
const maxSpinZoom = 5;
// Rotate at intermediate speeds between zoom levels 3 and 5.
const slowSpinZoom = 3;

const spinEnabled = true;

export default function RotationControl() {
  const { current: map } = useMap();

  const [userInteracting, setUserInteracting] = useState(false);

  const isInteractingRef = useRef(false);

  const spinGlobe = useCallback(() => {
    if (map) {
      const zoom = map.getZoom();
      if (spinEnabled && !isInteractingRef.current && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          // Slow spinning at higher zooms
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        // Smoothly animate the map over one second.
        // When this animation is complete, it calls a 'moveend' event.
        map.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    } else {
      console.log("map not loaded yet");
    }
  }, [map]);

  useEffect(() => {
    function isInteracting() {
      isInteractingRef.current = true;
    }
    function isNotInteracting() {
      isInteractingRef.current = false;
      spinGlobe();
    }
    function onMoveEnd() {
      console.log("move end");
      spinGlobe();
    }

    if (map?.loaded()) {
      map.on("mousedown", isInteracting);
      map.on("mouseup", isNotInteracting);

      map.on("dragend", isNotInteracting);
      map.on("pitchend", isNotInteracting);
      map.on("rotateend", isNotInteracting);

      map.on("moveend", onMoveEnd);
      spinGlobe();
      return () => {
        console.log("offfff");
        map.off("mousedown", isInteracting);
        map.off("mouseup", isNotInteracting);
        map.off("dragend", isNotInteracting);
        map.off("pitchend", isNotInteracting);
        map.off("rotateend", isNotInteracting);
        map.off("moveend", onMoveEnd);
      };
    }
    console.log("rotation effect");
  }, [map, spinGlobe]);

  return null;
}
