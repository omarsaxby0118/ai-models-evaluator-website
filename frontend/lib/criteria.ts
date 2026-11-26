/** Preference scale: from "A is much better" (AAAA) through Tie to "B is much better" (BBBB). */
export const SCALE = ["AAAA", "AAA", "AA", "A", "TIE", "B", "BB", "BBB", "BBBB"] as const;
export type Preference = (typeof SCALE)[number];

/** Detailed criteria, rated on the preference scale. Keys must match the backend. */
export const CRITERIA = [
  "correctness",
  "instruction_following",
  "completeness",
  "code_quality",
  "efficiency",
  "clarity",
] as const;
export type CriterionKey = (typeof CRITERIA)[number];

export type Side = "A" | "B" | "tie";

export function sideOf(p: Preference): Side {
  return p === "TIE" ? "tie" : (p[0] as "A" | "B");
}

/** 0 for a tie, 1 (marginal) to 4 (much better). */
export function strengthOf(p: Preference): number {
  return p === "TIE" ? 0 : p.length;
}

/** Same rating with A and B swapped. */
export function flip(p: Preference): Preference {
  if (p === "TIE") return p;
  return (p[0] === "A" ? "B" : "A").repeat(p.length) as Preference;
}

export function displayLabel(p: Preference, tieLabel: string): string {
  return p === "TIE" ? tieLabel : p;
}
