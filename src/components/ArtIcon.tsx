const STROKE = {
  stroke: "#000",
  strokeWidth: 5,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

const FILLS = ["#FFD400", "#FFFFFF", "#E6E6E1"] as const;

/**
 * Hand-ported from the prototype's FILLS array + artSvg() seed hash
 * (shop_prototype.html, lines 705 & 713) — picks the same fill color the
 * original would for a given seed string (e.g. a product id).
 */
export function fillFor(seed: string): string {
  const sum = [...seed].reduce((a, c) => a + c.charCodeAt(0), 0);
  return FILLS[sum % 3];
}

export type ArtCategory =
  | "laptop"
  | "mouse"
  | "keyboard"
  | "headphones"
  | "monitor"
  | "bag"
  | "storage"
  | "cooling";

/**
 * Hand-ported from the prototype's artSvg() helper (shop_prototype.html,
 * line 712) — same path data per category, fill picked by fillFor(seed).
 */
export function ArtIcon({ category, seed = "x" }: { category: ArtCategory; seed?: string }) {
  const f = fillFor(seed);
  const label = `${category} illustration`;

  switch (category) {
    case "laptop":
      return (
        <svg viewBox="0 0 200 140" role="img" aria-label={label}>
          <rect x="40" y="18" width="120" height="78" rx="8" fill="#000" {...STROKE} />
          <rect x="48" y="26" width="104" height="62" rx="3" fill={f} />
          <circle cx="82" cy="52" r="5" fill="#000" />
          <circle cx="118" cy="52" r="5" fill="#000" />
          <path d="M84 68q16 10 32 0" fill="none" {...STROKE} />
          <path d="M18 108h164l-10 16H28z" fill="#E6E6E1" {...STROKE} />
        </svg>
      );
    case "mouse":
      return (
        <svg viewBox="0 0 200 140" role="img" aria-label={label}>
          <rect x="66" y="12" width="68" height="112" rx="34" fill={f} {...STROKE} />
          <path d="M100 12v44M66 56h68" fill="none" {...STROKE} />
        </svg>
      );
    case "keyboard":
      return (
        <svg viewBox="0 0 200 140" role="img" aria-label={label}>
          <rect x="14" y="38" width="172" height="70" rx="10" fill={f} {...STROKE} />
          {[0, 1, 2].flatMap((r) =>
            [0, 1, 2, 3, 4, 5, 6].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={26 + c * 21}
                y={50 + r * 18}
                width="14"
                height="10"
                rx="2"
                fill="#000"
              />
            ))
          )}
        </svg>
      );
    case "headphones":
      return (
        <svg viewBox="0 0 200 140" role="img" aria-label={label}>
          <path d="M44 84V68a56 56 0 0 1 112 0v16" fill="none" {...STROKE} />
          <rect x="30" y="76" width="30" height="48" rx="12" fill={f} {...STROKE} />
          <rect x="140" y="76" width="30" height="48" rx="12" fill={f} {...STROKE} />
        </svg>
      );
    case "monitor":
      return (
        <svg viewBox="0 0 200 140" role="img" aria-label={label}>
          <rect x="20" y="14" width="160" height="96" rx="8" fill="#000" {...STROKE} />
          <rect x="28" y="22" width="144" height="80" rx="3" fill={f} />
          <path d="M100 110v16M70 128h60" fill="none" {...STROKE} />
        </svg>
      );
    case "bag":
      return (
        <svg viewBox="0 0 200 140" role="img" aria-label={label}>
          <rect x="48" y="30" width="104" height="100" rx="26" fill={f} {...STROKE} />
          <path d="M76 30v-8a24 24 0 0 1 48 0v8" fill="none" {...STROKE} />
          <rect x="70" y="84" width="60" height="30" rx="8" fill="#E6E6E1" {...STROKE} />
        </svg>
      );
    case "storage":
      return (
        <svg viewBox="0 0 200 140" role="img" aria-label={label}>
          <rect x="40" y="30" width="120" height="84" rx="14" fill={f} {...STROKE} />
          <circle cx="138" cy="94" r="6" fill="#000" />
          <path d="M58 52h52" fill="none" {...STROKE} />
        </svg>
      );
    case "cooling":
      return (
        <svg viewBox="0 0 200 140" role="img" aria-label={label}>
          <path d="M24 114L50 28h100l26 86z" fill={f} {...STROKE} />
          <circle cx="80" cy="76" r="16" fill="#E6E6E1" {...STROKE} />
          <circle cx="120" cy="76" r="16" fill="#E6E6E1" {...STROKE} />
        </svg>
      );
  }
}
