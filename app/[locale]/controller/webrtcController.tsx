"use client";

import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react"; // npm install qrcode.react
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";

export default function Controller() {
  const [offer, setOffer] = useState("");
  const [answer, setAnswer] = useState("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const [channelOpen, setChannelOpen] = useState(false);

  const [candidates, setCandidates] = useState<any[]>([]);

  // Paste the offer string (from QR code) here
  function handleOfferInput(offerStr: string) {
    const pc = new RTCPeerConnection();
    const localCandidates: any[] = [];
    pc.onicecandidate = (event) => {
      console.log(event);
      if (event.candidate) {
        localCandidates.push(event.candidate);
        setCandidates([...localCandidates]);
        console.log(event.candidate);
      }
    };
    pcRef.current = pc;
    pc.ondatachannel = (event) => {
      dataChannelRef.current = event.channel;
      event.channel.onopen = () => {
        setChannelOpen(true);
        console.log("Data channel is open (controller)");
      };
      event.channel.onclose = () => {
        setChannelOpen(false);
        console.log("Data channel is closed (controller)");
      };
    };
    const offer = JSON.parse(offerStr);
    pc.setRemoteDescription(offer).then(() => {
      pc.createAnswer().then((answer) => {
        pc.setLocalDescription(answer).then(() => {
          setAnswer(JSON.stringify(pc.localDescription));
        });
      });
    });
  }
  //   // Send gyroscope data
  //   useEffect(() => {
  //     function handleOrientation(event: DeviceOrientationEvent) {
  //       if (
  //         dataChannelRef.current &&
  //         dataChannelRef.current.readyState === "open"
  //       ) {
  //         dataChannelRef.current.send(
  //           JSON.stringify({
  //             alpha: event.alpha,
  //             beta: event.beta,
  //             gamma: event.gamma,
  //           })
  //         );
  //       }
  //     }
  //     window.addEventListener("deviceorientation", handleOrientation);
  //     return () =>
  //       window.removeEventListener("deviceorientation", handleOrientation);
  //   }, []);

  // Handle QR scan result
  function handleScan(result: IDetectedBarcode[]) {
    if (result && result[0]?.rawValue && !offer) {
      setOffer(result[0].rawValue);
      handleOfferInput(result[0].rawValue);
    }
  }

  function handleRead(text: string) {
    setOffer(text);
    handleOfferInput(text);
  }

  // Clipboard copy handler
  async function handleCopy() {
    console.log(offer);
    if (offer) {
      console.log(offer);
      await navigator.clipboard.writeText(offer);
    }
  }

  function sendTestMessage() {
    console.log(dataChannelRef.current);
    if (
      dataChannelRef.current &&
      dataChannelRef.current.readyState === "open"
    ) {
      dataChannelRef.current.send("hello from controller");
    } else {
      alert("DataChannel not open!");
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

  // Clipboard copy handler
  async function handleCopyCandidates() {
    console.log(candidates);
    if (candidates.length > 0) {
      await navigator.clipboard.writeText(JSON.stringify(candidates));
    }
  }

  return (
    <div className="">
      <div className="text-center flex flex-col gap-4 items-center">
        <h2>Paste scan the QRCode ond the Laptop:</h2>
        <div className="max-w-sm flex justify-center">
          {/* {!answer && (
            <Scanner
              onScan={handleScan}
              onError={console.error}
              formats={["qr_code"]}
              components={{
                torch: true,
                zoom: true,
                finder: true,
              }}
            />
          )} */}
        </div>
        <textarea onBlur={(e) => handleRead(e.target.value)} />
        <h2>Show this QR code to your laptop:</h2>
        {answer && (
          <button
            onClick={handleCopy}
            style={{ border: "none", background: "none", cursor: "pointer" }}
            title="Click to copy offer"
          >
            <QRCodeSVG size={200} value={answer} />
          </button>
        )}
        <button
          onClick={sendTestMessage}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Send test message to receiver
        </button>

        <h1>This is the ICE Candidates, show the laptop</h1>
        {candidates.length > 0 && (
          <>
            <h2>Show this ICE QR code to your laptop:</h2>
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
        <h2>Scan ICE QR code from your laptop:</h2>
        {/* <Scanner
          onScan={handleRemoteCandidatesScan}
          onError={console.error}
          formats={["qr_code"]}
        /> */}
        <textarea onBlur={(e) => handleRemoteCandidates(e.target.value)} />
      </div>
    </div>
  );
}
