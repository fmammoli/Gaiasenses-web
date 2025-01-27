"use client";
import { Info } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function InfoButton() {
  const searchParams = useSearchParams();
  return (
    <div className="absolute top-[175px] right-0 z-10">
      <div className="mr-[10px] mt-[10px]">
        <Link
          className=""
          href={{
            query: { ...Object.fromEntries(searchParams), info: true },
          }}
          replace
        >
          <div className="bg-white w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-gray-200">
            <Info width={22} height={22} strokeWidth={2.5} />
          </div>
        </Link>
      </div>
    </div>
  );
}
