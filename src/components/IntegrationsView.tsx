"use client";

import { useMemo, useState, useTransition } from "react";
import type { CandidateEvent, EmailLogEntry } from "@/lib/types";
import {
  CONNECTORS,
  STAGE_TRIGGERS,
  connectorById,
  stagesForConnector,
  type Connector,
  type ConnectorAccent,
  type ConnectorId,
  type StageTrigger,
} from "@/lib/connectors";
import { PIPELINE_STAGES, stageById } from "@/lib/stages";
import type { ConnectorState } from "@/lib/db";
import { StageBadge } from "./StageBadge";

const ACCENT_TEXT: Record<ConnectorAccent, string> = {
  teal: "text-teal",
  amber: "text-amber",
  rose: "text-rose",
  green: "text-green",
  violet: "text-violet",
  ink: "text-ink",
};

const ACCENT_BG_SOFT: Record<ConnectorAccent, string> = {
  teal: "bg-teal-soft",
  amber: "bg-amber-soft",
  rose: "bg-rose-soft",
  green: "bg-green-soft",
  violet: "bg-violet-soft",
  ink: "bg-[#EEECE5]",
};

const ACCENT_BORDER: Record<ConnectorAccent, string> = {
  teal: "border-teal",
  amber: "border-amber",
  rose: "border-rose",
  green: "border-green",
  violet: "border-violet",
  ink: "border-ink",
};

const ACCENT_HEX: Record<ConnectorAccent, string> = {
  teal: "#0E8C7F",
  amber: "#D98A11",
  rose: "#BE4E63",
  green: "#2E9E6B",
  violet: "#5B5BD6",
  ink: "#17233B",
};

// Fixed layout for the hub-and-spoke diagram. Coordinates are in the SVG
// viewBox (1000 × 600); the surrounding HTML chips are positioned as
// percentages of the same box so lines meet each card cleanly.
const HUB_LAYOUT: Record<ConnectorId, { xPct: number; yPct: number; lineX: number; lineY: number }> = {
  faq_concierge: { xPct: 50, yPct: 9, lineX: 500, lineY: 55 },
  calendly: { xPct: 88, yPct: 22, lineX: 880, lineY: 132 },
  docusign: { xPct: 94, yPct: 55, lineX: 940, lineY: 330 },
  rippling: { xPct: 86, yPct: 88, lineX: 860, lineY: 528 },
  checkr: { xPct: 14, yPct: 88, lineX: 140, lineY: 528 },
  ashby_ai: { xPct: 6, yPct: 55, lineX: 60, lineY: 330 },
  gmail: { xPct: 12, yPct: 22, lineX: 120, lineY: 132 },
};

interface Props {
  connectorStateInitial: ConnectorState[];
  events: CandidateEvent[];
  emailLog: EmailLogEntry[];
}

