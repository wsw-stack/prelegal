// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getUser, setUser } from "@/lib/auth/session";

import { AuthGate } from "./AuthGate";
import { LoginForm } from "./LoginForm";
import { UserBar } from "./UserBar";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

const alice = { name: "Alice", email: "alice@example.com" };

beforeEach(() => {
  localStorage.clear();
  replace.mockClear();
});

describe("AuthGate", () => {
  it("redirects to the login page when signed out", () => {
    render(<AuthGate>platform</AuthGate>);
    expect(screen.queryByText("platform")).not.toBeInTheDocument();
    expect(replace).toHaveBeenCalledWith("/login/");
  });

  it("shows the platform when signed in", () => {
    setUser(alice);
    render(<AuthGate>platform</AuthGate>);
    expect(screen.getByText("platform")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});

describe("LoginForm", () => {
  it("signs in with any name and email and goes to the platform", async () => {
    // Surrounding spaces are trimmed, so the stored user is exactly `alice`.
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Name"), "  Alice ");
    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(getUser()).toEqual(alice);
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("requires an email", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Name"), "Alice");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(getUser()).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it("skips the form when already signed in", () => {
    setUser(alice);
    render(<LoginForm />);
    expect(replace).toHaveBeenCalledWith("/");
  });

  it("rejects a name that is only spaces", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText("Name"), "   ");
    await user.type(screen.getByLabelText("Email"), "alice@example.com");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(getUser()).toBeNull();
  });
});

describe("UserBar", () => {
  it("shows the user and signs them out", async () => {
    const user = userEvent.setup();
    setUser(alice);
    render(<UserBar />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(getUser()).toBeNull();
    expect(replace).toHaveBeenCalledWith("/login/");
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();
  });
});
