import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { useState } from "react";

export default function TogglePlayButton({
  play,
  onPlay,
  onPause,
}: {
  play: boolean;
  onPlay: () => void;
  onPause: () => void;
}) {
  function onClick() {
    if (play) {
      onPause();
    } else {
      onPlay();
    }
  }
  return (
    <div
      className="absolute h-full w-full flex items-center justify-center"
      onClick={onClick}
    >
      <Button
        variant={"outline"}
        size={"icon"}
        className={`rounded-full w-[100px] h-[100px] border-4 hover:opacity-80 transition-transform  ${
          !play ? "opacity-100 bg-[rgba(255,255,255,0.5)]" : "opacity-0"
        }`}
        onClick={onClick}
      >
        {play ? (
          <PauseIcon height={80} width={80} strokeOpacity={0.8}></PauseIcon>
        ) : (
          <PlayIcon height={80} width={80} strokeOpacity={0.8}></PlayIcon>
        )}
      </Button>
    </div>
  );
}
