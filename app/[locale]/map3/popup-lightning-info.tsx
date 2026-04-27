import { getLightning } from "@/components/getData";
import { Zap } from "lucide-react";

export default async function PopupLightningInfo({
  lat,
  lon,
}: {
  lat: number | string;
  lon: number | string;
}) {
  const lightningData = await getLightning(lat.toString(), lon.toString(), 100);

  if (!lightningData || lightningData.count === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex items-end gap-1">
        <Zap size={20} />
        <p>
          {lightningData.count} lightning strike
          {lightningData.count !== 1 ? "s" : ""} nearby
        </p>
      </div>
    </div>
  );
}
