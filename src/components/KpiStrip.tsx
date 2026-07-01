import type { Candidate } from "@/lib/types";

export function KpiStrip({ candidates }: { candidates: Candidate[] }) {
  const active = candidates.filter((c) => c.stage !== "hired" && c.stage !== "rejected");
  const hired = candidates.filter((c) => c.stage === "hired").length;
  const rejected = candidates.filter((c) => c.stage === "rejected").length;
  const scored = candidates.filter((c) => typeof c.aiScore === "number");
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, c) => sum + (c.aiScore ?? 0), 0) / scored.length)
    : 0;

  const items = [
    { label: "Active candidates", value: active.length },
    { label: "In offer or preboard", value: candidates.filter((c) => c.stage === "offer" || c.stage === "preboard").length },
    { label: "Hired", value: hired },
    { label: "Rejected", value: rejected },
    { label: "Avg AI score", value: avgScore },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-line bg-panel px-4 py-3">
          <div className="font-serif text-2xl font-semibold text-ink">{item.value}</div>
          <div className="mt-1 text-[12.5px] text-muted">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
