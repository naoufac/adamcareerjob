// Per-user preference vector learning. NO LLM calls. Each keep/reject/edit
// feedback nudges term weights so Adam's future adaptations progressively
// favor what this candidate actually prefers.
//
// The vector is a plain Record<term, weight> stored in master_profiles.
// Weights are bounded in [-1, 1]. keep = +step, reject = -step, edit = small +.

const STEP = 0.15;
const EDIT_STEP = 0.05;
const MAX = 1.0;
const MIN = -1.0;

export type PreferenceVector = Record<string, number>;

// Extract meaningful terms from a text value (skill names, action verbs,
// domain keywords). Lowercased, deduplicated, stop-words removed.
const STOP_WORDS = new Set([
  "the","a","an","to","of","in","for","and","or","with","at","by","on","as","is",
  "are","was","were","be","been","being","have","has","had","do","does","did",
  "will","would","could","should","may","might","must","can","this","that",
  "these","those","it","its","from","into","your","our","their","his","her",
  "we","you","they","he","she","i","me","my","us","them","more","less","than",
  "et","le","la","les","de","des","du","un","une","pour","avec","dans","sur",
  "par","qui","que","quoi","dont","où","est","sont","a","au","aux","ce","cette",
  "ces","mon","ma","mes","notre","nos","leur","leurs","et","ou","mais","donc",
]);

export function extractTerms(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s+#.]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  return [...new Set(words)];
}

export function applyFeedback(
  vector: PreferenceVector,
  kind: "keep" | "reject" | "edit",
  text: string,
): PreferenceVector {
  const terms = extractTerms(text);
  const step = kind === "keep" ? STEP : kind === "reject" ? -STEP : EDIT_STEP;
  const next = { ...vector };
  for (const t of terms) {
    const current = next[t] ?? 0;
    next[t] = Math.round(Math.max(MIN, Math.min(MAX, current + step)) * 100) / 100;
    // Prune terms that decay to near-zero
    if (Math.abs(next[t]) < 0.02) delete next[t];
  }
  return next;
}

// Rank a set of texts by preference vector (higher = more aligned).
// Returns indices sorted by descending score.
export function rankByPreference(
  vector: PreferenceVector,
  texts: string[],
): { index: number; score: number }[] {
  const scored = texts.map((text, index) => {
    const terms = extractTerms(text);
    let score = 0;
    for (const t of terms) score += vector[t] ?? 0;
    return { index, score };
  });
  return scored.sort((a, b) => b.score - a.score);
}

// Top N preferred terms (for display / debugging).
export function topTerms(vector: PreferenceVector, n = 10): { term: string; weight: number }[] {
  return Object.entries(vector)
    .map(([term, weight]) => ({ term, weight }))
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, n);
}
