"use client";

import { useOrientation } from "@/hooks/orientation-context";
import { useOrientationSmoother } from "./use-orientation-smoother";
import { useMap } from "react-map-gl";
import { useEffect } from "react";

export default function OrientationControl() {
  const { orientation } = useOrientation();
  const smoothedRef = useOrientationSmoother(
    orientation
      ? {
          alpha: orientation.alpha ?? undefined,
          beta: orientation.beta ?? undefined,
        }
      : null
  );

  const mapRef = useMap();

  useEffect(() => {
    let animationId: number;
    function animate() {
      const { alpha, beta } = smoothedRef.current;
      if (mapRef.current) {
        // mapRef.current.easeTo({
        //   center: [alpha, Math.max(-85, Math.min(85, beta))],
        //   duration: 60,
        // });
      }
      animationId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [mapRef, smoothedRef]);

  return (
    <div className="absolute top-0 left-0 p-4 z-10">
      <div className="bg-white bg-opacity-75 backdrop-blur-md rounded-lg p-4 shadow-lg">
        <h2 className="text-lg font-bold mb-2">Orientation Control</h2>
        <p>Alpha: {smoothedRef.current.alpha.toFixed(2)}</p>
        <p>Beta: {smoothedRef.current.beta.toFixed(2)}</p>
      </div>
    </div>
  );
}
