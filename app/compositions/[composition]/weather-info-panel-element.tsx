export default function WeatherInfoPanelElement({
  value,
  name,
}: {
  value: string | number;
  name: string;
}) {
  return (
    <div className="my-0">
      <p className="uppercase text-sm leading-relaxed text-kandinsky-blue !my-1">
        {value}
      </p>
      <p className="uppercase text-xs leading-tight font-bold !my-1">{name}</p>
    </div>
  );
}
