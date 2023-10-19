import { H1 } from "@/components/ui/h1";
import { ModeToggle } from "@/components/ui/mode-toggle";
import CompositionsInfo, {
  AvailableCompositionNames,
} from "@/components/compositions/compositions-info";
import Link from "next/link";
import BackButton from "./back-button";

export type FireSpotsResponseData = {
  city: string;
  count: number;
  events: [];
  state: string;
};

export default async function Page({
  params,
  searchParams,
}: {
  params: { composition: string };
  searchParams: { lat?: string; lon?: string; rain?: number };
}) {
  console.log(params.composition);
  const compositionInfo = CompositionsInfo.hasOwnProperty(params.composition)
    ? CompositionsInfo[params.composition as AvailableCompositionNames]
    : null;

  if (searchParams && searchParams.lat && searchParams.lon) {
    if (compositionInfo) {
      const Component = compositionInfo.Component;
      const props = {
        lat: searchParams.lat,
        lon: searchParams.lon,
        debug: true,
      };
      return (
        <main className="grid grid-rows-[120px_1fr] h-full">
          <div className="">
            <nav className="flex p-8 gap-8">
              <BackButton></BackButton>
              <H1>GaiaSensesWeb</H1>
              <ModeToggle></ModeToggle>
            </nav>
          </div>
          {<Component {...props}></Component> ?? <p>Not working Inside</p>}
        </main>
      );
    }
  } else {
    return (
      <main className="grid grid-rows-[120px_1fr] h-full">
        <div className="">
          <nav className="flex p-8 gap-8">
            <BackButton></BackButton>
            <H1>GaiaSensesWeb</H1>
            <ModeToggle></ModeToggle>
          </nav>
        </div>
        {<p>Not working</p>}
      </main>
    );
  }
}
