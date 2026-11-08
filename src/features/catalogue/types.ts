import type { ArtCategory } from "@/components/ArtIcon";

/**
 * What the catalogue UI needs, independent of the db row shape. The page
 * that fetches from lib/db maps `Product` rows into this — if the schema
 * changes, only that mapper changes, not every component.
 */
export interface ProductSummary {
  id: string;
  name: string;
  brand: string;
  category: ArtCategory;
  condition: string;
  price: number;
  discountPrice: number | null;
  specs: Record<string, string>;
  availability: "in_stock" | "out_of_stock" | "preorder" | "unknown";
  stock: number;
  imageUrl: string | null;
  isSample: boolean;
}

export type Availability = {
  key: "in" | "out" | "pre" | "unknown";
  label: string;
};

/** Everything the product detail page needs, beyond what a card shows. */
export interface ProductDetail extends ProductSummary {
  description: string;
  warranty: string | null;
  metrics: Record<string, unknown>;
  useCases: string[];
}
