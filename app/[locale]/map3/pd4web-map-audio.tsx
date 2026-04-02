"use client";

import { useEffect, useRef, useState } from "react";
import type { MapRef } from "react-map-gl";

import { Button } from "@/components/ui/button";
import {
  getPd4WebBundleBasePath,
  getPd4WebBundleScriptPath,
  getPd4WebScriptId,
  type Map3Pd4WebPatch,
} from "./pd4web-patches";

type Pd4WebInstance = {
  init: () => Promise<void>;
  sendFloat: (receiver: string, value: number) => void;
  soundToggle?: () => void;
  suspendAudio?: () => void;
  resumeAudio?: () => void;
};

type Pd4WebModuleType = {
  Pd4Web: new () => Pd4WebInstance;
};

type Pd4WebModuleOptions = {
  locateFile?: (path: string, scriptDirectory: string) => string;
  mainScriptUrlOrBlob?: string;
};

declare global {
  interface Window {
    Pd4Web?: Pd4WebInstance | null;
    Pd4WebModule?: (opts?: Pd4WebModuleOptions) => Promise<Pd4WebModuleType>;
  }
}

type Pd4WebMapAudioProps = {
  patch: Map3Pd4WebPatch;
  mapRef: React.RefObject<MapRef>;
};

export default function Pd4WebMapAudio({ patch, mapRef }: Pd4WebMapAudioProps) {
  const pdRef = useRef<Pd4WebInstance | null>(null);
  const initializedRef = useRef(false);
  const toggleModeRef = useRef<"soundToggle" | "resumeSuspend" | null>(null);
  const positionTimerRef = useRef<number | null>(null);
  const lastPositionRef = useRef<{ lat: number; lng: number } | null>(null);
  const createdScriptRef = useRef<HTMLScriptElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scriptId = getPd4WebScriptId(patch.id);
  const bundleBasePath = getPd4WebBundleBasePath(patch.bundleFolder);
  const scriptSrc = getPd4WebBundleScriptPath(patch.bundleFolder);

  useEffect(() => {
    let cancelled = false;
    let existingScript: HTMLScriptElement | null = null;

    const resetRuntime = () => {
      if (positionTimerRef.current !== null) {
        window.clearInterval(positionTimerRef.current);
        positionTimerRef.current = null;
      }

      pdRef.current?.suspendAudio?.();
      pdRef.current = null;
      window.Pd4Web = undefined;
      initializedRef.current = false;
      toggleModeRef.current = null;
      lastPositionRef.current = null;
      setIsPlaying(false);
      setIsReady(false);
      setIsLoading(true);
    };

    const instantiatePd4Web = async () => {
      const moduleFactory = window.Pd4WebModule;
      if (!moduleFactory) {
        throw new Error("Pd4Web runtime is unavailable");
      }

      const pd4WebModule = await moduleFactory({
        mainScriptUrlOrBlob: scriptSrc,
        locateFile: (path) => `${bundleBasePath}${path}`,
      });
      if (cancelled) {
        return;
      }

      pdRef.current = new pd4WebModule.Pd4Web();
      window.Pd4Web = pdRef.current;
      setError(null);
      setIsReady(true);
      setIsLoading(false);
    };

    const handleReady = () => {
      instantiatePd4Web().catch((err: unknown) => {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to initialize Pd4Web",
        );
        setIsLoading(false);
      });
    };

    const handleScriptError = () => {
      if (cancelled) {
        return;
      }

      setError("Failed to load Pd4Web runtime");
      setIsLoading(false);
    };

    existingScript = document.getElementById(
      scriptId,
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (window.Pd4WebModule) {
        handleReady();
      } else {
        existingScript.addEventListener("load", handleReady, { once: true });
        existingScript.addEventListener("error", handleScriptError, {
          once: true,
        });
      }
    } else {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = scriptSrc;
      script.async = true;
      createdScriptRef.current = script;
      script.addEventListener("load", handleReady, { once: true });
      script.addEventListener("error", handleScriptError, { once: true });
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;

      if (existingScript && !window.Pd4WebModule) {
        existingScript.removeEventListener("load", handleReady);
        existingScript.removeEventListener("error", handleScriptError);
      }

      if (createdScriptRef.current) {
        createdScriptRef.current.remove();
      }

      createdScriptRef.current = null;
      resetRuntime();
    };
  }, [bundleBasePath, scriptId, scriptSrc]);

  useEffect(() => {
    if (!isReady || !pdRef.current || patch.binding.type !== "map-center") {
      return;
    }

    const pd = pdRef.current;
    const binding = patch.binding;
    const positionEpsilon = binding.epsilon ?? 0.0001;
    const positionPollMs = binding.pollMs ?? 100;

    const syncPosition = () => {
      const center = mapRef.current?.getCenter().wrap();
      if (!center) {
        return;
      }

      const nextPosition = { lat: center.lat, lng: center.lng };
      const lastPosition = lastPositionRef.current;

      if (
        lastPosition &&
        Math.abs(lastPosition.lat - nextPosition.lat) < positionEpsilon &&
        Math.abs(lastPosition.lng - nextPosition.lng) < positionEpsilon
      ) {
        return;
      }

      pd.sendFloat(binding.longitudeReceiver, nextPosition.lng);
      pd.sendFloat(binding.latitudeReceiver, nextPosition.lat);
      lastPositionRef.current = nextPosition;
    };

    syncPosition();
    positionTimerRef.current = window.setInterval(syncPosition, positionPollMs);

    return () => {
      if (positionTimerRef.current !== null) {
        window.clearInterval(positionTimerRef.current);
        positionTimerRef.current = null;
      }
    };
  }, [isReady, mapRef, patch.binding]);

  const toggleAfterInit = async (nextPlaying: boolean) => {
    const pd = pdRef.current;
    if (!pd) {
      return;
    }

    if (toggleModeRef.current === null) {
      if (
        typeof pd.resumeAudio === "function" &&
        typeof pd.suspendAudio === "function"
      ) {
        toggleModeRef.current = "resumeSuspend";
      } else if (typeof pd.soundToggle === "function") {
        toggleModeRef.current = "soundToggle";
      }
    }

    if (toggleModeRef.current === "resumeSuspend") {
      if (nextPlaying) {
        pd.resumeAudio?.();
      } else {
        pd.suspendAudio?.();
      }
      return;
    }

    pd.soundToggle?.();
  };

  const handleToggle = async () => {
    const pd = pdRef.current;
    if (!pd || isLoading) {
      return;
    }

    setError(null);

    try {
      if (!initializedRef.current) {
        await pd.init();
        initializedRef.current = true;
        setIsPlaying(true);
        return;
      }

      const nextPlaying = !isPlaying;
      await toggleAfterInit(nextPlaying);
      setIsPlaying(nextPlaying);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle audio");
    }
  };

  return (
    <div className="absolute left-4 bottom-4 z-20 flex flex-col gap-2 pointer-events-auto">
      <span id="Pd4WebAudioSwitch" className="hidden" aria-hidden="true" />
      <Button
        onClick={handleToggle}
        disabled={!isReady || isLoading}
        variant="secondary"
      >
        {isLoading
          ? `Loading ${patch.label.toLowerCase()}`
          : isPlaying
            ? `Pause ${patch.label.toLowerCase()}`
            : `Play ${patch.label.toLowerCase()}`}
      </Button>
      {error ? (
        <div className="max-w-[18rem] rounded bg-white/90 px-3 py-2 text-xs text-red-600 shadow-sm">
          {error}
        </div>
      ) : null}
    </div>
  );
}
