"use client";

import type { ReactNode } from "react";

import type { NdaData, Party } from "@/lib/nda/types";

type Props = {
  data: NdaData;
  onChange: (patch: Partial<NdaData>) => void;
};

const input =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-zinc-800">{label}</span>
      {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      {children}
    </label>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-lg border border-zinc-200 bg-white p-5">
      <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">{title}</legend>
      {children}
    </fieldset>
  );
}

function todayIso(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Whole years from 1 to 99; anything else falls back to 1. */
function toYears(value: string): number {
  const n = Math.trunc(Number(value));
  return n >= 1 && n <= 99 ? n : 1;
}

export function NdaForm({ data, onChange }: Props) {
  const updateParty = (index: 0 | 1, patch: Partial<Party>) => {
    const parties: [Party, Party] = [...data.parties];
    parties[index] = { ...parties[index], ...patch };
    onChange({ parties });
  };

  return (
    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
      <Section title="Agreement terms">
        <Field label="Purpose" hint="How Confidential Information may be used">
          <textarea
            className={input}
            rows={3}
            value={data.purpose}
            onChange={(e) => onChange({ purpose: e.target.value })}
          />
        </Field>

        <Field label="Effective date">
          <div className="flex gap-2">
            <input
              type="date"
              className={input}
              value={data.effectiveDate}
              onChange={(e) => onChange({ effectiveDate: e.target.value })}
            />
            <button
              type="button"
              className="shrink-0 rounded-md border border-zinc-300 px-3 text-sm text-zinc-700 hover:bg-zinc-50"
              onClick={() => onChange({ effectiveDate: todayIso() })}
            >
              Today
            </button>
          </div>
        </Field>

        <Field label="MNDA term" hint="The length of this MNDA">
          <div className="space-y-2 text-sm text-zinc-800">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mndaTerm"
                checked={data.mndaTerm === "expires"}
                onChange={() => onChange({ mndaTerm: "expires" })}
              />
              Expires
              <input
                type="number"
                min={1}
                max={99}
                aria-label="MNDA term in years"
                className={`${input} w-20`}
                value={data.mndaTermYears}
                disabled={data.mndaTerm !== "expires"}
                onChange={(e) => onChange({ mndaTermYears: toYears(e.target.value) })}
              />
              year(s) from the effective date
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="mndaTerm"
                checked={data.mndaTerm === "until-terminated"}
                onChange={() => onChange({ mndaTerm: "until-terminated" })}
              />
              Continues until terminated
            </label>
          </div>
        </Field>

        <Field label="Term of confidentiality" hint="How long Confidential Information is protected">
          <div className="space-y-2 text-sm text-zinc-800">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="confidentialityTerm"
                checked={data.confidentialityTerm === "years"}
                onChange={() => onChange({ confidentialityTerm: "years" })}
              />
              <input
                type="number"
                min={1}
                max={99}
                aria-label="Term of confidentiality in years"
                className={`${input} w-20`}
                value={data.confidentialityYears}
                disabled={data.confidentialityTerm !== "years"}
                onChange={(e) => onChange({ confidentialityYears: toYears(e.target.value) })}
              />
              year(s) from the effective date (trade secrets stay protected while they remain trade secrets)
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="confidentialityTerm"
                checked={data.confidentialityTerm === "perpetual"}
                onChange={() => onChange({ confidentialityTerm: "perpetual" })}
              />
              In perpetuity
            </label>
          </div>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Governing law" hint="State whose laws apply">
            <input
              className={input}
              placeholder="Delaware"
              value={data.governingLaw}
              onChange={(e) => onChange({ governingLaw: e.target.value })}
            />
          </Field>
          <Field label="Jurisdiction" hint="Courts that hear disputes">
            <input
              className={input}
              placeholder="Courts located in New Castle, DE"
              value={data.jurisdiction}
              onChange={(e) => onChange({ jurisdiction: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Modifications" hint="Optional changes to the Standard Terms">
          <textarea
            className={input}
            rows={2}
            value={data.modifications}
            onChange={(e) => onChange({ modifications: e.target.value })}
          />
        </Field>
      </Section>

      {([0, 1] as const).map((index) => {
        const party = data.parties[index];
        return (
          <Section key={index} title={`Party ${index + 1}`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company">
                <input
                  className={input}
                  value={party.company}
                  onChange={(e) => updateParty(index, { company: e.target.value })}
                />
              </Field>
              <Field label="Signatory name">
                <input
                  className={input}
                  value={party.name}
                  onChange={(e) => updateParty(index, { name: e.target.value })}
                />
              </Field>
              <Field label="Title">
                <input
                  className={input}
                  value={party.title}
                  onChange={(e) => updateParty(index, { title: e.target.value })}
                />
              </Field>
              <Field label="Notice address" hint="Email or postal address">
                <input
                  className={input}
                  value={party.noticeAddress}
                  onChange={(e) => updateParty(index, { noticeAddress: e.target.value })}
                />
              </Field>
            </div>
          </Section>
        );
      })}
    </form>
  );
}
