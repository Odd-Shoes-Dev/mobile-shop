import type { Product } from "@/lib/db";
import type { UseCase } from "@/lib/eri";

const WORD_NUMBERS: Record<string, number> = {
  half: 0.5, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
};
const WORD_NUMBER_PATTERN = Object.keys(WORD_NUMBERS).join("|");

/**
 * Ported from the prototype's `parseBudget()`, extended to understand
 * spelled-out numbers ("four million") alongside digits ("4 million"/"4m"),
 * since real typed messages use both.
 */
export function parseBudget(text: string): number | null {
  const t = String(text).toLowerCase().replace(/,/g, "");
  let m = t.match(new RegExp(`\\b(${WORD_NUMBER_PATTERN})\\s*(?:a\\s+)?(million|mil)\\b`));
  if (m) return Math.round(WORD_NUMBERS[m[1]] * 1e6);
  m = t.match(new RegExp(`\\b(${WORD_NUMBER_PATTERN})\\s*(?:a\\s+)?(thousand)\\b`));
  if (m) return Math.round(WORD_NUMBERS[m[1]] * 1e3);
  m = t.match(/(\d+(?:\.\d+)?)\s*(million|mil|m)\b/);
  if (m) return Math.round(parseFloat(m[1]) * 1e6);
  m = t.match(/(\d+(?:\.\d+)?)\s*(k|thousand)\b/);
  if (m) return Math.round(parseFloat(m[1]) * 1e3);
  m = t.match(/\b(\d{6,9})\b/);
  if (m) return parseInt(m[1], 10);
  return null;
}

// Each list started as the prototype's handful of keywords and is expanded
// with common synonyms, slang and specific app/game names real shoppers
// actually type, so one concept matches many ways of saying it instead of
// needing the exact original word.
const USE_WORDS: Record<UseCase, RegExp> = {
  gaming: /\b(games?|gaming|gamer|fortnite|fifa|pubg|valorant|minecraft|roblox|csgo|cs2|call of duty|cod|apex|esports?|play games|streaming games)\b/,
  create: /\b(edit|editing|video|photo|design|designer|music|produc(e|tion)|premiere|photoshop|illustrator|after effects|blender|ableton|fl studio|creator|content|3d|render|animation|illustrat\w+|studio|coding|programming|developer|dev work|vlogging|youtube|graphic design)\b/,
  study: /\b(student|study|studying|school|university|uni|campus|class|classes|assignment|assignments|learning|homework|college|exam|exams|revision|coursework|thesis|research|e-?learning|online class(es)?)\b/,
  work: /\b(office|work|business|excel|accounts?|accounting|productivity|spreadsheet|emails?|zoom|meetings?|job|remote work|wfh|powerpoint|presentations?|invoicing|data entry|admin|freelance|clients?)\b/,
};

/** Ported from the prototype's `parseUse()`. */
export function parseUse(text: string): UseCase | null {
  const t = String(text).toLowerCase();
  for (const k of ["gaming", "create", "study", "work"] as UseCase[]) if (USE_WORDS[k].test(t)) return k;
  return null;
}

const CATS: Record<string, RegExp> = {
  laptop: /\b(laptops?|notebooks?|computers?|pcs?|devices?|machines?)\b/,
  mouse: /\b(mouse|mice)\b/,
  keyboard: /\bkeyboards?\b/,
  headphones: /\b(headphones?|headsets?|earphones?|earbuds?|buds)\b/,
  monitor: /\b(monitors?|screens?|displays?|external screen)\b/,
  bag: /\b(bags?|backpacks?|sleeves?|pouch(es)?)\b/,
  storage: /\b(storage|ssd|hard ?drive|flash( drive)?|external drive|pen ?drive|usb drive|memory card|portable drive)\b/,
  cooling: /\b(cool(ing|er)|cooling pad|fan)\b/,
};

/**
 * Ported from the prototype's `parseCategory()`, with one fix: "is there a
 * cooling pad for laptops" mentions both "cooling" and "laptop(s)", but the
 * second is describing what it's *compatible with*, not what they want to
 * buy. When another category is mentioned alongside "laptop", that more
 * specific one wins — "laptop" only wins outright when it's the only match.
 */
export function parseCategory(text: string): string | null {
  const t = String(text).toLowerCase();
  const matches = Object.keys(CATS).filter((k) => CATS[k].test(t));
  if (!matches.length) return null;
  if (matches.length > 1) return matches.find((k) => k !== "laptop") ?? matches[0];
  return matches[0];
}

// Brands real shoppers ask about that this catalogue has never carried
// (HP, Dell, Lenovo, ASUS, Acer only) — named explicitly here because there
// is no "closest match" to fall back to the way there is for an
// over-budget laptop; saying so beats a generic "could not find".
const UNAVAILABLE_BRANDS =
  /\b(macbook|apple|samsung|huawei|msi|razer|toshiba|sony vaio|surface laptop|microsoft surface|xiaomi|redmi|infinix|tecno|itel|alienware|gigabyte|lg gram)\b/i;

