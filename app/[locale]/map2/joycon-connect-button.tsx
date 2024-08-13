"use client"

import { Button } from "@/components/ui/button";

export default function JoyconConnectButton(){

    async function handleClick(){
        //@ts-ignore
        const JoyCon = (await import("joy-con-webhid"))
        console.log(JoyCon)
        await JoyCon.connectJoyCon();
    }
    return(
        <div >
            <Button onClick={handleClick}>Connect</Button>
        </div>
    )
}