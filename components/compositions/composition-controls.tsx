"use client";
import useWebpd from "@/hooks/use-webpd";
import { PatchData } from "./lluvia/lluvia";
import TogglePlayButton from "./toggle-play-button";
import { useEffect } from "react";

export default function CompositionControls({
  play,
  patchPath,
  messages,
}: {
  play: boolean;
  patchPath?: PatchData["path"];
  messages?: PatchData["messages"];
}) {
  const { start, status, suspend, sendMsgToWebPd, resume, close } =
    useWebpd(patchPath);

  if (patchPath) {
    if (status === "playing") {
      messages?.forEach((item) => {
        sendMsgToWebPd(item.nodeId, item.portletId, item.message);
      });
    }
  }

  function handlePlay() {
    //play sound
    console.log(status);
    if (patchPath) {
      if (status === "waiting") {
        console.log("play");
        start().then(() => {
          // messages?.forEach((item) => {
          //   sendMsgToWebPd(item.nodeId, item.portletId, item.message);
          // });
        });
      }
      if (status === "suspended") {
        resume();
      }
    }
  }

  async function handlePause() {
    if (patchPath) {
      if (status === "started" || status == "playing") {
        suspend();
      }
    }
  }

  return (
    <>
      <TogglePlayButton
        play={play}
        onPlay={handlePlay}
        onPause={handlePause}
      ></TogglePlayButton>
    </>
  );
}
