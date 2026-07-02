import Link from "next/link";
import { ApplyForm } from "@/components/ApplyForm";

export const metadata = {
  title: "Apply · HR Automation",
};

export default function ApplyPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col gap-8 px-6 py-10">
      <div className="border-b border-line pb-6">
        <p className="font-mono text-xs font-bold uppercase tracking-widest text-teal">
          Join the team
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-ink sm:text-4xl">Apply</h1>
        <p className="mt-2 max-w-lg text-[15px] text-muted">
          Two fields, no black box. You&apos;ll get a confirmation the moment you submit, a clear
          timeline, and a reply either way — we don&apos;t leave applications unanswered.
        </p>
      </div>

      <ApplyForm />

      <Link href="/" className="text-sm text-muted hover:text-teal">
        ← Back home
      </Link>
    </div>
  );
}
