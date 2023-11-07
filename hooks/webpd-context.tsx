"use client";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { ReactNode, createContext, useEffect, useState } from "react";

// let audioContext: AudioContext | null = null;
// let webPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null = null;
//const audioContext = new AudioContext();
console.log("Module context load");

export type MyAudioContextContent = {
  audioContext: AudioContext | null;
  setAudioContext: ((newAudioContext: AudioContext | null) => void) | null;
  webPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null;
  setWebPdNode:
    | ((
        newWebPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null
      ) => void)
    | null;
};

export const MyAudioContext = createContext<MyAudioContextContent>({
  audioContext: null,
  setAudioContext: null,
  webPdNode: null,
  setWebPdNode: null,
});
console.log("Context Module rerender");
export function AudioContextProvider({ children }: { children: ReactNode }) {
  const [webPdNodeState, setWebPdNodeState] = useState<
    typeof window.WebPdRuntime.WebPdWorkletNode | null
  >(null);

  const pathname = usePathname();

  const [audioContextState, setAudioContextState] =
    useState<AudioContext | null>(null);

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

  //There is probably a better way to handle this close sound on browser back button.
  //Maybe an event listener to "popstate", or "before" something....not sure.
  useEffect(() => {
    async function closeAllSound() {
      console.log("effect closing sound");
      await webPdNodeState?.destroy();
      await audioContextState?.close();
      setAudioContextState(null);
      setWebPdNodeState(null);
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
        }}
      >
        {children}
      </MyAudioContext.Provider>
    </>
  );
}
