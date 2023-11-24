export default function WeatherInfoPanelElement({
  value,
  name,
}: {
  value: string | number;
  name: string;
}) {
  return (
    <div className="my-2">
      <p className="uppercase text-sm leading-relaxed text-kandinsky-blue font-medium !my-0">
        {value}
      </p>
      <p className="uppercase text-xs leading-tight font-bold !my-0">{name}</p>
    </div>
  );
}
