import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
          HR Automation
        </p>
        <h1 className="mt-3 max-w-xl font-serif text-4xl font-semibold text-ink sm:text-5xl">
          Automated hiring, human decisions
        </h1>
        <p className="mt-4 max-w-lg text-[15px] text-muted">
          Track every candidate through the automated recruiting workflow — from application to
          Day One.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/dashboard"
          className="rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-soft"
        >
          Open candidate pipeline
        </Link>
        <Link
          href="/faq"
          className="rounded-full border border-line-strong px-5 py-2.5 text-sm text-ink-soft transition-colors hover:border-violet hover:text-violet"
        >
          Ask the FAQ concierge
        </Link>
        <Link
          href="/candidate-experience-workflow.html"
          className="rounded-full border border-line-strong px-5 py-2.5 text-sm text-ink-soft transition-colors hover:border-teal hover:text-teal"
        >
          View workflow map
        </Link>
      </div>
    </div>
  );
}
