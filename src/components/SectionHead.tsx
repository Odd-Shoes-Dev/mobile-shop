import type { ReactNode } from "react";

/** Ported from the prototype's `secHead()`. */
export function SectionHead({ title, blurb, extra }: { title: string; blurb?: string; extra?: ReactNode }) {
  return (
    <div className="sec__head">
      <h2>{title}</h2>
      {blurb && <p>{blurb}</p>}
      {extra}
    </div>
  );
}
