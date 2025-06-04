"use client";
import { useEffect, useRef } from "react";

// This is for adding Pd4Web to the global this type
declare global {
  var Pd4Web: InstanceType<Pd4WebModuleType["Pd4Web"]> | undefined;
}

type Pd4WebModuleType = {
  Pd4Web: new () => {
    init: () => Promise<void>;
    // Add other Pd4Web methods here as needed
  };
};

interface Pd4WebPlayerProps {
  packageName?: string;
}

export default function usePd4Web({
  packageName = "/thunder4/pd4web.data",
}: Pd4WebPlayerProps) {
  const pdWebRef = useRef<InstanceType<Pd4WebModuleType["Pd4Web"]> | null>(
    null
  );

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/thunder4/pd4web.js";
    script.async = true;
    script.onload = () => {
      const Pd4WebModule = (globalThis as any).Pd4WebModule as
        | ((opts: { packageName: string }) => Promise<Pd4WebModuleType>)
        | undefined;
      if (Pd4WebModule) {
        Pd4WebModule({ packageName }).then((Pd4WebModulePromise) => {
          globalThis.Pd4Web = new Pd4WebModulePromise.Pd4Web();
          pdWebRef.current = globalThis.Pd4Web;
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      pdWebRef.current = null;
    };
  }, [packageName]);

  const init = async () => {
    if (pdWebRef.current) {
      await pdWebRef.current.init();
      //globalThis.Pd4Web?.init();
    }
  };

  return { init };
}
