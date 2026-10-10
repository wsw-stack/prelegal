import { describe, expect, it } from "vitest";

import { buildCoverPage, formatDate, pdfFilename } from "./coverPage";
import { defaultNdaData, type NdaData } from "./types";

function section(data: NdaData, heading: string) {
  return buildCoverPage(data).sections.find((s) => s.heading === heading)!;
}

describe("buildCoverPage", () => {
  it("marks blank fields as missing placeholders", () => {
    const cover = buildCoverPage(defaultNdaData);
    expect(section(defaultNdaData, "Effective Date").lines[0]).toEqual({ text: "[Effective date]", missing: true });
    expect(section(defaultNdaData, "Governing Law & Jurisdiction").lines[0]).toEqual({
      text: "Governing Law: [State]",
      missing: true,
    });
    expect(cover.partyRows.find((r) => r.label === "Company")!.values[0].missing).toBe(true);
  });

  it("fills in the user's values", () => {
    const data: NdaData = {
      ...defaultNdaData,
      effectiveDate: "2026-10-10",
      governingLaw: "Delaware",
      parties: [
        { name: "Ada", title: "CEO", company: "Acme", noticeAddress: "ada@acme.com" },
        defaultNdaData.parties[1],
      ],
    };
    expect(section(data, "Effective Date").lines[0]).toEqual({ text: "October 10, 2026", missing: false });
    expect(section(data, "Governing Law & Jurisdiction").lines[0].text).toBe("Governing Law: Delaware");
    expect(buildCoverPage(data).partyRows.find((r) => r.label === "Company")!.values[0]).toEqual({
      text: "Acme",
      missing: false,
    });
  });

  it("describes term choices with correct pluralization", () => {
    expect(section({ ...defaultNdaData, mndaTermYears: 1 }, "MNDA Term").lines[0].text).toBe(
      "Expires 1 year from Effective Date.",
    );
    expect(section({ ...defaultNdaData, mndaTermYears: 3 }, "MNDA Term").lines[0].text).toBe(
      "Expires 3 years from Effective Date.",
    );
    expect(section({ ...defaultNdaData, mndaTerm: "until-terminated" }, "MNDA Term").lines[0].text).toMatch(
      /^Continues until terminated/,
    );
    expect(
      section({ ...defaultNdaData, confidentialityTerm: "perpetual" }, "Term of Confidentiality").lines[0].text,
    ).toBe("In perpetuity.");
  });

  it("says None when there are no modifications", () => {
    expect(section(defaultNdaData, "MNDA Modifications").lines[0]).toEqual({ text: "None.", missing: false });
  });
});

describe("formatDate", () => {
  it("returns an empty string for blank or invalid dates", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });

  it("treats a partially typed year as invalid", () => {
    expect(formatDate("0026-10-10")).toBe("");
  });
});

describe("pdfFilename", () => {
  it("includes sanitized company names", () => {
    const parties: NdaData["parties"] = [
      { ...defaultNdaData.parties[0], company: "Acme, Inc." },
      { ...defaultNdaData.parties[1], company: "Globex" },
    ];
    expect(pdfFilename({ ...defaultNdaData, parties })).toBe("Mutual-NDA-Acme-Inc-Globex.pdf");
  });

  it("falls back to a generic name", () => {
    expect(pdfFilename(defaultNdaData)).toBe("Mutual-NDA.pdf");
  });
});
