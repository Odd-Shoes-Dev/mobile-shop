import type { CartLine } from "../types";

const STORAGE_KEY = "eri_cart";
const EMPTY: CartLine[] = [];

let cache: CartLine[] | null = null;
const listeners = new Set<() => void>();

function readFromStorage(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * A tiny external store so cart reads/writes go through useSyncExternalStore
 * instead of an effect — avoids the server/client hydration mismatch
 * (localStorage doesn't exist on the server) without ever calling setState
 * from inside an effect body.
 */
export const cartStore = {
  subscribe(onChange: () => void) {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
  },
  getSnapshot(): CartLine[] {
    if (cache === null) cache = readFromStorage();
    return cache;
  },
  getServerSnapshot(): CartLine[] {
    return EMPTY;
  },
  set(updater: (prev: CartLine[]) => CartLine[]) {
    const next = updater(cache ?? readFromStorage());
    cache = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage unavailable (private browsing, etc.) — cart just won't persist.
    }
    listeners.forEach((l) => l());
  },
};
