"use client";

import { useOrientation } from "@/hooks/orientation-context";
import { useOrientationSmoother } from "./use-orientation-smoother";
import { useMap } from "react-map-gl";
import { useEffect, useRef } from "react";
import { useWebRTC } from "@/hooks/webrtc-context";

export default function OrientationControl() {
  const { orientationMessageRef } = useWebRTC();

  const smoothedRef = useOrientationSmoother(
    orientationMessageRef.current === null
      ? null
      : {
          alpha: orientationMessageRef.current?.alpha ?? 0,
          beta: orientationMessageRef.current?.beta ?? 0,
          gamma: orientationMessageRef.current?.gamma ?? 0,
        }
  );

  const mapRef = useMap();
  const lastRef = useRef<{ alpha: number; beta: number; gamma: number }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const THRESHOLD = 1; // degrees, adjust as needed

  useEffect(() => {
    let animationId: number;
    function animate() {
      const { alpha, beta } = smoothedRef.current;

      const { alpha: lastAlpha, beta: lastBeta } = lastRef.current;

      // Only move if change exceeds threshold
      if (
        Math.abs(alpha - lastAlpha) > THRESHOLD ||
        Math.abs(beta - lastBeta) > THRESHOLD
      ) {
        if (mapRef.current) {
          // mapRef.current.easeTo({
          //   center: [alpha, Math.max(-85, Math.min(85, beta))],
          //   duration: 60,
          // });
        }
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
        <p>Gamma: {smoothedRef.current.gamma.toFixed(2)}</p>
      </div>
    </div>
  );
}
