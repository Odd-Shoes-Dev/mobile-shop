"use client";

export const OPEN_ASSISTANT_EVENT = "erisaf:open-assistant";

export interface OpenAssistantDetail {
  message?: string;
}

/** Fires an event AssistantWidget listens for, so any page can open the chat panel (optionally pre-filled). */
export function AskAssistantButton({
  label = "Ask the assistant",
  message,
  className = "btn btn--white",
}: {
  label?: string;
  message?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() =>
        window.dispatchEvent(new CustomEvent<OpenAssistantDetail>(OPEN_ASSISTANT_EVENT, { detail: { message } }))
      }
    >
      {label}
    </button>
  );
}
