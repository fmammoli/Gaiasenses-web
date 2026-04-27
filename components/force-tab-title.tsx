"use client";

import { useEffect } from "react";

const APP_TITLE = "GaiaSenses";

export default function ForceTabTitle() {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const applyTitle = () => {
      if (document.title !== APP_TITLE) {
        document.title = APP_TITLE;
      }
    };

    applyTitle();

    const titleElement = document.querySelector("title");
    if (!titleElement) return;

    const observer = new MutationObserver(() => {
      applyTitle();
    });

    observer.observe(titleElement, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
