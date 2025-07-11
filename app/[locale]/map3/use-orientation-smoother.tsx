import { useEffect, useRef } from "react";

const bufferSize = 10;

function mean(arr: number[]) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
export function useOrientationSmoother() {
  const smoothedRef = useRef<{ alpha: number; beta: number; gamma: number }>({
    alpha: 0,
    beta: 0,
    gamma: 0,
  });
  const workerRef = useRef<Worker | null>(null);

  const orientationRef = useRef<{ alpha: number; beta: number; gamma: number }>(
    {
      alpha: 0,
      beta: 0,
      gamma: 0,
    }
  );

  const alphaBufferRef = useRef<number[]>([]);
  const betaBufferRef = useRef<number[]>([]);
  const gammaBufferRef = useRef<number[]>([]);

  const smooth = ({
    alpha,
    beta,
    gamma,
  }: {
    alpha: number;
    beta: number;
    gamma: number;
  }) => {
    alphaBufferRef.current.push(alpha);
    betaBufferRef.current.push(beta);
    gammaBufferRef.current.push(gamma);
    if (alphaBufferRef.current.length > bufferSize)
      alphaBufferRef.current.shift();
    if (betaBufferRef.current.length > bufferSize)
      betaBufferRef.current.shift();
    if (gammaBufferRef.current.length > bufferSize)
      gammaBufferRef.current.shift();

    const smoothAlpha = mean(alphaBufferRef.current);
    const smoothBeta = mean(betaBufferRef.current);
    const smoothGamma = mean(gammaBufferRef.current);

    smoothedRef.current = {
      alpha: smoothAlpha,
      beta: smoothBeta,
      gamma: smoothGamma,
    };
    return { alpha: smoothAlpha, beta: smoothBeta, gamma: smoothGamma };
  };

  return { smoothedRef, smooth };
}
