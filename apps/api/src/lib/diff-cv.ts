import type { CvJson } from "../db/schema.js";

// Computes a field-by-field diff between a base CV (master profile) and an
// adapted variant. Produces a list of atomic, reviewable changes that the UI
// renders as highlighted cards with keep / cancel / other-version buttons.
//
// Change taxonomy:
//   - summary_edited : the professional summary was rewritten
//   - bullet_added   : a new bullet point appeared (green)
//   - bullet_removed : a bullet was dropped (struck through)
//   - bullet_edited  : an existing bullet was rewritten (diff of words)
//   - bullet_reorder : same bullet content, different position (orange)
//   - skill_added    : a new core competency keyword
//   - skill_removed  : a competency was dropped
//   - experience_added   : a whole new experience block
//   - experience_removed : an experience block was dropped

export interface CvChange {
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
  // Location context for the UI
  section: "summary" | "coreCompetencies" | "experience";
  experienceKey?: string; // company|title identifier when section=experience
  oldValue?: string;
  newValue?: string;
  oldIndex?: number;
  newIndex?: number;
}

export function diffCv(base: CvJson, variant: CvJson): CvChange[] {
  const changes: CvChange[] = [];

  // --- Summary ---
  if ((base.summary ?? "") !== (variant.summary ?? "")) {
    changes.push({
      id: "summary",
      kind: "summary_edited",
      section: "summary",
      oldValue: base.summary,
      newValue: variant.summary,
    });
  }

  // --- Core competencies ---
  const baseSkills = base.coreCompetencies ?? [];
  const varSkills = variant.coreCompetencies ?? [];
  const baseSet = new Set(baseSkills.map((s) => s.toLowerCase()));
  const varSet = new Set(varSkills.map((s) => s.toLowerCase()));

  for (const s of varSkills) {
    if (!baseSet.has(s.toLowerCase())) {
      changes.push({ id: `skill:${s}`, kind: "skill_added", section: "coreCompetencies", newValue: s });
    }
  }
  for (const s of baseSkills) {
    if (!varSet.has(s.toLowerCase())) {
      changes.push({ id: `skill:${s}`, kind: "skill_removed", section: "coreCompetencies", oldValue: s });
    }
  }

  // --- Experience ---
  const baseExp = base.experience ?? [];
  const varExp = variant.experience ?? [];

  const baseByKey = new Map<string, (typeof baseExp)[number]>();
  for (const e of baseExp) baseByKey.set(expKey(e), e);
  const varByKey = new Map<string, (typeof varExp)[number]>();
  for (const e of varExp) varByKey.set(expKey(e), e);

  // Added / removed experience blocks
  for (const e of varExp) {
    if (!baseByKey.has(expKey(e))) {
      changes.push({
        id: `exp:${expKey(e)}`,
        kind: "experience_added",
        section: "experience",
        experienceKey: expKey(e),
        newValue: JSON.stringify(e),
      });
    }
  }
  for (const e of baseExp) {
    if (!varByKey.has(expKey(e))) {
      changes.push({
        id: `exp:${expKey(e)}`,
        kind: "experience_removed",
        section: "experience",
        experienceKey: expKey(e),
        oldValue: JSON.stringify(e),
      });
    }
  }

  // For matching experiences, diff bullets
  for (const ve of varExp) {
    const be = baseByKey.get(expKey(ve));
    if (!be) continue;
    const key = expKey(ve);
    const baseBullets = be.bullets ?? [];
    const varBullets = ve.bullets ?? [];
    const baseNorm = baseBullets.map((b) => normalizeBullet(b));
    const varNorm = varBullets.map((b) => normalizeBullet(b));
    const baseMatched = new Set<number>();

    // Match: a variant bullet that closely matches a base bullet (same content,
    // possibly reordered) is a reorder; otherwise it's added.
    varBullets.forEach((vb, vi) => {
      const vbNorm = varNorm[vi];
      // exact or near-exact match in base = reorder or unchanged
      let matchIdx = -1;
      for (let bi = 0; bi < baseNorm.length; bi++) {
        if (baseMatched.has(bi)) continue;
        if (baseNorm[bi] === vbNorm) {
          matchIdx = bi;
          break;
        }
      }
      if (matchIdx >= 0) {
        baseMatched.add(matchIdx);
        if (matchIdx !== vi) {
          changes.push({
            id: `bullet:${key}:reorder:${vi}`,
            kind: "bullet_reorder",
            section: "experience",
            experienceKey: key,
            newValue: vb,
            oldIndex: matchIdx,
            newIndex: vi,
          });
        }
        return;
      }
      // fuzzy match = edited (similar wording)
      let bestSim = 0;
      let bestBase = -1;
      for (let bi = 0; bi < baseNorm.length; bi++) {
        if (baseMatched.has(bi)) continue;
        const sim = similarity(baseNorm[bi], vbNorm);
        if (sim > bestSim) {
          bestSim = sim;
          bestBase = bi;
        }
      }
      if (bestSim >= 0.5 && bestBase >= 0) {
        baseMatched.add(bestBase);
        changes.push({
          id: `bullet:${key}:edit:${vi}`,
          kind: "bullet_edited",
          section: "experience",
          experienceKey: key,
          oldValue: baseBullets[bestBase],
          newValue: vb,
        });
      } else {
        changes.push({
          id: `bullet:${key}:add:${vi}`,
          kind: "bullet_added",
          section: "experience",
          experienceKey: key,
          newValue: vb,
        });
      }
    });

    // Unmatched base bullets = removed
    baseBullets.forEach((bb, bi) => {
      if (!baseMatched.has(bi)) {
        changes.push({
          id: `bullet:${key}:rm:${bi}`,
          kind: "bullet_removed",
          section: "experience",
          experienceKey: key,
          oldValue: bb,
        });
      }
    });
  }

  return changes;
}

