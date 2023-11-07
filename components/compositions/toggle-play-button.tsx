"use client";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import { Button } from "../ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MouseEvent } from "react";

export default function TogglePlayButton({
  play,
  onPlay,
  onPause,
}: {
  play: boolean;
  onPlay?: (play?: boolean) => void;
  onPause?: (play?: boolean) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  async function togglePlay(
    event: MouseEvent<HTMLDivElement | HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();
    const newParams = new URLSearchParams(searchParams.toString());
    const newPlayStatus = !play;
    newParams.set("play", newPlayStatus.toString());
    if (newPlayStatus) {
      if (onPlay) onPlay(newPlayStatus);
    } else {
      if (onPause) onPause(newPlayStatus);
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  }

  return (
    <div
      className="absolute top-0 h-full w-full flex items-center justify-center"
      onClick={togglePlay}
    >
      <Button
        variant={"outline"}
        size={"icon"}
        className={`rounded-full w-[100px] h-[100px] border-4 hover:opacity-80 transition-transform  ${
          !play ? "opacity-100 bg-[rgba(255,255,255,0.5)]" : "opacity-0"
        }`}
        onClick={togglePlay}
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
