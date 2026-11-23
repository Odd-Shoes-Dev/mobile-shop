import type { Product } from "@/lib/db";
import { accessoriesFor, availabilityLabel, effectivePrice, fitScore, formatUgx, hasValue, rank, reasons, toEriProduct, verdict, USE_LABEL, type UseCase } from "@/lib/eri";
import {
  detectSmallTalk,
  isAffirmative,
  isVagueAnswer,
  lastAssistantMadeOffer,
  mentioned,
  mentionedUnavailableBrand,
  resolveActiveProduct,
  search,
  userContext,
  type AssistantHistoryMessage,
} from "./parse";

export interface AssistantResult {
  mode: "demo" | "live";
  reply: string;
  productIds: string[];
  compareIds: string[];
  chips: string[];
  whatsapp?: boolean;
  fallback?: boolean;
}

const SPEC_Q: [RegExp, string][] = [
  [/battery|charge|how long does it last/, "Battery"],
  [/\bram\b|memory/, "RAM"],
  [/storage|ssd|disk|hard ?drive|space|capacity|\bgb\b/, "Storage"],
  [/processor|cpu|chip|core i\d|ryzen/, "Processor"],
  [/graphics|gpu|video card|gfx/, "Graphics"],
  [/weigh|heavy|portable|light(weight)?/, "Weight"],
  [/screen|display|resolution|inches|\bhz\b|refresh rate/, "Display"],
];

/** None of the store policies are published yet in this catalogue — ported from the prototype's `policyText()`, specialized for that always-null case. */
function policyText(label: string): string {
  return `The store has not published verified ${label} information yet, so I won't guess. The team can confirm it for you on WhatsApp.`;
}

const ACRONYM_BRANDS = new Set(["msi", "lg", "lg gram"]);

