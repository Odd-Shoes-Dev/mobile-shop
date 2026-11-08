import type { ArtCategory } from "@/components/ArtIcon";
import type { Product } from "@/lib/db";
import { getStorage } from "@/lib/storage";
import type { Availability, ProductDetail, ProductSummary } from "../types";

const KNOWN_CATEGORIES: ArtCategory[] = [
  "laptop",
  "mouse",
  "keyboard",
  "headphones",
  "monitor",
  "bag",
  "storage",
  "cooling",
];

function asCategory(value: string): ArtCategory {
  return (KNOWN_CATEGORIES as string[]).includes(value) ? (value as ArtCategory) : "storage";
}

export function mapToSummary(p: Product): ProductSummary {
  const firstImage = p.images[0];
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: asCategory(p.category),
    condition: p.condition,
    price: p.priceUgx,
    discountPrice: p.discountPriceUgx,
    specs: p.specs,
    availability: p.availability as ProductSummary["availability"],
    stock: p.stock,
    imageUrl: firstImage ? getStorage().getUrl(firstImage, { width: 400 }) : null,
    isSample: p.sample,
  };
}

export function mapToDetail(p: Product): ProductDetail {
  return {
    ...mapToSummary(p),
    description: p.description,
    warranty: p.warranty,
    metrics: p.metrics,
    useCases: p.useCases,
  };
}

/** Ported from the prototype's `availability()` helper. */
export function resolveAvailability(p: Pick<ProductSummary, "availability" | "stock">): Availability {
  if (p.availability === "out_of_stock" || p.stock === 0) return { key: "out", label: "Out of stock" };
  if (p.availability === "preorder") return { key: "pre", label: "Pre-order" };
  if (p.availability === "in_stock" || p.stock > 0) return { key: "in", label: "In stock" };
  return { key: "unknown", label: "Ask us about availability" };
}

/** Ported from the prototype's `miniSpecs()` helper. */
export function miniSpecs(p: ProductSummary): string[] {
  const out: string[] = [];
  if (p.category === "laptop") {
    for (const key of ["RAM", "Storage", "Graphics"]) {
      const value = p.specs[key];
      if (!value) continue;
      out.push(key === "Graphics" ? value.replace(/ \(.*\)/, "") : value);
    }
  } else {
    Object.values(p.specs)
      .slice(0, 2)
      .forEach((v) => out.push(v));
  }
  return out.slice(0, 3);
}
