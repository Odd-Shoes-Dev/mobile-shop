import Image from "next/image";
import Link from "next/link";
import { ArtIcon } from "@/components/ArtIcon";

export default function Home() {
  return (
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
            Don&apos;t know what the specs mean? Good. Pick a mission and we&apos;ll do the
            translating.
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
  );
}
