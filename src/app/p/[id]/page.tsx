import Link from "next/link";
import { notFound } from "next/navigation";
import { ArtIcon } from "@/components/ArtIcon";
import { ProductCard } from "@/features/catalogue/components/ProductCard";
import { USE_CASE_NAMES, benefitsFor } from "@/features/catalogue/lib/benefits";
import { effectivePrice, formatUgx } from "@/features/catalogue/lib/format";
import { mapToDetail, mapToSummary, resolveAvailability } from "@/features/catalogue/lib/mapToSummary";
import { getProductById, listProducts } from "@/lib/db";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await getProductById(id).catch(() => undefined);
  if (!row) notFound();

  const product = mapToDetail(row);
  const availability = resolveAvailability(product);
  const out = availability.key === "out";
  const discounted = product.discountPrice != null && product.discountPrice < product.price;
  const price = effectivePrice(product.price, product.discountPrice);

  const allProducts = await listProducts().catch(() => []);
  const alternatives = allProducts
    .filter((p) => p.category === row.category && p.id !== row.id)
    .map(mapToSummary)
    .sort(
      (a, b) =>
        Math.abs(effectivePrice(a.price, a.discountPrice) - price) -
        Math.abs(effectivePrice(b.price, b.discountPrice) - price)
    )
    .slice(0, 3);

  const benefits = benefitsFor(product);

  return (
    <section className="sec">
      <div className="pdp">
        <div>
          <div className="art">
            <ArtIcon category={product.category} seed={product.id} />
            {product.isSample && <span className="tag-sample">SAMPLE ART</span>}
          </div>
        </div>
        <div>
          <Link href={`/shop?cat=${product.category}`} className="muted">
            {product.category}
          </Link>
          <h1 style={{ fontSize: "clamp(2rem,6vw,3.5rem)", margin: "6px 0 12px" }}>{product.name}</h1>
          <div className="card__meta">
            <span className={`pill ${availability.key === "in" ? "pill--in" : availability.key === "out" ? "pill--out" : ""}`}>
              {availability.label}
            </span>
            <span className="pill">{product.condition || "New"}</span>
            {product.isSample && <span className="pill">Sample listing</span>}
          </div>
          <div style={{ margin: "16px 0" }}>
            <span className="price">
              {discounted && <s>{formatUgx(product.price)}</s>}
              {formatUgx(price)}
            </span>
            {discounted && <span className="save">Save {formatUgx(product.price - price)}</span>}
          </div>
          <p>{product.description}</p>
          <div className="card__actions">
            <button className="btn" type="button" disabled={out}>
              {out ? "Out of stock" : "Add to cart"}
            </button>
            <span className="notice">WhatsApp number not set yet. Add it in config.</span>
          </div>
        </div>
      </div>

      <div className="wrap" style={{ display: "grid", gap: 36, marginTop: 40 }}>
        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: 12 }}>WHAT THIS MEANS FOR YOU</h2>
          <ul className="benefits">
            {benefits.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          {product.useCases.length > 0 && (
            <p style={{ marginTop: 14 }}>
              <b>Good for:</b> {product.useCases.map((u) => USE_CASE_NAMES[u] ?? u).join(", ")}
            </p>
          )}
        </div>

        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: 12 }}>FULL SPECIFICATIONS</h2>
          <table className="spec">
            <tbody>
              {Object.entries(product.specs).map(([k, v]) => (
                <tr key={k}>
                  <th>{k}</th>
                  <td>{v}</td>
                </tr>
              ))}
              <tr>
                <th>Warranty</th>
                <td>{product.warranty || "Not listed"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="notice notice--y">
          <h3>Delivery and warranty</h3>
          <p style={{ marginTop: 8 }}>
            <b>Delivery:</b> Not published yet. Ask on WhatsApp for confirmed delivery details.
          </p>
          <p>
            <b>Warranty:</b>{" "}
            {product.warranty || "Not published yet. Ask on WhatsApp for confirmed warranty details."}
          </p>
          <p>
            <b>Returns:</b> Not published yet. Ask on WhatsApp for confirmed returns details.
          </p>
        </div>

        {alternatives.length > 0 && (
          <div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: 12 }}>ALTERNATIVES</h2>
            <div className="grid">
              {alternatives.map((a) => (
                <ProductCard key={a.id} product={a} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: 12 }}>FAQS</h2>
          <div className="empty">
            <p className="muted">No FAQs published for this product yet. Ask the assistant or the team.</p>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "1.8rem", marginBottom: 12 }}>REVIEWS</h2>
          <div className="empty">
            <p className="muted">No verified reviews yet.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
