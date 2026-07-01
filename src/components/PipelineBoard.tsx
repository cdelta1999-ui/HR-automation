"use client";

import { useMemo, useState, useTransition } from "react";
import type { BoardState } from "@/lib/db";
import { STAGES, stageById } from "@/lib/stages";
import { StageBadge } from "./StageBadge";
import { CandidateCard } from "./CandidateCard";
import { KpiStrip } from "./KpiStrip";
import { EmailActivity } from "./EmailActivity";
import { CandidateDetailPanel } from "./CandidateDetailPanel";

type Action = "advance" | "reject" | "score";

async function runAction(id: string, action: Action): Promise<BoardState> {
  const res = await fetch(`/api/candidates/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error(`Failed to ${action} candidate`);
  return res.json();
}

export function PipelineBoard({ initialBoard }: { initialBoard: BoardState }) {
  const [board, setBoard] = useState(initialBoard);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const { candidates, events, emailLog } = board;

  function dispatch(id: string, action: Action) {
    startTransition(async () => {
      const next = await runAction(id, action);
      setBoard(next);
    });
  }

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

  const selectedCandidate = candidates.find((c) => c.id === selectedId) ?? null;
  const selectedEvents = useMemo(
    () => (selectedId ? events.filter((e) => e.candidateId === selectedId) : []),
    [events, selectedId],
  );

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
                    onAdvance={(id) => dispatch(id, "advance")}
                    onReject={(id) => dispatch(id, "reject")}
                    onScore={(id) => dispatch(id, "score")}
                    onOpen={setSelectedId}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <EmailActivity log={emailLog} />

      {selectedCandidate && (
        <CandidateDetailPanel
          candidate={selectedCandidate}
          events={selectedEvents}
          terminal={!!stageById(selectedCandidate.stage).terminal}
          onClose={() => setSelectedId(null)}
          onAdvance={(id) => dispatch(id, "advance")}
          onReject={(id) => dispatch(id, "reject")}
          onScore={(id) => dispatch(id, "score")}
        />
      )}
    </div>
  );
}
