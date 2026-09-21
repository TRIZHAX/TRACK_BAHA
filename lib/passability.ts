import type { FloodDepth } from "./types";

export type Passability = "passable" | "caution" | "hazardous" | "unknown";
const depthRank: Record<FloodDepth, number> = { none: 0, ankle: 1, calf: 2, knee: 3, waist: 4, chest: 5, unknown: 99 };

export function evaluatePassability(depth: FloodDepth, cautionDepth: FloodDepth, maxDepth: FloodDepth, ageHours: number): Passability {
  if (depth === "unknown" || ageHours > 6) return "unknown";
  if (depthRank[depth] > depthRank[maxDepth]) return "hazardous";
  if (depthRank[depth] >= depthRank[cautionDepth]) return "caution";
  return "passable";
}

export const defaultVehicleRules = [
  ["bicycle", "ankle", "calf"], ["motorcycle", "ankle", "calf"], ["tricycle", "ankle", "calf"],
  ["sedan", "ankle", "calf"], ["suv", "calf", "knee"], ["jeepney", "calf", "knee"],
  ["delivery_vehicle", "ankle", "calf"], ["other", "ankle", "calf"]
] as const;
