"use client";
import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useOrientation } from "./orientation-context";

type WebRTCContextType = {
  pcRef: React.MutableRefObject<RTCPeerConnection | null>;
  dcRef: React.MutableRefObject<RTCDataChannel | null>;
  dcOpen: boolean;
  setDcOpen: (open: boolean) => void;
};

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

export function WebRTCProvider({ children }: { children: React.ReactNode }) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const [dcOpen, setDcOpen] = useState(false);

  const { setOrientation } = useOrientation();

  useEffect(() => {
    // Only add listeners if dcRef.current exists
    const dc = dcRef.current;
    if (!dc) return;

    const onmessage = (e: MessageEvent<any>) => {
      try {
        const data = JSON.parse(e.data);
        if (
          typeof data.alpha === "number" &&
          typeof data.beta === "number" &&
          typeof data.gamma === "number"
        ) {
          setOrientation({
            alpha: data.alpha,
            beta: data.beta,
            gamma: data.gamma,
          });
        }
      } catch {}
    };

    dc.addEventListener("message", onmessage);

    return () => {
      dc.removeEventListener("message", onmessage);
    };
  }, [dcRef.current, setOrientation]);
  return (
    <WebRTCContext.Provider value={{ pcRef, dcRef, dcOpen, setDcOpen }}>
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTC() {
  const ctx = useContext(WebRTCContext);
  if (!ctx) throw new Error("useWebRTC must be used within a WebRTCProvider");
  return ctx;
}
