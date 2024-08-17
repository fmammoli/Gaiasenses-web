"use client"



import { useEffect, useRef, useState } from "react"
import { useMap } from "react-map-gl";
//@ts-ignore
//import * as JoyCon from "joy-con-webhid"


export default function JoyconControls(){
  const [infoText, setInfoText] = useState("");
  const mapRef = useMap()
  
  const prevActualOrientation = useRef({alpha:0, beta:0, gamma:0})
  
  useEffect(()=>{
    if(!window.navigator) return
    
    let joyCon:any = null;


    function handleHidinput({detail}:{detail:any}) {
      if(detail.actualOrientation){
        
        const {alpha, beta, gamma} = detail.actualOrientation;

        let newBeta = prevActualOrientation.current.beta
        if(Math.abs(Math.abs(beta) - Math.abs(prevActualOrientation.current.beta)) > 2){
          newBeta = beta;
        }

        const newAlpha = alpha

        if(mapRef.current){
          const center = mapRef.current.getCenter();

          let lngChange = false
          if(center.lng !== center.lng + Math.round(newAlpha) / 80){
            center.lng = center.lng + Math.round(newAlpha) / 80;
            lngChange = true;
            
          }
          
          let latChange = false
          //setInfoText(Math.abs(Math.abs(beta) - Math.abs(prevActualOrientation.current.beta)).toString())
          if(center.lat !== Math.round(newBeta)){
            center.lat = Math.round(newBeta)
            latChange = true;
          }            
          if(lngChange || latChange){
            mapRef.current.setCenter(center.wrap());
          }
        }
        prevActualOrientation.current = {alpha, beta, gamma}
      }
    }

    const interval = setInterval(async () => {
      //@ts-ignore
      const JoyCon = (await import("joy-con-webhid"))
      //console.log("awaiter")
      for (joyCon of JoyCon.connectedJoyCons.values()) {
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
        //await joyCon.rumble(600, 600, 0.5);
        // Listen for HID input reports.
        //@ts-ignore
        joyCon.addEventListener('hidinput', handleHidinput);
        joyCon.eventListenerAttached = true;
      }
    }, 2000);

    return () =>{
      clearInterval(interval)
      if(joyCon){
        joyCon.removeEventListener('hidinput', handleHidinput);
      }
    }

  },[mapRef])
  return(
    <div className="absolute bottom-14 left-14 text-white bg-purple-400 max-w-[80px]">
      <pre>{infoText}</pre>
    </div>
  )
}