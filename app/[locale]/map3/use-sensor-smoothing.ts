import { useSearchParams } from "next/navigation";
import { useRef, useCallback, useEffect, use } from "react";
import { MapRef } from "react-map-gl";

const BUFFER_SIZE = 5;
const EMA_ALPHA = 0.08;
const MAP_UPDATE_HZ = 20;
const MAP_UPDATE_MS = 1000 / MAP_UPDATE_HZ;
const MAX_DELTA_PER_UPDATE = 2.5;
const MOTION_STOP_THRESHOLD = 0.3; // degrees - velocity threshold to detect stop
const MOTION_STOP_DURATION = 300; // ms - how long velocity must be below threshold

function median(values: number[]) {
  const arr = [...values].sort((a, b) => a - b);
  const mid = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
}

function quatToEuler(q: { w: number; x: number; y: number; z: number }) {
  const { w, x, y, z } = q;
  const ysqr = y * y;

  const t0 = 2 * (w * x + y * z);
  const t1 = 1 - 2 * (x * x + ysqr);
  const roll = Math.atan2(t0, t1) * (180 / Math.PI);

  let t2 = 2 * (w * y - z * x);
  t2 = Math.max(-1, Math.min(1, t2));
  const pitch = Math.asin(t2) * (180 / Math.PI);

  const t3 = 2 * (w * z + x * y);
  const t4 = 1 - 2 * (ysqr + z * z);
  const yaw = Math.atan2(t3, t4) * (180 / Math.PI);

  return { yaw, pitch, roll };
}

export function useSensorSmoothing(
  mapRef: React.RefObject<MapRef>,
  onMotionStop?: () => void
) {
  const searchParams = useSearchParams();
  const sensorBufferRef = useRef<
    Array<{ yaw: number; pitch: number; roll: number }>
  >([]);
  const sensorSmoothedRef = useRef<{
    alpha: number;
    beta: number;
    gamma: number;
  }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const lastSensorValuesRef = useRef<{
    yaw: number;
    pitch: number;
    roll: number;
  } | null>(null);
  const motionStoppedRef = useRef<boolean>(false);
  const lowVelocityStartTimeRef = useRef<number | null>(null);
  const callbackFiredRef = useRef<boolean>(false);

  const handleOnSensor = useCallback(
    (data: any) => {
      if (!data) return;

      let yaw = 0,
        pitch = 0,
        roll = 0;
      data.q = {
        w: data.quat.quat_w,
        x: data.quat.quat_x,
        y: data.quat.quat_y,
        z: data.quat.quat_z,
      };
      if (data.q && typeof data.q === "object") {
        const q = data.q as {
          w: number;
          x: number;
          y: number;
          z: number;
        };
        const e = quatToEuler(q);
        yaw = e.yaw;
        pitch = e.pitch;
        roll = e.roll;
      } else {
        yaw = Number(data.euler?.yaw ?? 0);
        pitch = Number(data.euler?.pitch ?? 0);
        roll = Number(data.euler?.roll ?? 0);
      }

      yaw = ((((yaw + 180) % 360) + 360) % 360) - 180;

      // Check velocity (change in sensor values)
      if (lastSensorValuesRef.current) {
        const deltaYaw = Math.abs(yaw - lastSensorValuesRef.current.yaw);
        const deltaPitch = Math.abs(pitch - lastSensorValuesRef.current.pitch);
        const deltaRoll = Math.abs(roll - lastSensorValuesRef.current.roll);

        const velocity = Math.max(deltaYaw, deltaPitch, deltaRoll);

        if (velocity < MOTION_STOP_THRESHOLD) {
          // Low velocity detected
          if (lowVelocityStartTimeRef.current === null) {
            lowVelocityStartTimeRef.current = performance.now();
          }
          const lowVelocityDuration =
            performance.now() - lowVelocityStartTimeRef.current;
          if (lowVelocityDuration > MOTION_STOP_DURATION) {
            if (!motionStoppedRef.current) {
              motionStoppedRef.current = true;
              // Call the callback only once when motion stops
              if (!callbackFiredRef.current) {
                callbackFiredRef.current = true;
                onMotionStop?.();
              }
            }
          }
        } else {
          // Motion detected
          motionStoppedRef.current = false;
          lowVelocityStartTimeRef.current = null;
          callbackFiredRef.current = false; // Reset for next motion stop
        }
      }

      lastSensorValuesRef.current = { yaw, pitch, roll };

      const buf = sensorBufferRef.current;
      buf.push({ yaw, pitch, roll });
      if (buf.length > BUFFER_SIZE) buf.shift();
    },
    [onMotionStop]
  );

  useEffect(() => {
    let raf = 0;
    let lastMapUpdate = 0;

    function step() {
      const now = performance.now();
      const buf = sensorBufferRef.current;

      if (buf.length > 0 && !motionStoppedRef.current) {
        const yaws = buf.map((s) => s.yaw);
        const pitches = buf.map((s) => s.pitch);
        const rolls = buf.map((s) => s.roll);

        const medYaw = median(yaws);
        const medPitch = median(pitches);
        const medRoll = median(rolls);

        const s = sensorSmoothedRef.current;
        s.alpha += (medYaw - s.alpha) * EMA_ALPHA;
        s.beta += (medPitch - s.beta) * EMA_ALPHA;
        s.gamma += (medRoll - s.gamma) * EMA_ALPHA;

        if (now - lastMapUpdate >= MAP_UPDATE_MS && mapRef.current) {
          lastMapUpdate = now;

          const alphaRad = (s.alpha * Math.PI) / 180;
          const latitude = Math.max(
            -85,
            Math.min(
              85,
              s.beta * Math.cos(alphaRad) - s.gamma * Math.sin(alphaRad)
            )
          );
          let longitude = ((s.alpha + 180) % 360) - 180;

          const center = mapRef.current.getCenter();
          const clampedLat =
            Math.abs(center.lat - latitude) > MAX_DELTA_PER_UPDATE
              ? center.lat +
                Math.sign(latitude - center.lat) * MAX_DELTA_PER_UPDATE
              : latitude;
          const clampedLng =
            Math.abs(center.lng - longitude) > MAX_DELTA_PER_UPDATE
              ? center.lng +
                Math.sign(longitude - center.lng) * MAX_DELTA_PER_UPDATE
              : longitude;

          mapRef.current.easeTo({
            center: [clampedLng, clampedLat],
            duration: Math.max(40, MAP_UPDATE_MS * 0.9),
            easing: (t) => t,
          });
        }
      }

      raf = requestAnimationFrame(step);
    }
    if (searchParams.get("mode") === "map") {
      raf = requestAnimationFrame(step);
    }

    return () => cancelAnimationFrame(raf);
  }, [mapRef, searchParams]);

  return { handleOnSensor };
}
