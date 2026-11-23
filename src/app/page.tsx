import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { ArtIcon } from "@/components/ArtIcon";
import { mapToSummary } from "@/features/catalogue/lib/mapToSummary";
import { FeaturedRail } from "@/features/home/components/FeaturedRail";
import { FinalCta } from "@/features/home/components/FinalCta";
import { MissionBento } from "@/features/home/components/MissionBento";
import { OffersSection } from "@/features/home/components/OffersSection";
import { QuizTeaser } from "@/features/home/components/QuizTeaser";
import { ReviewsSection } from "@/features/home/components/ReviewsSection";
import { SetupsSection } from "@/features/home/components/SetupsSection";
import { Ticker } from "@/features/home/components/Ticker";
import { ToolTeaser } from "@/features/home/components/ToolTeaser";
import { listProducts } from "@/lib/db";

export const instant = false;

export default async function Home() {
  // Live inventory for the featured/offers rails — must not be baked into the build.
  await connection();

  let featured: ReturnType<typeof mapToSummary>[] = [];
  let deals: ReturnType<typeof mapToSummary>[] = [];
  try {
    const rows = await listProducts();
    const summaries = rows.map(mapToSummary);
    const laptops = summaries.filter((p) => p.category === "laptop" && p.availability !== "out_of_stock");
    const flaggedFeatured = rows.filter((r) => r.featured).map(mapToSummary);
    featured = (flaggedFeatured.length ? flaggedFeatured : laptops).slice(0, 8);
    deals = summaries.filter((p) => p.discountPrice != null && p.discountPrice < p.price);
  } catch {
    // No database configured yet — home page still renders, just without live rails.
  }

  return (
    <>
      <section className="hero">
        <div className="hero__grid">
          <div>
            <h1>
              <span className="hl1">GOOD TECH.</span>
              <br />
              <span className="hl2">BETTER DECISIONS.</span>
              <br />
              <span className="hl3">ZERO GUESSWORK.</span>
            </h1>
            <div className="hero__cta">
              <Link className="btn" href="/quiz">
                Find my perfect laptop
              </Link>
              <Link className="btn btn--white" href="/compare">
                Compare laptops
              </Link>
              <Link className="btn btn--white" href="/budget">
                Shop by budget
              </Link>
              <Link className="btn btn--dark" href="/setup/student">
                Build my setup
              </Link>
            </div>
            <p style={{ fontWeight: 700, maxWidth: "44ch" }}>
              Don&apos;t know what the specs mean? Good. Pick a mission and we&apos;ll do the translating.
            </p>
          </div>
          <div className="hero__art">
            <div className="bubble s1">New to specs? Start with a mission.</div>
            <div className="big">
              <ArtIcon category="laptop" seed="hero" />
            </div>
            <Image
              className="mini m1 mascot"
              src="/images/mascot-hero.jpg"
              alt="ERISAF mascot in sunglasses"
              width={335}
              height={273}
            />
            <div className="mini m2">
              <ArtIcon category="mouse" seed="hero2" />
            </div>
            <div className="burst s2">UGX prices. No fake sales.</div>
          </div>
        </div>
      </section>

      <Ticker />
      <MissionBento />

      <ToolTeaser
        id="finder"
        className="sec--y sec--dots"
        title="FIND YOUR PERFECT LAPTOP"
        blurb="Two taps. Real products from this catalogue, with reasons."
        cta="Start the finder"
        href="/quiz"
      />

      <ToolTeaser
        id="vs"
        className="sec--g"
        title="WHICH ONE WINS?"
        blurb="Pick two laptops. The verdict is calculated from the specs the store has listed."
        cta="Compare laptops"
        href="/compare"
      />

      <FeaturedRail products={featured} />

      <ToolTeaser
        id="budgetHome"
        className="sec--k"
        title="SHOP BY BUDGET"
        blurb="Drag to your number."
        cta="Open the budget tool"
        href="/budget"
      />

      <SetupsSection />
      <QuizTeaser />
      <ReviewsSection />
      <OffersSection deals={deals} />
      <FinalCta />
    </>
  );
}
