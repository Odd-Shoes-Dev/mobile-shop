/**
 * The shape ERI's scoring/comparison functions operate on — deliberately
 * close to the raw `Product` db row (lib/db), since this engine is meant
 * to run the same way wherever product data comes from (ported from the
 * prototype's isomorphic `ERI` module).
 */
export interface EriProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  discountPrice: number | null;
  specs: Record<string, string>;
  metrics: Record<string, unknown>;
  warranty: string | null;
  useCases: string[];
  availabilityLabel: string;
}

export type UseCase = "gaming" | "create" | "study" | "work";
