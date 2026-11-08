import Link from "next/link";
import { ProductCard } from "@/features/catalogue/components/ProductCard";
import { mapToSummary } from "@/features/catalogue/lib/mapToSummary";
import { effectivePrice } from "@/features/catalogue/lib/format";
import { listProducts } from "@/lib/db";

// This page reads searchParams and hits the database on every request —
// there's nothing meaningful to prerender, so skip static generation.
export const instant = false;

const SORTS = [
  { value: "rec", label: "Recommended" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
] as const;

function buildLink(params: { cat: string; q: string; sort: string }, overrides: Partial<typeof params>) {
  const merged = { ...params, ...overrides };
  const search = new URLSearchParams({ cat: merged.cat, q: merged.q, sort: merged.sort });
  return `/shop?${search.toString()}`;
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const cat = typeof sp.cat === "string" ? sp.cat : "all";
  const term = typeof sp.q === "string" ? sp.q : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "rec";

  let dbError: string | null = null;
  let summaries: ReturnType<typeof mapToSummary>[] = [];
  try {
    const products = await listProducts();
    summaries = products.map(mapToSummary);
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Could not load products.";
  }

  const categories = ["all", ...Array.from(new Set(summaries.map((p) => p.category)))];

  let list = summaries;
  if (term) {
    const needle = term.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.brand.toLowerCase().includes(needle) ||
        p.category.toLowerCase().includes(needle)
    );
  }
  if (cat !== "all") list = list.filter((p) => p.category === cat);
  if (sort === "low") list = [...list].sort((a, b) => effectivePrice(a.price, a.discountPrice) - effectivePrice(b.price, b.discountPrice));
  if (sort === "high") list = [...list].sort((a, b) => effectivePrice(b.price, b.discountPrice) - effectivePrice(a.price, a.discountPrice));

  const params = { cat, q: term, sort };

  return (
    <section className="sec">
      <div className="wrap">
        <h1 style={{ fontSize: "clamp(2rem,7vw,4rem)" }}>
          {term ? `RESULTS FOR "${term.toUpperCase()}"` : "ALL TECH"}
        </h1>

        <div className="row" style={{ margin: "18px 0" }}>
          {categories.map((c) => (
            <Link
              key={c}
              className={`chip ${c === cat ? "on" : ""}`}
              href={buildLink(params, { cat: c })}
              style={{ textDecoration: "none" }}
            >
              {c === "all" ? "All" : c}
            </Link>
          ))}
          <span style={{ marginLeft: "auto" }} />
          {SORTS.map((s) => (
            <Link
              key={s.value}
              className={`chip ${sort === s.value ? "on" : ""}`}
              href={buildLink(params, { sort: s.value })}
              style={{ textDecoration: "none" }}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {dbError ? (
          <div className="notice">
            <p>
              <b>Database not connected yet.</b>
            </p>
            <p className="muted">
              Set <code>NEON_DATABASE_URL</code> in <code>.env.local</code> and run the migrations in{" "}
              <code>neon-database/migrations</code> to see real products here.
            </p>
          </div>
        ) : list.length ? (
          <div className="grid">
            {list.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <p>
              <b>No products match.</b>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
