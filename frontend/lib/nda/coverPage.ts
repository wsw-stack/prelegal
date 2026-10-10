import type { NdaData, Party } from "./types";

/** A filled-in value, or a bracketed placeholder when the user left it blank. */
export type Field = { text: string; missing: boolean };

export type CoverSection = {
  heading: string;
  hint?: string;
  lines: Field[];
};

export type PartyRow = {
  label: string;
  hint?: string;
  values: [Field, Field];
};

export type CoverPage = {
  sections: CoverSection[];
  partyRows: PartyRow[];
};

const BLANK: Field = { text: "", missing: false };

function field(value: string, placeholder: string, prefix = ""): Field {
  const text = value.trim();
  return text ? { text: prefix + text, missing: false } : { text: `${prefix}[${placeholder}]`, missing: true };
}

function years(n: number): string {
  return `${n} year${n === 1 ? "" : "s"}`;
}

/** Formats "2026-10-10" as "October 10, 2026" without timezone drift. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  // A year below 1000 is a partially typed date (e.g. "0026"), not a real effective date.
  if (!y || y < 1000 || !m || !d) return "";
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function partyField(parties: [Party, Party], key: keyof Party, placeholder: string): [Field, Field] {
  return [field(parties[0][key], placeholder), field(parties[1][key], placeholder)];
}

/** Turns the form data into the cover page content shown in the preview and the PDF. */
export function buildCoverPage(data: NdaData): CoverPage {
  const mndaTerm =
    data.mndaTerm === "expires"
      ? `Expires ${years(data.mndaTermYears)} from Effective Date.`
      : "Continues until terminated in accordance with the terms of the MNDA.";

  const confidentialityTerm =
    data.confidentialityTerm === "years"
      ? `${years(data.confidentialityYears)} from Effective Date, but in the case of trade secrets until Confidential Information is no longer considered a trade secret under applicable laws.`
      : "In perpetuity.";

  return {
    sections: [
      { heading: "Purpose", hint: "How Confidential Information may be used", lines: [field(data.purpose, "Purpose")] },
      { heading: "Effective Date", lines: [field(formatDate(data.effectiveDate), "Effective date")] },
      { heading: "MNDA Term", hint: "The length of this MNDA", lines: [{ text: mndaTerm, missing: false }] },
      {
        heading: "Term of Confidentiality",
        hint: "How long Confidential Information is protected",
        lines: [{ text: confidentialityTerm, missing: false }],
      },
      {
        heading: "Governing Law & Jurisdiction",
        lines: [
          field(data.governingLaw, "State", "Governing Law: "),
          field(data.jurisdiction, "City or county and state", "Jurisdiction: "),
        ],
      },
      {
        heading: "MNDA Modifications",
        lines: [data.modifications.trim() ? field(data.modifications, "") : { text: "None.", missing: false }],
      },
    ],
    partyRows: [
      { label: "Signature", values: [BLANK, BLANK] },
      { label: "Print Name", values: partyField(data.parties, "name", "Name") },
      { label: "Title", values: partyField(data.parties, "title", "Title") },
      { label: "Company", values: partyField(data.parties, "company", "Company") },
      {
        label: "Notice Address",
        hint: "Use either email or postal address",
        values: partyField(data.parties, "noticeAddress", "Email or postal address"),
      },
      { label: "Date", values: [BLANK, BLANK] },
    ],
  };
}

/** Builds a safe download filename such as "Mutual-NDA-Acme-Globex.pdf". */
export function pdfFilename(data: NdaData): string {
  const slug = (s: string) => s.trim().replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const names = data.parties.map((p) => slug(p.company)).filter(Boolean);
  return ["Mutual-NDA", ...names].join("-") + ".pdf";
}
