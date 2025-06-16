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
  const STOPPED_THRESHOLD = 0.1; // degrees, adjust as needed
  const MOVING_THRESHOLD = 0.2; // degrees, adjust as needed
  const smoothedRef = useOrientationSmoother(orientationMessageRef.current);

  const lastTimeRef = useRef(performance.now());

  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const isStoppedRef = useRef<boolean>(false);

  const lngLatRef = useRef<LngLat | null>(null);

  useEffect(() => {
    let animationId: number;
    function animate() {
      const now = performance.now();
      const dt = (now - lastTimeRef.current) / 1000; // seconds

      const { alpha, beta, gamma } = smoothedRef.current;

      const {
        alpha: lastAlpha,
        beta: lastBeta,
        gamma: lastGamma,
      } = lastRef.current;

      // Calculate angular speed (degrees/sec)
      const dAlpha = Math.abs(alpha - lastAlpha) / dt;
      const dBeta = Math.abs(beta - lastBeta) / dt;
      const dGamma = Math.abs(gamma - lastGamma) / dt;
      const speed = Math.max(dAlpha, dBeta, dGamma);

      // Map speed to zoom (tune these values as needed)
      const minZoom = 1.5;
      const maxZoom = 8;
      const maxSpeed = 100; // degrees/sec for fastest spin
      const zoom = Math.max(
        minZoom,
        maxZoom - (speed / maxSpeed) * (maxZoom - minZoom)
      );

      const alphaRad = (alpha * Math.PI) / 180;
      const latitude = Math.max(
        -85,
        Math.min(85, beta * Math.cos(alphaRad) - gamma * Math.sin(alphaRad))
      );
      const longitude = alpha;

      // Only move if change exceeds threshold
      const threshold = isStoppedRef.current
        ? STOPPED_THRESHOLD
        : MOVING_THRESHOLD; // Lower threshold when stopped
      const moved =
        Math.abs(alpha - lastAlpha) > threshold ||
        Math.abs(beta - lastBeta) > threshold ||
        Math.abs(gamma - lastGamma) > threshold;

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
      if (moved) {
        isStoppedRef.current = false;
        //console.log("moved");
        lngLatRef.current = new LngLat(longitude, latitude).wrap();
        if (mapRef.current) {
          mapRef.current.easeTo({
            center: lngLatRef.current,
            duration: 100,
            easing: (t) => t,
          });
        }

        const additionalThreshold = threshold + 2;
        const compositionMoved =
          Math.abs(alpha - lastAlpha) > additionalThreshold ||
          Math.abs(beta - lastBeta) > additionalThreshold ||
          Math.abs(gamma - lastGamma) > additionalThreshold;

        if (onMove && compositionMoved) {
          onMove(lngLatRef.current.lat, lngLatRef.current.lng);
        }

        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
          if (lngLatRef.current && isStoppedRef.current === false) {
            console.log("open popup");
            onMoveEnd(lngLatRef.current.lat, lngLatRef.current.lng);
            isStoppedRef.current = true;
          }
        }, 300);
      }
      lastTimeRef.current = now;
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
