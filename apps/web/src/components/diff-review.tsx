"use client";

export interface Change {
  id: string;
  kind:
    | "summary_edited"
    | "bullet_added"
    | "bullet_removed"
    | "bullet_edited"
    | "bullet_reorder"
    | "skill_added"
    | "skill_removed"
    | "experience_added"
    | "experience_removed";
  section: "summary" | "coreCompetencies" | "experience";
  experienceKey?: string;
  oldValue?: string;
  newValue?: string;
  oldIndex?: number;
  newIndex?: number;
}

const KIND_META: Record<Change["kind"], { label: string; color: string }> = {
  summary_edited: { label: "Profil modifie", color: "bg-blue-50 text-blue-700 border-blue-200" },
  bullet_added: { label: "Ajout", color: "bg-green-50 text-green-700 border-green-200" },
  bullet_removed: { label: "Retire", color: "bg-red-50 text-red-700 border-red-200" },
  bullet_edited: { label: "Modifie", color: "bg-amber-50 text-amber-700 border-amber-200" },
  bullet_reorder: { label: "Reordonne", color: "bg-purple-50 text-purple-700 border-purple-200" },
  skill_added: { label: "Competence ajoutee", color: "bg-green-50 text-green-700 border-green-200" },
  skill_removed: { label: "Competence retiree", color: "bg-red-50 text-red-700 border-red-200" },
  experience_added: { label: "Experience ajoutee", color: "bg-green-50 text-green-700 border-green-200" },
  experience_removed: { label: "Experience retiree", color: "bg-red-50 text-red-700 border-red-200" },
};

export function DiffReview({
  changes,
  accepted,
  onToggle,
}: {
  changes: Change[];
  accepted: Set<string>;
  onToggle: (id: string) => void;
}) {
  // Group by experience key for readability
  const groups = new Map<string, Change[]>();
  for (const c of changes) {
    const key = c.experienceKey ?? c.section;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(c);
  }

  return (
    <div className="space-y-3">
      {[...groups.entries()].map(([key, group]) => (
        <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            {key === "experience" ? key : key.replace("|", " - ")}
          </h4>
          <div className="space-y-2">
            {group.map((c) => {
              const meta = KIND_META[c.kind];
              const isAccepted = accepted.has(c.id);
              return (
                <div
                  key={c.id}
                  className={`rounded-lg border p-3 transition ${
                    isAccepted ? meta.color : "border-slate-200 bg-slate-50 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                        {meta.label}
                      </span>
                      {(c.kind === "bullet_added" || c.kind === "skill_added" || c.kind === "experience_added") && (
                        <p className="text-sm text-slate-800">
                          <span className="text-green-600">+</span> {c.newValue?.slice(0, 200)}
                        </p>
                      )}
                      {(c.kind === "bullet_removed" || c.kind === "skill_removed") && (
                        <p className="text-sm text-slate-500 line-through">
                          <span className="text-red-500">-</span> {c.oldValue?.slice(0, 200)}
                        </p>
                      )}
                      {(c.kind === "bullet_edited" || c.kind === "summary_edited") && (
                        <div className="space-y-1 text-sm">
                          {c.oldValue && (
                            <p className="text-slate-400 line-through">{c.oldValue.slice(0, 200)}</p>
                          )}
                          {c.newValue && (
                            <p className="text-slate-800">{c.newValue.slice(0, 200)}</p>
                          )}
                        </div>
                      )}
                      {c.kind === "bullet_reorder" && (
                        <p className="text-sm text-slate-700">
                          Position {c.oldIndex} -&gt; {c.newIndex}: {c.newValue?.slice(0, 120)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onToggle(c.id)}
                      className={`shrink-0 rounded-md px-3 py-1 text-xs font-semibold transition ${
                        isAccepted
                          ? "bg-green-600 text-white"
                          : "border border-slate-300 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {isAccepted ? "Garder" : "Annuler"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
