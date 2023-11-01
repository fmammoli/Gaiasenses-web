export default function WeatherInfoPanelElement({
  value,
  name,
}: {
  value: string;
  name: string;
}) {
  return (
    <div className="">
      <p className="uppercase text-sm leading-relaxed text-kandinsky-blue">
        {value}
      </p>
      <p className="uppercase text-xs leading-tight font-bold">{name}</p>
    </div>
  );
}
