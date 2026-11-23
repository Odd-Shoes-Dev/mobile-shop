import Link from "next/link";
import { AskAssistantButton } from "@/features/assistant/components/AskAssistantButton";

/** Ported from the prototype's closing CTA section. */
export function FinalCta() {
  return (
    <section className="sec sec--k" id="final">
      <div className="wrap" style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: "clamp(2.2rem,8vw,5rem)" }}>STILL UNSURE? GOOD. ASK.</h2>
        <div className="row" style={{ justifyContent: "center", marginTop: 24 }}>
          <Link className="btn" href="/quiz">
            Take the quiz
          </Link>
          <AskAssistantButton label="Ask the assistant" message="I need help choosing a laptop" />
          <span className="notice">WhatsApp number not set yet. Add it in config.</span>
        </div>
      </div>
    </section>
  );
}
