"use client";
import useWebpd from "@/hooks/use-webpd";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  return (
    <Link href={"/"}>
      <Button>Back</Button>;
    </Link>
  );
}
