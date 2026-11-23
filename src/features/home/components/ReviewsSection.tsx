import { SectionHead } from "@/components/SectionHead";

/** Ported from the prototype's "REVIEWS" empty state. */
export function ReviewsSection() {
  return (
    <section className="sec" id="reviews">
      <div className="wrap">
        <SectionHead title="REVIEWS" blurb="Only from people who bought here." />
        <div className="empty">
          <h3>No verified reviews yet</h3>
          <p className="muted" style={{ marginTop: 8 }}>
            We won&apos;t show made-up reviews. Once customers have received an order, they can rate it and
            it will appear here with a Verified buyer label.
          </p>
        </div>
      </div>
    </section>
  );
}
