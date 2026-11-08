import Link from "next/link";
import { ComparePicker } from "@/features/compare/components/ComparePicker";
import { ProductArt } from "@/components/ProductArt";
import { listProducts } from "@/lib/db";
import { ROWS, rowWinners, toEriProduct, verdict, type EriProduct } from "@/lib/eri";

// Reads searchParams and hits the database on every request — nothing
// meaningful to prerender, so skip static generation.
export const instant = false;

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const idsParam = typeof sp.ids === "string" ? sp.ids : "";
  const ids = idsParam ? idsParam.split(",").filter(Boolean).slice(0, 3) : [];

  let dbError: string | null = null;
  let rows: Awaited<ReturnType<typeof listProducts>> = [];
  try {
    rows = await listProducts();
  } catch (err) {
    dbError = err instanceof Error ? err.message : "Could not load products.";
  }

  const byId = new Map(rows.map((r) => [r.id, r]));
  const selected = ids.map((id) => byId.get(id)).filter((r): r is NonNullable<typeof r> => Boolean(r));
  const items: EriProduct[] = selected.map(toEriProduct);
  const v = items.length >= 2 ? verdict(items) : null;

  return (
    <section className="sec">
      <div className="wrap">
        <h1>WHICH ONE WINS?</h1>

        {dbError ? (
          <div className="notice">
            <p>
              <b>Database not connected yet.</b>
            </p>
            <p className="muted">
              Set <code>NEON_DATABASE_URL</code> in <code>.env.local</code> and run the migrations to
              compare real products here.
            </p>
          </div>
        ) : (
          <>
            <ComparePicker products={rows.map((r) => ({ id: r.id, name: r.name }))} ids={ids} />

            {items.length < 2 ? (
              <div className="empty">
                <h3>Pick two products</h3>
                <p className="muted">
                  Choose from the boxes above, or open a product and tap Compare on its card.
                </p>
              </div>
            ) : (
              <>
                <div className="tablewrap">
                  <table className="cmp">
                    <thead>
                      <tr>
                        <th />
                        {selected.map((p) => (
                          <th key={p.id}>
                            <ProductArt category={p.category as never} seed={p.id} alt={p.name} isSample={p.sample} />
                            <Link href={`/p/${p.id}`}>{p.name}</Link>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ROWS.map((row) => {
                        const winners = rowWinners(items, row);
                        return (
                          <tr key={row.label}>
                            <td>{row.label}</td>
                            {items.map((p) => (
                              <td key={p.id} className={winners.includes(p.id) ? "win" : ""}>
                                {row.get(p)}
                                {winners.includes(p.id) ? " (best)" : ""}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="muted" style={{ marginTop: 8 }}>
                  Highlighted cells are the best listed value in that row. Swipe sideways on a phone.
                </p>

                <h2 style={{ margin: "32px 0 6px" }}>OUR VERDICT</h2>
                <p className="muted">Calculated from the specs listed above. Missing data is never guessed.</p>
                {v ? (
                  <div className="verdict">
                    {v.map((x) => (
                      <div key={x.use} className={`v ${x.winner ? "is-win" : ""}`}>
                        <b>{x.label}</b>
                        <div>
                          <b style={{ fontSize: "1.2rem" }}>
                            {x.winner ? items.find((p) => p.id === x.winner)?.name : "Too close to call"}
                          </b>
                        </div>
                        <p style={{ marginTop: 6 }}>{x.why}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="notice">
                    Verdicts are calculated for laptops. For other products, use the table above.
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}
