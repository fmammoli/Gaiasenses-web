import { getFireSpots } from "@/components/getData";
import { Flame } from "lucide-react";

export default async function PopupFireInfo({
  lat,
  lon,
}: {
  lat: number | string;
  lon: number | string;
}) {
  const fireData = await getFireSpots(lat.toString(), lon.toString(), 100);

  if (!fireData || fireData.count === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex items-end gap-1">
        <Flame size={20} />
        <p>
          {fireData.count} fire spot{fireData.count !== 1 ? "s" : ""} nearby
        </p>
      </div>
    </div>
  );
}
