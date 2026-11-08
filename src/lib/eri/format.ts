/** Ported from the prototype's `has`/`fmt`/`priceOf`/`clip` helpers. */

export function hasValue(v: unknown): v is number {
  return v !== null && v !== undefined && !Number.isNaN(v as number);
}

export function formatUgx(n: number | null | undefined): string {
  return hasValue(n) ? "UGX " + Math.round(n).toLocaleString("en-US") : "Not listed";
}

export function effectivePrice(price: number, discountPrice: number | null): number {
  return hasValue(discountPrice) && discountPrice < price ? discountPrice : price;
}

export function clip(x: number, a = 0, b = 1): number {
  return Math.max(a, Math.min(b, x));
}
