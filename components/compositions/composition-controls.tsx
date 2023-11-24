"use client";
import useWebpd from "@/hooks/use-webpd";

import TogglePlayButton from "./toggle-play-button";
import { PatchData } from "@/hooks/types";

import "react-h5-audio-player/lib/styles.css";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import { useEffect, useRef } from "react";
import H5AudioPlayer from "react-h5-audio-player";
const Player = ({ path, play }: { path: string; play: boolean }) => {
  const ref = useRef<H5AudioPlayer>(null);

  useEffect(() => {
    if (ref.current?.audio?.current) {
      if (play) {
        ref.current.audio.current.play();
      } else {
        ref.current.audio.current.pause();
      }
    }
  }, [play]);

  return (
    <div className="absolute bottom-0 w-full">
      <AudioPlayer
        className={`${
          play ? "opacity-0 " : "opacity-80"
        }  !bg-transparent duration-700 transition-opacity `}
        ref={ref}
        src={path}
        loop
        onPlay={(e) => console.log("play")}
        customProgressBarSection={[RHAP_UI.PROGRESS_BAR]}
        customControlsSection={[]}
        // other props here
      />
    </div>
  );
};

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
