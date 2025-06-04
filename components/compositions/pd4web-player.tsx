"use client";
import { useEffect, useRef } from "react";
import TogglePlayButton from "./toggle-play-button";

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
  play?: boolean;
}

export default function Pd4WebPlayer({
  packageName = "/thunder4/pd4web.data",
  play = true,
}: Pd4WebPlayerProps) {
  const pd4webRef = useRef<InstanceType<Pd4WebModuleType["Pd4Web"]> | null>(
    null
  );

  useEffect(() => {
    console.log(navigator.serviceWorker);
    navigator.serviceWorker.ready.then(() => {
      console.log("Service worker is ready");
      const script = document.createElement("script");
      script.src = "/pd4web/pd4web.js";
      script.async = true;
      script.onload = () => {
        const Pd4WebModule = (globalThis as any).Pd4WebModule as
          | ((opts: { packageName: string }) => Promise<Pd4WebModuleType>)
          | undefined;
        if (Pd4WebModule) {
          Pd4WebModule({ packageName }).then((Pd4WebModulePromise) => {
            globalThis.Pd4Web = new Pd4WebModulePromise.Pd4Web();
            pd4webRef.current = globalThis.Pd4Web;
            pd4webRef.current.init();
          });
        }
      };
      document.body.appendChild(script);

      const handleClick = async () => {
        if (pd4webRef.current) {
          await pd4webRef.current.init();
        }
      };
      document.addEventListener("click", handleClick, { once: true });

      return () => {
        document.body.removeChild(script);
        document.removeEventListener("click", handleClick);
        pd4webRef.current = null;
      };
    });
  }, [packageName]);

  const init = async () => {
    console.log("Pd4Web init called");
    if (pd4webRef.current) {
      console.log("Pd4Web init called");
      //await pd4webRef.current.init();
      globalThis.Pd4Web?.init();
    }
  };

  return <TogglePlayButton play={play} onPlay={init}></TogglePlayButton>;
}
