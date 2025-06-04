"use client";

import { useEffect } from "react";

export default function RegisterPd4webSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/pd4web.threads.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope
          );
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    } else {
      console.warn("Service Workers are not supported in this browser.");
    }
  }, []);

  return null;
}
