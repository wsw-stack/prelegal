"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { setUser } from "@/lib/auth/session";
import { useUser } from "@/lib/auth/useUser";
import { input } from "@/lib/ui";

/** Prototype sign in: accepts any name and email, with no password or account check. */
export function LoginForm() {
  const user = useUser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Already signed in, e.g. a bookmarked /login: go straight to the platform.
  useEffect(() => {
    if (user) router.replace("/");
  }, [user, router]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUser({ name: name.trim(), email: email.trim() });
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm space-y-6 rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-900">Sign in to prelegal</h1>
          <p className="text-sm text-zinc-600">Draft common legal agreements in minutes.</p>
        </header>
        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1">
            <span className="text-sm font-medium text-zinc-800">Name</span>
            <input
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              // At least one non-space character, so a blank name can't sign in.
              pattern=".*\S.*"
              className={input}
            />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium text-zinc-800">Email</span>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            Continue
          </button>
        </form>
        <p className="text-xs text-zinc-500">Prototype sign in: no password is needed and no account is created.</p>
      </div>
    </main>
  );
}
