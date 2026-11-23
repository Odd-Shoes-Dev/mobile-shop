import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";
import { ProductCard } from "@/features/catalogue/components/ProductCard";
import type { ProductSummary } from "@/features/catalogue/types";

/** Ported from the prototype's "FEATURED PICKS" rail — the home page's actual gateway into /shop. */
export function FeaturedRail({ products }: { products: ProductSummary[] }) {
  return (
    <section className="sec" id="featured">
      <div className="wrap">
        <SectionHead
          title="FEATURED PICKS"
          blurb="Chosen by the ERISAF team in the admin dashboard."
          extra={
            <Link className="btn btn--sm" href="/shop">
              See everything
            </Link>
          }
        />
        <div className="rail">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
