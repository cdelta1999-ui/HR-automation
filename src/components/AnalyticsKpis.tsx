import type { AnalyticsSummary } from "@/lib/analytics";

export function AnalyticsKpis({ summary }: { summary: AnalyticsSummary }) {
  const items = [
    { label: "Total candidates", value: summary.total },
    { label: "Active in pipeline", value: summary.active },
    { label: "Hired", value: summary.hired },
    { label: "Rejected", value: summary.rejected },
    { label: "Hire rate (decided)", value: `${summary.hireRate}%` },
    { label: "Avg AI score", value: summary.avgAiScore },
    { label: "Avg days since applied", value: summary.avgDaysSinceApplied },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-line bg-panel px-4 py-3">
          <div className="font-serif text-2xl font-semibold text-ink">{item.value}</div>
          <div className="mt-1 text-[12.5px] text-muted">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
