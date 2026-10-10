// Bundled at build time from the shared template dataset, so nothing is read from disk at runtime.
import markdown from "../../../templates/mutual-nda.md?raw";

import { parseStandardTerms } from "./standardTerms";

export const standardTerms = parseStandardTerms(markdown);
