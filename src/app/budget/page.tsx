import { connection } from "next/server";
import { BudgetTool } from "@/features/budget/components/BudgetTool";
import { mapToSummary } from "@/features/catalogue/lib/mapToSummary";
import { listProducts } from "@/lib/db";
import { toEriProduct } from "@/lib/eri";

export const instant = false;

export default async function BudgetPage() {
  // Live inventory and prices — must not be baked into the build.
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
            Set <code>NEON_DATABASE_URL</code> in <code>.env.local</code> and run the migrations to shop
            by budget against real products.
          </p>
        </div>
      </section>
    );
  }

  const summaries = new Map(rows.map((r) => [r.id, mapToSummary(r)]));
  const eriProducts = rows.map(toEriProduct);

  return <BudgetTool summaries={summaries} eriProducts={eriProducts} />;
}
