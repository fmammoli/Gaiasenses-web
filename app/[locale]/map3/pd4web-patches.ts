export type Map3Pd4WebMoment = "map" | "player";

export type Map3Pd4WebBinding =
  | {
      type: "map-center";
      longitudeReceiver: string;
      latitudeReceiver: string;
      pollMs?: number;
      epsilon?: number;
    }
  | {
      type: "none";
    };

export type Map3Pd4WebPatch = {
  id: string;
  label: string;
  bundleFolder: string;
  activation: {
    moments: Map3Pd4WebMoment[];
    compositions?: string[];
  };
  binding: Map3Pd4WebBinding;
};

const DEFAULT_POSITION_POLL_MS = 100;
const DEFAULT_POSITION_EPSILON = 0.0001;

export const MAP3_PD4WEB_PATCHES: readonly Map3Pd4WebPatch[] = [
  {
    id: "gabriel",
    label: "Map sound",
    bundleFolder: "gabriel-pd4web",
    activation: {
      moments: ["map"],
    },
    binding: {
      type: "map-center",
      longitudeReceiver: "x1",
      latitudeReceiver: "y1",
      pollMs: DEFAULT_POSITION_POLL_MS,
      epsilon: DEFAULT_POSITION_EPSILON,
    },
  },
] as const;

export function getPd4WebBundleScriptPath(bundleFolder: string): string {
  return `/${bundleFolder}/pd4web.js`;
}

export function getPd4WebBundleBasePath(bundleFolder: string): string {
  return `/${bundleFolder}/`;
}

export function getPd4WebScriptId(patchId: string): string {
  return `map3-pd4web-runtime-${patchId}`;
}

type ResolveMap3Pd4WebPatchOptions = {
  moment: Map3Pd4WebMoment;
  composition: string | null;
};

export function resolveMap3Pd4WebPatch({
  moment,
  composition,
}: ResolveMap3Pd4WebPatchOptions): Map3Pd4WebPatch | null {
  for (const patch of MAP3_PD4WEB_PATCHES) {
    if (!patch.activation.moments.includes(moment)) {
      continue;
    }

    if (
      patch.activation.compositions &&
      composition &&
      !patch.activation.compositions.includes(composition)
    ) {
      continue;
    }

    if (patch.activation.compositions && !composition) {
      continue;
    }

    return patch;
  }

  return null;
}
