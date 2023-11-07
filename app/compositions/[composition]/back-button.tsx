"use client";
import useWebpd from "@/hooks/use-webpd";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const { suspend, close } = useWebpd();

  const router = useRouter();
  async function handleBack() {
    try {
      console.log("close back button");
      close();
    } catch (error) {
      throw error;
    }

    router.back();
  }
  return <Button onClick={handleBack}>Back</Button>;
}
