"use client";
import useWebpd from "@/hooks/use-webpd";

import TogglePlayButton from "./toggle-play-button";
import { PatchData } from "@/hooks/types";

import "react-h5-audio-player/lib/styles.css";
import Player from "./my-player";

export default function CompositionControls({
  play,
  patchPath,
  messages,
  mp3 = false,
}: {
  play: boolean;
  patchPath?: PatchData["path"];
  messages?: PatchData["messages"];
  mp3?: boolean;
}) {
  const { start, status, suspend, sendMsgToWebPd, resume, close } =
    useWebpd(patchPath);

  //  console.log(patchPath);
  // console.log(messages);

  if (patchPath && !mp3) {
    if (status === "playing") {
      //console.log("is playing, sending msg");
      messages?.forEach((item) => {
        sendMsgToWebPd(item.nodeId, item.portletId, item.message);
      });
    }
  }

  function handlePlay() {
    //play sound

    if (patchPath) {
      if (status === "waiting") {
        start(patchPath).then(() => {
          // messages?.forEach((item) => {
          //   sendMsgToWebPd(item.nodeId, item.portletId, item.message);
          // });
        });
      }
      if (status === "suspended") {
        resume && resume();
      }
    }
  }

  async function handlePause() {
    if (patchPath) {
      if (status === "started" || status == "playing") {
        suspend && suspend();
      }
    }
  }

  const webpdHandlers = mp3 ? {} : { onPlay: handlePlay, onPause: handlePause };

  return (
    <>
      <TogglePlayButton play={play} {...webpdHandlers}></TogglePlayButton>
      {patchPath && mp3 && <Player path={patchPath} play={play}></Player>}
    </>
  );
}
