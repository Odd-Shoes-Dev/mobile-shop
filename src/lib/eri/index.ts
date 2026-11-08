import type { Product } from "@/lib/db";
import type { EriProduct } from "./types";

export { fitScore, parts, WEIGHTS } from "./scoring";
export { ROWS, rowWinners, verdict, USE_LABEL } from "./compare";
export { rank, reasons } from "./rank";
export { compat, accessoriesFor } from "./compat";
export { BUNDLES, setupDefaults } from "./bundles";
export type { CompareRow, VerdictEntry } from "./compare";
export type { Compat } from "./compat";
export type { Bundle } from "./bundles";
export type { EriProduct, UseCase } from "./types";
export { formatUgx, effectivePrice, hasValue, clip } from "./format";

/** Ported from the prototype's `availability()` helper. */
export function availabilityLabel(p: Pick<Product, "availability" | "stock">): string {
  if (p.availability === "out_of_stock" || p.stock === 0) return "Out of stock";
  if (p.availability === "preorder") return "Pre-order";
  if (p.availability === "in_stock" || p.stock > 0) return "In stock";
  return "Ask us about availability";
}

export function toEriProduct(p: Product): EriProduct {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.priceUgx,
    discountPrice: p.discountPriceUgx,
    specs: p.specs,
    metrics: p.metrics,
    warranty: p.warranty,
    useCases: p.useCases,
    availabilityLabel: availabilityLabel(p),
  };
}
