"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArtIcon, type ArtCategory } from "@/components/ArtIcon";
import { ProductArt } from "@/components/ProductArt";
import { useCart } from "@/features/cart/context/CartContext";
import type { ProductSummary } from "@/features/catalogue/types";
import {
  compat,
  effectivePrice,
  fitScore,
  formatUgx,
  setupDefaults,
  type Bundle,
  type EriProduct,
} from "@/lib/eri";

const BUDGET_OPTIONS: [string, number | ""][] = [
  ["No limit", ""],
  ["UGX 2.5M", 2_500_000],
  ["UGX 4M", 4_000_000],
  ["UGX 6M", 6_000_000],
  ["UGX 8M", 8_000_000],
];

export function SetupBuilder({
  bundleKey,
  bundle,
  allBundles,
  summaries,
  eriProducts,
}: {
  bundleKey: string;
  bundle: Bundle;
  allBundles: [string, Bundle][];
  summaries: Map<string, ProductSummary>;
  eriProducts: EriProduct[];
}) {
  const [budget, setBudget] = useState<number | "">("");
  const [sel, setSel] = useState<Record<number, string | null>>(() => setupDefaults(bundle, null, eriProducts));
  const { addItem } = useCart();

  const byId = useMemo(() => new Map(eriProducts.map((p) => [p.id, p])), [eriProducts]);
  const chosen = bundle.slots.map((_, i) => (sel[i] ? byId.get(sel[i]!) : undefined));
  const laptop = chosen[0];
  const total = chosen.reduce((a, p) => a + (p ? effectivePrice(p.price, p.discountPrice) : 0), 0);

  const upgrades = useMemo(() => {
    if (!budget) return [];
    const out: { i: number; cur: EriProduct; better: EriProduct }[] = [];
    bundle.slots.forEach(([cat], i) => {
      const cur = chosen[i];
      if (!cur) return;
      const better = eriProducts
        .filter(
          (p) =>
            p.category === cat &&
            p.availabilityLabel !== "Out of stock" &&
            effectivePrice(p.price, p.discountPrice) > effectivePrice(cur.price, cur.discountPrice) &&
            fitScore(p, bundle.use) > fitScore(cur, bundle.use) &&
            total + effectivePrice(p.price, p.discountPrice) - effectivePrice(cur.price, cur.discountPrice) <= budget
        )
        .sort((a, b) => fitScore(b, bundle.use) - fitScore(a, bundle.use))[0];
      if (better) out.push({ i, cur, better });
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `chosen`/`total` are derived fresh each render from `sel`
  }, [budget, bundle, eriProducts, sel]);

  return (
    <section className="sec sec--dots">
      <div className="wrap">
        <h1>BUILD MY SETUP</h1>
        <div className="row" style={{ margin: "16px 0" }}>
          {allBundles.map(([key, b]) => (
            <Link key={key} className={`chip ${key === bundleKey ? "on" : ""}`} href={`/setup/${key}`} style={{ textDecoration: "none" }}>
              {b.name}
            </Link>
          ))}
        </div>
        <p style={{ fontWeight: 700 }}>{bundle.blurb}</p>

        <div className="tool" style={{ margin: "16px 0" }}>
          <div className="field">
            <label>Budget for the whole setup (optional)</label>
            <div className="row">
              {BUDGET_OPTIONS.map(([label, v]) => (
                <button
                  key={label}
                  className="chip"
                  type="button"
                  aria-pressed={budget === v}
                  onClick={() => setBudget(v)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {bundle.slots.map(([cat, label], i) => {
            const pool = eriProducts
              .filter((p) => p.category === cat && p.availabilityLabel !== "Out of stock")
              .sort((a, b) => effectivePrice(a.price, a.discountPrice) - effectivePrice(b.price, b.discountPrice));
            const p = chosen[i];
            const c = p && laptop && i > 0 ? compat(laptop, p) : null;
            const summary = p ? summaries.get(p.id) : undefined;

            return (
              <div className="slot" key={i}>
                {summary ? (
                  <ProductArt category={summary.category} seed={summary.id} imageUrl={summary.imageUrl} alt={summary.name} isSample={summary.isSample} />
                ) : (
                  <div className="art">
                    <ArtIcon category={cat as ArtCategory} seed="e" />
                  </div>
                )}
                <div>
                  <b>{label}</b>
                  <select
                    className="sel"
                    aria-label={label}
                    value={p?.id ?? ""}
                    onChange={(e) => setSel((prev) => ({ ...prev, [i]: e.target.value || null }))}
                  >
                    <option value="">Skip this</option>
                    {pool.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}: {formatUgx(effectivePrice(x.price, x.discountPrice))}
                      </option>
                    ))}
                  </select>
                  {p ? (
                    <div style={{ marginTop: 6 }} className="price">
                      {formatUgx(effectivePrice(p.price, p.discountPrice))}
                    </div>
                  ) : (
                    <p className="muted">Nothing chosen.</p>
                  )}
                  {c && (
                    <div className={`compat ${c.status}`}>
                      <span className={`dot ${c.status}`} />
                      {c.status === "ok" ? "Compatible" : c.status === "no" ? "Problem" : "Not confirmed"}: {c.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {upgrades.length > 0 && (
          <>
            <h2 style={{ margin: "28px 0 12px", fontSize: "1.6rem" }}>UPGRADES WITHIN YOUR BUDGET</h2>
            <div className="grid">
              {upgrades.slice(0, 3).map((u) => (
                <div className="notice" key={u.i}>
                  <b>{u.cur.name}</b> to <b>{u.better.name}</b>
                  <p>+{formatUgx(effectivePrice(u.better.price, u.better.discountPrice) - effectivePrice(u.cur.price, u.cur.discountPrice))}</p>
                  <button
                    className="btn btn--sm"
                    type="button"
                    onClick={() => setSel((prev) => ({ ...prev, [u.i]: u.better.id }))}
                  >
                    Swap it in
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {budget !== "" && total > budget && (
          <div className="notice" style={{ marginTop: 16 }}>
            <b>Over budget by {formatUgx(total - budget)}.</b> Swap something to a cheaper option.
          </div>
        )}

        <div className="totalbar" style={{ marginTop: 24 }}>
          <div>
            <small>Running total</small>
            <div className="price">{formatUgx(total)}</div>
          </div>
          <button
            className="btn"
            type="button"
            disabled={!chosen.some(Boolean)}
            onClick={() => chosen.forEach((p) => p && addItem(p.id))}
          >
            Add bundle to cart
          </button>
        </div>
      </div>
    </section>
  );
}

