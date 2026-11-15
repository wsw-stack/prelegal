"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useUser } from "@/lib/auth/useUser";

/** Renders children only for a signed-in user; otherwise sends them to /login. */
export function AuthGate({ children }: { children: ReactNode }) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.replace("/login/");
  }, [user, router]);

  return user ? children : null;
}
