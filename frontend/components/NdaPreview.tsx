import { ATTRIBUTION, COVER_INTRO, SIGNING_STATEMENT } from "@/lib/nda/boilerplate";
import type { CoverPage, Field } from "@/lib/nda/coverPage";
import type { Clause } from "@/lib/nda/standardTerms";

function Value({ field }: { field: Field }) {
  return field.missing ? <span className="rounded bg-amber-100 px-1 text-amber-800">{field.text}</span> : <>{field.text}</>;
}

function Attribution() {
  return (
    <p className="text-xs text-zinc-500">
      {ATTRIBUTION.prefix}
      <a className="underline" href={ATTRIBUTION.version.url} target="_blank" rel="noreferrer">
        {ATTRIBUTION.version.text}
      </a>
      {ATTRIBUTION.middle}
      <a className="underline" href={ATTRIBUTION.license.url} target="_blank" rel="noreferrer">
        {ATTRIBUTION.license.text}
      </a>
      {ATTRIBUTION.suffix}
    </p>
  );
}

/** On-screen rendering of the completed Mutual NDA. */
export function NdaPreview({ cover, clauses }: { cover: CoverPage; clauses: Clause[] }) {
  return (
    <article className="space-y-8 bg-white px-6 py-10 font-serif text-[15px] leading-relaxed text-zinc-900 shadow-sm ring-1 ring-zinc-200 sm:px-12">
      <header className="space-y-4">
        <h1 className="text-center text-2xl font-bold">Mutual Non-Disclosure Agreement</h1>
        <p className="text-sm">{COVER_INTRO}</p>
      </header>

      <section className="space-y-5">
        {cover.sections.map((section) => (
          <div key={section.heading}>
            <h2 className="font-bold">{section.heading}</h2>
            {section.hint && <p className="text-xs italic text-zinc-500">{section.hint}</p>}
            {section.lines.map((line, i) => (
              <p key={i} className="whitespace-pre-wrap">
                <Value field={line} />
              </p>
            ))}
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <p>{SIGNING_STATEMENT}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-1/4 border border-zinc-300 p-2" />
                <th className="border border-zinc-300 p-2">PARTY 1</th>
                <th className="border border-zinc-300 p-2">PARTY 2</th>
              </tr>
            </thead>
            <tbody>
              {cover.partyRows.map((row) => (
                <tr key={row.label}>
                  <th className="border border-zinc-300 p-2 text-left align-top font-semibold">
                    {row.label}
                    {row.hint && <span className="block text-xs font-normal italic text-zinc-500">{row.hint}</span>}
                  </th>
                  {row.values.map((value, i) => (
                    <td key={i} className="h-10 border border-zinc-300 p-2 align-top">
                      <Value field={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Attribution />
      </section>

      <section className="space-y-4 border-t border-zinc-200 pt-8">
        <h2 className="text-center text-xl font-bold">Standard Terms</h2>
        <ol className="space-y-3">
          {clauses.map((clause) => (
            <li key={clause.number} className="sm:text-justify">
              {clause.number}. <strong>{clause.title}</strong>.{" "}
              {clause.body.map((run, i) =>
                run.bold ? (
                  <strong key={i}>{run.text}</strong>
                ) : run.term ? (
                  <span key={i} className="font-semibold text-indigo-700">
                    {run.text}
                  </span>
                ) : (
                  run.text
                ),
              )}
            </li>
          ))}
        </ol>
        <Attribution />
      </section>
    </article>
  );
}
