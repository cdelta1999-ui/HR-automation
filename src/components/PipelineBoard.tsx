"use client";

import { useMemo, useState } from "react";
import type { Candidate } from "@/lib/types";
import { STAGES, nextStage, stageById } from "@/lib/stages";
import { StageBadge } from "./StageBadge";
import { CandidateCard } from "./CandidateCard";
import { KpiStrip } from "./KpiStrip";

export function PipelineBoard({ initialCandidates }: { initialCandidates: Candidate[] }) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.roleTitle.toLowerCase().includes(q) ||
        c.recruiter.toLowerCase().includes(q),
    );
  }, [candidates, query]);

  function advance(id: string) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: nextStage(c.stage), daysInStage: 0 } : c)),
    );
  }

  function reject(id: string) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: "rejected", daysInStage: 0 } : c)),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <KpiStrip candidates={candidates} />

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by candidate, role, or recruiter…"
        className="w-full max-w-sm rounded-lg border border-line-strong bg-panel px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:border-teal focus:outline-none"
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageCandidates = filtered.filter((c) => c.stage === stage.id);
          return (
            <div key={stage.id} className="flex w-64 shrink-0 flex-col gap-3">
              <div className="flex items-center justify-between">
                <StageBadge stage={stage} />
                <span className="font-mono text-[11px] text-muted">{stageCandidates.length}</span>
              </div>
              <div className="flex min-h-[80px] flex-col gap-2.5 rounded-xl border border-dashed border-line p-2">
                {stageCandidates.length === 0 && (
                  <p className="px-1 py-2 text-center text-[12px] text-muted">No candidates</p>
                )}
                {stageCandidates.map((candidate) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    terminal={!!stageById(candidate.stage).terminal}
                    onAdvance={advance}
                    onReject={reject}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
