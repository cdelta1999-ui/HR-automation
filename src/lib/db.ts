import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { CANDIDATES } from "./data";
import { nextStage, stageById } from "./stages";
import { renderTemplate } from "./emailTemplates";
import { scoreCandidate, recommendationForScore } from "./aiScreening";
import {
  CONNECTORS,
  connectorById,
  triggersForStage,
  type ConnectorId,
  type StageTrigger,
} from "./connectors";
import type { Candidate, CandidateEvent, EmailLogEntry, StageId } from "./types";

export interface ConnectorState {
  id: ConnectorId;
  enabled: boolean;
}

export interface BoardState {
  candidates: Candidate[];
  events: CandidateEvent[];
  emailLog: EmailLogEntry[];
  connectorState: ConnectorState[];
}

const RECOMMENDATION_LABEL = {
  advance: "strong match",
  review: "borderline",
  reject: "below bar",
} as const;

const DB_PATH = path.join(process.cwd(), "data", "hr-automation.db");

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS candidates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      applied_on TEXT NOT NULL,
      stage TEXT NOT NULL,
      days_in_stage INTEGER NOT NULL,
      recruiter TEXT NOT NULL,
      ai_score INTEGER,
      rejected_from_stage TEXT,
      hold_release_at TEXT
    );
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      label TEXT NOT NULL,
      at TEXT NOT NULL,
      connector_id TEXT
    );
    CREATE TABLE IF NOT EXISTS email_log (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      template_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL DEFAULT '',
      sent_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS connectors (
      id TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 1
    );
  `);
  migrate(db);
  seedIfEmpty(db);
  seedConnectors(db);
  startHoldSweep(db);
  return db;
}

function migrate(database: DatabaseSync) {
  const columns = database.prepare("PRAGMA table_info(candidates)").all() as { name: string }[];
  if (!columns.some((c) => c.name === "rejected_from_stage")) {
    database.exec("ALTER TABLE candidates ADD COLUMN rejected_from_stage TEXT");
  }
  if (!columns.some((c) => c.name === "hold_release_at")) {
    database.exec("ALTER TABLE candidates ADD COLUMN hold_release_at TEXT");
  }
  const emailColumns = database.prepare("PRAGMA table_info(email_log)").all() as { name: string }[];
  if (!emailColumns.some((c) => c.name === "body")) {
    database.exec("ALTER TABLE email_log ADD COLUMN body TEXT NOT NULL DEFAULT ''");
  }
  const eventColumns = database.prepare("PRAGMA table_info(events)").all() as { name: string }[];
  if (!eventColumns.some((c) => c.name === "connector_id")) {
    database.exec("ALTER TABLE events ADD COLUMN connector_id TEXT");
  }
}

let holdSweepStarted = false;

function startHoldSweep(database: DatabaseSync) {
  if (holdSweepStarted) return;
  holdSweepStarted = true;
  setInterval(() => {
    try {
      sweepDueHolds(database);
    } catch {
      // best-effort background sweep; a failed tick just retries next interval
    }
  }, 60_000);
}

function seedIfEmpty(database: DatabaseSync) {
  const row = database.prepare("SELECT COUNT(*) as count FROM candidates").get() as {
    count: number;
  };
  if (row.count > 0) return;

  const insertCandidate = database.prepare(
    `INSERT INTO candidates (id, name, role_title, applied_on, stage, days_in_stage, recruiter, ai_score, rejected_from_stage)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertEvent = database.prepare(
    `INSERT INTO events (id, candidate_id, label, at, connector_id) VALUES (?, ?, ?, ?, NULL)`,
  );

  for (const c of CANDIDATES) {
    insertCandidate.run(
      c.id,
      c.name,
      c.roleTitle,
      c.appliedOn,
      c.stage,
      c.daysInStage,
      c.recruiter,
      c.aiScore ?? null,
      c.rejectedFromStage ?? null,
    );
    insertEvent.run(`${c.id}-applied`, c.id, "Application submitted", c.appliedOn);
  }
}

function seedConnectors(database: DatabaseSync) {
  const insert = database.prepare(
    "INSERT OR IGNORE INTO connectors (id, enabled) VALUES (?, 1)",
  );
  for (const c of CONNECTORS) insert.run(c.id);
}

function rowToCandidate(row: Record<string, unknown>): Candidate {
  return {
    id: row.id as string,
    name: row.name as string,
    roleTitle: row.role_title as string,
    appliedOn: row.applied_on as string,
    stage: row.stage as StageId,
    daysInStage: row.days_in_stage as number,
    recruiter: row.recruiter as string,
    aiScore: row.ai_score == null ? undefined : (row.ai_score as number),
    rejectedFromStage: row.rejected_from_stage == null ? undefined : (row.rejected_from_stage as StageId),
    holdReleaseAt: row.hold_release_at == null ? undefined : (row.hold_release_at as string),
  };
}

function rowToEvent(row: Record<string, unknown>): CandidateEvent {
  return {
    id: row.id as string,
    candidateId: row.candidate_id as string,
    label: row.label as string,
    at: row.at as string,
    connectorId: (row.connector_id as ConnectorId | null) ?? undefined,
  };
}

