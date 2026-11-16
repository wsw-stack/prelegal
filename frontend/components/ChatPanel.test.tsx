// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { defaultNdaData } from "@/lib/nda/types";

import { ChatPanel, GREETING } from "./ChatPanel";

function respond(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status });
}

function setup(...responses: (Response | Promise<Response>)[]) {
  const fetch = vi.fn();
  responses.forEach((r) => fetch.mockReturnValueOnce(r instanceof Promise ? r : Promise.resolve(r)));
  vi.stubGlobal("fetch", fetch);
  const onFieldsChange = vi.fn();
  const user = userEvent.setup();
  render(<ChatPanel data={defaultNdaData} onFieldsChange={onFieldsChange} />);
  const log = screen.getByRole("log");
  const box = screen.getByRole("textbox", { name: "Message" });
  const send = screen.getByRole("button", { name: "Send" });
  const sentBody = (call = 0) => JSON.parse(fetch.mock.calls[call][1].body);
  return { fetch, onFieldsChange, user, log, box, send, sentBody };
}

afterEach(() => vi.unstubAllGlobals());

const filled = { ...defaultNdaData, governingLaw: "Delaware" };

describe("ChatPanel", () => {
  it("opens with a greeting without calling the server", () => {
    const { fetch, log, send } = setup();
    expect(log).toHaveTextContent(GREETING);
    expect(fetch).not.toHaveBeenCalled();
    expect(send).toBeDisabled();
  });

  it("sends the message, shows the reply and passes on the updated fields", async () => {
    const { user, log, box, send, onFieldsChange, sentBody } = setup(respond(200, { reply: "Delaware it is.", fields: filled }));
    await user.type(box, "Use Delaware law");
    await user.click(send);

    expect(await within(log).findByText("Delaware it is.")).toBeInTheDocument();
    expect(within(log).getByText("Use Delaware law")).toBeInTheDocument();
    expect(onFieldsChange).toHaveBeenCalledWith(filled);
    expect(box).toHaveValue("");
    // The greeting is display-only; the conversation sent starts with the user.
    expect(sentBody()).toEqual({ messages: [{ role: "user", content: "Use Delaware law" }], fields: defaultNdaData });
  });

  it("sends the whole conversation on later turns", async () => {
    const { user, box, sentBody, log } = setup(
      respond(200, { reply: "Which state?", fields: defaultNdaData }),
      respond(200, { reply: "Done.", fields: filled }),
    );
    await user.type(box, "Acme and Globex{Enter}");
    await within(log).findByText("Which state?");
    await user.type(box, "Delaware{Enter}");
    await within(log).findByText("Done.");

    expect(sentBody(1).messages).toEqual([
      { role: "user", content: "Acme and Globex" },
      { role: "assistant", content: "Which state?" },
      { role: "user", content: "Delaware" },
    ]);
  });

  it("sends on Enter but adds a new line on Shift+Enter", async () => {
    const { user, box, fetch } = setup(respond(200, { reply: "Ok", fields: defaultNdaData }));
    await user.type(box, "line one{Shift>}{Enter}{/Shift}line two");
    expect(fetch).not.toHaveBeenCalled();
    expect(box).toHaveValue("line one\nline two");

    await user.type(box, "{Enter}");
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("shows that it is thinking and blocks sending until the reply arrives", async () => {
    let resolve!: (r: Response) => void;
    const { user, box, send, log } = setup(new Promise<Response>((r) => (resolve = r)));
    await user.type(box, "Hello{Enter}");

    expect(log).toHaveTextContent("Thinking…");
    await user.type(box, "More");
    expect(send).toBeDisabled();

    resolve(respond(200, { reply: "Hi!", fields: defaultNdaData }));
    expect(await within(log).findByText("Hi!")).toBeInTheDocument();
    expect(log).not.toHaveTextContent("Thinking…");
  });

  it("on failure shows the error, keeps the document and lets the user resend", async () => {
    const { user, box, send, log, onFieldsChange } = setup(
      respond(503, { detail: "The AI assistant is not configured. Set OPENROUTER_API_KEY." }),
      respond(200, { reply: "Got it.", fields: filled }),
    );
    await user.type(box, "Acme and Globex{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("not configured");
    expect(onFieldsChange).not.toHaveBeenCalled();
    expect(box).toHaveValue("Acme and Globex");
    expect(within(log).queryByText("Acme and Globex")).not.toBeInTheDocument();

    await user.click(send);
    expect(await within(log).findByText("Got it.")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onFieldsChange).toHaveBeenCalledWith(filled);
  });
});
