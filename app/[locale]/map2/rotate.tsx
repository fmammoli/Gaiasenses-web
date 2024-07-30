"use client"
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useMap } from "react-map-gl"
//@ts-ignore
import * as JoyCon from "joy-con-webhid"

type RotateProps = {
  shouldRotate?: boolean, 
  setMarker?:(lat:number, lng:number)=>void
}

export default function Rotate({shouldRotate = true, setMarker}:RotateProps){
    const userInterationRef = useRef(false)
    const lastInteraction = useRef(Date.now())
    //const [lastInteraction, setLastInteraction] = useState(new Date())
    const mapRef = useMap()
    const [infoText, setInfoText] = useState("")
    const divRef = useRef(null)

    const serie1 = useRef<number[]>([])

    const clicksRef = useRef<number[]>([])

    function addSerie1(value:number){
      if(serie1.current.length > 29) {
        serie1.current.shift()
        serie1.current.push(value)
      } else {
        serie1.current.push(value)
      }
      return serie1.current
    }

    function getAverage(array:number[]) {
      let sum = 0;
      for (let i = 0; i < array.length; i++) {
        sum += array[i];
      }
      return sum / array.length;
    }

    const serie2 = useRef<{time: number, value:number}[] | []>([])

    function addSerie2({time, value}:{time:number, value:number}){
      if(serie2.current){
        if(serie2.current.length > 499) {
          serie2.current.shift()
          //@ts-ignore
          serie2.current.push({time, value})
        } else {
          //@ts-ignore
          serie2.current.push({time, value})
        }        
      } 
    }

    function handleClick() {
        console.log(serie1.current)
        //mapRef.current?.easeTo({center:{lat: 35.6894, lng:139.692}, duration: 1000})
        //mapRef.current?.setPitch(0)
        //mapRef.current?.setBearing(30)
        //mapRef.current?.setPitch(-20)
    }



    const prevCenterRef = useRef<{lng:number, lat:number} | null>(null)

    useEffect(()=>{
      let joyCon:any = null;

      function handleHidinput({detail}:{detail:any}) {
        if(detail.actualOrientation){
          const {alpha, beta, gamma} = detail.actualOrientation;
        
          if(mapRef.current){
            const center = mapRef.current.getCenter();
            const {lng, lat} = center
            prevCenterRef.current = {lng, lat};

            
            setInfoText(parseInt(alpha).toString())
            let lngChange = false
            if(center.lng !== center.lng + parseInt(alpha) / 80 ){
              center.lng = center.lng + parseInt(alpha) / 80;
              lngChange = true
            }
            
            let latChange = false
            if(center.lat !== parseInt(beta)){
              center.lat = parseInt(beta)
              latChange = true
            }            
            if(lngChange || latChange){
              mapRef.current.setCenter(center.wrap());
            }
          }
        }
      }

      const interval = setInterval(async () => {
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
          joyCon.addEventListener('hidinput',handleHidinput);

          
          joyCon.eventListenerAttached = true;
        }
        }, 2000);

        

        return () =>{
          if(joyCon !== null && joyCon.eventListenerAttached === true){
            joyCon.removeEventListener("hidinput", handleHidinput);
            joyCon.eventListenerAttached === false;
          }
          clearInterval(interval);
        }
    },[mapRef])
    
    return (
      <div ref={divRef} className="absolute bottom-14 left-14 text-white bg-purple-400 max-w-[80px]" >
        <Button onClick={handleClick}></Button>
        <p>{infoText}</p>
      </div>
    )
}