function capitalize(s: string): string {
  if (ACRONYM_BRANDS.has(s.toLowerCase())) return s.toUpperCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Ported from the prototype's `demoReply()` — keyword matching only, no
 * external model call. `openProductId` is the product the customer is
 * currently viewing, if any (from the page they're on).
 */
export function demoReply(
  message: string,
  history: AssistantHistoryMessage[],
  catalogue: Product[],
  openProductId: string | null,
  compareIdsInContext: string[]
): AssistantResult {
  const t = message.toLowerCase();
  const uc = userContext(history, message);
  // Falls back to the product the customer was last talking about — not just
  // the page they're on — so "what's the battery on it?" keeps working
  // across turns instead of only right after a product-page view.
  const open = resolveActiveProduct(catalogue, history, message, openProductId);

  const R = (reply: string, ids: string[] = [], extra: Partial<AssistantResult> = {}): AssistantResult => ({
    mode: "demo",
    reply,
    productIds: ids,
    compareIds: [],
    chips: [],
    ...extra,
  });

  // A plain "yes"/"sure" is meaningless on its own, but if the assistant's
  // last message offered to show something ("want me to show options from
  // one of those?"), it means "go ahead" — checked before small talk so
  // "sure" isn't swallowed by the generic acknowledgment reply below.
  const confirmedOffer = isAffirmative(message) && lastAssistantMadeOffer(history);

  const smallTalk = confirmedOffer ? null : detectSmallTalk(message);
  if (smallTalk === "greeting") {
    return R(
      open
        ? `Hey! Still thinking about ${open.name}, or looking for something else?`
        : "Hey! Tell me what you need it for and your budget in UGX, or ask about a specific product.",
      [],
      { chips: ["Gaming laptop", "Laptop for school", "Compare two laptops"] }
    );
  }
  if (smallTalk === "thanks") {
    return R("You're welcome! Anything else you'd like to check?");
  }
  if (smallTalk === "ack") {
    return R(open ? `Alright. Want more details on ${open.name}, or something else?` : "Alright — what would you like to do next?");
  }

  if (/deliver|shipping|ship\b|send it|when (will|does) it arrive|how long to (get|deliver)|courier|pickup|pick up/.test(t)) {
    return R(policyText("delivery"), [], { whatsapp: true });
  }
  if (/warrant|guarantee/.test(t)) {
    if (open?.warranty) return R(`${open.name}: warranty listed as "${open.warranty}".`);
    return R((open ? `No warranty is listed for ${open.name}. ` : "") + policyText("warranty"), [], { whatsapp: true });
  }
  if (/return|refund|exchange|money back|swap it|take it back/.test(t)) return R(policyText("returns"), [], { whatsapp: true });
  if (/mobile money|momo|airtel|mtn|how (do|can) i pay|payment|\bpay\b|paying|installment|instalment|layaway|cash on delivery|\bcod\b/.test(t)) {
    return R(policyText("payment"), [], { whatsapp: true });
  }

  if (/discount|\bdeal(s)?\b|\boffer(s)?\b|on sale|any sales?|cheaper options?/.test(t)) {
    const deals = catalogue.filter((p) => hasValue(p.discountPriceUgx) && p.discountPriceUgx! < p.priceUgx);
    return deals.length
      ? R("These have an active price drop right now:", deals.map((p) => p.id))
      : R("No active offers right now — the team hasn't listed any discounts in this catalogue at the moment.");
  }

  const named = mentioned(catalogue, message);
  if (/\bvs\.?\b|versus|compare|compared to|difference|\bdiff\b|better than|which (is|one is) better|pick between|choose between/.test(t)) {
    let items = named.slice(0, 3);
    if (open && items.length === 1 && items[0].id !== open.id) items = [open, items[0]];
    if (items.length < 2 && compareIdsInContext.length >= 2) {
      items = compareIdsInContext.map((id) => catalogue.find((p) => p.id === id)).filter((p): p is Product => Boolean(p));
    }
    if (items.length < 2) {
      return R(
        'Which two products should I compare? Name them, for example "HP Victus vs HP Pavilion", or tap Compare on a product.',
        [],
        { chips: ["HP Victus vs HP Pavilion"] }
      );
    }
    const eriItems = items.map(toEriProduct);
    const v = verdict(eriItems);
    const lines = v
      ? v.map((x) => `${x.label}: ${x.winner ? eriItems.find((p) => p.id === x.winner)!.name : "tie"}. ${x.why}`)
      : ["Verdicts are only calculated for laptops. The comparison table shows listed specs side by side."];
    return R(lines.join("\n"), items.map((p) => p.id), { compareIds: items.map((p) => p.id) });
  }

  if (
    open &&
    open.category === "laptop" &&
    /what else|accessor|need with|goes with|pairing|pair(s)? with|go(es)? (well )?with|complement|extras|add-?ons|\bbag\b|case/.test(t)
  ) {
    const acc = accessoriesFor(toEriProduct(open), catalogue.map(toEriProduct))
      .filter((a) => a.status === "ok")
      .slice(0, 4);
    return R(
      acc.length ? `These match ${open.name} based on the listed ports and sizes:` : "I do not have compatible accessories with enough data for this laptop yet.",
      acc.map((a) => a.p.id)
    );
  }

  if (open) {
    for (const [re, key] of SPEC_Q) {
      if (re.test(t)) {
        const value = open.specs[key];
        return R(value ? `${open.name}: ${key.toLowerCase()} is ${value}.` : `${key} is not listed for ${open.name}.`);
      }
    }
    if (/price|cost|how much/.test(t)) return R(`${open.name} is ${formatUgx(effectivePrice(open.priceUgx, open.discountPriceUgx))}.`);
    if (/stock|available|availability|(do you|does it|u|you) (have|got) (one|it|this)\b|in stock/.test(t)) {
      return R(`${open.name}: ${availabilityLabel(open)}.`);
    }
    if (/right for me|good for|suitable|should i buy|is it good|is this good|worth it|recommend it/.test(t)) {
      if (!uc.use) return R(`What will you mostly use ${open.name} for?`, [], { chips: ["Gaming", "Video editing", "School", "Office work"] });
      const sc = fitScore(toEriProduct(open), uc.use);
      return R(
        `For ${USE_LABEL[uc.use].toLowerCase()}, ${open.name} is a ${sc > 0.65 ? "strong" : sc > 0.45 ? "decent" : "weak"} match on the listed specs.`,
        [open.id]
      );
    }
  }

  // Checked before the category/budget flow below: "got any Samsung
  // laptops?" also contains the word "laptop", which would otherwise send
  // it into the generic laptop-recommendation flow instead of answering
  // the actual question (we don't carry that brand).
  const unavailableBrand = mentionedUnavailableBrand(message);
  if (unavailableBrand) {
    const carriedBrands = Array.from(new Set(catalogue.filter((p) => p.category === "laptop").map((p) => p.brand))).sort();
    return R(
      `We don't carry any ${capitalize(unavailableBrand)} laptops in this catalogue. We do have ${carriedBrands.join(", ")}. Want me to show options from one of those?`,
      [],
      { chips: carriedBrands.map((b) => `${b} laptops`) }
    );
  }

  // Same proceed-with-defaults signal as an explicit "I don't care,
  // surprise me" (confirmedOffer computed above, before small talk).
  const readyToProceed = isVagueAnswer(message) || confirmedOffer;

  // A bare budget ("anything above 4 million") is enough to act on too —
  // this is fundamentally a laptop-recommendation assistant, so default to
  // that category rather than silently doing nothing until a category or
  // use happens to be named.
  const cat = uc.category || (uc.use || hasValue(uc.budget) || readyToProceed ? "laptop" : null);
  if (cat) {
    const askedBudgetBefore = history.some((m) => m.role === "assistant" && /budget/i.test(m.content));
    const askedUseBefore = history.some((m) => m.role === "assistant" && /use it for/i.test(m.content));
    if (cat === "laptop" && uc.use && !uc.budget && !askedBudgetBefore) {
      return R("Great. What is your budget in UGX?", [], { chips: ["UGX 1.5 million", "UGX 2.5 million", "UGX 4 million"] });
    }
    // Ask once; a non-committal reply ("not sure", "anything") or simply
    // having asked before moves on with a safe default rather than looping.
    if (cat === "laptop" && !uc.use && !readyToProceed && !askedUseBefore) {
      return R("What will you use it for?", [], { chips: ["Gaming", "Video editing", "School", "Office work"] });
    }
    const eriCatalogue = catalogue.map(toEriProduct);
    const list = rank(eriCatalogue, { use: uc.use || "work", budget: uc.budget, category: cat });
    if (!list.length && uc.budget) {
      const cheapest = rank(eriCatalogue, { use: uc.use || "work", category: cat }).sort(
        (a, b) => effectivePrice(a.price, a.discountPrice) - effectivePrice(b.price, b.discountPrice)
      )[0];
      return R(
        `Nothing available in that category fits ${formatUgx(uc.budget)}.${cheapest ? ` The closest is ${cheapest.name}.` : ""}`,
        cheapest ? [cheapest.id] : []
      );
    }
    return R(
      `Here are my best matches${uc.use ? " for " + USE_LABEL[uc.use].toLowerCase() : ""}${uc.budget ? " within " + formatUgx(uc.budget) : ""}:`,
      list.slice(0, 3).map((p) => p.id),
      { compareIds: list.length >= 2 ? list.slice(0, 2).map((p) => p.id) : [] }
    );
  }

  const found = search(catalogue, message).slice(0, 3);
  if (found.length) return R("This is what I found in the catalogue:", found.map((p) => p.id));

  return R(
    "I could not find that in the catalogue. Tell me what you will use it for and your budget, or ask the team on WhatsApp.",
    [],
    { chips: ["Gaming laptop", "Laptop for school", "Video editing"], whatsapp: true }
  );
}

/** Builds the "why" reasons for a recommended product, ported from the prototype's `card()`. */
export function reasonsFor(catalogue: Product[], id: string, use: UseCase | null, budget: number | null): string[] {
  const p = catalogue.find((x) => x.id === id);
  if (!p) return [];
  return reasons(toEriProduct(p), use || "work", budget);
}

