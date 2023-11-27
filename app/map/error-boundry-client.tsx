"use client";

import { ErrorBoundary } from "react-error-boundary";
import { ReactNode } from "react";

export default function MyErrorBoudary({
  fallback,
  children,
}: {
  fallback?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="mt-52 text-center">
          <p>This location is not supported yet.</p>
        </div>
      }
      onReset={(details) => {
        // Reset the state of your app so the error doesn't happen again
        console.log("reset");
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
