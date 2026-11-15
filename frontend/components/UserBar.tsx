"use client";

import { useRouter } from "next/navigation";

import { clearUser } from "@/lib/auth/session";
import { useUser } from "@/lib/auth/useUser";

/** Top bar with the product name, the signed-in user and a sign out button. */
export function UserBar() {
  const user = useUser();
  const router = useRouter();

  function signOut() {
    clearUser();
    router.replace("/login/");
  }

  return (
    <div className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <span className="text-sm font-semibold tracking-tight text-zinc-900">prelegal</span>
        {user && (
          <div className="flex items-center gap-3 text-sm text-zinc-600">
            <span>
              Signed in as <span className="font-medium text-zinc-900">{user.name}</span>
            </span>
            <button
              type="button"
              onClick={signOut}
              className="rounded-md border border-zinc-300 px-3 py-1.5 font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
