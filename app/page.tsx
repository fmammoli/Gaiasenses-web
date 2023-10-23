import { H1 } from "@/components/ui/h1";
import { ModeToggle } from "@/components/ui/mode-toggle";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import CompositionsInfo, {
  AvailableCompositionNames,
} from "@/components/compositions/compositions-info";

type CompositionHistoryItem = {
  id: string;
  date: Date;
  composition: AvailableCompositionNames;
  attributes: { [key: string]: string | number }[];
};

const compositionHistory: CompositionHistoryItem[] = [
  {
    id: "day 1",
    date: new Date("10-23-2023"),
    composition: "lluvia",
    attributes: [{ rain: 6 }],
  },
  {
    id: "day 2",
    date: new Date("05-10-2023"),
    composition: "zigzag",
    attributes: [{ rain: 6 }, { lightningCount: 10 }],
  },
];

export default async function Page({
  searchParams,
}: {
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

        {compositionHistory.map((item, index) => {
          const attributesString = item.attributes
            .map((attr) => {
              console.log(attr);
              return `${Object.keys(attr)[0]}=${attr[Object.keys(attr)[0]]}`;
            })
            .join("&");

          return (
            <div key={item.id}>
              <Card></Card>
              <Link
                href={`/compositions/${item.composition}/?lat=${lat}&lon=${lon}&${attributesString}`}
              >
                {`${item.id}   ${item.date.toUTCString()}`}
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
