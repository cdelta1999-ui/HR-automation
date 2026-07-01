import type { Candidate } from "@/lib/types";
import { computeFunnel } from "@/lib/analytics";

export function FunnelChart({ candidates }: { candidates: Candidate[] }) {
  const funnel = computeFunnel(candidates);
  const max = funnel[0]?.reached || 1;

  return (
    <div className="flex flex-col gap-3">
      {funnel.map((point) => (
        <div key={point.stage.id} className="flex items-center gap-4">
          <div className="w-40 shrink-0 font-mono text-[11px] uppercase tracking-wide text-muted">
            {point.stage.code} {point.stage.title}
          </div>
          <div className="flex-1">
            <div className="h-6 w-full overflow-hidden rounded-md bg-line/50">
              <div
                className="h-full rounded-md bg-teal transition-[width]"
                style={{ width: `${Math.max((point.reached / max) * 100, point.reached > 0 ? 3 : 0)}%` }}
              />
            </div>
          </div>
          <div className="w-10 shrink-0 text-right font-mono text-sm text-ink">{point.reached}</div>
          <div className="w-28 shrink-0 text-right font-mono text-[11px] text-rose">
            {point.droppedHere > 0 ? `−${point.droppedHere} dropped here` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}
