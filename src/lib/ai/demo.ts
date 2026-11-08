import type { AssistantMessage, AssistantProvider, AssistantReply } from "./types";

/**
 * No external calls. Used whenever no API key is configured, so the app
 * always has a working assistant even before AI is wired up for real.
 */
export class DemoAssistantProvider implements AssistantProvider {
  async reply(_systemPrompt: string, history: AssistantMessage[]): Promise<AssistantReply> {
    const last = history[history.length - 1]?.content.toLowerCase() ?? "";
    let content =
      "I can help you compare laptops, run the quiz, or check what fits your budget — what are you shopping for?";
    if (last.includes("price") || last.includes("budget")) {
      content = "Tell me your budget in UGX and what you'll mainly use it for, and I'll narrow it down.";
    } else if (last.includes("delivery") || last.includes("warranty")) {
      content = "Delivery and warranty details for this demo aren't published yet — check back soon.";
    }
    return { content, mode: "demo" };
  }
}
