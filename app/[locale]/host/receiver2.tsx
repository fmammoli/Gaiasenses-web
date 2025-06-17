"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react"; // npm install qrcode.react
import { useWebRTC } from "@/hooks/webrtc-context";
import { io, Socket } from "socket.io-client";

import { compressToEncodedURIComponent } from "lz-string";
import Link from "next/link";

export default function Receiver2() {
  const socketRef = useRef<Socket | null>(null);
  const { pcRef: lcRef, offer } = useWebRTC();

  const answerRef = useRef<RTCSessionDescriptionInit | null>(null);

  useEffect(() => {
    const socket = io("https://gaiasenses-controller-server.onrender.com");
    socketRef.current = socket;

    socketRef.current.on("connect", () => {
      if (socketRef.current && lcRef.current?.localDescription) {
        console.log("emitting offer");
        socketRef.current.emit("offer", offer);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      await lcRef.current?.addIceCandidate(candidate);
    });

    // Listen for answer and ICE candidates from the server
    socketRef.current.on(
      "getAnswer",
      async (newAnswer: RTCSessionDescriptionInit) => {
        const pc = lcRef.current;
        if (
          pc &&
          pc.localDescription &&
          pc.localDescription.type === "offer" &&
          !pc.remoteDescription
        ) {
          try {
            await pc.setRemoteDescription(newAnswer);
          } catch (e) {
            console.error("Failed to set remote description:", e);
          }
        } else {
          console.warn("Skipping setRemoteDescription: wrong state", {
            signalingState: pc?.signalingState,
            localDescription: pc?.localDescription,
            remoteDescription: pc?.remoteDescription,
          });
        }
      }
    );

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off("connect");
      socketRef.current?.off("ice-candidate");
      socketRef.current?.off("getAnswer");
      socketRef.current = null;
    };
  }, [lcRef, offer]);

  console.log(offer);

  return (
    <div className="flex-col items-center justify-center">
      <h2 className="text-md mb-4">
        1. Read this QR Code with your phone camera:
      </h2>
      <Link
        className="flex justify-center"
        href={`http://localhost:3000/controller?offer=${compressToEncodedURIComponent(
          JSON.stringify(offer)
        )}`}
        target="_blank"
      >
        <QRCodeSVG
          size={400}
          value={`https://gaiasenses-web.vercel.app/controller?offer=${compressToEncodedURIComponent(
            JSON.stringify(offer)
          )}`}
          //value={`http://gaiasenses-web-git-webrtc-control-fmammolis-projects.vercel.app/controller`}
          level="L"
        />
      </Link>
      <p>{JSON.stringify(offer, null, 2)}</p>
    </div>
  );
}
