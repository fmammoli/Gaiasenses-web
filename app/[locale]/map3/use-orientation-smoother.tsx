import { useEffect, useRef, useState } from "react";

export function useOrientationSmoother(
  orientation: { alpha?: number; beta?: number; gamma?: number } | null
) {
  const smoothedRef = useRef<{ alpha: number; beta: number; gamma: number }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL("./orientation-smoother.worker.js", import.meta.url)
    );
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (e.data.smoothAlpha !== undefined && e.data.smoothBeta !== undefined) {
        smoothedRef.current = {
          alpha: e.data.smoothAlpha,
          beta: e.data.smoothBeta,
          gamma: e.data.smoothGamma,
        };
      }
    };

    worker.postMessage({ action: "load" });

    return () => {
      worker.terminate();
    };
  }, []);

  useEffect(() => {
    if (workerRef.current && orientation) {
      workerRef.current.postMessage({
        alpha: orientation.alpha,
        beta: orientation.beta,
        gamma: orientation.gamma,
      });
    }
  }, [orientation]);

  return smoothedRef;
}
