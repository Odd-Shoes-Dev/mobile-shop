import Link from "next/link";
import { ArtIcon } from "@/components/ArtIcon";
import { SectionHead } from "@/components/SectionHead";
import { BUNDLES } from "@/lib/eri";

/** Ported from the prototype's "BUILD YOUR DREAM SETUP" tiles. */
export function SetupsSection() {
  return (
    <section className="sec sec--dots" id="setups">
      <div className="wrap">
        <SectionHead
          title="BUILD YOUR DREAM SETUP"
          blurb="Start from a bundle, swap anything, watch the total."
        />
        <div className="grid">
          {Object.values(BUNDLES).map((b) => (
            <Link
              key={b.id}
              className={`tile ${b.id === "gamer" ? "tile--k" : b.id === "creator" ? "tile--y" : ""}`}
              href={`/setup/${b.id}`}
            >
              <div className="row">
                {b.slots.slice(0, 5).map(([cat], i) => (
                  <span key={i} style={{ width: 46 }}>
                    <ArtIcon category={cat as never} seed={b.id + cat} />
                  </span>
                ))}
              </div>
              <div>
                <h3>{b.name}</h3>
                <p>{b.blurb}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
