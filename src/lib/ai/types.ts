export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantReply {
  content: string;
  /** "demo" = keyword-matched canned reply, no external call made. */
  mode: "demo" | "live";
}

export interface AssistantProvider {
  reply(systemPrompt: string, history: AssistantMessage[]): Promise<AssistantReply>;
}
