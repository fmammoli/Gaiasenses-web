"use client";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { ReactNode, createContext, useEffect, useState } from "react";

// let audioContext: AudioContext | null = null;
// let webPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null = null;
//const audioContext = new AudioContext();
console.log("Module context load");

export type AudioContent = {
  audioContext: AudioContext | null;
  webPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null;
};

export type MyAudioContextContent = {
  audioContext: AudioContext | null;
  setAudioContext: ((newAudioContext: AudioContext | null) => void) | null;
  webPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null;
  setWebPdNode:
    | ((
        newWebPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null
      ) => void)
    | null;
  closeSound: (() => void) | null;
  currentPatch: null | string;
  setPatch: null | ((newPatch: string) => void);
  status: "waiting" | "loading" | "error" | "playing" | "suspended" | "started";
  setStatus:
    | null
    | ((
        newStatus:
          | "waiting"
          | "loading"
          | "error"
          | "playing"
          | "suspended"
          | "started"
      ) => void);
  resume: (() => void) | null;
  suspend: (() => void) | null;
};

export const MyAudioContext = createContext<MyAudioContextContent>({
  audioContext: null,
  setAudioContext: null,
  webPdNode: null,
  setWebPdNode: null,
  closeSound: null,
  currentPatch: null,
  setPatch: null,
  status: "waiting",
  setStatus: null,
  resume: null,
  suspend: null,
});

export function AudioContextProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [currentPatch, setCurrentPatch] = useState<string | null>(null);

  const [status, setStatus] = useState<
    "waiting" | "loading" | "error" | "playing" | "suspended" | "started"
  >("waiting");

  const [audioContextState, setAudioContextState] =
    useState<AudioContext | null>(null);

  const [webPdNodeState, setWebPdNodeState] = useState<
    typeof window.WebPdRuntime.WebPdWorkletNode | null
  >(null);

  function setWebPdNode(
    newWebPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null
  ) {
    //webPdNode = newWebPdNode;
    setWebPdNodeState(newWebPdNode);
  }

  function setAudioContext(newAudioContext: AudioContext | null) {
    //audioContext = newAudioContext;
    setAudioContextState(newAudioContext);
  }

  async function closeSound() {
    if (audioContextState?.state !== "closed") {
      await webPdNodeState?.destroy();
      await audioContextState?.close();
      setAudioContext && setAudioContext(null);
      setWebPdNode && setWebPdNode(null);
      setStatus && setStatus("waiting");
      setCurrentPatch(null);
    }
  }

  //There is probably a better way to handle this close sound on browser back button.
  //Maybe an event listener to "popstate", or "before" something....not sure.
  useEffect(() => {
    async function closeAllSound() {
      console.log("effect closing sound");
      await webPdNodeState?.destroy();
      await audioContextState?.close();
      setAudioContextState(null);
      setWebPdNodeState(null);
      setStatus && setStatus("waiting");
      setCurrentPatch(null);
    }

    if (pathname === "/") {
      if (audioContextState && webPdNodeState) {
        if (audioContextState.state !== "closed") {
          closeAllSound();
        }
      }
    }
  }, [
    pathname,
    webPdNodeState,
    audioContextState,
    setAudioContextState,
    setWebPdNodeState,
  ]);

  function onReady() {
    console.log("WebPd runtime loaded successfully");
  }
  function onError(error: any) {
    console.log("WebPd runteime loaded with error");
    console.log(error);
  }

  function setPatch(newPatch: string) {
    setCurrentPatch(newPatch);
  }

  function updateStatus(
    newStatus:
      | "waiting"
      | "loading"
      | "error"
      | "playing"
      | "suspended"
      | "started"
  ) {
    setStatus(newStatus);
  }

  async function resume() {
    console.log("going to resume");
    if (audioContextState) {
      console.log("resume");
      await audioContextState.resume();
      console.log("resume end");
      setStatus && setStatus("playing");
    } else {
      throw new Error("Cannot resume, AudioContext is null");
    }
  }

  async function suspend() {
    if (audioContextState) {
      audioContextState.suspend();
      setStatus && setStatus("suspended");
    } else {
      throw new Error("Cannot Suspend, AudioContext is null");
    }
  }

  return (
    <>
      <Script
        src="/webpd-runtime.js"
        onReady={onReady}
        onError={onError}
        strategy="afterInteractive"
      ></Script>
      <MyAudioContext.Provider
        value={{
          audioContext: audioContextState,
          setAudioContext: setAudioContext,
          webPdNode: webPdNodeState,
          setWebPdNode,
          closeSound,
          currentPatch,
          setPatch,
          status,
          setStatus: updateStatus,
          resume,
          suspend,
        }}
      >
        {children}
      </MyAudioContext.Provider>
    </>
  );
}
