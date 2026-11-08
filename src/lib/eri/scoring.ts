import { clip, effectivePrice, hasValue } from "./format";
import type { EriProduct, UseCase } from "./types";

type Metrics = {
  cpuTier?: number;
  gpuTier?: number;
  ramGB?: number;
  storageGB?: number;
  batteryHrs?: number;
  weightKg?: number;
  displayInches?: number;
};

type Parts = {
  cpu: number | null;
  gpu: number | null;
  ram: number | null;
  sto: number | null;
  bat: number | null;
  light: number | null;
  value: number | null;
  disp: number | null;
};

/** Ported from the prototype's `parts()` helper — normalizes raw metrics to 0..1. */
export function parts(p: EriProduct): Parts {
  const m = p.metrics as Metrics;
  return {
    cpu: hasValue(m.cpuTier) ? m.cpuTier / 5 : null,
    gpu: hasValue(m.gpuTier) ? m.gpuTier / 5 : null,
    ram: hasValue(m.ramGB) ? clip(m.ramGB / 16) : null,
    sto: hasValue(m.storageGB) ? clip(m.storageGB / 1000) : null,
    bat: hasValue(m.batteryHrs) ? clip(m.batteryHrs / 12) : null,
    light: hasValue(m.weightKg) ? clip((2.5 - m.weightKg) / 1.3) : null,
    value: hasValue(p.price) ? clip(1 - effectivePrice(p.price, p.discountPrice) / 5_000_000) : null,
    disp: hasValue(m.displayInches) ? clip(m.displayInches / 16) : null,
  };
}

/** Ported from the prototype's `WEIGHTS`. */
export const WEIGHTS: Record<UseCase, Partial<Record<keyof Parts, number>>> = {
  gaming: { gpu: 0.6, cpu: 0.2, ram: 0.1, sto: 0.1 },
  create: { cpu: 0.3, ram: 0.25, gpu: 0.15, sto: 0.15, disp: 0.15 },
  study: { value: 0.35, bat: 0.3, light: 0.2, cpu: 0.15 },
  work: { bat: 0.3, cpu: 0.25, ram: 0.2, light: 0.15, value: 0.1 },
};

/** Ported from the prototype's `fitScore()`. */
export function fitScore(
  p: EriProduct,
  use: UseCase,
  priority?: "portable" | "performance"
): number {
  if (p.category !== "laptop") return p.useCases.includes(use) ? 0.6 : 0.3;

  const w: Partial<Record<keyof Parts, number>> = {
    ...(WEIGHTS[use] ?? { cpu: 0.3, ram: 0.2, bat: 0.2, value: 0.3 }),
  };
  if (priority === "portable") {
    w.bat = (w.bat ?? 0) + 0.25;
    w.light = (w.light ?? 0) + 0.25;
  }
  if (priority === "performance") {
    w.cpu = (w.cpu ?? 0) + 0.2;
    w.gpu = (w.gpu ?? 0) + 0.2;
    w.ram = (w.ram ?? 0) + 0.1;
  }

  const q = parts(p);
  let s = 0;
  let tw = 0;
  for (const key of Object.keys(w) as (keyof Parts)[]) {
    const qv = q[key];
    const wv = w[key];
    if (qv !== null && qv !== undefined && wv !== undefined) {
      s += wv * qv;
      tw += wv;
    }
  }
  return tw ? s / tw : 0;
}
