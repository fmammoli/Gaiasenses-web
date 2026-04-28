"use client";

import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { MapLocation } from "./map-constants";

export type AutoMoveProps = {
  isActive: boolean;
  locations: MapLocation[];
  compositionOptions: string[];
  onSaveLocations: (locations: MapLocation[]) => void;
  onActivate: (state: boolean) => void;
  onDeactivate: (state: boolean) => void;
};

export default function AutoMove({
  isActive,
  locations,
  compositionOptions,
  onSaveLocations,
  onActivate,
  onDeactivate,
}: AutoMoveProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [draftRows, setDraftRows] = useState<MapLocation[]>(locations);
  const [startCountdown, setStartCountdown] = useState<number | null>(null);
  const startTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setDraftRows(locations);
  }, [locations]);

  useEffect(() => {
    return () => {
      if (startTimeoutRef.current) {
        clearTimeout(startTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  function activate() {
    setIsPanelOpen(true);
  }

  function deactivate() {
    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
      startTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setStartCountdown(null);
    onDeactivate(false);
  }

  function updateRow(
    index: number,
    key: "name" | "composition" | "lat" | "lng",
    value: string,
  ) {
    setDraftRows((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) {
        return prev;
      }

      if (key === "name") {
        next[index] = { ...item, name: value };
        return next;
      }

      if (key === "composition") {
        next[index] = { ...item, composition: value };
        return next;
      }

      if (key === "lat") {
        const parsed = Number(value);
        next[index] = {
          ...item,
          coords: [
            item.coords[0],
            Number.isFinite(parsed) ? parsed : item.coords[1],
          ],
        };
        return next;
      }

      const parsed = Number(value);
      next[index] = {
        ...item,
        coords: [
          Number.isFinite(parsed) ? parsed : item.coords[0],
          item.coords[1],
        ],
      };
      return next;
    });
  }

  function addRow() {
    setDraftRows((prev) => [
      ...prev,
      {
        name: `Place ${prev.length + 1}`,
        coords: [0, 0],
        composition: compositionOptions[0] ?? "attractor",
      },
    ]);
  }

  function removeRow(index: number) {
    setDraftRows((prev) => prev.filter((_, i) => i !== index));
  }

  function saveRows() {
    const sanitized = draftRows
      .filter((item) => item.name.trim().length > 0)
      .map((item) => ({
        ...item,
        name: item.name.trim(),
      }));

    if (sanitized.length === 0) {
      return;
    }

    onSaveLocations(sanitized);
    setIsPanelOpen(false);
  }

  function startAutoModeWithDelay() {
    const sanitized = draftRows
      .filter((item) => item.name.trim().length > 0)
      .map((item) => ({
        ...item,
        name: item.name.trim(),
      }));

    if (sanitized.length === 0) {
      return;
    }

    onSaveLocations(sanitized);
    setIsPanelOpen(false);

    if (startTimeoutRef.current) {
      clearTimeout(startTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setStartCountdown(5);
    countdownIntervalRef.current = setInterval(() => {
      setStartCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    startTimeoutRef.current = setTimeout(() => {
      onActivate(true);
      setStartCountdown(null);
      startTimeoutRef.current = null;
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 5000);
  }

  return (
    <>
      <div className="absolute top-[255px] right-0 z-10">
        <div className="mr-[10px] mt-[10px]">
          {!isActive ? (
            <button
              onClick={activate}
              className="bg-white w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-gray-200"
              title="Activate auto mode"
            >
              <PlaneTakeoff width={22} height={22} strokeWidth={2.5} />
            </button>
          ) : (
            <button
              onClick={deactivate}
              className="bg-yellow-200 w-[29px] h-[29px] rounded-sm flex justify-center items-center hover:bg-yellow-100 "
              title="Deactivate auto mode"
            >
              <PlaneLanding width={22} height={22} strokeWidth={2.5} />
            </button>
          )}
          {startCountdown !== null && !isActive && (
            <p className="mt-1 max-w-[220px] rounded bg-white/90 px-2 py-1 text-[10px] shadow">
              Auto mode starts in {startCountdown}s
            </p>
          )}
        </div>
      </div>

      {isPanelOpen && (
        <div className="absolute right-[50px] top-[255px] z-20 w-[min(92vw,560px)] rounded-md border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <p className="text-sm font-semibold">Auto mode trajectory</p>
            <button
              className="rounded px-2 py-1 text-xs hover:bg-gray-100"
              onClick={() => setIsPanelOpen(false)}
            >
              Close
            </button>
          </div>

          <div className="max-h-[280px] overflow-auto p-2">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Latitude</th>
                  <th className="border px-2 py-1">Longitude</th>
                  <th className="border px-2 py-1">Composition</th>
                  <th className="border px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {draftRows.map((location, index) => (
                  <tr key={`${location.name}-${index}`}>
                    <td className="border px-1 py-1">
                      <input
                        className="w-full rounded border px-1 py-1"
                        value={location.name}
                        onChange={(e) =>
                          updateRow(index, "name", e.target.value)
                        }
                      />
                    </td>
                    <td className="border px-1 py-1">
                      <input
                        type="number"
                        step="any"
                        className="w-full rounded border px-1 py-1"
                        value={location.coords[1]}
                        onChange={(e) =>
                          updateRow(index, "lat", e.target.value)
                        }
                      />
                    </td>
                    <td className="border px-1 py-1">
                      <input
                        type="number"
                        step="any"
                        className="w-full rounded border px-1 py-1"
                        value={location.coords[0]}
                        onChange={(e) =>
                          updateRow(index, "lng", e.target.value)
                        }
                      />
                    </td>
                    <td className="border px-1 py-1">
                      <select
                        className="w-full rounded border px-1 py-1"
                        value={location.composition}
                        onChange={(e) =>
                          updateRow(index, "composition", e.target.value)
                        }
                      >
                        {compositionOptions.map((comp) => (
                          <option key={comp} value={comp}>
                            {comp}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border px-1 py-1">
                      <button
                        className="w-full rounded bg-red-100 px-1 py-1 hover:bg-red-200"
                        onClick={() => removeRow(index)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between border-t px-3 py-2">
            <button
              className="rounded bg-gray-100 px-3 py-1 text-xs hover:bg-gray-200"
              onClick={addRow}
            >
              Add place
            </button>
            <button
              className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
              onClick={saveRows}
            >
              Save trajectory
            </button>
            {!isActive && (
              <button
                className="rounded bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
                onClick={startAutoModeWithDelay}
              >
                Start auto mode (starts in 5 seconds)
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
