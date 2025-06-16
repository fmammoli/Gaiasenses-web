"use client";

import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react"; // npm install qrcode.react
import { useWebRTC } from "@/hooks/webrtc-context";
import { io, Socket } from "socket.io-client";

import { compressToEncodedURIComponent } from "lz-string";
import Link from "next/link";

const iceServers = {
  iceServers: [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:global.relay.metered.ca:80",
      username: "7d9972cbc21c1315dd614f41",
      credential: "ZxXcRjMbbHoOqjua",
    },
    {
      urls: "turn:global.relay.metered.ca:80?transport=tcp",
      username: "7d9972cbc21c1315dd614f41",
      credential: "ZxXcRjMbbHoOqjua",
    },
    {
      urls: "turn:global.relay.metered.ca:443",
      username: "7d9972cbc21c1315dd614f41",
      credential: "ZxXcRjMbbHoOqjua",
    },
    {
      urls: "turns:global.relay.metered.ca:443?transport=tcp",
      username: "7d9972cbc21c1315dd614f41",
      credential: "ZxXcRjMbbHoOqjua",
    },
  ],
};

export default function Receiver2() {
  const socketRef = useRef<Socket | null>(null);
  const { pcRef: lcRef, offer, setWebRTCConnection } = useWebRTC();

  useEffect(() => {
    if (!lcRef.current) {
      console.log("setting RTCPeer Connection");
      const pc = new RTCPeerConnection(iceServers);
      setWebRTCConnection(pc);
    }
  }, [lcRef, setWebRTCConnection]);

  useEffect(() => {
    const socket = io("https://gaiasenses-controller-server.onrender.com");
    socketRef.current = socket;

    socketRef.current.on("connect", () => {
      if (socketRef.current && lcRef.current?.localDescription) {
        socketRef.current.emit("offer", offer);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      if (lcRef.current) {
        await lcRef.current.addIceCandidate(candidate);
      }
    });

    // Listen for answer and ICE candidates from the server
    socketRef.current.on("getAnswer", async (answer) => {
      if (lcRef.current?.localDescription) console.log("has local description");
      if (lcRef.current?.remoteDescription)
        console.log("has remote description", lcRef.current?.remoteDescription);
      if (lcRef.current) {
        await lcRef.current.setRemoteDescription(answer);
        console.log(lcRef.current);
      }
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current?.off("connect");
      socketRef.current?.off("ice-candidate");
      socketRef.current?.off("getAnswer");
      socketRef.current = null;
    };
  }, [lcRef, offer]);

  return (
    <div className="flex-col items-center justify-center">
      <h2 className="text-md mb-4">
        1. Read this QR Code with your phone camera:
      </h2>
      <Link
        className="flex justify-center"
        href={`https://gaiasenses-web.vercel.app/controller?offer=${compressToEncodedURIComponent(
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
    </div>
  );
}
