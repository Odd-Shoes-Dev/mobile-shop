import { effectivePrice, hasValue, formatUgx } from "./format";
import { fitScore } from "./scoring";
import type { EriProduct, UseCase } from "./types";

/** Ported from the prototype's `rank()`. */
export function rank(
  catalogue: EriProduct[],
  opts: {
    use: UseCase;
    budget?: number | null;
    category?: string;
    priority?: "portable" | "performance" | null;
    brand?: string | null;
    stretch?: number;
    includeOut?: boolean;
  }
): EriProduct[] {
  const { use, budget, category = "laptop", priority, brand, stretch = 1.0 } = opts;
  let list = catalogue.filter((p) => p.category === category);
  if (hasValue(budget)) {
    list = list.filter((p) => hasValue(p.price) && effectivePrice(p.price, p.discountPrice) <= budget * stretch);
  }
  if (brand && brand.toLowerCase() !== "any") {
    list = list.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
  }
  return list
    .map((p) => ({ p, score: fitScore(p, use, priority ?? undefined) }))
    .sort((a, b) => b.score - a.score || effectivePrice(a.p.price, a.p.discountPrice) - effectivePrice(b.p.price, b.p.discountPrice))
    .map((x) => x.p);
}

type Metrics = {
  gpuTier?: number;
  ramGB?: number;
  batteryHrs?: number;
  weightKg?: number;
};

const spec = (p: EriProduct, key: string) => p.specs[key] || null;

/** Ported from the prototype's `reasons()`. */
export function reasons(p: EriProduct, use: UseCase, budget?: number | null): string[] {
  const m = p.metrics as Metrics;
  const out: string[] = [];

  if (p.category === "laptop") {
    if (use === "gaming") {
      if (hasValue(m.gpuTier) && m.gpuTier >= 3) {
        out.push(`Dedicated graphics (${spec(p, "Graphics") || "listed GPU"}) for smoother games`);
      } else if (hasValue(m.gpuTier)) {
        out.push(`Integrated graphics (${spec(p, "Graphics") || "shared"}): fine for light games, not demanding ones`);
      }
      if (hasValue(m.ramGB) && m.ramGB >= 16) {
        out.push(`${m.ramGB}GB RAM keeps games and background apps running together`);
      }
    } else if (use === "create") {
      if (hasValue(m.ramGB)) {
        out.push(
          m.ramGB >= 16
            ? `${m.ramGB}GB RAM gives editing software room to breathe`
            : `${m.ramGB}GB RAM is the minimum for editing; expect slower timelines`
        );
      }
      if (spec(p, "Processor")) out.push(`Processor: ${spec(p, "Processor")}`);
      if (spec(p, "Storage")) out.push(`Storage: ${spec(p, "Storage")} for project files`);
      if (hasValue(m.gpuTier) && m.gpuTier >= 3) {
        out.push(`Dedicated graphics (${spec(p, "Graphics")}) helps video effects and exports`);
      }
    } else if (use === "study") {
      if (hasValue(m.batteryHrs)) out.push(`Listed battery life of about ${m.batteryHrs} hours for lectures away from sockets`);
      if (hasValue(m.weightKg)) out.push(`${m.weightKg}kg: ${m.weightKg <= 1.7 ? "easy to carry daily" : "noticeable in a bag"}`);
    } else {
      if (hasValue(m.batteryHrs)) out.push(`About ${m.batteryHrs} hours listed battery life`);
      if (hasValue(m.ramGB)) out.push(`${m.ramGB}GB RAM for spreadsheets, browsers and video calls together`);
      if (hasValue(m.weightKg)) out.push(`${m.weightKg}kg`);
    }
  } else {
    if (p.useCases.includes(use)) out.push(`Tagged for ${use === "create" ? "creative" : use} use in the catalogue`);
  }

  if (hasValue(budget)) {
    const diff = budget - effectivePrice(p.price, p.discountPrice);
    out.push(diff >= 0 ? `Within your budget with ${formatUgx(diff)} to spare` : `${formatUgx(-diff)} over your budget`);
  }

  return out.slice(0, 4);
}
