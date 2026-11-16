"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { ChatError, sendChat, type ChatMessage } from "@/lib/chat/api";
import type { NdaData } from "@/lib/nda/types";
import { input } from "@/lib/ui";

/** Shown first, but not sent: the backend's instructions already set up the conversation. */
export const GREETING =
  "Hi! I'll help you draft your Mutual NDA. To start, which two companies are entering into the agreement?";

type Props = {
  data: NdaData;
  onFieldsChange: (fields: NdaData) => void;
};

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.role === "user";
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <p
        className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
          mine ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-900"
        }`}
      >
        {message.content}
      </p>
    </div>
  );
}

/** A chat with the AI assistant, which fills in the document as the user answers. */
export function ChatPanel({ data, onFieldsChange }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Optional call: jsdom has no scrollIntoView.
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages, pending]);

  async function submit(e?: FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || pending) return;

    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setDraft("");
    setError(null);
    setPending(true);
    try {
      const turn = await sendChat(history, data);
      setMessages([...history, { role: "assistant", content: turn.reply }]);
      onFieldsChange(turn.fields);
    } catch (err) {
      if (!(err instanceof ChatError)) console.error(err);
      // Take the message back out and return it to the input, so the user can resend it.
      setMessages(messages);
      setDraft(text);
      setError(err instanceof ChatError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      void submit();
    }
  }

  return (
    <section
      aria-label="Chat with the AI assistant"
      className="flex h-[32rem] flex-col rounded-lg border border-zinc-200 bg-white lg:h-[calc(100vh-14rem)]"
    >
      <div role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto p-4">
        <Bubble message={{ role: "assistant", content: GREETING }} />
        {messages.map((message, i) => (
          <Bubble key={i} message={message} />
        ))}
        {pending && <p className="text-sm text-zinc-500">Thinking…</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="space-y-2 border-t border-zinc-200 p-4">
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            aria-label="Message"
            className={`${input} resize-none`}
            rows={2}
            placeholder="Type your answer…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            type="submit"
            disabled={pending || !draft.trim()}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </form>
    </section>
  );
}
