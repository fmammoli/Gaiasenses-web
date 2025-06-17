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
  onMoveEndLong?: (lat: number, lon: number) => void;
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
  const THRESHOLD = 0;

  const smoothedRef = useOrientationSmoother(orientationMessageRef.current);

  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const longIdleTimer = useRef<NodeJS.Timeout | null>(null);

  const lngLatRef = useRef<LngLat | null>(null);

  useEffect(() => {
    let animationId: number;
    function animate() {
      const { alpha, beta, gamma } = smoothedRef.current;
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

      setOrientation({
        alpha: Math.abs(alpha - lastAlpha),
        beta: Math.abs(beta - lastBeta),
        gamma: Math.abs(gamma - lastGamma),
      });
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
          duration: 60,
          easing: (t) => t,
        });

        const additionalThreshold = THRESHOLD + 2;
        const compositionMoved =
          Math.abs(alpha - lastAlpha) > additionalThreshold ||
          Math.abs(beta - lastBeta) > additionalThreshold ||
          Math.abs(gamma - lastGamma) > additionalThreshold;

        // if (onMove && compositionMoved) {
        //   //onMove(lngLatRef.current.lat, lngLatRef.current.lng);
        // }

        // if (idleTimer.current) clearTimeout(idleTimer.current);
        // idleTimer.current = setTimeout(() => {
        //   if (lngLatRef.current) {
        //     console.log("open popup");
        //     //onMoveEnd(lngLatRef.current.lat, lngLatRef.current.lng);
        //   }
        // }, 400);

        // if (longIdleTimer.current) clearTimeout(longIdleTimer.current);
        // longIdleTimer.current = setTimeout(() => {
        //   if (idleTimer.current) clearTimeout(idleTimer.current);
        //   if (lngLatRef.current) {
        //     console.log("redirect");
        //     //onMoveLongEnd(lngLatRef.current.lat, lngLatRef.current.lng);
        //     // onMoveEnd(lngLatRef.current.lat, lngLatRef.current.lng);
        //     //isStoppedRef.current = true;
        //   }
        // }, 3000);
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
    smoothedRef,
  ]);

  return (
    <div>
      <div className="absolute top-0 left-0 p-4 z-10 m-10">
        <div className="bg-white bg-opacity-75 backdrop-blur-md rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-bold mb-2">Orientation Control</h2>
          <p className="text-sm text-gray-700">
            Alpha: {orientation.alpha.toFixed(2)}°<br />
            Beta: {orientation.beta.toFixed(2)}°<br />
            Gamma: {orientation.gamma.toFixed(2)}°
          </p>
        </div>
      </div>
    </div>
  );
}
