"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Gamepad } from "lucide-react";
import Receiver2 from "../host/receiver2";
import { useEffect, useRef, useState } from "react";
import { useWebRTC } from "@/hooks/webrtc-context";

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry/i.test(
    navigator.userAgent
  );
}

export default function ReceiverDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const { dcOpen } = useWebRTC();
  const [showDialog, setShowDialog] = useState(true);

  useEffect(() => {
    if (dcOpen) {
      setShowDialog(false);
    }
  }, [dcOpen]);

  if (isMobile()) return null;

  return (
    <>
      {showDialog && (
        <Dialog>
          <DialogTrigger asChild>
            <div className="absolute top-[255px] right-0 z-10">
              <div className="mr-[10px] mt-[10px]">
                <button className="bg-white w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-gray-200">
                  <Gamepad width={22} height={22} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-[75%]">
            <DialogTitle>Receiver</DialogTitle>
            <Receiver2 />
            <DialogClose></DialogClose>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