function rowToEmailLogEntry(row: Record<string, unknown>): EmailLogEntry {
  return {
    id: row.id as string,
    candidateId: row.candidate_id as string,
    candidateName: row.candidate_name as string,
    templateId: row.template_id as EmailLogEntry["templateId"],
    subject: row.subject as string,
    body: (row.body as string) ?? "",
    sentAt: row.sent_at as string,
  };
}

function readConnectorState(database: DatabaseSync): ConnectorState[] {
  const rows = database.prepare("SELECT id, enabled FROM connectors").all() as {
    id: string;
    enabled: number;
  }[];
  const byId = new Map(rows.map((r) => [r.id, r.enabled === 1]));
  // Fall back to enabled=true for any connector that isn't in the table yet
  // (e.g. right after adding a new one to the registry).
  return CONNECTORS.map((c) => ({ id: c.id, enabled: byId.get(c.id) ?? true }));
}

export function getBoardState(): BoardState {
  const database = getDb();
  sweepDueHolds(database);
  const candidates = (database.prepare("SELECT * FROM candidates").all() as Record<string, unknown>[]).map(
    rowToCandidate,
  );
  const events = (
    database.prepare("SELECT * FROM events ORDER BY at DESC").all() as Record<string, unknown>[]
  ).map(rowToEvent);
  const emailLog = (
    database.prepare("SELECT * FROM email_log ORDER BY sent_at DESC").all() as Record<
      string,
      unknown
    >[]
  ).map(rowToEmailLogEntry);
  const connectorState = readConnectorState(database);
  return { candidates, events, emailLog, connectorState };
}

