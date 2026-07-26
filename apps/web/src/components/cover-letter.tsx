"use client";

export function CoverLetterCard({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
        Lettre d'accompagnement
      </h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={16}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-adam"
      />
      <p className="mt-2 text-xs text-slate-400">
        Format canadien. Editez librement avant de finaliser.
      </p>
    </div>
  );
}
