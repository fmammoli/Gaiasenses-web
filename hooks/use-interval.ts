import { useEffect, useRef } from "react";
export default function useInterval(callback: () => void, delay: number) {
  const intervalRef = useRef<ReturnType<typeof window.setInterval>>();
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === "number") {
      intervalRef.current = setInterval(tick, delay);
      return () => clearInterval(intervalRef.current);
    }
  }, [delay]);

  function restart() {
    const tick = () => savedCallback.current();
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, delay);
  }

  return { intervalRef, restart };
}
