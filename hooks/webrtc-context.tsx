"use client";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  MutableRefObject,
} from "react";

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

type OrientationMessage = {
  alpha: number;
  beta: number;
  gamma: number;
};

type WebRTCContextType = {
  pcRef: React.MutableRefObject<RTCPeerConnection | null>;
  dcRef: React.MutableRefObject<RTCDataChannel | null>;
  dcOpen: boolean;
  offer: RTCSessionDescriptionInit | null;
  orientationMessageRef: MutableRefObject<OrientationMessage | null>;
};

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

type WebRTCProviderProps = {
  children: React.ReactNode;
};

export function WebRTCProvider({ children }: WebRTCProviderProps) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const [dcOpen, setDcOpen] = useState(false);
  const [offer, setOffer] = useState<RTCSessionDescriptionInit | null>(null);

  const orientationMessageRef = useRef<OrientationMessage | null>(null);

  useEffect(() => {
    if (pcRef.current) return;
    pcRef.current = new RTCPeerConnection(iceServers);
    dcRef.current = pcRef.current.createDataChannel("gaiasenses");

    if (!pcRef.current || !dcRef.current) return;
    console.log("WebRTCProvider initialized");

    const onopen = () => {
      console.log("Data channel is open (receiver)!!!");
      //alert("Data channel is open (receiver)!!!");
      setDcOpen(true);
    };

    const onmessage = (e: MessageEvent<any>) => {
      try {
        const data = JSON.parse(e.data);
        if (
          typeof data.alpha === "number" &&
          typeof data.beta === "number" &&
          typeof data.gamma === "number"
        ) {
          orientationMessageRef.current = {
            alpha: data.alpha,
            beta: data.beta,
            gamma: data.gamma,
          };
        }
      } catch {
        console.error("Failed to parse message data:", e.data);
      }
    };

    const onicecandidate = () => {
      if (!pcRef.current) return;
      console.log(
        "New ICE candidate preprinting SDP:",
        JSON.stringify(pcRef.current.localDescription)
      );
    };

    dcRef.current.addEventListener("open", onopen);
    dcRef.current.addEventListener("message", onmessage);
    pcRef.current.addEventListener("icecandidate", onicecandidate);

    return () => {
      if (pcRef.current && dcRef.current) {
        pcRef.current.removeEventListener("icecandidate", onicecandidate);
        dcRef.current.removeEventListener("open", onopen);
        dcRef.current.removeEventListener("message", onmessage);
        dcRef.current.close();
        pcRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const configure = async () => {
      if (pcRef.current && !pcRef.current.localDescription) {
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        setOffer(offer);
      }
    };

    if (offer === null) {
      configure().then(() => {
        console.log("local description set based on offer");
      });
    }
  }, [offer]);

  return (
    <WebRTCContext.Provider
      value={{
        pcRef,
        dcRef,
        dcOpen,
        offer,
        orientationMessageRef,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTC() {
  const ctx = useContext(WebRTCContext);
  if (!ctx) throw new Error("useWebRTC must be used within a WebRTCProvider");
  return ctx;
}
