const WORDS = ["GAME", "STUDY", "CREATE", "WORK", "BUILD", "COMPARE", "SAVE"];

/** Ported from the prototype's `ticker` — repeated 4x so the CSS translateX(-50%) loop has no visible seam. */
export function Ticker() {
  const group = (
    <>
      {WORDS.map((w, i) => (
        <span key={i}>{w}</span>
      ))}
    </>
  );
  return (
    <div className="ticker" aria-hidden="true">
      <div>
        {group}
        {group}
        {group}
        {group}
      </div>
    </div>
  );
}
