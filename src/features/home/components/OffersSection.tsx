import { SectionHead } from "@/components/SectionHead";
import { ProductCard } from "@/features/catalogue/components/ProductCard";
import type { ProductSummary } from "@/features/catalogue/types";

/** Ported from the prototype's "OFFERS" section. */
export function OffersSection({ deals }: { deals: ProductSummary[] }) {
  return (
    <section className="sec sec--g" id="offers">
      <div className="wrap">
        <SectionHead
          title="OFFERS"
          blurb="Real price drops only: the original price is always shown next to the new one."
        />
        {deals.length ? (
          <div className="grid">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <p>
              <b>No active offers right now.</b>
            </p>
            <p className="muted">When staff add a discount price in the admin dashboard, it appears here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
