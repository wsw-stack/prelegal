import type { NdaData } from "@/lib/nda/types";

export type ChatMessage = { role: "user" | "assistant"; content: string };

/** One assistant turn: what it said, and the whole updated document. */
export type ChatTurn = { reply: string; fields: NdaData };

/** A chat request failed. The message is safe to show to the user. */
export class ChatError extends Error {}

/**
 * Sends the conversation and the current fields to the backend, which asks the
 * AI for its next reply and the updated fields.
 */
export async function sendChat(messages: ChatMessage[], fields: NdaData): Promise<ChatTurn> {
  let response: Response;
  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, fields }),
    });
  } catch {
    throw new ChatError("Could not reach the server. Check your connection and try again.");
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    // FastAPI puts a readable message in `detail` for 502/503; 422 details are a list.
    const detail = typeof body?.detail === "string" ? body.detail : "Something went wrong. Please try again.";
    throw new ChatError(detail);
  }
  if (typeof body?.reply !== "string" || typeof body?.fields !== "object" || body.fields === null) {
    throw new ChatError("The AI assistant sent an unexpected response. Please try again.");
  }
  return body as ChatTurn;
}
