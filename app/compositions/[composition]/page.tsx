import CompositionsInfo, {
  AvailableCompositionNames,
} from "@/components/compositions/compositions-info";

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
        <div className="h-full">
          {<Component {...props}></Component> ?? <p>Not working Inside</p>}
        </div>
      );
    }
  } else {
    return <>{<p>Not working</p>}</>;
  }
}