// {
//   "inputReportID": {
//       "_raw": {
//           "0": 48
//       },
//       "_hex": {
//           "0": 30
//       }
//   },
//   "timer": {
//       "_raw": {
//           "0": 71
//       },
//       "_hex": {
//           "0": 47
//       }
//   },
//   "batteryLevel": {
//       "_raw": {
//           "0": 110
//       },
//       "_hex": {
//           "0": 0
//       },
//       "level": "empty"
//   },
//   "connectionInfo": {
//       "_raw": {
//           "0": 110
//       },
//       "_hex": {
//           "0": 0
//       }
//   },
//   "buttonStatus": {
//       "_raw": {
//           "0": 0,
//           "1": 0,
//           "2": 0
//       },
//       "_hex": {
//           "0": 0,
//           "1": 0,
//           "2": 0
//       },
//       "down": false,
//       "up": false,
//       "right": false,
//       "left": false,
//       "l": false,
//       "zl": false,
//       "sr": false,
//       "sl": false,
//       "minus": false,
//       "leftStick": false,
//       "capture": false,
//       "chargingGrip": false
//   },
//   "analogStickLeft": {
//       "_raw": {
//           "0": 39,
//           "1": 135,
//           "2": 138
//       },
//       "_hex": {
//           "0": 27,
//           "1": 87,
//           "2": 0
//       },
//       "horizontal": "-0.2",
//       "vertical": "0.0"
//   },
//   "analogStickRight": {
//       "_raw": {
//           "0": 0,
//           "1": 0,
//           "2": 0
//       },
//       "_hex": {
//           "0": 0,
//           "1": 0,
//           "2": 0
//       },
//       "horizontal": "-2.0",
//       "vertical": "2.0"
//   },
//   "vibrator": {
//       "_raw": {
//           "0": 176
//       },
//       "_hex": {
//           "0": 0
//       }
//   },
//   "accelerometers": [
//       {
//           "x": {
//               "_raw": {
//                   "0": 34,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 22,
//                   "1": 0
//               },
//               "acc": -0.054168
//           },
//           "y": {
//               "_raw": {
//                   "0": 254,
//                   "1": 254
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "acc": -0.062952
//           },
//           "z": {
//               "_raw": {
//                   "0": 13,
//                   "1": 16
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 10
//               },
//               "acc": 1.002596
//           }
//       },
//       {
//           "x": {
//               "_raw": {
//                   "0": 24,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 18,
//                   "1": 0
//               },
//               "acc": -0.056608
//           },
//           "y": {
//               "_raw": {
//                   "0": 253,
//                   "1": 254
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "acc": -0.063196
//           },
//           "z": {
//               "_raw": {
//                   "0": 249,
//                   "1": 15
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "acc": 0.997716
//           }
//       },
//       {
//           "x": {
//               "_raw": {
//                   "0": 21,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 15,
//                   "1": 0
//               },
//               "acc": -0.05734
//           },
//           "y": {
//               "_raw": {
//                   "0": 251,
//                   "1": 254
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "acc": -0.063684
//           },
//           "z": {
//               "_raw": {
//                   "0": 240,
//                   "1": 15
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "acc": 0.99552
//           }
//       }
//   ],
//   "gyroscopes": [
//       [
//           {
//               "_raw": {
//                   "0": 205,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "dps": -3.11253,
//               "rps": -0.008639
//           },
//           {
//               "_raw": {
//                   "0": 252,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "dps": -0.24412,
//               "rps": -0.000678
//           },
//           {
//               "_raw": {
//                   "0": 254,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "dps": -0.12206,
//               "rps": -0.000339
//           }
//       ],
//       [
//           {
//               "_raw": {
//                   "0": 222,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "dps": -2.07502,
//               "rps": -0.00576
//           },
//           {
//               "_raw": {
//                   "0": 248,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "dps": -0.48824,
//               "rps": -0.001355
//           },
//           {
//               "_raw": {
//                   "0": 252,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "dps": -0.24412,
//               "rps": -0.000678
//           }
//       ],
//       [
//           {
//               "_raw": {
//                   "0": 241,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "dps": -0.91545,
//               "rps": -0.002541
//           },
//           {
//               "_raw": {
//                   "0": 240,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "dps": -0.97648,
//               "rps": -0.00271
//           },
//           {
//               "_raw": {
//                   "0": 247,
//                   "1": 255
//               },
//               "_hex": {
//                   "0": 0,
//                   "1": 0
//               },
//               "dps": -0.54927,
//               "rps": -0.001525
//           }
//       ]
//   ],
//   "actualAccelerometer": {
//       "x": -0.000841,
//       "y": -0.000949,
//       "z": 0.014979
//   },
//   "actualGyroscope": {
//       "dps": {
//           "x": -0.030515,
//           "y": -0.008544,
//           "z": -0.004577
//       },
//       "rps": {
//           "x": -0.000085,
//           "y": -0.000024,
//           "z": -0.000013
//       }
//   },
//   "actualOrientation": {
//       "alpha": "-0.322279",
//       "beta": "5.146698",
//       "gamma": "-5.531431"
//   },
//   "actualOrientationQuaternion": {
//       "alpha": "-0.051392",
//       "beta": "2.944690",
//       "gamma": "-3.847341"
//   },
//   "quaternion": {
//       "w": 0.9991067492611023,
//       "x": -0.03354546976150379,
//       "y": 0.025695005043975795,
//       "z": 0.00041443356860527167
//   },
//   "ringCon": {
//       "_raw": {},
//       "_hex": {},
//       "strain": -261
//   }
// }