import { connection } from "next/server";
import { QuizFlow } from "@/features/quiz/components/QuizFlow";
import { mapToSummary } from "@/features/catalogue/lib/mapToSummary";
import { listProducts } from "@/lib/db";
import { toEriProduct } from "@/lib/eri";

export const instant = false;

export default async function QuizPage() {
  // Forces a dynamic render — this page reads live inventory on every
  // request and must never be baked into the build as a static shell.
  await connection();

  let dbError: string | null = null;
  let rows: Awaited<ReturnType<typeof listProducts>> = [];
  try {
    rows = await listProducts();
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Could not load products.";
  }

  if (dbError) {
    return (
      <section className="sec">
        <div className="wrap notice">
          <p>
            <b>Database not connected yet.</b>
          </p>
          <p className="muted">
            Set <code>NEON_DATABASE_URL</code> in <code>.env.local</code> and run the migrations to take
            the quiz against real products.
          </p>
        </div>
      </section>
    );
  }

  const summaries = new Map(rows.map((r) => [r.id, mapToSummary(r)]));
  const eriProducts = rows.map(toEriProduct);
  const brands = Array.from(new Set(rows.filter((r) => r.category === "laptop").map((r) => r.brand)));

  return <QuizFlow summaries={summaries} eriProducts={eriProducts} brands={brands} />;
}
