export function AssistantFab() {
  return (
    <button type="button" className="fab" aria-label="Ask the shopping assistant">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path
          d="M4 4h16v12H9l-5 4z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
      <span>Ask</span>
    </button>
  );
}
