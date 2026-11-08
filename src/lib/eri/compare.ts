import { effectivePrice, formatUgx, hasValue } from "./format";
import { fitScore } from "./scoring";
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

export interface CompareRow {
  label: string;
  get(p: EriProduct): string;
  metric: ((p: EriProduct) => number | null | undefined) | null;
  best?: "low" | "high";
}

const spec = (p: EriProduct, key: string) => p.specs[key] || null;

/** Ported from the prototype's `ROWS`. */
export const ROWS: CompareRow[] = [
  { label: "Price", get: (p) => formatUgx(effectivePrice(p.price, p.discountPrice)), metric: (p) => effectivePrice(p.price, p.discountPrice), best: "low" },
  { label: "Processor", get: (p) => spec(p, "Processor") || "Not listed", metric: (p) => (p.metrics as Metrics).cpuTier, best: "high" },
  { label: "RAM", get: (p) => spec(p, "RAM") || "Not listed", metric: (p) => (p.metrics as Metrics).ramGB, best: "high" },
  { label: "Storage", get: (p) => spec(p, "Storage") || "Not listed", metric: (p) => (p.metrics as Metrics).storageGB, best: "high" },
  { label: "Graphics", get: (p) => spec(p, "Graphics") || "Not listed", metric: (p) => (p.metrics as Metrics).gpuTier, best: "high" },
  { label: "Display", get: (p) => spec(p, "Display") || "Not listed", metric: null },
  { label: "Battery", get: (p) => spec(p, "Battery") || "Not listed", metric: (p) => (p.metrics as Metrics).batteryHrs, best: "high" },
  { label: "Weight", get: (p) => spec(p, "Weight") || "Not listed", metric: (p) => (p.metrics as Metrics).weightKg, best: "low" },
  { label: "Warranty", get: (p) => p.warranty || "Not listed", metric: null },
  { label: "Availability", get: (p) => p.availabilityLabel, metric: null },
];

/** Ported from the prototype's `rowWinners()`. */
export function rowWinners(items: EriProduct[], row: CompareRow): string[] {
  if (!row.metric) return [];
  const vals = items.map((p) => row.metric!(p));
  if (vals.some((v) => !hasValue(v))) return [];
  const nums = vals as number[];
  const best = row.best === "low" ? Math.min(...nums) : Math.max(...nums);
  if (nums.every((v) => v === best)) return [];
  return items.filter((_, i) => nums[i] === best).map((p) => p.id);
}

const USE_METRICS: Record<UseCase, (keyof Metrics | "price")[]> = {
  gaming: ["gpuTier", "cpuTier", "ramGB"],
  create: ["ramGB", "cpuTier", "storageGB", "displayInches", "gpuTier"],
  study: ["batteryHrs", "weightKg", "price"],
  work: ["batteryHrs", "ramGB", "cpuTier", "weightKg"],
};

export const USE_LABEL: Record<UseCase, string> = {
  gaming: "Gaming",
  create: "Creative work",
  study: "Study and everyday use",
  work: "Office productivity",
};

function metricVal(p: EriProduct, k: keyof Metrics | "price"): number | undefined {
  if (k === "price") return effectivePrice(p.price, p.discountPrice);
  return (p.metrics as Metrics)[k];
}

const PHRASE: Partial<Record<keyof Metrics | "price", (w: EriProduct, r: EriProduct) => string | null>> = {
  gpuTier: (w, r) => {
    const wv = (w.metrics as Metrics).gpuTier, rv = (r.metrics as Metrics).gpuTier;
    return wv !== undefined && rv !== undefined && wv > rv
      ? `stronger graphics (${spec(w, "Graphics")} vs ${spec(r, "Graphics")})`
      : null;
  },
  cpuTier: (w, r) => {
    const wv = (w.metrics as Metrics).cpuTier, rv = (r.metrics as Metrics).cpuTier;
    return wv !== undefined && rv !== undefined && wv > rv
      ? `a higher-class processor (${spec(w, "Processor")} vs ${spec(r, "Processor")})`
      : null;
  },
  ramGB: (w, r) => {
    const wv = (w.metrics as Metrics).ramGB, rv = (r.metrics as Metrics).ramGB;
    return wv !== undefined && rv !== undefined && wv > rv ? `more RAM (${wv}GB vs ${rv}GB)` : null;
  },
  storageGB: (w, r) => {
    const wv = (w.metrics as Metrics).storageGB, rv = (r.metrics as Metrics).storageGB;
    return wv !== undefined && rv !== undefined && wv > rv
      ? `more storage (${spec(w, "Storage")} vs ${spec(r, "Storage")})`
      : null;
  },
  displayInches: (w, r) => {
    const wv = (w.metrics as Metrics).displayInches, rv = (r.metrics as Metrics).displayInches;
    return wv !== undefined && rv !== undefined && wv > rv ? `a bigger screen (${wv}" vs ${rv}")` : null;
  },
  batteryHrs: (w, r) => {
    const wv = (w.metrics as Metrics).batteryHrs, rv = (r.metrics as Metrics).batteryHrs;
    return wv !== undefined && rv !== undefined && wv > rv ? `longer listed battery life (${wv}h vs ${rv}h)` : null;
  },
  weightKg: (w, r) => {
    const wv = (w.metrics as Metrics).weightKg, rv = (r.metrics as Metrics).weightKg;
    return wv !== undefined && rv !== undefined && wv < rv ? `lighter to carry (${wv}kg vs ${rv}kg)` : null;
  },
  price: (w, r) => {
    const wv = effectivePrice(w.price, w.discountPrice), rv = effectivePrice(r.price, r.discountPrice);
    return wv < rv ? `${formatUgx(rv - wv)} cheaper` : null;
  },
};

export interface VerdictEntry {
  use: UseCase | "value";
  label: string;
  winner: string | null;
  why: string;
}

/** Ported from the prototype's `verdict()`. */
export function verdict(items: EriProduct[]): VerdictEntry[] | null {
  if (items.length < 2 || items.some((p) => p.category !== "laptop")) return null;

  const out: VerdictEntry[] = [];
  const useCases: UseCase[] = ["gaming", "create", "study", "work"];

  for (const use of useCases) {
    const scored = items
      .map((p) => ({ p, s: fitScore(p, use) }))
      .sort((a, b) => b.s - a.s);
    const [w, r] = scored;
    if (w.s - r.s < 0.03) {
      out.push({ use, label: USE_LABEL[use], winner: null, why: "Too close to call on the listed specs." });
      continue;
    }
    const bits: string[] = [];
    for (const k of USE_METRICS[use]) {
      const wv = metricVal(w.p, k), rv = metricVal(r.p, k);
      if (hasValue(wv) && hasValue(rv)) {
        const phrase = PHRASE[k]?.(w.p, r.p);
        if (phrase) bits.push(phrase);
      }
    }
    out.push({
      use,
      label: USE_LABEL[use],
      winner: w.p.id,
      why: bits.length
        ? `${w.p.name} wins over ${r.p.name} with ${bits.slice(0, 3).join(", ")}.`
        : `${w.p.name} scores higher overall on the listed specs.`,
    });
  }

  const vals = items
    .map((p) => ({
      p,
      v: (useCases.reduce((a, u) => a + fitScore(p, u), 0) / 4) / Math.max(effectivePrice(p.price, p.discountPrice) / 1e6, 0.1),
    }))
    .sort((a, b) => b.v - a.v);
  out.push({
    use: "value",
    label: "Best value for money",
    winner: vals[0].p.id,
    why: `${vals[0].p.name} gives the most all-round capability per shilling among these.`,
  });

  return out;
}
