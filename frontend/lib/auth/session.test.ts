// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { clearUser, getUser, setUser, subscribe } from "./session";

const alice = { name: "Alice", email: "alice@example.com" };

beforeEach(() => localStorage.clear());

describe("session", () => {
  it("is signed out by default", () => {
    expect(getUser()).toBeNull();
  });

  it("round-trips the user through localStorage", () => {
    setUser(alice);
    expect(getUser()).toEqual(alice);
    clearUser();
    expect(getUser()).toBeNull();
  });

  it.each(["not json", "null", '{"name":"Alice"}', '{"name":1,"email":"a@b.c"}'])(
    "treats corrupt stored value %s as signed out",
    (raw) => {
      localStorage.setItem("prelegal.user", raw);
      expect(getUser()).toBeNull();
    },
  );

  it("returns a stable snapshot until the user changes", () => {
    setUser(alice);
    const first = getUser();
    expect(getUser()).toBe(first);
    setUser({ ...alice, name: "Alicia" });
    expect(getUser()).not.toBe(first);
    expect(getUser()?.name).toBe("Alicia");
  });

  it("notifies subscribers on sign in and sign out", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    setUser(alice);
    clearUser();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    setUser(alice);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
