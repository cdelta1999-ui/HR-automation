import Link from "next/link";
import { PipelineBoard } from "@/components/PipelineBoard";
import { CANDIDATES } from "@/lib/data";

export const metadata = {
  title: "Candidate Pipeline · HR Automation",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
            Talent Operations
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Candidate Pipeline
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-muted">
            Live view of every candidate moving through the automated workflow, from intake to
            Day One.
          </p>
        </div>
        <Link
          href="/candidate-experience-workflow.html"
          className="rounded-full border border-line-strong px-4 py-2 text-sm text-ink-soft transition-colors hover:border-teal hover:text-teal"
        >
          View workflow map ↗
        </Link>
      </div>

      <PipelineBoard initialCandidates={CANDIDATES} />
    </div>
  );
}
