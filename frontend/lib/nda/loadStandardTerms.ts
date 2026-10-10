import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";

import { parseStandardTerms } from "./standardTerms";

/** Source of truth for the legal text: the shared template dataset at the repo root. */
const TEMPLATE_PATH = path.join(process.cwd(), "..", "templates", "mutual-nda.md");

export async function loadStandardTerms() {
  "use cache";
  cacheLife("max");
  return parseStandardTerms(await readFile(TEMPLATE_PATH, "utf8"));
}
