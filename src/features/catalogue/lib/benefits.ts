import { hasValue } from "./format";

type Metrics = {
  ramGB?: number;
  gpuTier?: number;
  batteryHrs?: number;
  weightKg?: number;
};

/** Ported from the prototype's `benefits()` helper. */
export function benefitsFor(p: {
  metrics: Record<string, unknown>;
  specs: Record<string, string>;
  description: string;
}): string[] {
  const m = p.metrics as Metrics;
  const out: string[] = [];
  const storage = p.specs["Storage"] ?? "";
  const display = p.specs["Display"] ?? "";

  if (hasValue(m.ramGB)) {
    out.push(
      m.ramGB >= 16
        ? `${m.ramGB}GB RAM: keep many tabs and apps open without slowing down.`
        : `${m.ramGB}GB RAM: fine for browsing, documents and classes; heavy multitasking can feel slow.`
    );
  }
  if (/ssd/i.test(storage)) {
    out.push("SSD storage: starts up and opens files much faster than an old-style hard drive.");
  }
  if (hasValue(m.gpuTier)) {
    out.push(
      m.gpuTier >= 3
        ? "Dedicated graphics: smoother games and faster video effects."
        : "Integrated graphics: great for everyday use, limited for demanding games."
    );
  }
  if (hasValue(m.batteryHrs) && m.batteryHrs >= 8) {
    out.push(`Around ${m.batteryHrs} hours listed battery: a long day of classes or meetings.`);
  }
  if (hasValue(m.weightKg) && m.weightKg <= 1.7) {
    out.push(`${m.weightKg}kg: light enough to carry every day.`);
  }
  if (/144\s*hz/i.test(display)) {
    out.push("144Hz screen: motion looks noticeably smoother in games.");
  }
  if (!out.length && p.description) out.push(p.description);
  return out;
}

export const USE_CASE_NAMES: Record<string, string> = {
  gaming: "Gaming",
  create: "Creative work",
  study: "Study",
  work: "Office work",
};
