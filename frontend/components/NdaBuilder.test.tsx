// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Clause } from "@/lib/nda/standardTerms";

import { NdaBuilder } from "./NdaBuilder";

const toBlob = vi.fn();
vi.mock("@react-pdf/renderer", () => ({ pdf: () => ({ toBlob }) }));
vi.mock("./NdaPdf", () => ({ NdaPdf: () => null }));

const clauses: Clause[] = [
  { number: 1, title: "Introduction", body: [{ text: "Use for the " }, { text: "Purpose", term: true }, { text: "." }] },
];

function setup() {
  const user = userEvent.setup();
  render(<NdaBuilder clauses={clauses} />);
  const preview = screen.getByRole("article");
  const party = (n: 1 | 2) => within(screen.getByRole("group", { name: `Party ${n}` }));
  return { user, preview, party };
}

describe("NdaBuilder", () => {
  it("starts with every required field highlighted as missing", () => {
    const { preview } = setup();
    expect(screen.getByText("11 fields still empty (highlighted).")).toBeInTheDocument();
    expect(preview).toHaveTextContent("[Effective date]");
    expect(preview).toHaveTextContent("Use for the Purpose.");
  });

  it("updates the preview and missing count as the user types", async () => {
    const { user, preview, party } = setup();
    await user.type(party(1).getByLabelText("Company"), "Acme");
    expect(within(preview).getByRole("cell", { name: "Acme" })).toBeInTheDocument();
    expect(screen.getByText("10 fields still empty (highlighted).")).toBeInTheDocument();
  });

  it("keeps the two parties independent", async () => {
    const { user, party } = setup();
    await user.type(party(2).getByLabelText("Company"), "Globex");
    expect(party(1).getByLabelText("Company")).toHaveValue("");
    expect(party(2).getByLabelText("Company")).toHaveValue("Globex");
  });

  it("fills in today's date from the Today button", async () => {
    const { user, preview } = setup();
    await user.click(screen.getByRole("button", { name: "Today" }));
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    expect(preview).toHaveTextContent(today);
  });

  it("switches MNDA term options and disables the unused years input", async () => {
    const { user, preview } = setup();
    const years = screen.getByLabelText("MNDA term in years");
    await user.clear(years);
    await user.type(years, "3");
    expect(preview).toHaveTextContent("Expires 3 years from Effective Date.");

    await user.click(screen.getByRole("radio", { name: "Continues until terminated" }));
    expect(years).toBeDisabled();
    expect(preview).toHaveTextContent("Continues until terminated in accordance with the terms of the MNDA.");
  });

  it("lets the user clear a years field and type a new value", async () => {
    const { user, preview } = setup();
    const years = screen.getByLabelText("MNDA term in years");
    await user.clear(years);
    await user.type(years, "5");
    expect(years).toHaveValue(5);
    expect(preview).toHaveTextContent("Expires 5 years from Effective Date.");
  });

  it("clamps out-of-range years to 1–99", async () => {
    const { user, preview } = setup();
    const years = screen.getByLabelText("Term of confidentiality in years");
    await user.clear(years);
    await user.type(years, "100");
    await user.tab();
    expect(years).toHaveValue(99);
    expect(preview).toHaveTextContent("99 years from Effective Date");

    await user.clear(years);
    await user.type(years, "0");
    await user.tab();
    expect(years).toHaveValue(1);
    expect(preview).toHaveTextContent("1 year from Effective Date");
  });

  it("labels each radio option by its own text", () => {
    setup();
    for (const name of ["Expires", "Continues until terminated", "In perpetuity"]) {
      expect(screen.getByRole("radio", { name: new RegExp(`^${name}`) })).toBeInTheDocument();
    }
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
      const { user, party } = setup();
      await user.type(party(1).getByLabelText("Company"), "Acme, Inc.");
      await user.type(party(2).getByLabelText("Company"), "Globex");

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
