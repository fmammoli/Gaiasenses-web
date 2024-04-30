import { useEffect, useRef } from "react";
export default function useTimeout(callback: () => void, delay: number) {
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout>>();
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === "number") {
      timeoutRef.current = setTimeout(tick, delay);
      return () => clearTimeout(timeoutRef.current);
    }
  }, [delay]);

  function restart() {
    const tick = () => savedCallback.current();
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(tick, delay);
  }

  return { timeoutRef, restart };
}
