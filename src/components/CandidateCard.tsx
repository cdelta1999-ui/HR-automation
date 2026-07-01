import type { Candidate } from "@/lib/types";

function scoreClasses(score: number) {
  if (score >= 80) return "bg-green-soft text-green";
  if (score >= 60) return "bg-amber-soft text-amber";
  return "bg-rose-soft text-rose";
}

interface Props {
  candidate: Candidate;
  terminal: boolean;
  onAdvance: (id: string) => void;
  onReject: (id: string) => void;
}

export function CandidateCard({ candidate, terminal, onAdvance, onReject }: Props) {
  return (
    <div className="rounded-xl border border-line bg-panel p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-serif text-[15px] font-semibold leading-tight text-ink">
            {candidate.name}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted">{candidate.roleTitle}</p>
        </div>
        {typeof candidate.aiScore === "number" && (
          <span
            className={`shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold ${scoreClasses(candidate.aiScore)}`}
          >
            {candidate.aiScore}
          </span>
        )}
      </div>

      <div className="mt-2.5 flex items-center justify-between text-[11.5px] text-muted">
        <span>{candidate.recruiter}</span>
        <span className="font-mono">{candidate.daysInStage}d in stage</span>
      </div>

      {!terminal && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onAdvance(candidate.id)}
            className="flex-1 rounded-md bg-teal-soft px-2 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-teal transition-colors hover:bg-teal hover:text-white"
          >
            Advance →
          </button>
          <button
            onClick={() => onReject(candidate.id)}
            className="rounded-md border border-line-strong px-2 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-muted transition-colors hover:border-rose hover:text-rose"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  );
}
