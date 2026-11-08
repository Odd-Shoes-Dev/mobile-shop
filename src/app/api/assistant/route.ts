import { NextResponse } from "next/server";
import { demoReply, reasonsFor, type AssistantResult } from "@/lib/ai/demoAssistant";
import { getAssistant, hasLiveProvider } from "@/lib/ai";
import { buildSystemPrompt, retrieve } from "@/lib/ai/prompt";
import type { AssistantHistoryMessage } from "@/lib/ai/parse";
import { mapToSummary } from "@/features/catalogue/lib/mapToSummary";
import { listProducts, type Product } from "@/lib/db";
import { userContext } from "@/lib/ai/parse";

interface AssistantRequestBody {
  message?: string;
  history?: AssistantHistoryMessage[];
  context?: { productId?: string | null; compareIds?: string[] };
}

async function liveReply(
  message: string,
  history: AssistantHistoryMessage[],
  catalogue: Product[],
  openProductId: string | null,
  compareIds: string[]
): Promise<AssistantResult> {
  const records = retrieve(catalogue, message, history, openProductId, compareIds);
  const system = buildSystemPrompt(records, openProductId);
  const messages = [...history.slice(-8), { role: "user" as const, content: message }];

  const { content } = await getAssistant().reply(system, messages);
  const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());

  const validIds = (ids: unknown): string[] =>
    (Array.isArray(ids) ? ids : []).filter((id): id is string => catalogue.some((p) => p.id === id));

  return {
    mode: "live",
    reply: String(parsed.reply || ""),
    productIds: validIds(parsed.product_ids).slice(0, 4),
    compareIds: validIds(parsed.compare_ids).slice(0, 3),
    chips: (parsed.quick_replies || []).slice(0, 3),
  };
}

export async function POST(request: Request) {
  let body: AssistantRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const message = String(body.message ?? "").slice(0, 800);
  const history = (body.history ?? []).slice(-10);
  const openProductId = body.context?.productId ?? null;
  const compareIds = body.context?.compareIds ?? [];

  let catalogue: Product[];
  try {
    catalogue = await listProducts();
  } catch {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  let result: AssistantResult;
  if (hasLiveProvider()) {
    try {
      result = await liveReply(message, history, catalogue, openProductId, compareIds);
    } catch {
      result = { ...demoReply(message, history, catalogue, openProductId, compareIds), fallback: true };
    }
  } else {
    result = demoReply(message, history, catalogue, openProductId, compareIds);
  }

  const uc = userContext(history, message);
  const cards = result.productIds
    .map((id) => {
      const product = catalogue.find((p) => p.id === id);
      if (!product) return null;
      return { ...mapToSummary(product), why: reasonsFor(catalogue, id, uc.use, uc.budget) };
    })
    .filter((c): c is NonNullable<typeof c> => c !== null);

  return NextResponse.json({
    mode: result.mode,
    reply: result.reply,
    cards,
    compareIds: result.compareIds,
    chips: result.chips,
    whatsapp: result.whatsapp ?? false,
    fallback: result.fallback ?? false,
  });
}