/** The brand name matched from `UNAVAILABLE_BRANDS`, if the message names one this catalogue doesn't carry. */
export function mentionedUnavailableBrand(text: string): string | null {
  const m = text.match(UNAVAILABLE_BRANDS);
  return m ? m[0] : null;
}

function normalizedName(p: Product): string {
  return p.name.toLowerCase().replace(/\(.*?\)/g, "").trim();
}

/**
 * High-confidence product mentions only: the full name, or its first two
 * words, appear verbatim. Used wherever a false positive would be
 * confusing (like deciding which product "it" refers to) — unlike
 * `mentioned()`'s single-keyword fallback, this never matches on a
 * generic word like "laptop" alone.
 */
function strongMentioned(catalogue: Product[], text: string): Product[] {
  const t = text.toLowerCase();
  return catalogue.filter((p) => {
    const n = normalizedName(p);
    if (t.includes(n)) return true;
    const toks = n.split(/\s+/);
    return toks.length > 1 && t.includes(toks.slice(0, 2).join(" "));
  });
}

/** Ported from the prototype's `mentioned()`. */
export function mentioned(catalogue: Product[], text: string): Product[] {
  const t = text.toLowerCase();
  return catalogue.filter((p) => {
    const n = normalizedName(p);
    if (t.includes(n)) return true;
    const toks = n.split(/\s+/);
    const key = toks.length > 1 ? toks[1] : toks[0];
    return t.includes(toks.slice(0, 2).join(" ")) || (key.length > 3 && new RegExp("\\b" + key + "\\b").test(t));
  });
}

export interface AssistantHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * Ported from the prototype's `userContext()`, with two fixes:
 * 1. The original only checked category against the current message, so a
 *    category mentioned one turn ("maybe a laptop?") was forgotten the next.
 * 2. The original resolved budget (and now category/use) by joining every
 *    user message oldest-first into one string and taking the regex's
 *    *first* match — which is the *oldest* mention, not the most recent.
 *    "Anything above 4 million" followed later by "anything above 350,000"
 *    would keep answering against 4,000,000 forever. This now checks the
 *    current message first, then earlier turns newest-to-oldest, so a
 *    later statement always overrides an earlier one.
 */
export function userContext(history: AssistantHistoryMessage[], message: string) {
  const newestFirst = [message, ...history.filter((m) => m.role === "user").map((m) => m.content).reverse()];
  const firstMatch = <T,>(parse: (text: string) => T | null): T | null => {
    for (const text of newestFirst) {
      const value = parse(text);
      if (value !== null) return value;
    }
    return null;
  };
  return {
    use: firstMatch(parseUse),
    budget: firstMatch(parseBudget),
    category: firstMatch(parseCategory),
  };
}

