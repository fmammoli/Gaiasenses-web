"use client";

import { useOrientationSmoother } from "./use-orientation-smoother";
import { useMap } from "react-map-gl";
import { useEffect, useRef, useState } from "react";
import { useWebRTC } from "@/hooks/webrtc-context";
import { LngLat } from "mapbox-gl";

export default function OrientationControl({
  onMoveEnd,
  onConnected,
  onMoveEndLong,
  onMove,
}: {
  onMoveEnd: (lat: number, lon: number) => void;
  onMoveEndLong: (lat: number, lon: number) => void;
  onConnected: (dcOpen: boolean) => void;
  onMove?: (lat: number, lon: number) => void;
}) {
  const { orientationMessageRef, dcOpen } = useWebRTC();

  useEffect(() => {
    onConnected(dcOpen);
  }, [dcOpen, onConnected]);

  const [orientation, setOrientation] = useState<{
    alpha: number;
    beta: number;
    gamma: number;
  }>({ alpha: 0, beta: 0, gamma: 0 });

  const mapRef = useMap();
  const lastRef = useRef<{ alpha: number; beta: number; gamma: number }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const THRESHOLD = 0.1;

  const { smoothedRef, smooth } = useOrientationSmoother();

  const lastMoveRef = useRef(Date.now());

  const lngLatRef = useRef<LngLat | null>(null);

  useEffect(() => {
    let animationId: number;
    function animate() {
      const { alpha, beta, gamma } = smooth(
        orientationMessageRef.current || { alpha: 0, beta: 0, gamma: 0 }
      );
      smoothedRef.current = { alpha, beta, gamma };
      //console.log(orientationMessageRef.current);
      const {
        alpha: lastAlpha,
        beta: lastBeta,
        gamma: lastGamma,
      } = lastRef.current;

      const alphaRad = (alpha * Math.PI) / 180;
      const latitude = Math.max(
        -85,
        Math.min(85, beta * Math.cos(alphaRad) - gamma * Math.sin(alphaRad))
      );
      const longitude = alpha;

      const moved =
        Math.abs(alpha - lastAlpha) > THRESHOLD ||
        Math.abs(beta - lastBeta) > THRESHOLD ||
        Math.abs(gamma - lastGamma) > THRESHOLD;

      // setOrientation({
      //   alpha: Math.abs(alpha - lastAlpha),
      //   beta: Math.abs(beta - lastBeta),
      //   gamma: Math.abs(gamma - lastGamma),
      // });
      // console.log({
      //   alpha: Math.abs(alpha - lastAlpha),
      //   beta: Math.abs(beta - lastBeta),
      //   gamma: Math.abs(gamma - lastGamma),
      // });
      // console.log(moved);
      if (moved) {
        //console.log("moved");
        lngLatRef.current = new LngLat(longitude, latitude).wrap();

        mapRef.current?.easeTo({
          center: lngLatRef.current,
          duration: 80,
          easing: (t) => t,
        });

        const additionalThreshold = THRESHOLD + 1;
        const compositionMoved =
          Math.abs(alpha - lastAlpha) > additionalThreshold ||
          Math.abs(beta - lastBeta) > additionalThreshold ||
          Math.abs(gamma - lastGamma) > additionalThreshold;
        //console.log(compositionMoved);

        if (onMove && compositionMoved) {
          // console.log("Aloooo");
          onMove(lngLatRef.current.lat, lngLatRef.current.lng);
        }
        lastMoveRef.current = Date.now();
      }
      const idleTime = Date.now() - lastMoveRef.current;
      //console.log(idleTime);
      if (idleTime >= 470 && idleTime <= 500) {
        //console.log("on move end");
        if (mapRef.current) {
          const center = mapRef.current.getCenter();
          onMoveEnd(center.lat, center.lng);
        }
      }
      if (idleTime >= 2970 && idleTime <= 3000) {
        //console.log("on move end long");
        if (mapRef.current) {
          const center = mapRef.current.getCenter();
          onMoveEndLong(center.lat, center.lng);
        }
      }
      lastRef.current = smoothedRef.current;
      animationId = requestAnimationFrame(animate);
    }
    animate();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [
    mapRef,
    onMove,
    onMoveEnd,
    onMoveEndLong,
    orientationMessageRef,
    smooth,
    smoothedRef,
  ]);

  return (
    <div>
      {/* <div className="absolute top-0 left-0 p-4 z-10 m-10">
        <div className="bg-white bg-opacity-75 backdrop-blur-md rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-bold mb-2">Orientation Control</h2>
          <p className="text-sm text-gray-700">
            Alpha: {orientation.alpha.toFixed(2)}°<br />
            Beta: {orientation.beta.toFixed(2)}°<br />
            Gamma: {orientation.gamma.toFixed(2)}°
          </p>
        </div>
      </div> */}
    </div>
  );
}
