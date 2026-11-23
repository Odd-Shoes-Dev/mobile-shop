import Link from "next/link";
import { SectionHead } from "@/components/SectionHead";

/**
 * Simplified stand-in for the prototype's inline home-page tools (the
 * laptop finder, the laptop-vs-laptop picker, and the budget slider),
 * which duplicated full logic already built as dedicated pages
 * (/quiz, /compare, /budget). Rather than maintain that scoring logic in
 * two places, this links straight to the real page.
 */
export function ToolTeaser({
  id,
  className,
  title,
  blurb,
  cta,
  href,
}: {
  id: string;
  className?: string;
  title: string;
  blurb: string;
  cta: string;
  href: string;
}) {
  return (
    <section className={`sec ${className ?? ""}`} id={id}>
      <div className="wrap">
        <SectionHead title={title} blurb={blurb} />
        <Link className="btn" href={href}>
          {cta}
        </Link>
      </div>
    </section>
  );
}
