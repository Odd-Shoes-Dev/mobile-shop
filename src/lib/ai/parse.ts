import type { Product } from "@/lib/db";
import type { UseCase } from "@/lib/eri";

/** Ported from the prototype's `parseBudget()`. */
export function parseBudget(text: string): number | null {
  const t = String(text).toLowerCase().replace(/,/g, "");
  let m = t.match(/(\d+(?:\.\d+)?)\s*(million|mil|m)\b/);
  if (m) return Math.round(parseFloat(m[1]) * 1e6);
  m = t.match(/(\d+(?:\.\d+)?)\s*(k|thousand)\b/);
  if (m) return Math.round(parseFloat(m[1]) * 1e3);
  m = t.match(/\b(\d{6,9})\b/);
  if (m) return parseInt(m[1], 10);
  return null;
}

const USE_WORDS: Record<UseCase, RegExp> = {
  gaming: /\b(game|gaming|gamer|fortnite|fifa|pubg|call of duty|esports?|play games)\b/,
  create: /\b(edit|editing|video|photo|design|designer|music|produc(e|tion)|premiere|photoshop|creator|content|3d|render|animation|illustrat\w+|studio)\b/,
  study: /\b(student|study|studying|school|university|campus|class|assignment|learning|homework)\b/,
  work: /\b(office|work|business|excel|accounts?|accounting|productivity|spreadsheet|emails?|zoom|meetings?)\b/,
};

/** Ported from the prototype's `parseUse()`. */
export function parseUse(text: string): UseCase | null {
  const t = String(text).toLowerCase();
  for (const k of ["gaming", "create", "study", "work"] as UseCase[]) if (USE_WORDS[k].test(t)) return k;
  return null;
}

const CATS: Record<string, RegExp> = {
  laptop: /\b(laptops?|notebooks?|computers?)\b/,
  mouse: /\b(mouse|mice)\b/,
  keyboard: /\bkeyboards?\b/,
  headphones: /\b(headphones?|headsets?|earphones?)\b/,
  monitor: /\b(monitors?|screens?|displays?)\b/,
  bag: /\b(bags?|backpacks?|sleeves?)\b/,
  storage: /\b(storage|ssd|hard ?drive|flash|external drive)\b/,
  cooling: /\b(cool(ing|er)|cooling pad|fan)\b/,
};

/** Ported from the prototype's `parseCategory()`. */
export function parseCategory(text: string): string | null {
  const t = String(text).toLowerCase();
  for (const k of Object.keys(CATS)) if (CATS[k].test(t)) return k;
  return null;
}

/** Ported from the prototype's `mentioned()`. */
export function mentioned(catalogue: Product[], text: string): Product[] {
  const t = text.toLowerCase();
  return catalogue.filter((p) => {
    const n = p.name.toLowerCase().replace(/\(.*?\)/g, "").trim();
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

/** Ported from the prototype's `userContext()`. */
export function userContext(history: AssistantHistoryMessage[], message: string) {
  const all = [...history.filter((m) => m.role === "user").map((m) => m.content), message].join(" ");
  return {
    use: parseUse(all),
    budget: parseBudget(message) || parseBudget(all),
    category: parseCategory(message),
  };
}

/** Ported from the prototype's `search()`. */
export function search(catalogue: Product[], q: string): Product[] {
  const toks = String(q)
    .toLowerCase()
    .split(/[^a-z0-9.]+/)
    .filter((t) => t.length > 1);
  if (!toks.length) return [];
  return catalogue
    .map((p) => {
      const hay = [p.name, p.brand, p.category, p.description, p.keywords.join(" "), p.useCases.join(" ")]
        .join(" ")
        .toLowerCase();
      let s = 0;
      for (const t of toks) if (hay.includes(t)) s += p.name.toLowerCase().includes(t) ? 3 : 1;
      return { p, s };
    })
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}
