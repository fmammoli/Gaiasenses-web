import dynamic from "next/dynamic";

const DynamicMap = dynamic(() => import("./map"), { ssr: false });

export default async function Page({
  searchParams,
}: {
  searchParams: { lat: string; lon: string; [key: string]: string };
}) {
  const {lat, lon} = searchParams;

  return (
    <div className="place-self-center w-full h-full">
      <DynamicMap lat={lat} lon={lon} />
    </div>
  );
}
