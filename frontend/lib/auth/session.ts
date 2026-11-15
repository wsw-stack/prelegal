/**
 * Fake session for the V1 prototype: the signed-in user lives in localStorage
 * and nothing is checked. Real sign up / sign in will replace this module.
 */

export type User = { name: string; email: string };

const KEY = "prelegal.user";
/** Fired on this tab when the user changes; the "storage" event covers other tabs. */
const CHANGE_EVENT = "prelegal:user-change";

function isUser(value: unknown): value is User {
  const v = value as Partial<User> | null;
  return typeof v?.name === "string" && typeof v.email === "string";
}

function parse(raw: string | null): User | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isUser(value) ? value : null;
  } catch {
    return null;
  }
}

// The signed-in user. As a useSyncExternalStore snapshot it must return the
// same object while storage is unchanged, so the parsed user is cached against
// the raw string it came from.
let cachedRaw: string | null = null;
let cachedUser: User | null = null;

export function getUser(): User | null {
  const raw = localStorage.getItem(KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = parse(raw);
  }
  return cachedUser;
}

export function setUser(user: User): void {
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearUser(): void {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

