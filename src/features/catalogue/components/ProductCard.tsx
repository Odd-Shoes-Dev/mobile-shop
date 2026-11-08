import Image from "next/image";
import Link from "next/link";
import { ArtIcon } from "@/components/ArtIcon";
import { effectivePrice, formatUgx } from "../lib/format";
import { miniSpecs, resolveAvailability } from "../lib/mapToSummary";
import type { ProductSummary } from "../types";

/** Ported from the prototype's `cardHtml()` / `art()` / `priceHtml()` / `availPill()`. */
export function ProductCard({ product }: { product: ProductSummary }) {
  const availability = resolveAvailability(product);
  const out = availability.key === "out";
  const specs = miniSpecs(product);
  const discounted =
    product.discountPrice != null && product.discountPrice < product.price;
  const price = effectivePrice(product.price, product.discountPrice);

  return (
    <article className="card">
      <div className="art">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill style={{ objectFit: "contain" }} />
        ) : (
          <ArtIcon category={product.category} seed={product.id} />
        )}
        {product.isSample && <span className="tag-sample">SAMPLE ART</span>}
      </div>

      <div className="card__meta">
        <span className={`pill ${availability.key === "in" ? "pill--in" : availability.key === "out" ? "pill--out" : ""}`}>
          {availability.label}
        </span>
        <span className="pill">{product.condition || "New"}</span>
      </div>

      <h3>
        <Link href={`/p/${product.id}`}>{product.name}</Link>
      </h3>

      {specs.length > 0 && (
        <ul className="specs-mini">
          {specs.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}

      <div>
        <span className="price">
          {discounted && <s>{formatUgx(product.price)}</s>}
          {formatUgx(price)}
        </span>
        {discounted && <span className="save">Save {formatUgx(product.price - price)}</span>}
      </div>

      <div className="card__actions">
        <button className="btn btn--sm" type="button" disabled={out}>
          {out ? "Unavailable" : "Add to cart"}
        </button>
        {product.category === "laptop" && (
          <button className="chip" type="button" aria-pressed="false">
            Compare
          </button>
        )}
      </div>
    </article>
  );
}
