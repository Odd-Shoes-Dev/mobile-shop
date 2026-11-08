import type { AssistantMessage, AssistantProvider, AssistantReply } from "./types";

/**
 * Anthropic-backed implementation. This is the only file allowed to talk
 * to the Anthropic API directly. Swapping models/providers later means
 * rewriting this file and the export in index.ts — nothing else changes.
 */
export class AnthropicAssistantProvider implements AssistantProvider {
  constructor(private apiKey: string, private model = "claude-sonnet-5-5") {}

  async reply(systemPrompt: string, history: AssistantMessage[]): Promise<AssistantReply> {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 600,
        system: systemPrompt,
        messages: history.map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    const content: string = data.content?.[0]?.text ?? "";
    return { content, mode: "live" };
  }
}
