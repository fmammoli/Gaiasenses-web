"use client";

import useWebpd from "@/hooks/use-webpd";
// Not very nice, should find a better solution
export default function AudioStopper() {
  const { close } = useWebpd();
  close();
  return <div className="hidden"></div>;
}
