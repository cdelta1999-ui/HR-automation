import Link from "next/link";
import { FaqConcierge } from "@/components/FaqConcierge";

export const metadata = {
  title: "Candidate FAQ · HR Automation",
};

export default function FaqPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col gap-8 px-6 py-10">
      <div className="border-b border-line pb-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-violet">
          Candidate Support
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">
          Ask us anything
        </h1>
        <p className="mt-2 max-w-xl text-[15px] text-muted">
          Status, timeline, location, benefits, or scheduling — the assistant below can answer most
          questions instantly, and hands off to a recruiter for anything it can&apos;t.
        </p>
      </div>

      <FaqConcierge />

      <Link href="/" className="text-sm text-muted hover:text-teal">
        ← Back home
      </Link>
    </div>
  );
}
