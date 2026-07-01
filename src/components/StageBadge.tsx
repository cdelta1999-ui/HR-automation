import type { Stage } from "@/lib/types";

const ACCENT_CLASSES: Record<Stage["accent"], string> = {
  teal: "bg-teal-soft text-teal",
  violet: "bg-violet-soft text-violet",
  amber: "bg-amber-soft text-amber",
  green: "bg-green-soft text-green",
  rose: "bg-rose-soft text-rose",
  ink: "bg-line/60 text-ink-soft",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-bold tracking-wide uppercase ${ACCENT_CLASSES[stage.accent]}`}
    >
      <span>{stage.code}</span>
      <span>{stage.title}</span>
    </span>
  );
}
