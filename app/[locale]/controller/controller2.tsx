"use client";

import { Button } from "@/components/ui/button";
import { H1 } from "@/components/ui/h1";
import { H2 } from "@/components/ui/h2";
import { P } from "@/components/ui/p";
import { useCallback, useEffect, useRef, useState } from "react";

import { decompressFromEncodedURIComponent } from "lz-string";
import { io, Socket } from "socket.io-client";

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

export default function Controller2({ offer }: { offer: string }) {
  //const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const [answer, setAnswer] = useState<RTCSessionDescriptionInit | null>(null);
  const [dcOpen, setDcOpen] = useState(false);
  const rcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  type DeviceOrientationEvent = {
    alpha: number | null; // rotation around z-axis
    beta: number | null; // rotation around x-axis
    gamma: number | null; // rotation around y-axis
  };
  const [orientation, setOrientation] = useState<DeviceOrientationEvent | null>(
    null
  );

  // Add this function to handle device orientation (gyroscope) data

  // In your enableMotionDetection function, also add the orientation event listener:
  const enableMotionDetection = () => {
    const handleOrientationEvent = (event: DeviceOrientationEvent) => {
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
    };

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
      socketRef.current?.emit("answer", rc.localDescription);
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
      };
    };

    if (!socketRef.current) {
      const socket = io("https://gaiasenses-controller-server.onrender.com");
      socketRef.current = socket;

      socketRef.current.on("connect", () => {
        console.log("Socket connected");
      });
    }
    return () => {
      rc.ondatachannel = null;
    };
  }, []);

  useEffect(() => {
    const emitAnswer = async () => {
      if (
        motionEnabled &&
        rcRef.current &&
        offer &&
        !rcRef.current.localDescription
      ) {
        const offerStr = decompressFromEncodedURIComponent(offer);
        console.log(JSON.parse(offerStr));

        await rcRef.current.setRemoteDescription(JSON.parse(offerStr));

        const answer = await rcRef.current.createAnswer();

        await rcRef.current.setLocalDescription(answer);

        console.log("Answer created:", rcRef.current.localDescription);

        if (socketRef.current) {
          //socketRef.current.emit("answer", rcRef.current.localDescription);
          console.log(
            "Answer emitted to server:",
            rcRef.current.localDescription
          );
          setAnswer(rcRef.current.localDescription);
        } else {
          console.error("Socket is not initialized.");
        }
      }
    };
    if (!answer) {
      emitAnswer();
    }
  }, [motionEnabled, offer, answer]);

  // DeviceMotion event handler
  function handleMotionEvent(event: DeviceMotionEvent) {
    // Example: log acceleration
    console.log("Acceleration:", event.acceleration);
  }

  return (
    <div className="p-4">
      <H1>Controller</H1>
      {!motionEnabled && (
        <div className="flex flex-col gap-4 mt-4">
          <P>
            This page uses motion sensors and camera from your device. Click
            start to enable them.
          </P>
          <Button onClick={enableMotionDetection}>Start</Button>
        </div>
      )}

      {motionEnabled && (
        <div>
          <div className="mb-10">
            <H2>Rotate your device to move the map.</H2>
          </div>

          <H2>Orientation</H2>
          <p>alpha: {orientation?.alpha}</p>
          <p>beta: {orientation?.beta}</p>
          <p>gamma: {orientation?.gamma}</p>
        </div>
      )}
    </div>
  );
}
