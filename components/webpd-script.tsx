"use client";
import Script from "next/script";

export default function WebPdScript() {
  function onReady() {
    console.log("WebPd runtime loaded successfully");
  }
  function onError(error: any) {
    console.log("WebPd runteime loaded with error");
    console.log(error);
  }
  return (
    <Script
      src="/webpd-runtime.js"
      onReady={onReady}
      onError={onError}
      strategy="afterInteractive"
    ></Script>
  );
}
