"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArtIcon } from "@/components/ArtIcon";
import { ProductCard } from "@/features/catalogue/components/ProductCard";
import type { ProductSummary } from "@/features/catalogue/types";
import { QUIZ, type QuizStep } from "../data";
import { rank, reasons, type EriProduct, type UseCase } from "@/lib/eri";

type Answers = Partial<Record<QuizStep["key"], string>>;

const USE_NAME: Record<string, string> = {
  gaming: "Gaming",
  create: "Creative work",
  study: "Study",
  work: "Office work",
};

export function QuizFlow({
  summaries,
  eriProducts,
  brands,
}: {
  summaries: Map<string, ProductSummary>;
  eriProducts: EriProduct[];
  brands: string[];
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});

  const current = QUIZ[step];

  const brandOptions = useMemo(
    () => ["Any", ...brands].map((b) => ({ label: b === "Any" ? "No preference" : b, value: b === "Any" ? "" : b, icon: "laptop" as const })),
    [brands]
  );

  function choose(value: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function restart() {
    setStep(0);
    setAnswers({});
  }

  if (!current) {
    const use: UseCase = (answers.focus && answers.focus !== "none" ? answers.focus : answers.for || "work") as UseCase;
    const budgetRaw = answers.budget ? Number(answers.budget) : null;
    const priority = answers.prio === "portable" || answers.prio === "performance" ? answers.prio : null;

    let list = rank(eriProducts, { use, budget: budgetRaw, priority, brand: answers.brand || null });
    let note = "";
    if (!list.length && answers.brand) {
      list = rank(eriProducts, { use, budget: budgetRaw, priority });
      note = `No ${answers.brand} laptop fits that budget, so here are the best matches from other brands.`;
    }

    const top3 = list.slice(0, 3);
    const budgetForReasons = budgetRaw && budgetRaw < 9e7 ? budgetRaw : null;

    return (
      <section className="sec sec--y sec--dots">
        <div className="quiz">
          <h1 style={{ fontSize: "clamp(2rem,7vw,4rem)" }}>YOUR MATCHES</h1>
          <p style={{ fontWeight: 700, margin: "8px 0 20px" }}>
            {USE_NAME[use] || use}
            {budgetForReasons ? `, up to UGX ${budgetForReasons.toLocaleString("en-US")}` : ""}
          </p>
          {note && <div className="notice">{note}</div>}

          {top3.length ? (
            <div className="grid">
              {top3.map((p) => {
                const summary = summaries.get(p.id);
                if (!summary) return null;
                return <ProductCard key={p.id} product={summary} why={reasons(p, use, budgetForReasons)} />;
              })}
            </div>
          ) : (
            <div className="empty">
              <p>
                <b>No laptop fits those answers.</b> Try a higher budget.
              </p>
            </div>
          )}

          <div className="row" style={{ marginTop: 20 }}>
            <button className="btn btn--white" type="button" onClick={back}>
              Change my answers
            </button>
            <button className="btn btn--dark" type="button" onClick={restart}>
              Start again
            </button>
            <Link className="btn" href={`/compare?ids=${top3.slice(0, 2).map((p) => p.id).join(",")}`}>
              Compare the top two
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const opts = current.options ?? brandOptions;

  return (
    <section className="sec sec--y sec--dots">
      <div className="quiz">
        <h1 style={{ fontSize: "clamp(1.8rem,6vw,3.2rem)" }}>LET&apos;S FIND YOUR PERFECT TECH.</h1>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={QUIZ.length}
          aria-valuenow={step + 1}
        >
          <i style={{ width: `${((step + 1) / QUIZ.length) * 100}%` }} />
        </div>
        <h2 style={{ fontSize: "clamp(1.5rem,5vw,2.4rem)", marginBottom: 16 }}>{current.question}</h2>
        <p className="muted">
          Question {step + 1} of {QUIZ.length}
        </p>
        <div className="choices">
          {opts.map((o) => (
            <button key={o.label} className="choice" type="button" onClick={() => choose(o.value)}>
              <ArtIcon category={o.icon} seed={o.label} />
              <b>{o.label}</b>
            </button>
          ))}
        </div>
        {step > 0 && (
          <div className="row" style={{ marginTop: 18 }}>
            <button className="btn btn--sm btn--white" type="button" onClick={back}>
              Back
            </button>
            <button className="btn btn--sm btn--white" type="button" onClick={restart}>
              Restart
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
