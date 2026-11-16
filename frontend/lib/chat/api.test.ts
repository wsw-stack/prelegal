import { afterEach, describe, expect, it, vi } from "vitest";

import { defaultNdaData } from "@/lib/nda/types";

import { ChatError, sendChat, type ChatMessage } from "./api";

const messages: ChatMessage[] = [{ role: "user", content: "Acme and Globex." }];

function stubFetch(status: number, body: unknown) {
  const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status }));
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => vi.unstubAllGlobals());

describe("sendChat", () => {
  it("posts the conversation and current fields to /api/chat", async () => {
    const fetch = stubFetch(200, { reply: "Hi", fields: defaultNdaData });
    await sendChat(messages, defaultNdaData);

    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe("/api/chat");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
    expect(JSON.parse(init.body)).toEqual({ messages, fields: defaultNdaData });
  });

  it("returns the reply and the updated fields", async () => {
    const fields = { ...defaultNdaData, governingLaw: "Delaware" };
    stubFetch(200, { reply: "Noted.", fields });
    await expect(sendChat(messages, defaultNdaData)).resolves.toEqual({ reply: "Noted.", fields });
  });

  it.each([
    [503, "The AI assistant is not configured. Set OPENROUTER_API_KEY."],
    [502, "The AI assistant didn't respond. Please try again."],
  ])("uses the server's message for a %i", async (status, detail) => {
    stubFetch(status, { detail });
    await expect(sendChat(messages, defaultNdaData)).rejects.toThrow(new ChatError(detail));
  });

  it("falls back to a generic message when there is no readable detail", async () => {
    stubFetch(422, { detail: [{ msg: "Field required" }] });
    await expect(sendChat(messages, defaultNdaData)).rejects.toThrow("Something went wrong. Please try again.");
  });

  it("reports a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(sendChat(messages, defaultNdaData)).rejects.toThrow("Could not reach the server.");
  });

  it("rejects a response without a reply and fields", async () => {
    stubFetch(200, { reply: "Hi" });
    await expect(sendChat(messages, defaultNdaData)).rejects.toBeInstanceOf(ChatError);
  });
});
