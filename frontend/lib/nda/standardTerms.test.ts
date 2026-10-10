import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { parseStandardTerms } from "./standardTerms";

const template = readFileSync(path.join(__dirname, "../../../templates/mutual-nda.md"), "utf8");

describe("parseStandardTerms", () => {
  it("parses all 11 clauses of the Mutual NDA template", () => {
    const clauses = parseStandardTerms(template);
    expect(clauses.map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(clauses[0].title).toBe("Introduction");
    expect(clauses[10].title).toBe("General");
  });

  it("leaves no markdown or HTML markup in the text", () => {
    const text = parseStandardTerms(template)
      .flatMap((c) => [c.title, ...c.body.map((r) => r.text)])
      .join(" ");
    expect(text).not.toMatch(/\*\*|<span|<\/span>/);
  });

  it("splits bold text and cover page references into runs", () => {
    const [clause] = parseStandardTerms(
      '1. **Intro**. Use for the <span class="coverpage_link">Purpose</span> (“**MNDA**”) only.',
    );
    expect(clause.body).toEqual([
      { text: "Use for the " },
      { text: "Purpose", term: true },
      { text: " (“" },
      { text: "MNDA", bold: true },
      { text: "”) only." },
    ]);
  });

  it("throws when the template has no clauses", () => {
    expect(() => parseStandardTerms("# Nothing here")).toThrow();
  });
});
