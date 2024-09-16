import { useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl";
import Webcam from "react-webcam";

function mapRange(
  value: number,
  minInput: number,
  maxInput: number,
  minOutput: number,
  maxOutput: number
) {
  return (
    minOutput +
    ((value - minInput) * (maxOutput - minOutput)) / (maxInput - minInput)
  );
}

export default function GlobeDetector() {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastVideoTimeRef = useRef(-1);

  const mapRef = useMap();

  const prevArea = useRef(0);
  const prevZoom = useRef(0);

  const areaBufferRef = useRef<number[]>([]);

  function addArea(newArea: number) {
    if (areaBufferRef.current.length > 16) {
      areaBufferRef.current.shift();
    }
    areaBufferRef.current.push(newArea);
    return areaBufferRef.current;
  }

  function isStopped() {
    //console.log(areaBufferRef.current.reduce((a, b) => a + b, 0) / areaBufferRef.current.length)
    const mean =
      areaBufferRef.current.reduce((a, b) => a + b, 0) /
      areaBufferRef.current.length;
    const range = 200;
    if (mean > prevArea.current - range && mean < prevArea.current + range) {
      return true;
    }
  }

  useEffect(() => {
    // Initialize the worker
    const objectDetectorWorker = new Worker(
      new URL("./worker.js", import.meta.url)
    );

    objectDetectorWorker.onmessage = (e) => {
      if (e.data.action === "loaded") {
        setIsWorkerReady(true);
      } else if (e.data.action === "result") {
        console.log(e.data.detection.detections);
        if (e.data.detection.detections.length > 0) {
          const res = e.data.detection.detections[0];
          const area =
            (res.boundingBox?.height || 1) * (res.boundingBox?.width || 1);
          //console.log(`${area} - ${prevArea.current} = ${Math.abs(area - prevArea.current)}` );
          addArea(area);

          if (isStopped()) {
            //console.log("stopped");
          } else {
            //min mean area = 1000, max mean area = 60000
            const mean =
              areaBufferRef.current.reduce((a, b) => a + b, 0) /
              areaBufferRef.current.length;
            console.log(mean);
            //for person
            const mappedValue = mapRange(mean, 15000, 90000, 0, 5);

            //for cell phone
            //const mappedValue = mapRange(mean, 1000, 60000, 0, 15);

            //for sport ball
            //const mappedValue = mapRange(mean, 20000, 90000, 0, 15);

            const zoom = Math.floor(mappedValue);
            //console.log(zoom)
            if (zoom !== prevZoom.current) {
              mapRef.current?.zoomTo(Math.floor(mappedValue));
            }
            prevZoom.current = zoom;
          }

          //console.log(areaBufferRef.current);
          // if(Math.abs(area - prevArea.current) > 500) {
          //   if(area - prevArea.current > 0){
          //     //!mapRef.current?.isZooming() && mapRef.current?.zoomIn()
          //     console.log("zoom in")
          //   } else {
          //     console.log("zoom out")
          //     //!mapRef.current?.isZooming() && mapRef.current?.zoomOut()
          //   }
          // }

          prevArea.current = area;
        }
      }
    };

    // Load the object detector in the worker
    objectDetectorWorker.postMessage({ action: "load" });
    setWorker(objectDetectorWorker);

    return () => {
      objectDetectorWorker.terminate();
    };
  }, [mapRef]);

  const getFrameFromVideo = () => {
    if (webcamRef.current && webcamRef.current.video && canvasRef.current) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match the video
      canvas.width = 320;
      canvas.height = 320;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
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
      <Webcam
        height={320}
        width={320}
        ref={webcamRef}
        className="absolute -z-10"
      />
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width={320}
        height={320}
      ></canvas>
    </div>
  );
}
