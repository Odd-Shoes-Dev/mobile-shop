"use client";

import { useEffect, useState } from "react";
import type { CartProductInfo } from "../types";

/** Fetches the public product list client-side, for the cart drawer and checkout to resolve names/prices without every page prop-drilling the catalogue. Pass `enabled: false` to defer the fetch (e.g. until a closed panel is opened). */
export function useCatalogue(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;
  const [products, setProducts] = useState<Map<string, CartProductInfo>>(new Map());
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch("/api/catalogue")
      .then((r) => r.json())
      .then((data: { products: CartProductInfo[]; error?: string }) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        setProducts(new Map(data.products.map((p) => [p.id, p])));
      })
      .catch(() => {
        if (!cancelled) setError("Could not load products.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { products, loading, error };
}
