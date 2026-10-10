/** A run of text; `term` marks a reference to a value defined on the cover page. */
export type Run = { text: string; bold?: boolean; term?: boolean };

export type Clause = {
  number: number;
  title: string;
  body: Run[];
};

const CLAUSE = /^(\d+)\.\s+\*\*(.+?)\*\*\.\s*(.*)$/;
const INLINE = /\*\*([^*]+)\*\*|<span class="coverpage_link">([^<]+)<\/span>/g;

function parseRuns(text: string): Run[] {
  const runs: Run[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) runs.push({ text: text.slice(last, match.index) });
    runs.push(match[1] !== undefined ? { text: match[1], bold: true } : { text: match[2], term: true });
    last = match.index + match[0].length;
  }
  if (last < text.length) runs.push({ text: text.slice(last) });
  return runs;
}

/** Parses the numbered clauses of Common Paper's Mutual NDA Standard Terms markdown. */
export function parseStandardTerms(markdown: string): Clause[] {
  const clauses = markdown.split("\n").flatMap((line) => {
    const match = CLAUSE.exec(line.trim());
    return match ? [{ number: Number(match[1]), title: match[2], body: parseRuns(match[3]) }] : [];
  });
  if (clauses.length === 0) throw new Error("No clauses found in the Mutual NDA standard terms template");
  return clauses;
}
