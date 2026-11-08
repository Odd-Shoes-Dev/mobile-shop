import { notFound } from "next/navigation";
import { connection } from "next/server";
import { SetupBuilder } from "@/features/setup/components/SetupBuilder";
import { mapToSummary } from "@/features/catalogue/lib/mapToSummary";
import { listProducts } from "@/lib/db";
import { BUNDLES, toEriProduct } from "@/lib/eri";

export const instant = false;

export default async function SetupPage({ params }: { params: Promise<{ key: string }> }) {
  // Live inventory and prices — must not be baked into the build.
  await connection();

  const { key } = await params;
  const bundle = BUNDLES[key];
  if (!bundle) notFound();

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
            Set <code>NEON_DATABASE_URL</code> in <code>.env.local</code> and run the migrations to build
            a setup against real products.
          </p>
        </div>
      </section>
    );
  }

  const summaries = new Map(rows.map((r) => [r.id, mapToSummary(r)]));
  const eriProducts = rows.map(toEriProduct);

  return (
    <SetupBuilder
      bundleKey={key}
      bundle={bundle}
      allBundles={Object.entries(BUNDLES)}
      summaries={summaries}
      eriProducts={eriProducts}
    />
  );
}
