"use client";

import { useState } from "react";

let audioContext: AudioContext | null = null;
let webpdNode: typeof window.WebPdRuntime.WebPdWorkletNode | null = null;
let stream: MediaStream | null = null;
let patch: ArrayBuffer | null = null;

async function startAudio(patchPath: string) {
  // Fetch the patch code
  const response = await fetch(patchPath);

  patch = await response.arrayBuffer();

  audioContext = new AudioContext();
  const r = await window.WebPdRuntime.registerWebPdWorkletNode(audioContext);

  let node = audioContext.createMediaStreamDestination();
  stream = node.stream;

  if (audioContext.state === "running") {
    audioContext.suspend();
  }

  // Setup web audio graph
  const sourceNode = audioContext.createMediaStreamSource(stream);
  webpdNode = new window.WebPdRuntime.WebPdWorkletNode(audioContext);

  sourceNode.connect(webpdNode);
  webpdNode.connect(audioContext.destination);

  // Setup filesystem management
  webpdNode.port.onmessage = (message: any) => {
    return window.WebPdRuntime.fsWeb(webpdNode.current, message, {
      rootUrl: window.WebPdRuntime.urlDirName(location.pathname),
    });
  };

  // Send code to the worklet

  webpdNode.port.postMessage({
    type: "code:WASM",
    payload: {
      wasmBuffer: patch,
    },
  });

  return webpdNode;
}

export default function useWebpd(patchPath?: string | null) {
  const [path, setPath] = useState(patchPath);
  const [status, setStatus] = useState<
    "waiting" | "loading" | "error" | "playing" | "suspended" | "started"
  >("waiting");
  const [error, setError] = useState(null);

  const sendMsgToWebPd = (
    nodeId: string,
    portletId: string,
    message: (string | number)[]
  ) => {
    webpdNode.port.postMessage({
      type: "inletCaller",
      payload: {
        nodeId,
        portletId,
        message,
      },
    });
  };

  async function resume() {
    if (audioContext) {
      await audioContext.resume();
      setStatus("playing");
    } else {
      throw new Error("Cannot resmuse, AudioContext is null");
    }
  }

  async function suspend() {
    if (audioContext) {
      await audioContext.suspend();
      setStatus("suspended");
    } else {
      throw new Error("Cannot Suspend, AudioContext is null");
    }
  }

  async function start(latePath?: string) {
    //setStatus("loading");
    if (window.WebPdRuntime) {
      try {
        await startAudio(path ?? latePath ?? "");
        setStatus("started");
      } catch (error: any) {
        setError(error);
        //throw new Error("Error starting audio worklet: ", error);
      }
    }
  }

  async function close() {
    webpdNode?.destroy();
    patch = null;
    if (audioContext?.state! !== "closed") {
      audioContext?.close();
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
