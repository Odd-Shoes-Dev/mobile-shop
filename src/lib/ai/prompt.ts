import type { Product } from "@/lib/db";
import { accessoriesFor, availabilityLabel, rank, toEriProduct } from "@/lib/eri";
import { mentioned, search, userContext, type AssistantHistoryMessage } from "./parse";

/** Ported verbatim from the prototype's `SYSTEM` prompt. */
export const SYSTEM = `You are the shopping assistant for ERISAF TECH SAFARI, a computer and electronics shop in Uganda.
Rules you must follow:
- Use ONLY the catalogue records and store policies provided below. Never invent prices, specifications, stock, compatibility, warranties, delivery costs or policies.
- If something is not in the data, say it is not listed and suggest asking the team on WhatsApp.
- Prices are in UGX. Do not write prices in your reply text; the product cards show them. Refer to products by exact name.
- If a record has sample_data true, it is sample/demo data, not confirmed inventory; mention this once if you recommend it.
- Ask ONE short clarifying question if the use or budget is missing, then recommend once you know.
- Explain specifications in plain everyday language. Explain trade-offs honestly, including when a cheaper product is the better choice.
- When comparing, cover processor, RAM, storage, graphics, display, battery, weight, price and intended use where listed, then say which is better for gaming, creative work and everyday productivity, with reasons.
- Never use urgency, scarcity or invented discounts.
- Keep replies under 140 words.
Respond with ONLY a JSON object: {"reply": string, "product_ids": string[] (max 4, ids from the records), "compare_ids": string[] (2-3 ids only when comparing), "quick_replies": string[] (max 3 short suggestions)}.`;

/** Ported from the prototype's `slim()` — trims a product record to what the model needs. */
function slim(p: Product) {
  const m = p.metrics as { ports?: string[]; inputs?: string[]; connection?: string[]; fitsInches?: number };
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price_ugx: p.priceUgx,
    discount_price_ugx: p.discountPriceUgx,
    specs: p.specs,
    condition: p.condition,
    warranty: p.warranty || "not listed",
    availability: availabilityLabel(p),
    use_cases: p.useCases,
    compat_data: { ports: m.ports, inputs: m.inputs, connection: m.connection, fitsInches: m.fitsInches },
    sample_data: p.sample,
  };
}

/** Ported from the prototype's `retrieve()` — picks a relevant subset of the catalogue so the prompt stays small. */
export function retrieve(
  catalogue: Product[],
  message: string,
  history: AssistantHistoryMessage[],
  openProductId: string | null,
  compareIds: string[]
): Product[] {
  const ids = new Set<string>();
  const add = (p: Product | undefined) => p && ids.add(p.id);
  const byId = (id: string) => catalogue.find((p) => p.id === id);

  add(openProductId ? byId(openProductId) : undefined);
  compareIds.forEach((id) => add(byId(id)));
  mentioned(catalogue, message).forEach(add);

  const uc = userContext(history, message);
  rank(catalogue.map(toEriProduct), { use: uc.use || "work", budget: uc.budget, category: uc.category || "laptop", stretch: 1.1, includeOut: true })
    .slice(0, 5)
    .forEach((p) => add(byId(p.id)));
  search(catalogue, message)
    .slice(0, 4)
    .forEach(add);

  const open = openProductId ? byId(openProductId) : undefined;
  if (open && open.category === "laptop") {
    accessoriesFor(toEriProduct(open), catalogue.map(toEriProduct))
      .filter((a) => a.status === "ok")
      .slice(0, 6)
      .forEach((a) => add(byId(a.p.id)));
  }

  return catalogue.filter((p) => ids.has(p.id)).slice(0, 14);
}

/** Ported from the prototype's `liveReply()` system-prompt assembly — policies are all unpublished (null) in this catalogue, same as the prototype's default. */
export function buildSystemPrompt(records: Product[], openProductId: string | null): string {
  const policies = { delivery: null, warranty: null, returns: null, payment: null, faqs: [] as unknown[] };
  return `${SYSTEM}

VERIFIED STORE POLICIES (null = not published):
${JSON.stringify(policies)}

CUSTOMER IS CURRENTLY VIEWING: ${openProductId ?? "no specific product"}

CATALOGUE RECORDS FOR THIS QUESTION:
${JSON.stringify(records.map(slim))}`;
}
