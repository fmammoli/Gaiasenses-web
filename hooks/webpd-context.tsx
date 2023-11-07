"use client";
import Script from "next/script";
import { ReactNode, createContext, useState } from "react";

let audioContext: AudioContext | null = null;
let webPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null = null;
//const audioContext = new AudioContext();
console.log("Module context load");

export type MyAudioContextContent = {
  audioContext: AudioContext | null;
  setAudioContext: ((newAudioContext: AudioContext) => void) | null;
  webPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null;
  setWebPdNode:
    | ((newWebPdNode: typeof window.WebPdRuntime.WebPdWorkletNode) => void)
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
  const [audioState, setAudioState] = useState<{
    audioContext: AudioContext | null;
    webPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null;
  }>({ audioContext: null, webPdNode: null });

  const [webPdNodeState, setWebPdNodeState] = useState<
    typeof window.WebPdRuntime.WebPdWorkletNode | null
  >(null);
  const [audioContextState, setAudioContextState] =
    useState<AudioContext | null>(null);

  function setWebPdNode(
    newWebPdNode: typeof window.WebPdRuntime.WebPdWorkletNode
  ) {
    webPdNode = newWebPdNode;
    setWebPdNodeState(newWebPdNode);
  }

  function setAudioContext(newAudioContext: AudioContext) {
    audioContext = newAudioContext;
    setAudioContextState(newAudioContext);
  }

  function onReady() {
    console.log("WebPd runtime loaded successfully");
  }
  function onError(error: any) {
    console.log("WebPd runteime loaded with error");
    console.log(error);
  }

  // useEffect(() => {
  //   // if (!audioContext) {
  //   //   audioContext = new AudioContext();
  //   // }
  //   //console.log("useEffect> ", audioContextState);
  //   if (!audioContextState) {
  //     const audioContext = new AudioContext();
  //     setAudioContextState(audioContext);
  //   }
  // }, [audioContextState]);
  // console.log(audioContextState);
  //console.log("rendering context component, ", audioContextState);
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
          audioContext: audioContext,
          setAudioContext: setAudioContext,
          webPdNode: webPdNode,
          setWebPdNode,
        }}
      >
        {children}
      </MyAudioContext.Provider>
    </>
  );
}
