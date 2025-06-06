"use client";

import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/h1";
import { H2 } from "@/components/ui/h2";
import { IDetectedBarcode, Scanner } from "@yudiel/react-qr-scanner";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useRef, useState } from "react";

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

export default function Controller() {
  const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [answer, setAnswer] = useState<RTCSessionDescriptionInit | null>(null);
  const [dcOpen, setDcOpen] = useState(false);
  const rcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    const rc = new RTCPeerConnection(iceServers);
    rcRef.current = rc;
    //This gets triggered when we create an answer based on a received offer
    rc.onicecandidate = (e) => {
      console.log(
        "New ICE candidate preprinting SDP:",
        JSON.stringify(rc.localDescription)
      );
      setAnswer(rc.localDescription);
    };

    rc.ondatachannel = (e) => {
      const dc = e.channel;
      dcRef.current = dc;
      dc.onmessage = (e) => {
        console.log("New message on client" + e.data);
      };
      dc.onopen = () => {
        console.log("Data channel is open (controller)!!!");
        setDcOpen(true);
        alert("Data channel is open (controller)!!!");
        enableMotionDetection();
      };
    };
  }, []);

  const handleOfferInput = async (offerStr: string) => {
    if (!rcRef.current) return;

    const offer = JSON.parse(offerStr);
    await rcRef.current.setRemoteDescription(offer);
    //This triggers the onicecandidate event
    const answer = await rcRef.current.createAnswer();
    await rcRef.current.setLocalDescription(answer);
    console.log("Answer created:", rcRef.current.localDescription);
    setAnswer(rcRef.current.localDescription);
  };

  const sendTestMessage = () => {
    if (dcRef.current && dcRef.current.readyState === "open") {
      dcRef.current.send("Hello from the controller!");
    } else {
      console.log("Data channel is not open or not available.");
    }
  };
  const copyToClipboard = () => {
    if (answer) {
      navigator.clipboard.writeText(JSON.stringify(answer));
      console.log("Answer copied to clipboard:", answer);
    }
  };

  type DeviceOrientationEvent = {
    alpha: number | null; // rotation around z-axis
    beta: number | null; // rotation around x-axis
    gamma: number | null; // rotation around y-axis
  };
  const [orientation, setOrientation] = useState<DeviceOrientationEvent | null>(
    null
  );
  // Add this function to handle device orientation (gyroscope) data
  function handleOrientationEvent(event: DeviceOrientationEvent) {
    // alpha: rotation around z-axis, beta: x-axis, gamma: y-axis
    const orientation = console.log("Gyroscope:", {
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
    dcRef.current?.send(
      JSON.stringify({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      })
    );
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  }

  // DeviceMotion event handler
  function handleMotionEvent(event: DeviceMotionEvent) {
    // Example: log acceleration
    console.log("Acceleration:", event.acceleration);
  }

  // In your enableMotionDetection function, also add the orientation event listener:
  const enableMotionDetection = () => {
    if (
      typeof DeviceMotionEvent !== "undefined" &&
      typeof (DeviceMotionEvent as any).requestPermission === "function"
    ) {
      (DeviceMotionEvent as any)
        .requestPermission()
        .then((permissionState: string) => {
          if (permissionState === "granted") {
            setMotionEnabled(true);
            window.addEventListener(
              "devicemotion",
              handleMotionEvent as EventListener,
              true
            );
            window.addEventListener(
              "deviceorientation",
              (event) =>
                handleOrientationEvent(event as DeviceOrientationEvent),
              true
            );
          } else {
            alert("Permission denied for device motion.");
          }
        })
        .catch((err: any) => {
          alert("Error requesting device motion permission: " + err);
        });
    } else {
      setMotionEnabled(true);
      window.addEventListener(
        "devicemotion",
        handleMotionEvent as EventListener,
        true
      );
      window.addEventListener(
        "deviceorientation",
        (event) => handleOrientationEvent(event as DeviceOrientationEvent),
        true
      );
    }
  };

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes && detectedCodes[0]?.rawValue && !offer) {
      handleOfferInput(detectedCodes[0].rawValue);
    }
  };

  return (
    <div className="p-4">
      <H1>This is the controller</H1>
      <H2>Paste the receiver offer here:</H2>
      <Scanner
        onScan={handleScan}
        onError={console.error}
        formats={["qr_code"]}
        components={{
          torch: true,
          zoom: true,
          finder: true,
        }}
        classNames={{ container: "max-w-xs mx-auto" }}
      />
      <textarea onBlur={(e) => handleOfferInput(e.target.value)} />
      {answer && (
        <div>
          <H2>This is the answer, paste it on the receiver</H2>
          <button onClick={copyToClipboard}>
            <QRCodeSVG
              size={200}
              className="mx-auto"
              value={JSON.stringify(answer)}
            />
          </button>
          {/* <p>{JSON.stringify(answer)}</p> */}
        </div>
      )}
      <div>
        <Button onClick={sendTestMessage}>Click to send message test!</Button>
      </div>
      {!motionEnabled && (
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={enableMotionDetection}
        >
          Enable Motion Detection
        </button>
      )}
      {motionEnabled && (
        <div>
          <H2>Orientation</H2>
          <p>alpha: {orientation?.alpha}</p>
          <p>beta: {orientation?.beta}</p>
          <p>gamma: {orientation?.gamma}</p>
        </div>
      )}
    </div>
  );
}
