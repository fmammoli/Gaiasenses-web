"use client";

import "react-h5-audio-player/lib/styles.css";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import { useEffect, useRef } from "react";
import H5AudioPlayer from "react-h5-audio-player";

export default function Player({
  path,
  play,
}: {
  path: string;
  play: boolean | "true" | "false";
}) {
  const ref = useRef<H5AudioPlayer>(null);

  console.log(play);
  useEffect(() => {
    console.log("inside ", play);
    if (play) {
      if (ref.current?.audio?.current) {
        if (play === true || play === "true") {
          ref.current.audio.current.play();
        } else {
          ref.current.audio.current.pause();
        }
      }
    }
  }, [play]);

  if (ref.current && play === false) {
    ref.current.audio?.current?.pause();
  }

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
}
