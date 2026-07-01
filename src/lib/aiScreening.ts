import type { Candidate } from "./types";

export type ScreeningRecommendation = "advance" | "review" | "reject";

/**
 * Deterministic stand-in for a real resume-scoring model: hashes the
 * candidate's identity into a stable 35-97 score so repeat renders agree.
 */
export function scoreCandidate(candidate: Candidate): number {
  let hash = 0;
  const seed = candidate.id + candidate.name;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return 35 + (hash % 63);
}

export function recommendationForScore(score: number): ScreeningRecommendation {
  if (score >= 80) return "advance";
  if (score >= 60) return "review";
  return "reject";
}
