"use client";
import useWebpd from "@/components/compositions/visual/use-webpd";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const { suspend, close } = useWebpd();
  const router = useRouter();
  async function handleBack() {
    await suspend();
    await close();
    router.back();
  }
  return <Button onClick={handleBack}>Back</Button>;
}
