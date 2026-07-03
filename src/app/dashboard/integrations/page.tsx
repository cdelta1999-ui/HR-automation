import Link from "next/link";
import { IntegrationsView } from "@/components/IntegrationsView";
import { getBoardState } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Integrations · HR Automation",
};

export default function IntegrationsPage() {
  const { connectorState, events, emailLog } = getBoardState();

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px] flex-col gap-8 px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
            ATS integration architecture
          </p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
            Integrations
          </h1>
          <p className="mt-2 max-w-2xl text-[15px] text-muted">
            Everything the ATS reaches out to, and the exact stage transitions that fire each one.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-full border border-line-strong px-4 py-2 text-sm text-ink-soft transition-colors hover:border-teal hover:text-teal"
          >
            ← Pipeline
          </Link>
          <Link
            href="/dashboard/analytics"
            className="rounded-full border border-line-strong px-4 py-2 text-sm text-ink-soft transition-colors hover:border-teal hover:text-teal"
          >
            Analytics ↗
          </Link>
        </div>
      </div>

      <IntegrationsView
        connectorStateInitial={connectorState}
        events={events}
        emailLog={emailLog}
      />
    </div>
  );
}
