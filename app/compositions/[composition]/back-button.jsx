"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  function handleBack() {
    router.back();
  }
  return <Button onClick={handleBack}>Back</Button>;
}
