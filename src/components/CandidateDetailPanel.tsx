import type { Candidate, CandidateEvent } from "@/lib/types";
import { stageById } from "@/lib/stages";
import { StageBadge } from "./StageBadge";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  candidate: Candidate;
  events: CandidateEvent[];
  terminal: boolean;
  onClose: () => void;
  onAdvance: (id: string) => void;
  onReject: (id: string) => void;
  onScore: (id: string) => void;
}

export function CandidateDetailPanel({
  candidate,
  events,
  terminal,
  onClose,
  onAdvance,
  onReject,
  onScore,
}: Props) {
  const awaitingScreen = candidate.stage === "ai_screen" && typeof candidate.aiScore !== "number";
  const stage = stageById(candidate.stage);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        aria-label="Close candidate detail"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30"
      />
      <div className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-line bg-panel p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-serif text-2xl font-semibold text-ink">{candidate.name}</p>
            <p className="mt-1 text-sm text-muted">{candidate.roleTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-line-strong px-2 py-1 font-mono text-[11px] uppercase text-muted hover:border-ink hover:text-ink"
          >
            Close
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StageBadge stage={stage} />
          {typeof candidate.aiScore === "number" && (
            <span className="rounded-md bg-violet-soft px-2 py-1 font-mono text-[11px] font-bold text-violet">
              AI score {candidate.aiScore}
            </span>
          )}
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[12px] text-muted">Recruiter</dt>
            <dd className="text-ink">{candidate.recruiter}</dd>
          </div>
          <div>
            <dt className="text-[12px] text-muted">Applied on</dt>
            <dd className="text-ink">{new Date(candidate.appliedOn).toLocaleDateString()}</dd>
          </div>
        </dl>

        {!terminal && (
          <div className="mt-5 flex gap-2">
            {awaitingScreen ? (
              <button
                onClick={() => onScore(candidate.id)}
                className="flex-1 rounded-md bg-violet-soft px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-violet hover:bg-violet hover:text-white"
              >
                Run AI screen
              </button>
            ) : (
              <>
                <button
                  onClick={() => onAdvance(candidate.id)}
                  className="flex-1 rounded-md bg-teal-soft px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-teal hover:bg-teal hover:text-white"
                >
                  Advance →
                </button>
                <button
                  onClick={() => onReject(candidate.id)}
                  className="rounded-md border border-line-strong px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wide text-muted hover:border-rose hover:text-rose"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-7">
          <h3 className="font-serif text-lg font-semibold text-ink">Activity timeline</h3>
          <ol className="mt-3 flex flex-col gap-3 border-l border-line pl-4">
            {events.map((event) => (
              <li key={event.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-teal" />
                <p className="text-sm text-ink">{event.label}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">{formatDateTime(event.at)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
