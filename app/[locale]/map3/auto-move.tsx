"use client";

import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import { useState } from "react";

export type AutoMoveProps = {
  isActive: boolean;
  onActivate: (state: boolean) => void;
  onDeactivate: (state: boolean) => void;
};

export default function AutoMove({
  isActive,
  onActivate,
  onDeactivate,
}: AutoMoveProps) {
  function activate() {
    onActivate(true);
  }

  function deactivate() {
    onDeactivate(false);
  }

  return (
    <>
      <div className="absolute top-[255px] right-0 z-10">
        <div className="mr-[10px] mt-[10px]">
          {!isActive ? (
            <button
              onClick={activate}
              className="bg-white w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-gray-200"
            >
              <PlaneTakeoff width={22} height={22} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={deactivate}
              className="bg-yellow-200 w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-yellow-100 "
            >
              <PlaneLanding width={22} height={22} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
