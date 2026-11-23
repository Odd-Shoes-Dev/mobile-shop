import Link from "next/link";
import { ArtIcon } from "@/components/ArtIcon";
import { SectionHead } from "@/components/SectionHead";
import { MISSIONS } from "@/features/mission/data";

const ORDER = ["game", "study", "create", "work"];

/** Ported from the prototype's "PICK A MISSION" bento grid in pageHome(). */
export function MissionBento() {
  return (
    <section className="sec" id="missions">
      <div className="wrap">
        <SectionHead
          title="PICK A MISSION"
          blurb="Each one opens a shortlist built for that kind of life, not a category page."
        />
        <div className="bento">
          {ORDER.map((key, i) => {
            const m = MISSIONS[key];
            return (
              <Link key={key} className={`tile ${m.cls} ${i < 2 ? "big" : "w3"}`} href={`/mission/${key}`}>
                <div>
                  <ArtIcon category={m.icon} seed={key} />
                </div>
                <div>
                  <h3>{m.name}</h3>
                  <p>{m.tag}</p>
                </div>
              </Link>
            );
          })}
          <Link className="tile tile--k w3" href="/setup/student">
            <div>
              <ArtIcon category="monitor" seed="setup" />
            </div>
            <div>
              <h3>BUILD MY SETUP</h3>
              <p>Laptop, mouse, bag and more in one total.</p>
            </div>
          </Link>
          <Link className="tile tile--y w3" href="/budget">
            <div>
              <ArtIcon category="storage" seed="budget" />
            </div>
            <div>
              <h3>SHOP BY BUDGET</h3>
              <p>Tell us the money. We&apos;ll show what it buys.</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
