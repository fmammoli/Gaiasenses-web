"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TitleScreenButton() {
  function onClick() {}
  return (
    <Button
      variant={"link"}
      className="text-white text-[2rem] md:text-[2rem] font-pop font-semibold leading-tight md:leading-[0.9em] [text-shadow:_0px_1px_1px_rgba(255,255,255,0.6)] z-50"
    >
      Iniciar
    </Button>
  );
}
