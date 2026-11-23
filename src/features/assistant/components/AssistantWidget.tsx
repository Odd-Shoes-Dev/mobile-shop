"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useCatalogue } from "@/features/cart/hooks/useCatalogue";
import { AssistantCard, type AssistantCardData } from "./AssistantCard";
import { OPEN_ASSISTANT_EVENT, type OpenAssistantDetail } from "./AskAssistantButton";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  typing?: boolean;
  cards?: AssistantCardData[];
  chips?: string[];
  compareIds?: string[];
  fallback?: boolean;
}

const DEFAULT_CHIPS = [
  "Laptop for video editing under 2 million",
  "HP Victus vs HP Pavilion",
  "How long is delivery?",
];
const PRODUCT_PAGE_CHIPS = ["Is this right for me?", "What else do I need?", "How is the battery?"];

export function AssistantWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const productMatch = pathname.match(/^\/p\/(.+)$/);
  const openProductId = productMatch ? decodeURIComponent(productMatch[1]) : null;
  const { products } = useCatalogue({ enabled: isOpen });
  const openProductName = openProductId ? products.get(openProductId)?.name : undefined;

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const container = logRef.current;
    const last = messages[messages.length - 1];
    if (!container || !last) return;
    if (last.role === "assistant" && !last.typing) {
      // A long reply (plus product cards) would otherwise land scrolled to
      // its end, forcing a scroll back up just to start reading it — show
      // its start instead of the container's absolute bottom. scrollIntoView
      // (rather than computing offsetTop by hand) scrolls the nearest
      // scrollable ancestor correctly regardless of the panel's own
      // position: fixed, which otherwise throws off offset-based math.
      const lastEl = container.lastElementChild as HTMLElement | null;
      lastEl?.scrollIntoView({ block: "start" });
    } else {
      // Sending a message or waiting on the typing indicator: keep the
      // usual chat behavior of following the bottom.
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const sendRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    function onOpenRequest(e: Event) {
      setIsOpen(true);
      const detail = (e as CustomEvent<OpenAssistantDetail>).detail;
      if (detail?.message) sendRef.current(detail.message);
    }
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpenRequest);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpenRequest);
  }, []);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const history = messages.filter((m) => !m.typing).map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, { role: "user", content: trimmed }, { role: "assistant", content: "", typing: true }]);
    setInput("");

    const lastCompareIds = [...messages].reverse().find((m) => m.compareIds?.length)?.compareIds ?? [];

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          context: { productId: openProductId, compareIds: lastCompareIds },
        }),
      });
      const data = await res.json();
      setMode(data.mode === "live" ? "live" : "demo");
      setMessages((prev) => [
        ...prev.slice(0, -1),
        res.ok
          ? {
              role: "assistant",
              content: data.reply,
              cards: data.cards,
              chips: data.chips,
              compareIds: data.compareIds,
              fallback: data.fallback,
            }
          : { role: "assistant", content: data.error || "Something went wrong. Try again." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "I could not reach the shop server. Check your connection and try again." },
      ]);
    }
  }

  useEffect(() => {
    sendRef.current = send;
  });

  if (!isOpen) {
    return (
      <button type="button" className="fab" aria-label="Ask the shopping assistant" onClick={() => setIsOpen(true)}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path d="M4 4h16v12H9l-5 4z" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
        <span>Ask</span>
      </button>
    );
  }

  const last = [...messages].reverse().find((m) => m.role === "assistant" && !m.typing);
  const chips = last?.chips?.length ? last.chips : messages.length ? [] : openProductId ? PRODUCT_PAGE_CHIPS : DEFAULT_CHIPS;

  return (
    <>
      <div className="scrim" onClick={() => setIsOpen(false)} />
      <section className="panel" aria-label="Shopping assistant">
        <header className="panel__head">
          <div>
            <b>Shopping assistant</b>
            <div className={`modebadge ${mode === "demo" ? "demo" : ""}`}>
              {mode === "demo" ? "DEMO MODE: keyword matching, not AI" : "AI: Claude"}
            </div>
          </div>
          <button className="x" type="button" aria-label="Close assistant" onClick={() => setIsOpen(false)}>
            &times;
          </button>
        </header>

        {openProductId && <div className="panel__ctx">Looking at: {openProductName ?? openProductId}</div>}

        <div className="panel__log" ref={logRef} aria-live="polite">
          {messages.length === 0 && (
            <div className="msg bot">
              Tell me what you need and your budget in UGX. I only recommend products that are in this catalogue.
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div className="msg user" key={i}>
                {m.content}
              </div>
            ) : m.typing ? (
              <div className="msg bot typing" key={i}>
                Checking the catalogue&hellip;
              </div>
            ) : (
              <div key={i}>
                <div className="msg bot">{m.content}</div>
                {m.cards?.map((c) => (
                  <AssistantCard key={c.id} card={c} onNavigate={() => setIsOpen(false)} />
                ))}
                {m.fallback && <div className="muted">AI was unavailable, so demo matching answered.</div>}
              </div>
            )
          )}
        </div>

        <div className="panel__chips">
          {chips.map((c) => (
            <button key={c} className="chip" type="button" onClick={() => send(c)}>
              {c}
            </button>
          ))}
        </div>

        <form
          className="panel__form"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <label className="sr" htmlFor="chatIn">
            Message
          </label>
          <input
            id="chatIn"
            ref={inputRef}
            autoComplete="off"
            placeholder="Ask about a product or your budget"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="btn btn--sm" type="submit">
            Send
          </button>
        </form>
      </section>
    </>
  );
}