// Short replies that must be the *whole* message (bare "any" elsewhere in a
// real sentence isn't necessarily non-committal).
const VAGUE_WHOLE = /^(not sure|unsure|any|anything|no idea|dunno|idk|i don'?t know)[!.\s]*$/i;
// Distinctive phrases that signal "I don't care" wherever they appear —
// "im not fussy, surprise me" or "whatever is good" should match even
// though they're not the whole message verbatim. Tolerates a stray adverb
// ("i don't really mind").
const VAGUE_PHRASE =
  /(no preference|not fussy|open to anything|surprise me|up to you|you (choose|pick|decide)|don'?t\s+(really\s+|particularly\s+)?(know|mind|care)|doesn'?t matter|\bwhatever\b)/i;

/** A non-committal reply to a clarifying question ("not sure", "anything") — the signal to proceed with a safe default instead of asking again. */
export function isVagueAnswer(message: string): boolean {
  const t = message.trim();
  return VAGUE_WHOLE.test(t) || VAGUE_PHRASE.test(t);
}

// "yes" and a follow-up clause ("go ahead", "please") commonly arrive
// together ("yes go ahead", "yes, show me") — the lead word alone being
// anchored end-to-end previously meant that combination matched nothing.
const AFFIRMATIVE = new RegExp(
  "^(" +
    "(yes|yeah|yea|yep|yup|ya|sure|ok(ay)?|alright)(,?\\s*(go ahead|please( do)?|show me|that works|do it|sounds good))?" +
    "|go ahead|please do|do it|show me" +
    ")[!.\\s]*$",
  "i"
);

/** A plain "yes"/"go ahead" — meaningless on its own, but the signal to follow through on whatever the assistant just offered. */
export function isAffirmative(message: string): boolean {
  return AFFIRMATIVE.test(message.trim());
}

/**
 * True when the assistant's last message was an offer worth following up
 * on ("...want me to show options from one of those?") — so a bare "yes"
 * reply to it can be acted on instead of falling through as meaningless.
 */
export function lastAssistantMadeOffer(history: AssistantHistoryMessage[]): boolean {
  const last = [...history].reverse().find((m) => m.role === "assistant");
  return last ? /want me to show|should i show|shall i show/i.test(last.content) : false;
}

/**
 * Resolves which product the customer is implicitly talking about, so
 * follow-ups like "what's the battery on it?" or "is that one good for
 * gaming?" keep working across turns without a page to anchor on.
 * Priority: the product page they're currently viewing, then a product
 * named in this message, then the most recently mentioned product
 * anywhere earlier in the conversation.
 */
export function resolveActiveProduct(
  catalogue: Product[],
  history: AssistantHistoryMessage[],
  message: string,
  pageProductId: string | null
): Product | undefined {
  if (pageProductId) {
    const onPage = catalogue.find((p) => p.id === pageProductId);
    if (onPage) return onPage;
  }

  const pickBest = (weak: Product[], strong: Product[]): Product | undefined => {
    if (!weak.length) return undefined;
    const pool = strong.length ? strong : weak;
    return pool[pool.length - 1];
  };

  const namedNow = mentioned(catalogue, message);
  if (namedNow.length) return pickBest(namedNow, strongMentioned(catalogue, message));

  for (let i = history.length - 1; i >= 0; i--) {
    const turnText = history[i].content;
    const foundInTurn = mentioned(catalogue, turnText);
    if (foundInTurn.length) return pickBest(foundInTurn, strongMentioned(catalogue, turnText));
  }

  return undefined;
}

const TRAILER = /(\s+(so much|a lot|very much|man|bro|guys?))?/.source;
const GREETING = new RegExp(
  `^(hi+|hello+|hey+|yo+( whats? good| wassup)?|sup|whats? good|wassup|howdy|good\\s*(morning|afternoon|evening)|good day)${TRAILER}[!.\\s]*$`,
  "i"
);
const THANKS = new RegExp(`^(thanks?( you)?|thank\\s*u|thx|ta|cheers|appreciate it|much appreciated|many thanks)${TRAILER}[!.\\s]*$`, "i");
const ACK =
  /^(ok(ay)?|cool|alright|nice|great|sweet|sounds good|got it|sure|fine|perfect|noted|roger|fair enough|makes sense|yes|yeah|yea|yep|yup|ya)[!.\s]*$/i;

export type SmallTalkKind = "greeting" | "thanks" | "ack";

function classifyClause(clause: string): SmallTalkKind | null {
  if (GREETING.test(clause)) return "greeting";
  if (THANKS.test(clause)) return "thanks";
  if (ACK.test(clause)) return "ack";
  return null;
}

/**
 * Catches short conversational messages that aren't really questions —
 * "hi", "thanks", "ok" — so they get a natural reply instead of falling
 * through to the generic "I could not find that in the catalogue" dead end.
 * Deliberately whole-message matches only (not substrings), so a real
 * question that happens to contain "thanks" somewhere isn't swallowed by
 * this — but a message that's nothing but small talk strung together
 * ("noted, thanks") still counts, checking each clause separately.
 */
export function detectSmallTalk(message: string): SmallTalkKind | null {
  const t = message.trim();
  if (!t) return null;
  const whole = classifyClause(t);
  if (whole) return whole;

  const clauses = t.split(/[,.!]+|\band\b/i).map((c) => c.trim()).filter(Boolean);
  if (clauses.length < 2) return null;
  const kinds = clauses.map(classifyClause);
  if (kinds.some((k) => k === null)) return null;
  // thanks/ack read as more specific than a bare greeting when combined.
  return kinds.includes("thanks") ? "thanks" : kinds.includes("ack") ? "ack" : "greeting";
}

// Common conversational filler the original 2-char minimum let through —
// "am", "ok", "no", "to", "is"… each a substring of some unrelated word
// (famously "am" inside "Sample" and "gaming"), so every product scored a
// false hit on them. Word-boundary matching below catches most of this on
// its own, but filtering fillers first keeps short real queries ("ssd",
// "hp") from being diluted by meaningless tokens in the same message.
const SEARCH_STOPWORDS = new Set([
  "am", "is", "it", "to", "of", "in", "on", "at", "ok", "no", "a", "an", "the", "do", "me", "my",
]);

/**
 * Ported from the prototype's `search()`, hardened against false
 * positives: raw substring matching (`hay.includes(t)`) meant a token as
 * short as "am" matched inside unrelated words like "Sample" or "gaming",
 * so a message like "am not sure yet" could return confident-looking but
 * meaningless results. Now matches are whole-word and short filler tokens
 * are dropped before scoring.
 */
export function search(catalogue: Product[], q: string): Product[] {
  const toks = String(q)
    .toLowerCase()
    .split(/[^a-z0-9.]+/)
    .filter((t) => t.length > 1 && !SEARCH_STOPWORDS.has(t));
  if (!toks.length) return [];
  return catalogue
    .map((p) => {
      const hay = [p.name, p.brand, p.category, p.description, p.keywords.join(" "), p.useCases.join(" ")]
        .join(" ")
        .toLowerCase();
      let s = 0;
      for (const t of toks) {
        if (!new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(hay)) continue;
        s += p.name.toLowerCase().includes(t) ? 3 : 1;
      }
      return { p, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}
