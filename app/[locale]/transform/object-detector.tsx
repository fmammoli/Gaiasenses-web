'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Webcam from 'react-webcam';

export default function ObjectDetector() {
  /* TODO: Add state variables */
  // Keep track of the classification result and the model loading status.
  const [result, setResult] = useState(null);
  const [ready, setReady] = useState<null | boolean>(null);

  // Create a reference to the worker object.
  const worker = useRef<Worker | null>(null);

  const webcamRef = useRef<Webcam>(null);

  // We use the `useEffect` hook to set up the worker as soon as the `App` component is mounted.
  useEffect(() => {
    if (!worker.current) {
      // Create the worker if it does not yet exist.
      worker.current = new Worker(new URL('./worker.js', import.meta.url), {
        type: 'module'
      });
    }

    // Create a callback function for messages from the worker thread.
    const onMessageReceived = (e) => {
      console.log("event")
      switch (e.data.status) {
        case 'initiate':
          setReady(false);
          break;
        case 'ready':
          setReady(true);
          break;
        case 'complete':
          console.log(e.data.output)
          //setResult(e.data.output)
          break;
      }
    };

    // Attach the callback function as an event listener.
    worker.current.addEventListener('message', onMessageReceived);
    
    // Define a cleanup function for when the component is unmounted.
    return () => worker.current?.removeEventListener('message', onMessageReceived);
  });

  
  const detect2 = useCallback((text) => {
    //console.log("detect")
    if (worker.current) {
      if(webcamRef.current && webcamRef){
        const image = webcamRef.current.getScreenshot();
        if(image){
          worker.current.postMessage({ image });
        } else {
          console.log("no image")
        }
      }
      
    }
    
    requestAnimationFrame(detect2)
    
  }, []);

  const [webcamReady, setWebcamReady] = useState(false);

  useEffect(()=>{
    if(webcamRef.current){
      setWebcamReady(true)
    }
  },[webcamRef, setWebcamReady])

  useEffect(()=>{
    const detect = () => {
      console.log("detect")
      if (worker.current) {
        if(webcamRef.current && webcamRef){
          const image = webcamRef.current.getScreenshot();
          if(image){
            worker.current.postMessage({ image });
          } else {
            console.log("no image")
          }
        }
        
      }
      
      // requestAnimationFrame(detect)
      
    }


    if(webcamRef.current, webcamReady){
      setInterval(() => {
        detect()  
      }, 100); 
    }
  },[webcamReady, webcamRef]);

  return (
    <>
      <input
        className="w-full max-w-xs p-2 border border-gray-300 rounded mb-4 text-black"
        type="text"
        placeholder="Enter text here"
        onInput={e => {
            detect(e.target.value);
        }}
      />

      <Webcam height={"100%"} width={"100%"} ref={webcamRef}></Webcam>       
        
      {ready !== null && (
        <pre className="bg-gray-100 p-2 rounded text-black">
          { (!ready || !result) ? 'Loading...' : JSON.stringify(result, null, 2) }
        </pre>
      )}
    </>
  )
}