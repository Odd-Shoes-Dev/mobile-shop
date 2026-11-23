import Link from "next/link";
import { ArtIcon, type ArtCategory } from "@/components/ArtIcon";

const ICONS: ArtCategory[] = ["laptop", "headphones", "mouse", "bag"];

/** Ported from the prototype's quiz teaser banner. */
export function QuizTeaser() {
  return (
    <section className="sec sec--y" id="quizTeaser">
      <div
        className="wrap"
        style={{
          display: "grid",
          gap: 20,
          alignItems: "center",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
        }}
      >
        <div>
          <h2>LET&apos;S FIND YOUR PERFECT TECH.</h2>
          <p style={{ marginTop: 12, fontWeight: 700 }}>
            Five quick questions with big buttons. You can change any answer.
          </p>
          <Link className="btn btn--dark" href="/quiz">
            Start the quiz
          </Link>
        </div>
        <div className="row">
          {ICONS.map((c) => (
            <span key={c} style={{ width: 120 }}>
              <ArtIcon category={c} seed={`q${c}`} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
