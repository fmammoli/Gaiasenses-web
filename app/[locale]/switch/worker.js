import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";

let objectDetector = null;

onmessage = async (e) => {
  const { action } = e.data;

  if (action === "load") {
    // Load the MediaPipe vision task
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Initialize the Object Detector
      objectDetector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/latest/efficientdet_lite0.tflite`,
        },
        scoreThreshold: 0.4,
        runningMode: "VIDEO",
        categoryAllowlist: ["cell phone"],
      });

      // Notify the main thread that the object detector is ready
      postMessage({ action: "loaded" });
    } catch (error) {
      console.error("Error loading object detector:", error);
      postMessage({ action: "error", error: error.message });
    }
  }

  if (action === "detect" && objectDetector) {
    const { videoFrame, startTimeMs } = e.data;

    try {
      // Perform object detection on the provided frame
      const detection = await objectDetector.detectForVideo(videoFrame, startTimeMs);
      // Send the detection result back to the main thread
      postMessage({ action: "result", detection });
    } catch (error) {
      console.error("Error during detection:", error);
      postMessage({ action: "error", error: error.message });
    }
  }
};