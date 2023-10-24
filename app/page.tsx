import { H1 } from "@/components/ui/h1";
import { ModeToggle } from "@/components/ui/mode-toggle";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AvailableCompositionNames } from "@/components/compositions/compositions-info";

type CompositionHistoryItem = {
  id: string;
  date: Date;
  description: string;
  composition: AvailableCompositionNames;
  attributes: { [key: string]: string | number }[];
};

const compositionHistory: CompositionHistoryItem[] = [
  {
    id: "day 2",
    date: new Date("10-23-2023"),
    description: "A cloudy day with some evening rain.",
    composition: "lluvia",
    attributes: [{ rain: 6 }],
  },
  {
    id: "day 1",
    date: new Date("05-10-2023"),
    composition: "zigzag",
    attributes: [{ rain: 20 }, { lightningCount: 20 }],
    description: "A rainy day with lots of lightning",
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
    <main className="grid grid-rows-[120px_1fr] h-full justify-center">
      <nav className="flex p-8 justify-between">
        <div className="grow text-center">
          <H1>GaiaSensesWeb</H1>
        </div>

        <ModeToggle></ModeToggle>
      </nav>

      <div className="p-8">
        <H1>My compositons</H1>

        {compositionHistory.map((item, index) => {
          const attributesString = item.attributes
            .map((attr) => {
              return `${Object.keys(attr)[0]}=${attr[Object.keys(attr)[0]]}`;
            })
            .join("&");

          return (
            <div key={item.id} className="my-4 max-w-sm">
              <Link
                href={`/compositions/${item.composition}/?lat=${lat}&lon=${lon}&${attributesString}`}
              >
                <Card className="shadow-sm hover:shadow-md hover:scale-[102%] transition-shadow">
                  <CardHeader>
                    <CardTitle className="capitalize">{`${item.id} - ${item.composition}`}</CardTitle>
                    <CardDescription>
                      {item.date.toLocaleDateString("pt-Br", {
                        weekday: "short",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>{item.description}</p>
                    <div>
                      {item.attributes.map((item, index) => (
                        <p key={index}>{JSON.stringify(item)}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
    </main>
  );
}
