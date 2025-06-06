"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react"; // npm install qrcode.react
import { H1 } from "@/components/ui/h1";
import { H2 } from "@/components/ui/h2";

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
  const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);

  const lcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    console.log("Initializing WebRTC Receiver...");
    const lc = new RTCPeerConnection(iceServers);
    lcRef.current = lc;
    const dc = lc.createDataChannel("gaiaChannel");
    dcRef.current = dc;

    dc.onmessage = (e) => console.log("Received message:", e.data);
    dc.onopen = () => {
      console.log("Data channel is open (receiver)!!!");
      alert("Data channel is open (receiver)!!!");
    };

    lc.onicecandidate = (e) => {
      console.log(
        "New ICE candidate preprinting SDP:",
        JSON.stringify(lc.localDescription)
      );
      setOffer(lc.localDescription);
    };

    lc.createOffer()
      .then((offer) => lc.setLocalDescription(offer))
      .then((a) => console.log("Offer set as local description"));
  }, []);

  const handleAnswerInput = async (answerStr: string) => {
    if (!lcRef.current) return;
    const answer = JSON.parse(answerStr);
    await lcRef.current.setRemoteDescription(answer);
  };

  const copyToClipboard = () => {
    if (offer) {
      navigator.clipboard.writeText(JSON.stringify(offer));
      console.log("Offer copied to clipboard:", offer);
    }
  };

  return (
    <div className="p-4">
      <H1>This is the receiver</H1>
      <H2>This is the offer, paste it on the controller:</H2>
      <button onClick={copyToClipboard}>
        <QRCodeSVG
          size={200}
          className="mx-auto"
          value={JSON.stringify(offer)}
        />
      </button>
      {/* <p>{JSON.stringify(offer)}</p> */}

      <H2>Paste the controller answer here</H2>
      <textarea onBlur={(e) => handleAnswerInput(e.target.value)} />
    </div>
  );
}
