import { MoonIcon } from "@radix-ui/react-icons";

export default function ColorInfoDrawer() {
  <div className="absolute bottom-0 w-full font-bold rounded-t-[2rem] bg-destructive shadow-inner">
    <div className="p-1 text-center">
      <h2 className="text-white text-xl">Campinas - SP</h2>
    </div>
    <div className="flex px-4 py-3 bg-background rounded-t-[2rem] shadow-inner">
      <div className="grow">
        <h3 className="text-5xl font-black font-mono">10:38</h3>

        <p className="text-sm font-semibold">
          {new Date().toLocaleDateString("pt-Br", {
            dateStyle: "long",
          })}
        </p>
      </div>
      <div className="self-center flex">
        <p className="self-end">34°</p>
        <MoonIcon height={40} width={40}></MoonIcon>
      </div>
    </div>
    <div className="bg-background ">
      <div className="bg-accent p-5 rounded-t-[2rem] shadow-inner">
        <div className="flex justify-between ">
          <div>
            <p className="font-mono text-sm tracking-wide">LOW</p>
            <p className="text-xs font-bold">UV Index</p>
          </div>
          <div>
            <p className="font-mono text-sm tracking-wide">20mm</p>
            <p className="text-xs font-bold">Rainfall</p>
          </div>
          <div>
            <p className="font-mono text-sm tracking-wide">HIGHT</p>
            <p className="text-xs font-bold">Fire Chance</p>
          </div>
        </div>
        <div className=" border-t-2 border-white my-2"></div>
        <div className="flex justify-between ">
          <div>
            <p className="font-mono text-sm tracking-wide">GOOD</p>
            <p className="text-xs font-bold">Satellite Visibility</p>
          </div>
          <div>
            <p className="font-mono text-sm tracking-wide">Dry</p>
            <p className="text-xs font-bold">Vegetation Status</p>
          </div>
          <div>
            <p className="font-mono text-sm tracking-wide">None</p>
            <p className="text-xs font-bold">Lightning</p>
          </div>
        </div>
      </div>
    </div>
  </div>;
}
