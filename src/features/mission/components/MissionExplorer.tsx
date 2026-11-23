"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductCard } from "@/features/catalogue/components/ProductCard";
import type { ProductSummary } from "@/features/catalogue/types";
import { rank, reasons, type EriProduct } from "@/lib/eri";
import { AskAssistantButton } from "@/features/assistant/components/AskAssistantButton";
import { BUDGET_PRESETS, type Mission } from "../data";

const PRIORITY_OPTIONS: [string, "" | "portable" | "performance"][] = [
  ["Balanced", ""],
  ["Portable", "portable"],
  ["Performance", "performance"],
];

export function MissionExplorer({
  mission,
  summaries,
  eriProducts,
  accessories,
}: {
  mission: Mission;
  summaries: Map<string, ProductSummary>;
  eriProducts: EriProduct[];
  accessories: ProductSummary[];
}) {
  const [budget, setBudget] = useState<number | null>(null);
  const [priority, setPriority] = useState<"" | "portable" | "performance">(mission.priority ?? "");

  const list = useMemo(
    () =>
      rank(eriProducts, {
        use: mission.use,
        budget,
        priority: priority || null,
        includeOut: false,
      }).slice(0, 6),
    [eriProducts, mission.use, budget, priority]
  );

  return (
    <>
      <section className="sec">
        <div className="wrap">
          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
            <div className="notice notice--y">
              <h3>What to look for</h3>
              <ul className="why" style={{ marginTop: 8 }}>
                {mission.tips.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="tool">
              <div className="field">
                <label>Budget</label>
                <div className="row">
                  {BUDGET_PRESETS.map(([label, v]) => (
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
              <div className="field">
                <label>Lean towards</label>
                <div className="row">
                  {PRIORITY_OPTIONS.map(([label, v]) => (
                    <button
                      key={label}
                      className="chip"
                      type="button"
                      aria-pressed={priority === v}
                      onClick={() => setPriority(v)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <h2 style={{ margin: "36px 0 18px" }}>BEST MATCHES</h2>
          {list.length ? (
            <div className="grid">
              {list.map((p) => {
                const summary = summaries.get(p.id);
                return summary ? (
                  <ProductCard key={p.id} product={summary} why={reasons(p, mission.use, budget)} />
                ) : null;
              })}
            </div>
          ) : (
            <div className="empty">
              <p>
                <b>Nothing available at that budget.</b> Try a higher one.
              </p>
            </div>
          )}

          <h2 style={{ margin: "40px 0 18px" }}>GEAR FOR THIS MISSION</h2>
          <div className="rail">
            {accessories.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          <div className="row" style={{ marginTop: 24 }}>
            <Link className="btn btn--dark" href={`/setup/${mission.setup}`}>
              Build a full setup
            </Link>
            <AskAssistantButton
              label="Ask the assistant"
              message={`Which laptop is best for ${mission.use}?`}
              className="btn btn--white"
            />
          </div>
        </div>
      </section>
    </>
  );
}