export function IntegrationsView({ connectorStateInitial, events, emailLog }: Props) {
  const [connectorState, setConnectorState] = useState(connectorStateInitial);
  const [pending, startTransition] = useTransition();

  const stateById = useMemo(
    () => new Map(connectorState.map((c) => [c.id, c.enabled])),
    [connectorState],
  );

  function toggle(id: ConnectorId, enabled: boolean) {
    startTransition(async () => {
      const res = await fetch(`/api/connectors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
      if (!res.ok) return;
      const { state } = (await res.json()) as { state: ConnectorState[] };
      setConnectorState(state);
    });
  }

  const enabledCount = connectorState.filter((c) => c.enabled).length;

  return (
    <div className="flex flex-col gap-10">
      <SummaryStrip
        total={CONNECTORS.length}
        enabled={enabledCount}
        triggerCount={Object.values(STAGE_TRIGGERS).reduce((n, t) => n + t.length, 0)}
      />

      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Architecture"
          title="The ATS is the hub"
          body="Every candidate email, every calendar hold, every offer packet fires from a single wiring diagram — stage transitions in this pipeline dispatch to the connectors below. Toggle a connector off and its triggers stop, silently and immediately."
        />
        <HubDiagram stateById={stateById} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Connected tools"
          title="Seven integrations, one wire each"
          body="Five native marketplace connections, two glued in via Zapier. Each card shows what fires from what stage."
        />
        <ConnectorGrid stateById={stateById} pending={pending} onToggle={toggle} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Trigger matrix"
          title="Which connector fires on which stage"
          body="Every dot is a real dispatch. Hover to see the exact action. This is the entire behavior of the ATS — nothing else is hidden in code."
        />
        <TriggerMatrix stateById={stateById} />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeader
          eyebrow="Live activity"
          title="What the connectors did, most recent first"
          body="Everything a connector fires — emails, calendar holds, background checks — lands here with its source tagged."
        />
        <ActivityFeed events={events} emailLog={emailLog} />
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs font-bold uppercase tracking-widest text-teal">{eyebrow}</p>
      <h2 className="mt-1.5 font-serif text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-1.5 max-w-3xl text-[15px] text-muted">{body}</p>
    </div>
  );
}

function SummaryStrip({
  total,
  enabled,
  triggerCount,
}: {
  total: number;
  enabled: number;
  triggerCount: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <SummaryCell label="Connectors" value={`${enabled}/${total}`} sub="enabled" />
      <SummaryCell label="Stage triggers" value={String(triggerCount)} sub="wired end-to-end" />
      <SummaryCell label="Manual work" value="0" sub="per stage transition" />
    </div>
  );
}

function SummaryCell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel p-4">
      <p className="font-mono text-[11px] uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl font-semibold text-ink">{value}</p>
      <p className="text-[12px] text-muted">{sub}</p>
    </div>
  );
}

function HubDiagram({ stateById }: { stateById: Map<ConnectorId, boolean> }) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-line bg-panel">
      <div className="relative w-full" style={{ aspectRatio: "1000 / 600" }}>
        <svg
          viewBox="0 0 1000 600"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {CONNECTORS.map((c) => {
            const layout = HUB_LAYOUT[c.id];
            const enabled = stateById.get(c.id) ?? true;
            return (
              <line
                key={c.id}
                x1="500"
                y1="300"
                x2={layout.lineX}
                y2={layout.lineY}
                stroke={ACCENT_HEX[c.accent]}
                strokeWidth={enabled ? 2 : 1.25}
                strokeOpacity={enabled ? 0.55 : 0.2}
                strokeDasharray={enabled ? undefined : "6 6"}
              />
            );
          })}
          <circle cx="500" cy="300" r="6" fill="#17233B" />
        </svg>

        {/* Hub */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-ink bg-paper px-5 py-3 text-center shadow-sm"
          style={{ left: "50%", top: "50%" }}
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal">
            ATS pipeline
          </p>
          <p className="font-serif text-lg font-semibold text-ink">This app</p>
          <p className="mt-0.5 text-[11px] text-muted">Stage transitions →</p>
        </div>

        {/* Connector chips */}
        {CONNECTORS.map((c) => {
          const layout = HUB_LAYOUT[c.id];
          const enabled = stateById.get(c.id) ?? true;
          return (
            <div
              key={c.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-panel px-3 py-2 text-center shadow-sm transition-opacity ${
                enabled ? ACCENT_BORDER[c.accent] : "border-line-strong opacity-55"
              }`}
              style={{ left: `${layout.xPct}%`, top: `${layout.yPct}%`, minWidth: "140px" }}
            >
              <p className={`font-mono text-[10px] font-bold uppercase tracking-widest ${ACCENT_TEXT[c.accent]}`}>
                {c.category}
              </p>
              <p className="font-serif text-[15px] font-semibold text-ink">{c.name}</p>
              <p className="text-[10.5px] text-muted">
                {c.mode === "native" ? "Native" : "Zapier"} · {enabled ? "on" : "off"}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConnectorGrid({
  stateById,
  pending,
  onToggle,
}: {
  stateById: Map<ConnectorId, boolean>;
  pending: boolean;
  onToggle: (id: ConnectorId, enabled: boolean) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {CONNECTORS.map((c) => (
        <ConnectorCard
          key={c.id}
          connector={c}
          enabled={stateById.get(c.id) ?? true}
          pending={pending}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

function ConnectorCard({
  connector,
  enabled,
  pending,
  onToggle,
}: {
  connector: Connector;
  enabled: boolean;
  pending: boolean;
  onToggle: (id: ConnectorId, enabled: boolean) => void;
}) {
  const stages = stagesForConnector(connector.id);
  return (
    <div
      className={`flex flex-col rounded-xl border bg-panel p-5 transition-opacity ${
        enabled ? "border-line" : "border-line opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${enabled ? "bg-teal" : "bg-line-strong"}`}
            />
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
              {connector.category}
            </p>
          </div>
          <p className="mt-1 font-serif text-lg font-semibold text-ink">{connector.name}</p>
          <p className="text-[12px] text-muted">{connector.provider}</p>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${
            connector.mode === "native"
              ? `${ACCENT_BG_SOFT[connector.accent]} ${ACCENT_TEXT[connector.accent]}`
              : "bg-[#EEECE5] text-muted"
          }`}
        >
          {connector.mode === "native" ? "Native" : "Zapier glue"}
        </span>
      </div>

      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">{connector.tagline}</p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{connector.description}</p>

      {stages.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted">
            Fires on
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {stages.map((s) => (
              <StageBadge key={s} stage={stageById(s)} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
        <span className="font-mono text-[11px] text-muted">
          {enabled ? "Connected — dispatching" : "Disconnected — bypassed"}
        </span>
        <button
          onClick={() => onToggle(connector.id, !enabled)}
          disabled={pending}
          className={`rounded-md border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide transition-colors ${
            enabled
              ? "border-line-strong text-muted hover:border-rose hover:text-rose"
              : "border-teal bg-teal-soft text-teal hover:bg-teal hover:text-white"
          } disabled:opacity-50`}
        >
          {enabled ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
}

function TriggerMatrix({ stateById }: { stateById: Map<ConnectorId, boolean> }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-panel">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className="w-52 px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-muted">
              Connector
            </th>
            {PIPELINE_STAGES.map((s) => (
              <th
                key={s.id}
                className="px-2 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-wide text-muted"
              >
                <span className="inline-block max-w-[64px] text-[10.5px] leading-tight">
                  {s.title}
                </span>
              </th>
            ))}
            <th className="px-2 py-3 text-center font-mono text-[11px] font-bold uppercase tracking-wide text-muted">
              Rejected
            </th>
          </tr>
        </thead>
        <tbody>
          {CONNECTORS.map((c) => {
            const enabled = stateById.get(c.id) ?? true;
            return (
              <tr key={c.id} className="border-b border-line last:border-b-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: enabled ? ACCENT_HEX[c.accent] : "#D6CFC2" }}
                    />
                    <div>
                      <p className="text-[13.5px] font-semibold text-ink">{c.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-muted">
                        {c.category}
                      </p>
                    </div>
                  </div>
                </td>
                {[...PIPELINE_STAGES.map((s) => s.id), "rejected" as const].map((stageId) => {
                  const triggers = (STAGE_TRIGGERS[stageId] ?? []).filter(
                    (t: StageTrigger) => t.connectorId === c.id,
                  );
                  const actions = triggers.map((t) => t.action).join("\n");
                  return (
                    <td key={stageId} className="px-2 py-3 text-center">
                      {triggers.length > 0 ? (
                        <span
                          title={actions}
                          className="inline-block h-3 w-3 rounded-full"
                          style={{
                            background: enabled ? ACCENT_HEX[c.accent] : "#D6CFC2",
                            opacity: enabled ? 1 : 0.4,
                          }}
                        />
                      ) : (
                        <span className="text-[11px] text-line-strong">·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface ActivityRow {
  id: string;
  at: string;
  label: string;
  connector: Connector | null;
  isEmail: boolean;
}

function ActivityFeed({
  events,
  emailLog,
}: {
  events: CandidateEvent[];
  emailLog: EmailLogEntry[];
}) {
  const rows: ActivityRow[] = useMemo(() => {
    const evRows: ActivityRow[] = events
      .filter((e) => !!e.connectorId)
      .map((e) => ({
        id: e.id,
        at: e.at,
        label: e.label,
        connector: e.connectorId ? connectorById(e.connectorId) : null,
        isEmail: false,
      }));
    const emailRows: ActivityRow[] = emailLog.map((e) => ({
      id: e.id,
      at: e.sentAt,
      label: `${e.subject} → ${e.candidateName}`,
      connector: connectorById("gmail"),
      isEmail: true,
    }));
    return [...evRows, ...emailRows]
      .sort((a, b) => (a.at < b.at ? 1 : -1))
      .slice(0, 25);
  }, [events, emailLog]);

  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-panel p-6 text-sm text-muted">
        No connector activity yet. Move a candidate through a stage from the pipeline board and it
        will appear here.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-panel">
      <ul>
        {rows.map((r) => (
          <li
            key={r.id}
            className="flex items-start gap-3 border-b border-line px-4 py-3 last:border-b-0"
          >
            {r.connector ? (
              <span
                className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ background: ACCENT_HEX[r.connector.accent] }}
              />
            ) : (
              <span className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full bg-line-strong" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] text-ink">{r.label.replace(/^\[[^\]]+\]\s*/, "")}</p>
              <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-muted">
                {r.connector?.name ?? "System"}
                {r.isEmail ? " · email" : ""} · {new Date(r.at).toLocaleString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
