import type { Candidate, Stage } from "./types";
import { PIPELINE_STAGES, stageOrderIndex } from "./stages";

export interface FunnelPoint {
  stage: Stage;
  reached: number;
  droppedHere: number;
}

function reachedStageIndex(candidate: Candidate, idx: number): boolean {
  if (candidate.stage === "hired") return true;
  if (candidate.stage === "rejected") {
    const rejectedIdx = candidate.rejectedFromStage ? stageOrderIndex(candidate.rejectedFromStage) : 0;
    return rejectedIdx >= idx;
  }
  return stageOrderIndex(candidate.stage) >= idx;
}

export function computeFunnel(candidates: Candidate[]): FunnelPoint[] {
  return PIPELINE_STAGES.map((stage, idx) => ({
    stage,
    reached: candidates.filter((c) => reachedStageIndex(c, idx)).length,
    droppedHere: candidates.filter((c) => c.stage === "rejected" && c.rejectedFromStage === stage.id)
      .length,
  }));
}

export interface AnalyticsSummary {
  total: number;
  active: number;
  hired: number;
  rejected: number;
  hireRate: number;
  avgAiScore: number;
  avgDaysSinceApplied: number;
}

const MS_PER_DAY = 86_400_000;

export function computeSummary(candidates: Candidate[]): AnalyticsSummary {
  const total = candidates.length;
  const hired = candidates.filter((c) => c.stage === "hired").length;
  const rejected = candidates.filter((c) => c.stage === "rejected").length;
  const active = total - hired - rejected;
  const decided = hired + rejected;

  const scored = candidates.filter((c) => typeof c.aiScore === "number");
  const avgAiScore = scored.length
    ? Math.round(scored.reduce((sum, c) => sum + (c.aiScore ?? 0), 0) / scored.length)
    : 0;

  const now = Date.now();
  const avgDaysSinceApplied = total
    ? Math.round(
        candidates.reduce((sum, c) => sum + (now - new Date(c.appliedOn).getTime()) / MS_PER_DAY, 0) /
          total,
      )
    : 0;

  return {
    total,
    active,
    hired,
    rejected,
    hireRate: decided > 0 ? Math.round((hired / decided) * 100) : 0,
    avgAiScore,
    avgDaysSinceApplied,
  };
}
