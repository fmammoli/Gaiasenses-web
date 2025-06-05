"use client";
import { useEffect, useRef } from "react";
import TogglePlayButton from "./toggle-play-button";

// This is for adding Pd4Web to the global this type
declare global {
  var Pd4Web: InstanceType<Pd4WebModuleType["Pd4Web"]> | undefined;
  var Pd4WebAudioWorkletNode: AudioWorkletNode | undefined;
}

type Pd4WebModuleType = {
  Pd4Web: new () => {
    // Internal handle (optional, for advanced use)
    $$?: any;

    // Main API methods
    init: () => Promise<void> | void;
    addGuiReceiver: (arg0: any) => void;
    bindReceiver: (arg0: any) => void;
    noteOn: (arg0: any, arg1: any, arg2: any) => void;
    resumeAudio: () => void;
    sendBang: (arg0: any) => void;
    sendFloat: (arg0: any, arg1: any) => void;
    sendSymbol: (arg0: any, arg1: any) => void;
    soundToggle: () => void;
    suspendAudio: () => void;
    unbindReceiver: (arg0: any) => void;

    // Internal/low-level methods
    _addFloat: (arg0: any, arg1: any) => void;
    _addSymbol: (arg0: any, arg1: any) => void;
    _finishMessage: (arg0: any) => void;
    _getItemFromListFloat: (arg0: any, arg1: any) => any;
    _getItemFromListSymbol: (arg0: any, arg1: any) => any;
    _getItemFromListType: (arg0: any, arg1: any) => any;
    _getMessageSelector: (arg0: any) => any;
    _getReceivedListSize: (arg0: any) => number;
    _startMessage: (arg0: any, arg1: any) => void;

    // ClassHandle methods (from Emscripten embind)
    delete: () => void;
    deleteLater: () => void;
    isAliasOf: (other: any) => boolean;
    isDeleted: () => boolean;
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
  const pd4webAudioWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const initializedRef = useRef(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  useEffect(() => {
    navigator.serviceWorker.ready.then(() => {
      console.log("Service worker is ready");
      scriptRef.current = document.createElement("script");
      scriptRef.current.src = "/pd4web/pd4web.js";
      scriptRef.current.async = true;
      scriptRef.current.onload = () => {
        const Pd4WebModule = (globalThis as any).Pd4WebModule as
          | ((opts: { packageName: string }) => Promise<Pd4WebModuleType>)
          | undefined;
        if (Pd4WebModule) {
          Pd4WebModule({ packageName }).then((Pd4WebModulePromise) => {
            globalThis.Pd4Web = new Pd4WebModulePromise.Pd4Web();
            //TODO
            // For some reasing the globalThis.Pd4WebAudioWorkletNode is not available at this moment
            //pd4webAudioWorkletNodeRef.current = globalThis.Pd4WebAudioWorkletNode(
            pd4webRef.current = globalThis.Pd4Web;
            if (pd4webRef.current && !initializedRef.current) {
              pd4webRef.current.init();
              initializedRef.current = true;
              console.log("Pd4Web initialized");
            }
          });
        }
      };
      if (scriptRef.current) {
        document.body.appendChild(scriptRef.current);
      }

      return () => {
        console.log("Cleaning up Pd4Web script");
        if (scriptRef.current) {
          document.body.removeChild(scriptRef.current);
        }
        initializedRef.current = false;
        globalThis.Pd4Web = undefined;
        pd4webRef.current = null;
        if (pd4webAudioWorkletNodeRef.current) {
          pd4webAudioWorkletNodeRef.current.disconnect(
            pd4webAudioWorkletNodeRef.current.context.destination
          );
        }
      };
    });
  }, [packageName]);

  const init = () => {
    console.log("Pd4Web init called");
    if (pd4webRef.current && !initializedRef.current) {
      console.log("Pd4Web init called");
      pd4webRef.current.init();
      initializedRef.current = true;
    }
  };

  const suspendAudio = () => {
    console.log(pd4webAudioWorkletNodeRef.current);
    if (pd4webRef.current && initializedRef.current && globalThis.Pd4Web) {
      console.log("Pd4Web suspend called");
      //TODO
      //This should probably be a ref but I didn't managed to make it work,
      //should come back to this later
      //pd4webRef.current.suspendAudio(); This does not work for some reaseon
      globalThis.Pd4WebAudioWorkletNode?.disconnect();
      initializedRef.current = false;
    }
  };

  return (
    <TogglePlayButton
      play={play}
      onPlay={init}
      onPause={suspendAudio}
    ></TogglePlayButton>
  );
}
