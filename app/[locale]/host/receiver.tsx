"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react"; // npm install qrcode.react
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { useOrientation } from "@/hooks/orientation-context";
import { useWebRTC } from "@/hooks/webrtc-context";

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

export default function Receiver() {
  const { pcRef: lcRef, offer, setWebRTCConnection } = useWebRTC();

  useEffect(() => {
    console.log("Initializing WebRTC Receiver...");
    if (!lcRef.current) {
      const pc = new RTCPeerConnection(iceServers);
      setWebRTCConnection(pc);
    }
  }, [lcRef, setWebRTCConnection]);

  const handleAnswerInput = async (answerStr: string) => {
    if (!lcRef.current) return;
    console.log(answerStr);
    const answer = JSON.parse(answerStr);
    await lcRef.current.setRemoteDescription(answer);
  };

  const copyToClipboard = () => {
    if (offer) {
      navigator.clipboard.writeText(JSON.stringify(offer));
      console.log("Offer copied to clipboard:", offer);
    }
  };

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    console.log("Detected codes:", detectedCodes);
    if (detectedCodes && detectedCodes[0]?.rawValue) {
      handleAnswerInput(detectedCodes[0].rawValue);
    }
  };

  return (
    <div>
      <div className="p-4 mx-auto flex items-center gap-40">
        <div className="flex-col items-center">
          <h2 className="text-md mb-4">
            1) Read this QR Code with your phone using the controller Page:
          </h2>
          <button onClick={copyToClipboard} className="flex mx-auto">
            <QRCodeSVG
              size={300}
              value={JSON.stringify(offer)}
              //value={`http://gaiasenses-web-git-webrtc-control-fmammolis-projects.vercel.app/controller`}
              level="L"
              minVersion={40}
            />
          </button>
          {/* <p>{JSON.stringify(offer)}</p> */}
        </div>
        <div className="flex-col items-center">
          <h2>2) Show the laptop camera the QR Code on your phone:</h2>
          <Scanner
            onScan={handleScan}
            onError={console.error}
            components={{
              torch: true,
              finder: true,
            }}
            classNames={{ container: "max-w-xs mx-auto" }}
            sound={false}
          />
        </div>
        <div></div>
      </div>
      <textarea onBlur={(e) => handleAnswerInput(e.target.value)} />
    </div>
  );
}
