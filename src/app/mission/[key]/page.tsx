import { notFound } from "next/navigation";
import { connection } from "next/server";
import { MissionExplorer } from "@/features/mission/components/MissionExplorer";
import { MISSIONS } from "@/features/mission/data";
import { mapToSummary } from "@/features/catalogue/lib/mapToSummary";
import { listProducts } from "@/lib/db";
import { fitScore, toEriProduct, effectivePrice } from "@/lib/eri";

export const instant = false;

export default async function MissionPage({ params }: { params: Promise<{ key: string }> }) {
  // Live inventory — must not be baked into the build.
  await connection();

  const { key } = await params;
  const mission = MISSIONS[key];
  if (!mission) notFound();

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
            Set <code>NEON_DATABASE_URL</code> in <code>.env.local</code> and run the migrations to explore
            this mission against real products.
          </p>
        </div>
      </section>
    );
  }

  const summaries = new Map(rows.map((r) => [r.id, mapToSummary(r)]));
  const eriProducts = rows.map(toEriProduct);

  const accessories = rows
    .filter((r) => (mission.acc as string[]).includes(r.category) && r.availability !== "out_of_stock" && r.stock > 0)
    .map(toEriProduct)
    .sort(
      (a, b) =>
        fitScore(b, mission.use) - fitScore(a, mission.use) ||
        effectivePrice(a.price, a.discountPrice) - effectivePrice(b.price, b.discountPrice)
    )
    .slice(0, 6)
    .map((p) => summaries.get(p.id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <section className="hero" style={{ paddingBottom: 28 }}>
        <div className="wrap">
          <h1>{mission.name}</h1>
          <p style={{ fontWeight: 700, fontSize: "1.2rem", marginTop: 10 }}>{mission.tag}</p>
        </div>
      </section>
      <MissionExplorer mission={mission} summaries={summaries} eriProducts={eriProducts} accessories={accessories} />
    </>
  );
}
