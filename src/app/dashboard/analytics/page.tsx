import Link from "next/link";
import { getBoardState } from "@/lib/db";
import { computeSummary } from "@/lib/analytics";
import { AnalyticsKpis } from "@/components/AnalyticsKpis";
import { FunnelChart } from "@/components/FunnelChart";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pipeline Analytics · HR Automation",
};

export default function AnalyticsPage() {
  const { candidates } = getBoardState();
  const summary = computeSummary(candidates);

  return (
    <div className="mx-auto flex min-h-screen max-w-[1000px] flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
            Talent Operations
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Pipeline Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-muted">
            Where candidates drop off, and how the pipeline is performing overall.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-full border border-line-strong px-4 py-2 text-sm text-ink-soft transition-colors hover:border-teal hover:text-teal"
        >
          ← Back to pipeline
        </Link>
      </div>

      <AnalyticsKpis summary={summary} />

      <div>
        <h2 className="font-serif text-xl font-semibold text-ink">Stage funnel &amp; drop-off</h2>
        <p className="mt-1 text-sm text-muted">
          Candidates who reached each stage, and how many were rejected right there.
        </p>
        <div className="mt-5">
          <FunnelChart candidates={candidates} />
        </div>
      </div>
    </div>
  );
}
