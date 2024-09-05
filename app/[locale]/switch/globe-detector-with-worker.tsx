import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export default function GlobeDetector() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastVideoTimeRef = useRef(-1);

  useEffect(() => {
    // Initialize the worker
    const objectDetectorWorker = new Worker(new URL('./worker.js', import.meta.url));

    objectDetectorWorker.onmessage = (e) => {
      if (e.data.action === "loaded") {
        setIsWorkerReady(true);
      } else if (e.data.action === "result") {
        console.log(e.data.detection.detections);
      }
    };

    // Load the object detector in the worker
    objectDetectorWorker.postMessage({ action: "load" });
    setWorker(objectDetectorWorker);

    return () => {
      objectDetectorWorker.terminate();
    };
  }, []);

  const getFrameFromVideo = () => {
    if (webcamRef.current && webcamRef.current.video && canvasRef.current) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match the video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw the current video frame onto the canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get the ImageData (frame) from the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        return imageData; // Return the frame as ImageData
      }
    }
    return null;
  };

  useEffect(() => {
    function predictWebcam() {
      if (isWorkerReady && worker) {
        const startTimeMs = performance.now();
        const frame = getFrameFromVideo();

        if (frame) {
          // Send the video frame to the worker for object detection
          worker.postMessage({
            action: "detect",
            videoFrame: frame,
            startTimeMs,
          });
        }
      }
    }

    const interval = setInterval(() => {
      predictWebcam();
    }, 100);

    return () => clearInterval(interval);
  }, [isWorkerReady, worker]);

  return (
    <div>
      <Webcam height={320} width={320} ref={webcamRef} className="absolute -z-10" />
      <canvas ref={canvasRef} style={{ display: "none" }} width={320} height={320}></canvas>
    </div>
  );
}
