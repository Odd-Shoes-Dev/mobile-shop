import type { EriProduct } from "./types";

type Metrics = {
  fitsInches?: number;
  displayInches?: number;
  inputs?: string[];
  ports?: string[];
  connection?: string[];
};

export interface Compat {
  status: "ok" | "no" | "unknown";
  note: string;
}

/** Ported from the prototype's `compat()`. */
export function compat(laptop: EriProduct, acc: EriProduct): Compat {
  const L = laptop.metrics as Metrics;
  const A = acc.metrics as Metrics;

  if (acc.category === "bag" || acc.category === "cooling") {
    if (A.fitsInches != null && L.displayInches != null) {
      return A.fitsInches >= L.displayInches
        ? { status: "ok", note: `Fits laptops up to ${A.fitsInches}"; this one is ${L.displayInches}"` }
        : { status: "no", note: `Made for up to ${A.fitsInches}"; this laptop is ${L.displayInches}"` };
    }
    return { status: "unknown", note: "Size data missing for one of the two products" };
  }

  if (acc.category === "monitor") {
    if (Array.isArray(A.inputs) && Array.isArray(L.ports)) {
      const shared = A.inputs.filter((i) => L.ports!.includes(i));
      return shared.length
        ? { status: "ok", note: `Connects with a ${shared[0].toUpperCase()} cable (cable not included unless listed)` }
        : { status: "no", note: "No matching video port listed on both products" };
    }
    return { status: "unknown", note: "Port data missing for one of the two products" };
  }

  if (Array.isArray(A.connection) && Array.isArray(L.ports)) {
    const shared = A.connection.filter((i) => L.ports!.includes(i));
    return shared.length
      ? { status: "ok", note: `Connects via ${shared[0]}` }
      : { status: "no", note: `Needs ${A.connection.join(" or ")}; laptop lists ${L.ports.join(", ")}` };
  }

  return { status: "unknown", note: "Connection data not listed" };
}

/** Ported from the prototype's `accessoriesFor()`. */
export function accessoriesFor(laptop: EriProduct, catalogue: EriProduct[]): (Compat & { p: EriProduct })[] {
  return catalogue
    .filter((p) => p.category !== "laptop" && p.availabilityLabel !== "Out of stock")
    .map((p) => ({ p, ...compat(laptop, p) }));
}
