"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react"; // npm install qrcode.react
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";

export default function GlobeReceiver() {
  const [offer, setOffer] = useState("");
  const [answer, setAnswer] = useState("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [channelOpen, setChannelOpen] = useState(false);

  // Add at the top of your component
  const [candidates, setCandidates] = useState<any[]>([]);

  // After creating the RTCPeerConnection (pc)
  useEffect(() => {
    if (!pcRef.current) return;
    const pc = pcRef.current;
    const localCandidates: any[] = [];
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        localCandidates.push(event.candidate);
        setCandidates([...localCandidates]);
      }
    };
  }, []);

  useEffect(() => {
    console.log("Initializing WebRTC Receiver...");
    const pc = new RTCPeerConnection();
    pcRef.current = pc;
    const dataChannel = pc.createDataChannel("gyro");
    dataChannelRef.current = dataChannel;
    // On the receiver, after setRemoteDescription(answer)
    // Track open/close state
    dataChannel.onerror = (error) => {
      console.error("DataChannel error:", error);
    };
    dataChannel.onopen = () => {
      setChannelOpen(true);
      console.log("DataChannel is open (receiver)");
    };
    dataChannel.onclose = () => {
      setChannelOpen(false);
      console.log("DataChannel is closed (receiver)");
    };

    dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received gyro data:", data);
      } catch {
        console.log("Received message from controller:", event.data);
      }
    };

    pc.onicecandidate = (event) => {
      console.log("New ICE candidate:" + JSON.stringify(pc.localDescription));
      setOffer(JSON.stringify(pc.localDescription));
    };

    pc.createOffer()
      .then((offer) => {
        pc.setLocalDescription(offer);
      })
      .then(() => setOffer(JSON.stringify(pc.localDescription)));
  }, []);

  // After scanning the answer QR code, call this:
  async function handleAnswerInput(answerStr: string) {
    const pc = pcRef.current;
    if (!pc) return;
    const answer = JSON.parse(answerStr);
    const res = await pc.setRemoteDescription(
      new RTCSessionDescription(answer)
    );
    console.log(dataChannelRef.current);
  }

  // Handle QR scan result
  function handleScan(result: IDetectedBarcode[]) {
    if (result && result[0]?.rawValue && !offer) {
      setAnswer(result[0].rawValue);
      handleAnswerInput(result[0].rawValue);
    }
  }

  function handleRead(text: string) {
    setAnswer(text);
    handleAnswerInput(text);
  }
  // Clipboard copy handler
  async function handleCopy() {
    if (offer) {
      console.log(offer);
      await navigator.clipboard.writeText(offer);
    }
  }

  function handleRemoteCandidatesScan(result: IDetectedBarcode[]) {
    if (result && result[0]?.rawValue) {
      handleRemoteCandidates(result[0].rawValue);
    }
  }

  function handleRemoteCandidates(candidatesStr: string) {
    const pc = pcRef.current;
    if (!pc) return;
    try {
      const candidates = JSON.parse(candidatesStr);
      candidates.forEach((candidate: RTCIceCandidateInit) => {
        pc.addIceCandidate(new RTCIceCandidate(candidate));
      });
      console.log("Added remote ICE candidates");
    } catch (e) {
      console.error("Failed to parse ICE candidates", e);
    }
  }

  const handleCopyCandidates = async () => {
    if (candidates.length > 0) {
      const candidatesStr = JSON.stringify(candidates);
      await navigator.clipboard.writeText(candidatesStr);
      console.log("Copied ICE candidates to clipboard");
    } else {
      console.warn("No ICE candidates to copy");
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center flex flex-col gap-4">
        <h2>Scan this QR code with your phone:</h2>
        {offer && (
          <button
            onClick={handleCopy}
            style={{ border: "none", background: "none", cursor: "pointer" }}
            title="Click to copy offer"
          >
            <QRCodeSVG size={200} className="mx-auto" value={offer} />
          </button>
        )}
        <h2>Then, point the QRCode from your phone here:</h2>
        {/* <Scanner
          onScan={handleScan}
          onError={console.error}
          formats={["qr_code"]}
          components={{
            torch: true,
            zoom: true,
            finder: true,
          }}
          classNames={{ container: "max-w-xs mx-auto" }}
        /> */}
        <textarea onBlur={(e) => handleRead(e.target.value)} />
        <h1>This is the ICE Candidates</h1>
        {candidates.length > 0 && (
          <>
            <h2>Show this ICE QR code to your phone:</h2>
            <button
              onClick={handleCopyCandidates}
              style={{ border: "none", background: "none", cursor: "pointer" }}
              title="Click to copy offer"
            >
              {" "}
              <QRCodeSVG value={JSON.stringify(candidates)} />
            </button>
          </>
        )}
        / Add this below your answer QR scanner/textarea
        <h2>Scan ICE QR code from your phone:</h2>
        {/* <Scanner
          onScan={handleRemoteCandidatesScan}
          onError={console.error}
          formats={["qr_code"]}
        /> */}
        <p>Paste the controllers candidates here</p>
        <textarea onBlur={(e) => handleRemoteCandidates(e.target.value)} />
      </div>
    </div>
  );
}
