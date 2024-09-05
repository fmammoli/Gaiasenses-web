
import { FilesetResolver, ObjectDetector } from "@mediapipe/tasks-vision";
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

export default function GlobeDetector(){
  const [objectDetector, setObjectDetector] = useState<ObjectDetector>();
  const detectorRef = useRef<ObjectDetector>();

  useEffect(()=>{
    async function loadObjectDetector(){
      const vision = await FilesetResolver.forVisionTasks(
        // path/to/wasm/root
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      let detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite`
        },
        scoreThreshold: 0.3,
        runningMode: "VIDEO",
        categoryAllowlist: ["remote","cell phone"],
        //canvas: webcamRef.current.getCanvas(),
      });
      detectorRef.current = detector;
      setObjectDetector(detector)
    }
    loadObjectDetector()
  },[])


  const webcamRef = useRef<Webcam>(null)

  const lastVideoTimeRef = useRef(-1)

  useEffect(()=>{
    function predictWebcam(){
      //console.log(objectDetector)
      if(webcamRef.current && webcamRef.current.video && objectDetector){
        let startTimeMs = performance.now();
        if(webcamRef.current.video?.currentTime !== lastVideoTimeRef.current){
          lastVideoTimeRef.current = webcamRef.current.video.currentTime;
          const detection = objectDetector.detectForVideo(webcamRef.current.video, startTimeMs);
          console.log(detection.detections);
        }
        //requestAnimationFrame(predictWebcam);
      }
    }
    const interval = setInterval(() => {
      predictWebcam(); 
    }, 100);
    return () => clearInterval(interval);
  },[objectDetector, webcamRef])

  return(
    <Webcam height={300} width={300} ref={webcamRef} className="absolute -z-10"></Webcam>  
  )
}