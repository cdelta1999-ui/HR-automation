import type { EmailLogEntry } from "@/lib/types";
import { templateById } from "@/lib/emailTemplates";

const ACCENT_DOT: Record<string, string> = {
  teal: "bg-teal",
  amber: "bg-amber",
  rose: "bg-rose",
  green: "bg-green",
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function EmailActivity({ log }: { log: EmailLogEntry[] }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-semibold text-ink">Automated email activity</h3>
        <span className="font-mono text-[11px] text-muted">{log.length} sent this session</span>
      </div>

      {log.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Advance or reject a candidate to see the matching email fire automatically.
        </p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {log.map((entry) => {
            const template = templateById(entry.templateId);
            return (
              <li key={entry.id} className="flex items-start gap-3 border-t border-line pt-2.5 first:border-t-0 first:pt-0">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${ACCENT_DOT[template.accent]}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{entry.subject}</p>
                  <p className="mt-0.5 text-[12px] text-muted">
                    {template.label} → {entry.candidateName}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-muted">
                  {formatTime(entry.sentAt)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
