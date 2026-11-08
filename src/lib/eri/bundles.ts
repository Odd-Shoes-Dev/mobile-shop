import { effectivePrice } from "./format";
import { fitScore } from "./scoring";
import type { EriProduct, UseCase } from "./types";

export interface Bundle {
  id: string;
  name: string;
  blurb: string;
  use: UseCase;
  slots: [category: string, label: string][];
}

/** Ported from the prototype's `BUNDLES`. */
export const BUNDLES: Record<string, Bundle> = {
  student: {
    id: "student",
    name: "STUDENT",
    blurb: "Light, long-lasting, easy on the wallet.",
    use: "study",
    slots: [
      ["laptop", "Laptop"],
      ["mouse", "Mouse"],
      ["bag", "Bag"],
      ["headphones", "Headphones"],
      ["storage", "External storage"],
    ],
  },
  gamer: {
    id: "gamer",
    name: "GAMER",
    blurb: "Frames, feel and a cooler laptop.",
    use: "gaming",
    slots: [
      ["laptop", "Gaming laptop"],
      ["mouse", "Gaming mouse"],
      ["keyboard", "Keyboard"],
      ["headphones", "Headset"],
      ["cooling", "Cooling pad"],
    ],
  },
  creator: {
    id: "creator",
    name: "CREATOR",
    blurb: "Power, a proper screen and room for projects.",
    use: "create",
    slots: [
      ["laptop", "Powerful laptop"],
      ["monitor", "Monitor"],
      ["mouse", "Mouse"],
      ["keyboard", "Keyboard"],
      ["headphones", "Headphones"],
      ["storage", "Storage"],
    ],
  },
};

/** Ported from the prototype's `setupDefaults()`. */
export function setupDefaults(
  bundle: Bundle,
  budget: number | null,
  catalogue: EriProduct[]
): Record<number, string | null> {
  const sel: Record<number, string | null> = {};
  bundle.slots.forEach(([cat], i) => {
    const pool = catalogue.filter((p) => p.category === cat && p.availabilityLabel !== "Out of stock");
    const ranked = pool
      .map((p) => ({ p, s: fitScore(p, bundle.use) }))
      .sort((x, y) => y.s - x.s || effectivePrice(x.p.price, x.p.discountPrice) - effectivePrice(y.p.price, y.p.discountPrice))
      .map((x) => x.p);

    let cap = Infinity;
    if (budget) {
      const first = sel[0] ? catalogue.find((p) => p.id === sel[0]) : undefined;
      const firstPrice = first ? effectivePrice(first.price, first.discountPrice) : 0;
      cap = i === 0 ? budget * 0.6 : Math.max((budget - firstPrice) / (bundle.slots.length - 1), 0);
    }
    sel[i] = (ranked.find((p) => effectivePrice(p.price, p.discountPrice) <= cap) ?? (budget ? null : ranked[0]) ?? null)?.id ?? null;
  });
  return sel;
}