function getCandidate(database: DatabaseSync, id: string): Candidate | undefined {
  const row = database.prepare("SELECT * FROM candidates WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  return row ? rowToCandidate(row) : undefined;
}

function logEvent(
  database: DatabaseSync,
  candidateId: string,
  label: string,
  connectorId?: ConnectorId,
) {
  database
    .prepare(
      "INSERT INTO events (id, candidate_id, label, at, connector_id) VALUES (?, ?, ?, ?, ?)",
    )
    .run(
      `${candidateId}-${Date.now()}-${Math.random()}`,
      candidateId,
      label,
      new Date().toISOString(),
      connectorId ?? null,
    );
}

function logEmail(
  database: DatabaseSync,
  candidate: Candidate,
  templateId: EmailLogEntry["templateId"],
) {
  const { subject, body } = renderTemplate(templateId, candidate);
  database
    .prepare(
      `INSERT INTO email_log (id, candidate_id, candidate_name, template_id, subject, body, sent_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      `${candidate.id}-${templateId}-${Date.now()}`,
      candidate.id,
      candidate.name,
      templateId,
      subject,
      body,
      new Date().toISOString(),
    );
}

/**
 * The dispatcher. When a candidate arrives on a stage, every trigger for
 * that stage fires through its connector — provided the connector is
 * enabled. A disabled connector logs nothing, sends nothing, does nothing.
 */
function fireStageTriggers(
  database: DatabaseSync,
  candidate: Candidate,
  stage: StageId,
): void {
  const enabled = new Map(readConnectorState(database).map((c) => [c.id, c.enabled]));
  for (const trigger of triggersForStage(stage)) {
    if (!enabled.get(trigger.connectorId)) {
      logEvent(
        database,
        candidate.id,
        `[${connectorById(trigger.connectorId).name}] skipped (connector disabled) — ${trigger.action}`,
        trigger.connectorId,
      );
      continue;
    }
    dispatchTrigger(database, candidate, trigger);
  }

  // Stage 03 is AI decision support, not just an event: score on arrival.
  if (
    stage === "ai_screen" &&
    enabled.get("ashby_ai") &&
    typeof candidate.aiScore !== "number"
  ) {
    applyAiScreen(database, { ...candidate, stage });
  }
}

function dispatchTrigger(
  database: DatabaseSync,
  candidate: Candidate,
  trigger: StageTrigger,
): void {
  const connector = connectorById(trigger.connectorId);
  if (trigger.emailTemplateId) {
    logEmail(database, candidate, trigger.emailTemplateId);
    return;
  }
  logEvent(database, candidate.id, `[${connector.name}] ${trigger.action}`, trigger.connectorId);
}

export function advanceCandidate(id: string): BoardState | undefined {
  const database = getDb();
  const candidate = getCandidate(database, id);
  if (!candidate) return undefined;

  const stage = nextStage(candidate.stage);
  database
    .prepare("UPDATE candidates SET stage = ?, days_in_stage = 0, hold_release_at = NULL WHERE id = ?")
    .run(stage, id);
  if (candidate.holdReleaseAt) {
    logEvent(database, id, "Hold overridden by recruiter — advanced instead of auto-rejecting");
  }
  logEvent(database, id, `Moved to ${stageById(stage).title}`);

  const advanced = getCandidate(database, id)!;
  fireStageTriggers(database, advanced, stage);
  return getBoardState();
}

export function rejectCandidate(id: string): BoardState | undefined {
  const database = getDb();
  const candidate = getCandidate(database, id);
  if (!candidate) return undefined;

  database
    .prepare(
      "UPDATE candidates SET stage = 'rejected', days_in_stage = 0, rejected_from_stage = ?, hold_release_at = NULL WHERE id = ?",
    )
    .run(candidate.stage, id);
  logEvent(database, id, `Moved to Rejected (from ${stageById(candidate.stage).title})`);
  fireStageTriggers(database, { ...candidate, stage: "rejected" }, "rejected");
  return getBoardState();
}

const HOLD_MIN_HOURS = 24;
const HOLD_MAX_HOURS = 48;

function applyAiScreen(database: DatabaseSync, candidate: Candidate): void {
  const score = scoreCandidate(candidate);
  const recommendation = recommendationForScore(score);

  if (recommendation === "reject") {
    const holdHours = HOLD_MIN_HOURS + Math.random() * (HOLD_MAX_HOURS - HOLD_MIN_HOURS);
    const holdReleaseAt = new Date(Date.now() + holdHours * 60 * 60 * 1000).toISOString();
    database
      .prepare("UPDATE candidates SET ai_score = ?, hold_release_at = ? WHERE id = ?")
      .run(score, holdReleaseAt, candidate.id);
    logEvent(
      database,
      candidate.id,
      `[Résumé Screener] scored ${score} (below bar) — held for early rejection, auto-releases in ~${Math.round(holdHours)}h`,
      "ashby_ai",
    );
  } else {
    database.prepare("UPDATE candidates SET ai_score = ? WHERE id = ?").run(score, candidate.id);
    logEvent(
      database,
      candidate.id,
      `[Résumé Screener] scored ${score} (${RECOMMENDATION_LABEL[recommendation]})`,
      "ashby_ai",
    );
  }
}

export function scoreCandidateAi(id: string): BoardState | undefined {
  const database = getDb();
  const candidate = getCandidate(database, id);
  if (!candidate) return undefined;

  applyAiScreen(database, candidate);
  return getBoardState();
}

const RECRUITERS = ["Dana Kim", "Sam Osei", "Priya Sharma"];

/**
 * The front door of the workflow: "Candidate clicks Apply." Captures the
 * application, logs the intake automation, and immediately auto-acknowledges
 * — the acknowledge stage's triggers (Gmail template, etc.) then fire
 * through the dispatcher, honoring the doc's "sent in < 2 minutes" promise.
 */
export function createCandidate(name: string, roleTitle: string): BoardState {
  const database = getDb();
  const id = `c${Date.now()}`;
  const now = new Date().toISOString();

  // Round-robin assignment: hand the new application to the least-loaded recruiter.
  const counts = RECRUITERS.map(
    (r) =>
      (
        database.prepare("SELECT COUNT(*) as count FROM candidates WHERE recruiter = ?").get(r) as {
          count: number;
        }
      ).count,
  );
  const recruiter = RECRUITERS[counts.indexOf(Math.min(...counts))];

  database
    .prepare(
      `INSERT INTO candidates (id, name, role_title, applied_on, stage, days_in_stage, recruiter, ai_score, rejected_from_stage, hold_release_at)
       VALUES (?, ?, ?, ?, 'intake', 0, ?, NULL, NULL, NULL)`,
    )
    .run(id, name, roleTitle, now, recruiter);
  logEvent(database, id, "Application submitted");
  logEvent(database, id, "Résumé parsed into structured fields");

  const candidate = getCandidate(database, id)!;
  database.prepare("UPDATE candidates SET stage = 'acknowledge' WHERE id = ?").run(id);
  logEvent(database, id, "Moved to Acknowledged — automated, no human action needed");
  fireStageTriggers(database, { ...candidate, stage: "acknowledge" }, "acknowledge");

  return getBoardState();
}

/** Auto-rejects any candidate whose 24-48h hold has elapsed, with a rejection email — never an instant auto-decline. */
export function sweepDueHolds(database: DatabaseSync): void {
  const due = database
    .prepare(
      "SELECT * FROM candidates WHERE hold_release_at IS NOT NULL AND hold_release_at <= ? AND stage != 'rejected'",
    )
    .all(new Date().toISOString()) as Record<string, unknown>[];

  for (const row of due) {
    const candidate = rowToCandidate(row);
    database
      .prepare(
        "UPDATE candidates SET stage = 'rejected', days_in_stage = 0, rejected_from_stage = ?, hold_release_at = NULL WHERE id = ?",
      )
      .run(candidate.stage, candidate.id);
    logEvent(database, candidate.id, "Hold period elapsed — automatic early rejection sent");
    fireStageTriggers(database, { ...candidate, stage: "rejected" }, "rejected");
  }
}

export function setConnectorEnabled(id: ConnectorId, enabled: boolean): ConnectorState[] {
  const database = getDb();
  database
    .prepare("INSERT INTO connectors (id, enabled) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET enabled = excluded.enabled")
    .run(id, enabled ? 1 : 0);
  return readConnectorState(database);
}

export function getConnectorState(): ConnectorState[] {
  return readConnectorState(getDb());
}
