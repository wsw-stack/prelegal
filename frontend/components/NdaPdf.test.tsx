import { readFileSync } from "node:fs";
import path from "node:path";

import { renderToBuffer } from "@react-pdf/renderer";
import { describe, expect, it } from "vitest";

import { buildCoverPage } from "@/lib/nda/coverPage";
import { parseStandardTerms } from "@/lib/nda/standardTerms";
import { defaultNdaData } from "@/lib/nda/types";

import { NdaPdf } from "./NdaPdf";

describe("NdaPdf", () => {
  it("renders the agreement to a PDF", async () => {
    const clauses = parseStandardTerms(readFileSync(path.join(__dirname, "../../templates/mutual-nda.md"), "utf8"));
    const buffer = await renderToBuffer(<NdaPdf cover={buildCoverPage(defaultNdaData)} clauses={clauses} />);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
