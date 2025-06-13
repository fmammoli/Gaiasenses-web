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
  setWebRTCConnection: (pc: RTCPeerConnection) => void;
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

  const onopen = useCallback(() => {
    console.log("Data channel is open (receiver)!!!");
    alert("Data channel is open (receiver)!!!");
    setDcOpen(true);
  }, [setDcOpen]);

  const onicecandidate = useCallback((e: RTCPeerConnectionIceEvent) => {
    if (!pcRef.current) return;
    console.log(
      "New ICE candidate preprinting SDP:",
      JSON.stringify(pcRef.current.localDescription)
    );
  }, []);

  const onmessage = useCallback((e: MessageEvent<any>) => {
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
  }, []);

  const setWebRTCConnection = useCallback(
    (pc: RTCPeerConnection) => {
      pcRef.current = pc;
      dcRef.current = pc.createDataChannel("gaiasenses");

      if (!pcRef.current || !dcRef.current) return;
      console.log("WebRTCProvider initialized");

      dcRef.current.addEventListener("open", onopen);
      dcRef.current.addEventListener("message", onmessage);
      pcRef.current.addEventListener("icecandidate", onicecandidate);

      if (!pcRef.current.localDescription) {
        pcRef.current
          .createOffer()
          .then((offer) => {
            if (!pcRef.current) return;
            console.log("Local description", pcRef.current.localDescription);
            pcRef.current.setLocalDescription(offer);
            setOffer(offer);
          })
          .then(() => console.log("Offer set as local description"));
      }
    },
    [onopen, onmessage, onicecandidate, setOffer]
  );

  useEffect(() => {
    return () => {
      if (pcRef.current && dcRef.current) {
        pcRef.current.removeEventListener("icecandidate", onicecandidate);
        dcRef.current.removeEventListener("open", onopen);
        dcRef.current.removeEventListener("message", onmessage);
      }
    };
  }, [pcRef, dcRef, onicecandidate, onopen, onmessage]);

  return (
    <WebRTCContext.Provider
      value={{
        pcRef,
        dcRef,
        dcOpen,
        offer,
        orientationMessageRef,
        setWebRTCConnection,
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
