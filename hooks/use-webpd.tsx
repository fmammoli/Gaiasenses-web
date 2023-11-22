"use client";

import { useContext, useRef, useState } from "react";
import { MyAudioContext } from "./webpd-context";

//!!!!! TODO IMPORTANT
// It seams I am creating a new WebWorker or wasm at every new starAudio.
// Should look how to clear them after using.

// let audioContext: AudioContext | null = null;
// let webPdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null = null;
// let stream: MediaStream | null = null;
// let patch: ArrayBuffer | null = null;

async function startAudio(patchPath: string) {
  // Fetch the patch code
  const response = await fetch(patchPath);

  const patch = await response.arrayBuffer();

  const audioContext = new AudioContext();
  const r = await window.WebPdRuntime.registerWebPdWorkletNode(audioContext);
  console.log("context created");
  let node = audioContext.createMediaStreamDestination();
  const stream = node.stream;

  if (audioContext.state === "running") {
    audioContext.suspend();
  }

  // Setup web audio graph
  const sourceNode = audioContext.createMediaStreamSource(stream);
  const webpdNode = new window.WebPdRuntime.WebPdWorkletNode(audioContext);

  const gainNode = audioContext.createGain();
  //gainNode.gain.setValueAtTime(1.0, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    1.0,
    audioContext.currentTime + 0.1
  );

  sourceNode
    .connect(webpdNode)
    //.connect(gainNode)
    .connect(audioContext.destination);

  console.log("webpd connect");
  // Setup filesystem management
  webpdNode.port.onmessage = (message: any) => {
    return window.WebPdRuntime.fsWeb(webpdNode.current, message, {
      rootUrl: window.WebPdRuntime.urlDirName(location.pathname),
    });
  };
  console.log("port on message");
  // Send code to the worklet
  webpdNode.port.postMessage({
    type: "code:WASM",
    payload: {
      wasmBuffer: patch,
    },
  });

  console.log("almost end");

  return { audioContext, webpdNode, gainNode };
}

// async function startAudio(patchPath: string) {
//   // Fetch the patch code
//   const response = await fetch(patchPath);

//   patch = await response.arrayBuffer();

//   audioContext = new AudioContext();
//   console.log("new audio context");
//   const r = await window.WebPdRuntime.registerWebPdWorkletNode(audioContext);

//   let node = audioContext.createMediaStreamDestination();
//   stream = node.stream;

//   if (audioContext.state === "running") {
//     audioContext.suspend();
//   }

//   // Setup web audio graph
//   const sourceNode = audioContext.createMediaStreamSource(stream);
//   webpdNode = new window.WebPdRuntime.WebPdWorkletNode(audioContext);

//   sourceNode.connect(webpdNode);
//   webpdNode.connect(audioContext.destination);

//   // Setup filesystem management
//   webpdNode.port.onmessage = (message: any) => {
//     return window.WebPdRuntime.fsWeb(webpdNode.current, message, {
//       rootUrl: window.WebPdRuntime.urlDirName(location.pathname),
//     });
//   };

//   // Send code to the worklet
//   webpdNode.port.postMessage({
//     type: "code:WASM",
//     payload: {
//       wasmBuffer: patch,
//     },
//   });

//   return webpdNode;
// }

export default function useWebpd(patchPath?: string | null) {
  const [path, setPath] = useState(patchPath);
  const [status, setStatus] = useState<
    "waiting" | "loading" | "error" | "playing" | "suspended" | "started"
  >("waiting");
  const [error, setError] = useState(null);

  const { audioContext, setAudioContext, setWebPdNode, webPdNode } =
    useContext(MyAudioContext);
  // const audioContextRef = useRef<AudioContext>();
  // const webpdNodeRef = useRef<typeof window.WebPdRuntime.WebPdWorkletNode>();

  // useEffect(() => {
  //   function closeOnBack(e: any) {
  //     console.log(e);
  //   }
  //   if (window) {
  //     console.log("adding e listener");
  //     window.addEventListener("popstate", closeOnBack);
  //     return () => {
  //       window.removeEventListener("popstate", closeOnBack);
  //     };
  //   }
  // }, [close]);

  function sendMsgToWebPd(
    nodeId: string,
    portletId: string,
    message: (string | number)[]
  ) {
    webPdNode?.port.postMessage({
      type: "inletCaller",
      payload: {
        nodeId,
        portletId,
        message,
      },
    });
  }

  async function resume() {
    console.log("going to resume");
    if (audioContext) {
      if (gainRef.current) {
        console.log("fade in");
        gainRef.current.gain.exponentialRampToValueAtTime(
          1,
          audioContext.currentTime + 0.2
        );
      }
      console.log("resume");
      await audioContext.resume();
      console.log("resume end");
      setStatus("playing");
    } else {
      throw new Error("Cannot resume, AudioContext is null");
    }
  }

  async function suspend() {
    if (audioContext) {
      if (gainRef.current) {
        console.log("fade out");
        console.log(audioContext.currentTime);
        gainRef.current.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.2
        );
      }

      setTimeout(() => {
        audioContext.suspend();
      }, 400);

      setStatus("suspended");
    } else {
      throw new Error("Cannot Suspend, AudioContext is null");
    }
  }

  const gainRef = useRef<GainNode>();

  async function start(latePath?: string) {
    //setStatus("loading");
    if (window.WebPdRuntime) {
      try {
        if (setWebPdNode && setAudioContext && !webPdNode && !audioContext) {
          const {
            audioContext: newAudioContext,
            webpdNode: newWebPdNode,
            gainNode,
          } = await startAudio(path ?? latePath ?? "");

          gainRef.current = gainNode;
          await newAudioContext.resume();
          setStatus("playing");
          if (newAudioContext && newWebPdNode) {
            setAudioContext(newAudioContext);
            setWebPdNode(newWebPdNode);
          }
        }
      } catch (error: any) {
        setError(error);
        //throw new Error("Error starting audio worklet: ", error);
      }
    }
  }

  async function close() {
    if (audioContext?.state !== "closed") {
      audioContext?.close();
      webPdNode?.destroy();
      setAudioContext && setAudioContext(null);
      setWebPdNode && setWebPdNode(null);
    }
  }

  return {
    status: status,
    start: start,
    resume: resume,
    suspend: suspend,
    sendMsgToWebPd: sendMsgToWebPd,
    close: close,
  };
}
