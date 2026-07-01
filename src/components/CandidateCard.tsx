import type { Candidate } from "@/lib/types";
import { recommendationForScore } from "@/lib/aiScreening";

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
  onScore: (id: string) => void;
  onOpen: (id: string) => void;
}

export function CandidateCard({ candidate, terminal, onAdvance, onReject, onScore, onOpen }: Props) {
  const awaitingScreen = candidate.stage === "ai_screen" && typeof candidate.aiScore !== "number";
  const recommendation =
    candidate.stage === "ai_screen" && typeof candidate.aiScore === "number"
      ? recommendationForScore(candidate.aiScore)
      : null;

  return (
    <div className="rounded-xl border border-line bg-panel p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <button
            onClick={() => onOpen(candidate.id)}
            className="text-left font-serif text-[15px] font-semibold leading-tight text-ink hover:text-teal hover:underline"
          >
            {candidate.name}
          </button>
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

      {recommendation === "review" && (
        <p className="mt-2.5 rounded-md bg-amber-soft px-2 py-1 text-[11.5px] text-amber">
          Borderline — flagged for recruiter review
        </p>
      )}
      {recommendation === "reject" && (
        <p className="mt-2.5 rounded-md bg-rose-soft px-2 py-1 text-[11.5px] text-rose">
          AI recommends early rejection — recruiter decides
        </p>
      )}

      {!terminal && (
        <>
          {awaitingScreen ? (
            <button
              onClick={() => onScore(candidate.id)}
              className="mt-3 w-full rounded-md bg-violet-soft px-2 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-violet transition-colors hover:bg-violet hover:text-white"
            >
              Run AI screen
            </button>
          ) : (
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
          {recommendation === "reject" && (
            <button
              onClick={() => onAdvance(candidate.id)}
              className="mt-1.5 w-full text-center font-mono text-[10.5px] uppercase tracking-wide text-muted underline-offset-2 hover:text-ink hover:underline"
            >
              Override — advance anyway
            </button>
          )}
        </>
      )}
    </div>
  );
}
