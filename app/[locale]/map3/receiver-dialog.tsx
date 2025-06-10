"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import Receiver from "../host/receiver"; // Adjust path if needed
import { Gamepad } from "lucide-react";

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry/i.test(
    navigator.userAgent
  );
}

export default function ReceiverDialog() {
  if (isMobile()) return null;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="absolute top-[215px] right-0 z-10">
          <div className="mr-[10px] mt-[10px]">
            <button className="bg-white w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-gray-200">
              <Gamepad width={22} height={22} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[75%]">
        <DialogTitle>Receiver</DialogTitle>
        <Receiver />
        <DialogClose asChild></DialogClose>
      </DialogContent>
    </Dialog>
  );
}
