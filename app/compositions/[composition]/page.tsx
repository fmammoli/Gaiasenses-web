import { H1 } from "@/components/ui/h1";
import { ModeToggle } from "@/components/ui/mode-toggle";
import CompositionsInfo, {
  AvailableCompositionNames,
} from "@/components/compositions/compositions-info";
import BackButton from "./back-button";
import Script from "next/script";

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
  searchParams: { lat: string; lon: string; [key: string]: string };
}) {
  const compositionInfo = CompositionsInfo.hasOwnProperty(params.composition)
    ? CompositionsInfo[params.composition as AvailableCompositionNames]
    : null;

  if (searchParams && searchParams.lat && searchParams.lon) {
    if (compositionInfo) {
      const compositionProps: { [key: string]: number } = {};
      compositionInfo.attributes.forEach((attr) => {
        compositionProps[attr] = parseInt(searchParams[attr]);
      });

      const Component = compositionInfo.Component;
      const props = {
        lat: searchParams.lat,
        lon: searchParams.lon,
        debug: true,
        ...compositionProps,
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
