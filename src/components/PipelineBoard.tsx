"use client";

import { useMemo, useState } from "react";
import type { Candidate, EmailLogEntry } from "@/lib/types";
import { STAGES, nextStage, stageById, emailTemplateForStage } from "@/lib/stages";
import { renderTemplate } from "@/lib/emailTemplates";
import { StageBadge } from "./StageBadge";
import { CandidateCard } from "./CandidateCard";
import { KpiStrip } from "./KpiStrip";
import { EmailActivity } from "./EmailActivity";

export function PipelineBoard({ initialCandidates }: { initialCandidates: Candidate[] }) {
  const [candidates, setCandidates] = useState(initialCandidates);
  const [emailLog, setEmailLog] = useState<EmailLogEntry[]>([]);
  const [query, setQuery] = useState("");

  function logEmailForStage(candidate: Candidate, stage: Candidate["stage"]) {
    const templateId = emailTemplateForStage(stage);
    if (!templateId) return;
    const { subject } = renderTemplate(templateId, candidate);
    setEmailLog((prev) => [
      {
        id: `${candidate.id}-${templateId}-${Date.now()}`,
        candidateId: candidate.id,
        candidateName: candidate.name,
        templateId,
        subject,
        sentAt: new Date().toISOString(),
      },
      ...prev,
    ]);
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

  function advance(id: string) {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;
    const stage = nextStage(candidate.stage);
    logEmailForStage(candidate, stage);
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, stage, daysInStage: 0 } : c)));
  }

  function reject(id: string) {
    const candidate = candidates.find((c) => c.id === id);
    if (!candidate) return;
    logEmailForStage(candidate, "rejected");
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

      <EmailActivity log={emailLog} />
    </div>
  );
}
