import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl"
//@ts-ignore
import * as JoyCon from "joy-con-webhid"


export default function Rotate({shouldRotate = true, setMarker}:{shouldRotate: boolean, setMarker:(lat:number, lng:number)=>void}){
    const userInterationRef = useRef(false)
    const lastInteraction = useRef(Date.now())
    //const [lastInteraction, setLastInteraction] = useState(new Date())
    const mapRef = useMap()
    const [infoText, setInfoText] = useState("")
    const divRef = useRef(null)
  
    const [transform, setTransform] = useState({alpha:0, beta:0, gamma:0})
    // The following values can be changed to control rotation speed:
    // useEffect(()=>{
    //     // At low zooms, complete a revolution every two minutes.
    //     const secondsPerRevolution = 120;
    //     // Above zoom level 5, do not rotate.
    //     const maxSpinZoom = 5;
    //     // Rotate at intermediate speeds between zoom levels 3 and 5.
    //     const slowSpinZoom = 3;

    //     let userInteracting = false;
    //     let spinEnabled = true;

    //     function spinGlobe() {
    //         console.log("spin globe")
    //         if(!mapRef.current) return
    //         const map = mapRef.current
    //         const zoom = map.getZoom();
    //         if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
                
    //             let distancePerSecond = 360 / secondsPerRevolution;
    //             if (zoom > slowSpinZoom) {
    //                 // Slow spinning at higher zooms
    //                 const zoomDif =
    //                     (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
    //                 distancePerSecond *= zoomDif;
    //             }
    //             const center = map.getCenter();
    //             center.lng -= distancePerSecond;
    //             // Smoothly animate the map over one second.
    //             // When this animation is complete, it calls a 'moveend' event.
                
    //             map.easeTo({ center, duration: 1000, easing: (n) => n });
    //         }
    //     }
    

    //     // function handleMoveEnd(){
    //     //     console.log("alo")
    //     //     spinGlobe()
    //     // }

    //     // if(mapRef.current){
    //     //     const a =mapRef.current?.on("moveend", handleMoveEnd)
    //     //     return () => {
    //     //         a.off("moveend", handleMoveEnd)
    //     //     }
    //     // }

    //     const intreval = setInterval(()=> spinGlobe(), 1000)
    //     return () => clearInterval(intreval)
    // },[mapRef])
    
    // useEffect(()=>{

    //      // At low zooms, complete a revolution every two minutes.
    //      const secondsPerRevolution = 120;
    //      // Above zoom level 5, do not rotate.
    //      const maxSpinZoom = 5;
    //      // Rotate at intermediate speeds between zoom levels 3 and 5.
    //      const slowSpinZoom = 3;

    //      let spinEnabled = true;

    //     function spinGlobe() {
    //         console.log("spin globe")
    //         if(!mapRef.current) return
    //         const map = mapRef.current
    //         const zoom = map.getZoom();
    //         if (spinEnabled && !userInterationRef.current && zoom < maxSpinZoom) {
                
    //             let distancePerSecond = 360 / secondsPerRevolution;
    //             if (zoom > slowSpinZoom) {
    //                 // Slow spinning at higher zooms
    //                 const zoomDif =
    //                     (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
    //                 distancePerSecond *= zoomDif;
    //             }
    //             const center = map.getCenter();
    //             center.lng -= distancePerSecond;

    //             // Smoothly animate the map over one second.
    //             // When this animation is complete, it calls a 'moveend' event.
    //             map.easeTo({ center, duration: 1000, easing: (n) => n });
    //         }
    //     }

        

    //     function handleMouseUp(){
    //         console.log("mouse up")
    //         userInterationRef.current = false
    //         spinGlobe()
            
    //     }
    //     function handleMouseDown(){
    //         console.log("mouse down")
    //         userInterationRef.current = true
    //     }
        
    //     function handleMoveEnd() {
    //         spinGlobe()
    //     }

    //     function handleMouseMove(e: any){
    //         //console.log(e)
    //     }

    //     if(mapRef.current){
    //         const map = mapRef.current
    //         map.on("mouseup", handleMouseUp)
    //         map.on("mousedown", handleMouseDown)
    //         map.on("moveend", handleMoveEnd)
    //         map.on("mousemove", handleMouseMove)
    //         spinGlobe()
    //         return ()=>{
    //             map.off("mouseup",handleMouseUp)
    //             map.off("mousedown", handleMouseDown)
    //             map.off("moveend", handleMoveEnd)
    //             map.off("mousemove", handleMouseMove)
    //         }
    //     }
        
    // },[mapRef])
    
    function handleClick() {
        console.log("rotate")
        //mapRef.current?.easeTo({center:{lat: 35.6894, lng:139.692}, duration: 1000})
    }

    useEffect(()=>{

        setInterval(async () => {
            for (const joyCon of JoyCon.connectedJoyCons.values()) {
              if (joyCon.eventListenerAttached) {
                continue;
              }
              // Open the device and enable standard full mode and inertial measurement
              // unit mode, so the Joy-Con activates the gyroscope and accelerometers.
              await joyCon.open();
              await joyCon.enableStandardFullMode();
              await joyCon.enableIMUMode();
              await joyCon.enableVibration();
              // Get information about the connected Joy-Con.
              //console.log(await joyCon.getDeviceInfo());
              // Rumble.
              await joyCon.rumble(600, 600, 0.5);
              // Listen for HID input reports.
              //@ts-ignore
              joyCon.addEventListener('hidinput', ({ detail }) => {
                // Careful, this fires at ~60fps.
                //console.log(`Input report from ${joyCon.device.productName}:`, detail);
                const alpha:number = parseFloat(detail.actualOrientation?.alpha) // Zdeg
                const beta:number = parseFloat(detail.actualOrientation?.beta) // Xdeg
                const gamma: number = parseFloat(detail.actualOrientation?.gamma) //Ydeg
                console.log(typeof(detail.actualOrientation?.alpha))
                if(alpha && beta && gamma){
                    setInfoText(JSON.stringify({alpha, beta, gamma}))
                    setTransform({alpha, beta, gamma})
                   // setInfoText(`Orientation: \nalpha:${alpha * 300} \nbeta:${beta * 300} \ngama:${gamma * 300}`)
                   if(mapRef.current){
                    // mapRef.current.rotateTo(gamma, {duration:0});
                    // mapRef.current.setPitch(beta, {duration:0});
                    const center = mapRef.current.getCenter();
                    center.lng -= alpha / 60;
                    //center.lat = beta;
                    
                    mapRef.current.setCenter(center);
                    setMarker(center.lat, center.lng)
                   }
                }
              });
              joyCon.eventListenerAttached = true;
            }
          }, 2000);

    },[mapRef])

    return (
      <div ref={divRef} style={{transform: `rotateZ(${transform.alpha}deg) rotateX(${transform.beta}deg) rotateY(${transform.gamma}deg)`}} className="absolute bottom-40 left-4 text-white" >
        <p>{infoText}</p>
      </div>
    )
}