"use client";

import { useState } from "react";

interface CvData {
  contact?: { name?: string; email?: string; phone?: string; location?: string };
  summary?: string;
  coreCompetencies?: string[];
  experience?: {
    company?: string;
    title?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
    bullets?: string[];
  }[];
  education?: { institution?: string; degree?: string; field?: string }[];
  languages?: { name: string; level: string }[];
}

export function CvPreview({
  cv,
  onChange,
}: {
  cv: CvData;
  onChange?: (cv: CvData) => void;
}) {
  const [draft, setDraft] = useState<CvData>(cv);

  const update = (next: CvData) => {
    setDraft(next);
    onChange?.(next);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      {/* Header */}
      <header className="mb-6 border-b border-slate-200 pb-4">
        <EditableText
          value={draft.contact?.name ?? ""}
          placeholder="Votre nom"
          className="text-2xl font-bold text-slate-900"
          onChange={(v) =>
            update({ ...draft, contact: { ...draft.contact, name: v } })
          }
        />
        <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-600">
          <EditableText
            value={draft.contact?.email ?? ""}
            placeholder="email"
            onChange={(v) =>
              update({ ...draft, contact: { ...draft.contact, email: v } })
            }
          />
          <EditableText
            value={draft.contact?.phone ?? ""}
            placeholder="telephone"
            onChange={(v) =>
              update({ ...draft, contact: { ...draft.contact, phone: v } })
            }
          />
          <EditableText
            value={draft.contact?.location ?? ""}
            placeholder="ville, province"
            onChange={(v) =>
              update({ ...draft, contact: { ...draft.contact, location: v } })
            }
          />
        </div>
      </header>

      {/* Summary */}
      {draft.summary != null && (
        <section className="mb-6">
          <SectionTitle>Profil professionnel</SectionTitle>
          <EditableText
            value={draft.summary}
            multiline
            onChange={(v) => update({ ...draft, summary: v })}
          />
        </section>
      )}

      {/* Competencies */}
      {draft.coreCompetencies && draft.coreCompetencies.length > 0 && (
        <section className="mb-6">
          <SectionTitle>Competences cles</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {draft.coreCompetencies.map((c, i) => (
              <span
                key={i}
                className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {draft.experience && draft.experience.length > 0 && (
        <section className="mb-6">
          <SectionTitle>Experience professionnelle</SectionTitle>
          <div className="space-y-5">
            {draft.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between">
                  <h4 className="font-semibold text-slate-900">
                    {exp.title}
                    {exp.company ? ` — ${exp.company}` : ""}
                  </h4>
                  <span className="text-xs text-slate-400">
                    {[exp.startDate, exp.endDate].filter(Boolean).join(" - ")}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {draft.education && draft.education.length > 0 && (
        <section className="mb-6">
          <SectionTitle>Formation</SectionTitle>
          <div className="space-y-2">
            {draft.education.map((ed, i) => (
              <div key={i} className="text-sm">
                <span className="font-medium text-slate-900">
                  {ed.degree}
                  {ed.field ? `, ${ed.field}` : ""}
                </span>
                {ed.institution ? ` — ${ed.institution}` : ""}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Languages */}
      {draft.languages && draft.languages.length > 0 && (
        <section>
          <SectionTitle>Langues</SectionTitle>
          <div className="text-sm text-slate-700">
            {draft.languages.map((l, i) => (
              <span key={i}>
                {i > 0 ? ", " : ""}
                {l.name}
                {l.level ? ` (${l.level})` : ""}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-2 border-b border-slate-100 pb-1 text-xs font-bold uppercase tracking-wider text-adam">
      {children}
    </h3>
  );
}

function EditableText({
  value,
  onChange,
  placeholder,
  className = "",
  multiline = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className={`w-full resize-y rounded border border-transparent px-1 py-0.5 text-sm text-slate-700 hover:border-slate-200 focus:border-adam focus:outline-none ${className}`}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`rounded border border-transparent px-1 py-0.5 text-sm hover:border-slate-200 focus:border-adam focus:outline-none ${className}`}
    />
  );
}
