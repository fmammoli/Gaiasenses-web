// "use client";
// import { Button } from "@/components/ui/button";
// import DebugInput from "./debug-input";
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from "../ui/collapsible";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import useWebpd from "@/hooks/use-webpd";
// import { PatchData } from "./lluvia/lluvia";

// type DebugPanelProps = {
//   patch?: PatchData;
// };

// export default function DebugPanel({ patch }: DebugPanelProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   // const { start, status, suspend, sendMsgToWebPd, resume } = useWebpd(
//   //   patch?.path
//   // );

//   if (status === "playing") {
//     patch?.messages?.forEach((item) => {
//       sendMsgToWebPd(item.nodeId, item.portletId, item.message);
//     });
//   }

//   const sketchProps = Object.fromEntries(searchParams.entries());

//   function handleChange(newSketchProp: { [key: string]: string }) {
//     const newProps = { ...sketchProps, ...newSketchProp };
//     const newSearchParams = new URLSearchParams(Object.entries(newProps));
//     router.replace(`${pathname}?${newSearchParams.toString()}`);
//   }

//   async function handlePlay() {
//     //play sound
//     if (status === "waiting" && patch?.path) {
//       await start();
//       await resume();
//       patch?.messages?.forEach((item) => {
//         sendMsgToWebPd(item.nodeId, item.portletId, item.message);
//       });
//     }
//     if (status === "suspended") {
//       resume();
//     }
//   }

//   async function handlePause() {
//     if (status === "started" || status == "playing") {
//       suspend();
//     }
//   }

//   function handleStop() {
//     handlePause();
//     router.refresh();
//   }

//   function handleClick() {
//     const newParams = new URLSearchParams(searchParams.toString());
//     const newPlayStatus = !(newParams.get("play") === "true" ? true : false);
//     newParams.set("play", newPlayStatus.toString());
//     if (sketchProps.play === "true") {
//       handlePause();
//     } else {
//       handlePlay();
//     }
//     router.replace(`${pathname}?${newParams.toString()}`);
//   }

//   return (
//     <div className="absolute max-w-[22rem] bg-secondary p-2 rounded-lg right-2 top-1/4 opacity-60 hover:opacity-100 z-50">
//       <Collapsible>
//         <CollapsibleTrigger asChild>
//           <Button variant={"outline"} className="mb-1 w-full text-xs">
//             Debug Panel
//           </Button>
//         </CollapsibleTrigger>
//         <CollapsibleContent>
//           <div>
//             <div>
//               {Object.entries(sketchProps)
//                 .filter(
//                   (entry) =>
//                     entry[0] !== "lat" &&
//                     entry[0] != "lon" &&
//                     entry[0] != "play"
//                 )
//                 .map((entry, index) => {
//                   const name = entry[0];
//                   const value = entry[1];
//                   return (
//                     <DebugInput
//                       key={index}
//                       index={index}
//                       name={name}
//                       value={value}
//                       handleChange={handleChange}
//                     ></DebugInput>
//                   );
//                 })}
//             </div>
//             <div>
//               <Button id="play-button" className="mt-2" onClick={handleClick}>
//                 {sketchProps.play === "true" ? "Pause" : "Play"}
//               </Button>
//             </div>
//             <div>
//               <Button
//                 variant={"outline"}
//                 id="play-button"
//                 className="mt-2"
//                 onClick={handleStop}
//               >
//                 Reset
//               </Button>
//             </div>
//             <p className="text-xs mt-2">
//               * Click on canvas to play/pause animation.
//             </p>
//           </div>
//         </CollapsibleContent>
//       </Collapsible>
//     </div>
//   );
// }
