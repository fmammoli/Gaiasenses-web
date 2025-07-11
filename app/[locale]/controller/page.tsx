import Controller2 from "./controller2";

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const offer = searchParams.offer;
  return <Controller2 offer={offer as string}></Controller2>;
}
