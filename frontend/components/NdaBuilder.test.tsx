// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Clause } from "@/lib/nda/standardTerms";
import { defaultNdaData, type NdaData } from "@/lib/nda/types";

import { NdaBuilder } from "./NdaBuilder";

const toBlob = vi.fn();
vi.mock("@react-pdf/renderer", () => ({ pdf: () => ({ toBlob }) }));
vi.mock("./NdaPdf", () => ({ NdaPdf: () => null }));

const clauses: Clause[] = [
  { number: 1, title: "Introduction", body: [{ text: "Use for the " }, { text: "Purpose", term: true }, { text: "." }] },
];

const party = (company: string) => ({ name: "", title: "", company, noticeAddress: "" });

/** Makes the next chat request answer with `reply` and these fields. */
function replyWith(reply: string, fields: NdaData) {
  vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ reply, fields }), { status: 200 }));
}

function setup() {
  const user = userEvent.setup();
  render(<NdaBuilder clauses={clauses} />);
  const preview = screen.getByRole("article");
  const say = async (text: string, reply: string) => {
    await user.type(screen.getByRole("textbox", { name: "Message" }), `${text}{Enter}`);
    await screen.findByText(reply);
  };
  return { user, preview, say };
}

beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
afterEach(() => vi.unstubAllGlobals());

describe("NdaBuilder", () => {
  it("starts with the chat and every required field highlighted as missing", () => {
    const { preview } = setup();
    expect(screen.getByRole("region", { name: "Chat with the AI assistant" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Company")).not.toBeInTheDocument();
    expect(screen.getByText("11 fields still empty (highlighted).")).toBeInTheDocument();
    expect(preview).toHaveTextContent("[Effective date]");
    expect(preview).toHaveTextContent("Use for the Purpose.");
  });

  it("fills in the preview and missing count from the chat", async () => {
    const { preview, say } = setup();
    replyWith("Thanks! Who signs for Acme?", {
      ...defaultNdaData,
      effectiveDate: "2026-11-15",
      governingLaw: "Delaware",
      parties: [party("Acme"), party("Globex")],
    });
    await say("Acme and Globex, Delaware law, starting 15 Nov 2026", "Thanks! Who signs for Acme?");

    expect(within(preview).getByRole("cell", { name: "Acme" })).toBeInTheDocument();
    expect(within(preview).getByRole("cell", { name: "Globex" })).toBeInTheDocument();
    expect(preview).toHaveTextContent("November 15, 2026");
    expect(screen.getByText("7 fields still empty (highlighted).")).toBeInTheDocument();
  });

  it("sends the current fields with each message", async () => {
    const { say } = setup();
    const afterFirst = { ...defaultNdaData, parties: [party("Acme"), party("Globex")] as NdaData["parties"] };
    replyWith("Which state's law?", afterFirst);
    await say("Acme and Globex", "Which state's law?");
    replyWith("Delaware it is.", { ...afterFirst, governingLaw: "Delaware" });
    await say("Delaware", "Delaware it is.");

    const sent = JSON.parse(vi.mocked(fetch).mock.calls[1][1]!.body as string);
    expect(sent.fields).toEqual(afterFirst);
  });

  describe("PDF download", () => {
    let downloads: string[];

    beforeEach(() => {
      downloads = [];
      URL.createObjectURL = vi.fn(() => "blob:nda");
      URL.revokeObjectURL = vi.fn();
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
        downloads.push(this.download);
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      toBlob.mockReset();
    });

    it("downloads a PDF named after the companies", async () => {
      toBlob.mockResolvedValue(new Blob(["%PDF-"]));
      const { user, say } = setup();
      replyWith("Done.", { ...defaultNdaData, parties: [party("Acme, Inc."), party("Globex")] });
      await say("Acme, Inc. and Globex", "Done.");

      await user.click(screen.getByRole("button", { name: "Download PDF" }));

      expect(await screen.findByRole("button", { name: "Download PDF" })).toBeEnabled();
      expect(downloads).toEqual(["Mutual-NDA-Acme-Inc-Globex.pdf"]);
    });

    it("shows an error and re-enables the button when generation fails", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      toBlob.mockRejectedValue(new Error("boom"));
      const { user } = setup();

      await user.click(screen.getByRole("button", { name: "Download PDF" }));

      expect(await screen.findByText("Could not generate the PDF. Please try again.")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Download PDF" })).toBeEnabled();
      expect(downloads).toEqual([]);
    });
  });
});
