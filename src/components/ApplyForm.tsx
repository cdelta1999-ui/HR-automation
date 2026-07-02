"use client";

import { useState } from "react";
import Link from "next/link";

const OPEN_ROLES = [
  "Senior Frontend Engineer",
  "Backend Engineer",
  "Product Designer",
  "Data Analyst",
  "Customer Success Manager",
  "Sales Development Rep",
];

export function ApplyForm() {
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState(OPEN_ROLES[0]);
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, roleTitle }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="rounded-xl border border-line bg-panel p-6">
        <p className="font-serif text-xl font-semibold text-ink">Your application is in 🎉</p>
        <p className="mt-2 text-[15px] text-ink-soft">
          Check your inbox — a confirmation email was sent the moment you applied. A real person
          (with a little help from our tools) is reviewing your application now, and you&apos;ll
          hear from us either way.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/faq"
            className="rounded-full border border-line-strong px-4 py-2 text-sm text-ink-soft hover:border-violet hover:text-violet"
          >
            Questions? Ask the assistant
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full border border-line-strong px-4 py-2 text-sm text-ink-soft hover:border-teal hover:text-teal"
          >
            See it land in the pipeline →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-line bg-panel p-6">
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink-soft">Full name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={80}
          placeholder="Your name"
          className="rounded-lg border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:border-teal focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-ink-soft">Role</span>
        <select
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          className="rounded-lg border border-line-strong bg-paper px-3.5 py-2.5 text-sm text-ink focus:border-teal focus:outline-none"
        >
          {OPEN_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="mt-1 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {status === "submitting" ? "Submitting…" : "Apply"}
      </button>

      {status === "error" && (
        <p className="rounded-md bg-rose-soft px-3 py-2 text-[13px] text-rose">
          Something went wrong — please try again.
        </p>
      )}

      <p className="text-[12.5px] leading-relaxed text-muted">
        We use automation and AI to keep things fast, but a human owns every decision about your
        application. You can reach a real person at any point.
      </p>
    </form>
  );
}
