import { Satellite, SatelliteDish } from "lucide-react";

export default function PopupLoading() {
    return (
        <div className="p-16 flex gap-2 items-center">
            <div className="">
                <p>Loading weather data...</p>
            </div>
            <div className="">
                <Satellite></Satellite>
            </div>
            
        </div>
    )
}