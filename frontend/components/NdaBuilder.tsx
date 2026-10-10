"use client";

import { useMemo, useState } from "react";

import { buildCoverPage, pdfFilename } from "@/lib/nda/coverPage";
import type { Clause } from "@/lib/nda/standardTerms";
import { defaultNdaData, type NdaData } from "@/lib/nda/types";

import { NdaForm } from "./NdaForm";
import { NdaPreview } from "./NdaPreview";

/** Form on the left, live document preview on the right, and PDF download. */
export function NdaBuilder({ clauses }: { clauses: Clause[] }) {
  const [data, setData] = useState<NdaData>(defaultNdaData);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cover = useMemo(() => buildCoverPage(data), [data]);
  const missingCount = useMemo(
    () => [...cover.sections.flatMap((s) => s.lines), ...cover.partyRows.flatMap((r) => r.values)].filter((f) => f.missing).length,
    [cover],
  );

  async function download() {
    setDownloading(true);
    setError(null);
    try {
      // Loaded on demand: the PDF renderer is large and only needed here.
      const [{ pdf }, { NdaPdf }] = await Promise.all([import("@react-pdf/renderer"), import("./NdaPdf")]);
      const blob = await pdf(<NdaPdf cover={cover} clauses={clauses} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFilename(data);
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (e) {
      console.error(e);
      setError("Could not generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-900">Mutual NDA creator</h1>
          <p className="text-sm text-zinc-600">
            Fill in the details below. The agreement on the right updates as you type, and you can download it as a PDF.
          </p>
        </header>
        <NdaForm data={data} onChange={(patch) => setData((prev) => ({ ...prev, ...patch }))} />
      </div>

      <div className="space-y-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-zinc-600">
            {missingCount === 0
              ? "All fields are filled in."
              : `${missingCount} field${missingCount === 1 ? "" : "s"} still empty (highlighted).`}
          </p>
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 disabled:opacity-60"
          >
            {downloading ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <NdaPreview cover={cover} clauses={clauses} />
      </div>
    </div>
  );
}
