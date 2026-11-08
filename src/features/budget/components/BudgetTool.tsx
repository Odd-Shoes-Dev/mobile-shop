"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/features/catalogue/components/ProductCard";
import type { ProductSummary } from "@/features/catalogue/types";
import { effectivePrice, formatUgx, rank, reasons, type EriProduct, type UseCase } from "@/lib/eri";

const USE_NAME: Record<UseCase, string> = {
  gaming: "Gaming",
  create: "Creative work",
  study: "Study",
  work: "Office work",
};

const USES: UseCase[] = ["gaming", "create", "study", "work"];

/** Ported from the prototype's `pageBudget()` / `bindBudget()`. */
export function BudgetTool({
  summaries,
  eriProducts,
}: {
  summaries: Map<string, ProductSummary>;
  eriProducts: EriProduct[];
}) {
  const [v, setV] = useState(2_500_000);
  const [use, setUse] = useState<UseCase>("work");

  const { list, top, left, accessories } = useMemo(() => {
    const ranked = rank(eriProducts, { use, budget: v }).slice(0, 4);
    const topItem = ranked[0];
    const leftover = topItem ? v - effectivePrice(topItem.price, topItem.discountPrice) : v;
    const accs = eriProducts
      .filter((p) => p.category !== "laptop" && p.availabilityLabel !== "Out of stock")
      .filter((p) => effectivePrice(p.price, p.discountPrice) <= Math.max(leftover, 0))
      .sort((a, b) => effectivePrice(b.price, b.discountPrice) - effectivePrice(a.price, a.discountPrice))
      .slice(0, 6);
    return { list: ranked, top: topItem, left: leftover, accessories: accs };
  }, [eriProducts, use, v]);

  return (
    <section className="sec sec--y sec--dots">
      <div className="wrap">
        <h1>SHOP BY BUDGET</h1>
        <div className="tool" style={{ marginTop: 20 }}>
          <div className="bigbudget">{formatUgx(v)}</div>
          <label className="sr" htmlFor="bRange">
            Budget
          </label>
          <input
            id="bRange"
            type="range"
            min={300_000}
            max={6_000_000}
            step={50_000}
            value={v}
            onChange={(e) => setV(Number(e.target.value))}
          />
          <div className="row" style={{ marginTop: 10 }}>
            {USES.map((u) => (
              <button
                key={u}
                className="chip"
                type="button"
                aria-pressed={u === use}
                onClick={() => setUse(u)}
              >
                {USE_NAME[u]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 14 }}>LAPTOPS YOU CAN AFFORD</h2>
          {list.length ? (
            <div className="grid">
              {list.map((p) => {
                const summary = summaries.get(p.id);
                if (!summary) return null;
                return <ProductCard key={p.id} product={summary} why={reasons(p, use, v)} />;
              })}
            </div>
          ) : (
            <div className="empty">
              <p>
                <b>No available laptop at this budget.</b> Try moving the slider up.
              </p>
            </div>
          )}

          {top && (
            <>
              <h2 style={{ margin: "30px 0 6px" }}>WITH THE {formatUgx(left)} LEFT</h2>
              <p className="muted">
                If you pick {summaries.get(top.id)?.name ?? top.name}.
              </p>
              <div className="rail">
                {accessories.length ? (
                  accessories.map((p) => {
                    const summary = summaries.get(p.id);
                    return summary ? <ProductCard key={p.id} product={summary} /> : null;
                  })
                ) : (
                  <div className="empty">Nothing fits in the leftover amount.</div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
