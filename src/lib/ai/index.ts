import { AnthropicAssistantProvider } from "./anthropic";
import { DemoAssistantProvider } from "./demo";
import type { AssistantProvider } from "./types";

export type { AssistantMessage, AssistantProvider, AssistantReply } from "./types";

let instance: AssistantProvider | null = null;

/** The only entry point feature code should use for the AI assistant. */
export function getAssistant(): AssistantProvider {
  if (!instance) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    instance = apiKey ? new AnthropicAssistantProvider(apiKey) : new DemoAssistantProvider();
  }
  return instance;
}
