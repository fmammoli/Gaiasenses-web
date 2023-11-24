"use client";

import { useContext, useState } from "react";
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

  let node = audioContext.createMediaStreamDestination();
  const stream = node.stream;

  if (audioContext.state === "running") {
    audioContext.suspend();
  }

  // Setup web audio graph
  const sourceNode = audioContext.createMediaStreamSource(stream);
  const webpdNode = new window.WebPdRuntime.WebPdWorkletNode(audioContext);

  sourceNode.connect(webpdNode).connect(audioContext.destination);

  //console.log("webpd connect");
  // Setup filesystem management
  webpdNode.port.onmessage = (message: any) => {
    return window.WebPdRuntime.fsWeb(webpdNode.current, message, {
      rootUrl: window.WebPdRuntime.urlDirName(location.pathname),
    });
  };
  //console.log("port on message");
  // Send code to the worklet
  webpdNode.port.postMessage({
    type: "code:WASM",
    payload: {
      wasmBuffer: patch,
    },
  });

  //console.log("almost end");

  return { audioContext, webpdNode };
}

export default function useWebpd(patchPath?: string | null) {
  const [path, setPath] = useState(patchPath);

  const [error, setError] = useState(null);

  const {
    audioContext,
    setAudioContext,
    setWebPdNode,
    webPdNode,
    setPatch,
    status,
    setStatus,
    resume,
    suspend,
  } = useContext(MyAudioContext);
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

  async function start(latePath?: string) {
    //console.log("starting useWebPd");
    setPath(latePath);

    if (latePath) {
      setPatch && setPatch(latePath);
    } else {
      if (path) {
        setPatch && setPatch(path);
      }
    }

    //setStatus("loading");
    if (window.WebPdRuntime) {
      try {
        if (setWebPdNode && setAudioContext && !webPdNode && !audioContext) {
          const { audioContext: newAudioContext, webpdNode: newWebPdNode } =
            await startAudio(latePath ?? path ?? "");

          await newAudioContext.resume();
          setStatus && setStatus("playing");
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
      setStatus && setStatus("waiting");
    }
  }

  return {
    status: status,
    start: start,
    resume: resume,
    suspend: suspend,
    sendMsgToWebPd: sendMsgToWebPd,
    close: close,
    patch: patchPath,
  };
}
