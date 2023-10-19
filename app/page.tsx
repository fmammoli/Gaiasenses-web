import { H1 } from "@/components/ui/h1";
import { ModeToggle } from "@/components/ui/mode-toggle";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getWeather } from "@/components/compositions/visual/lluvia/lluvia";
import { getLightning } from "@/components/compositions/visual/zigzag/zigzag";
import CompositionsInfo, {
  AvailableCompositionNames,
} from "@/components/compositions/compositions-info";
import { Button } from "@/components/ui/button";

export default async function Page({
  params,
  searchParams,
}: {
  params: { composition: string };
  searchParams: { lat: string; lon: string } | {};
}) {
  const lat = searchParams.hasOwnProperty("lat")
    ? (searchParams as { lat: string; lon: string }).lat
    : "0";

  const lon = searchParams.hasOwnProperty("lon")
    ? (searchParams as { lat: string; lon: string }).lon
    : "0";

  return (
    <main className="grid grid-rows-[120px_1fr] h-full">
      <div className="">
        <nav className="flex p-8 gap-8">
          <H1>GaiaSensesWeb</H1>
          <ModeToggle></ModeToggle>
        </nav>
      </div>
      <div className="p-8">
        <H1>Hi this is Home</H1>
        <p>Test some compositions:</p>

        {(Object.keys(CompositionsInfo) as AvailableCompositionNames[]).map(
          (key, index) => {
            const attributesString = CompositionsInfo[key].attributes
              .map((item) => `${item}=0`)
              .join("&");
            return (
              <div key={index}>
                <Card></Card>
                <Link
                  href={`/compositions/${CompositionsInfo[key].name}/?lat=${lat}&lon=${lon}&${attributesString}`}
                >
                  {CompositionsInfo[key].name}
                </Link>
              </div>
            );
          }
        )}
      </div>
    </main>
  );
}