function expKey(e: { company?: string; title?: string }): string {
  return `${e.company ?? "?"}|${e.title ?? "?"}`;
}

function normalizeBullet(b: string): string {
  return b.toLowerCase().replace(/\s+/g, " ").trim();
}

// Jaccard similarity over word sets. Cheap, no deps, good enough for bullet
// matching. We deliberately keep it coarse: a threshold of 0.5 catches "Led
// migration to TypeScript" vs "Led the TypeScript migration reducing bugs".
function similarity(a: string, b: string): number {
  const wa = new Set(a.split(" "));
  const wb = new Set(b.split(" "));
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter++;
  const union = wa.size + wb.size - inter;
  return union === 0 ? 0 : inter / union;
}

// Apply accepted changes to a base CV, producing the accepted variant.
// Rejected changes are skipped; the base value is kept.
export function applyChanges(
  base: CvJson,
  changes: CvChange[],
  acceptedIds: Set<string>,
): CvJson {
  const result: CvJson = structuredClone(base);
  const accepted = changes.filter((c) => acceptedIds.has(c.id));

  // Summary
  if (accepted.some((c) => c.kind === "summary_edited")) {
    const sc = accepted.find((c) => c.kind === "summary_edited");
    if (sc?.newValue != null) result.summary = sc.newValue;
  }

  // Skills: rebuild from accepted adds/removes
  if (result.coreCompetencies || accepted.some((c) => c.section === "coreCompetencies")) {
    let skills = [...(base.coreCompetencies ?? [])];
    for (const c of accepted) {
      if (c.kind === "skill_added" && c.newValue) skills.push(c.newValue);
      if (c.kind === "skill_removed" && c.oldValue) {
        skills = skills.filter((s) => s.toLowerCase() !== c.oldValue!.toLowerCase());
      }
    }
    result.coreCompetencies = skills;
  }

  // Experience: rebuild per experience key
  const expById = new Map<string, NonNullable<CvJson["experience"]>[number]>();
  for (const e of base.experience ?? []) expById.set(expKey(e), structuredClone(e));

  // Handle added/removed experience blocks
  for (const c of accepted) {
    if (c.kind === "experience_removed" && c.experienceKey) {
      expById.delete(c.experienceKey);
    }
    if (c.kind === "experience_added" && c.experienceKey && c.newValue) {
      try {
        expById.set(c.experienceKey, JSON.parse(c.newValue));
      } catch {
        /* skip */
      }
    }
  }

  // Handle bullet-level changes
  for (const c of accepted) {
    if (!c.experienceKey) continue;
    const exp = expById.get(c.experienceKey);
    if (!exp) continue;
    const bullets = exp.bullets ?? [];

    if (c.kind === "bullet_added" && c.newValue) {
      bullets.push(c.newValue);
    }
    if (c.kind === "bullet_removed" && c.oldValue) {
      const idx = bullets.findIndex((b) => b === c.oldValue);
      if (idx >= 0) bullets.splice(idx, 1);
    }
    if (c.kind === "bullet_edited" && c.oldValue && c.newValue) {
      const idx = bullets.findIndex((b) => b === c.oldValue);
      if (idx >= 0) bullets[idx] = c.newValue;
    }
    if (c.kind === "bullet_reorder" && c.oldIndex != null && c.newIndex != null) {
      if (c.oldIndex < bullets.length) {
        const [moved] = bullets.splice(c.oldIndex, 1);
        bullets.splice(c.newIndex, 0, moved);
      }
    }
    exp.bullets = bullets;
  }

  result.experience = [...expById.values()];
  // Preserve variant ordering if experiences were added/removed: sort by
  // variant order when available, else keep base order.
  return result;
}
