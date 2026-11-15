"use client";

import { useSyncExternalStore } from "react";

import { getUser, subscribe, type User } from "./session";

/**
 * The signed-in user, or null when signed out. Undefined during prerendering
 * and hydration, when localStorage can't be read yet.
 */
export function useUser(): User | null | undefined {
  return useSyncExternalStore<User | null | undefined>(subscribe, getUser, () => undefined);
}
