import type { Stage, StageId } from "./types";
import type { EmailTemplateId } from "./emailTemplates";

export const STAGES: Stage[] = [
  { id: "intake", code: "01", title: "Intake", accent: "teal" },
  { id: "acknowledge", code: "02", title: "Acknowledged", accent: "teal" },
  { id: "ai_screen", code: "03", title: "AI Screen", accent: "violet" },
  { id: "recruiter_review", code: "04", title: "Recruiter Review", accent: "amber" },
  { id: "interview_invite", code: "05", title: "Interview Invite", accent: "teal" },
  { id: "screening_call", code: "06", title: "Screening Call", accent: "ink" },
  { id: "team_interviews", code: "07", title: "Team Interviews", accent: "ink" },
  { id: "offer", code: "08", title: "Offer", accent: "green" },
  { id: "preboard", code: "09", title: "Preboard", accent: "green" },
  { id: "hired", code: "✓", title: "Hired", accent: "green", terminal: true },
  { id: "rejected", code: "✕", title: "Rejected", accent: "rose", terminal: true },
];

const ORDER: StageId[] = STAGES.filter((s) => !s.terminal).map((s) => s.id);

export const PIPELINE_STAGES: Stage[] = STAGES.filter((s) => !s.terminal);

export function nextStage(stage: StageId): StageId {
  const idx = ORDER.indexOf(stage);
  if (idx === -1 || idx === ORDER.length - 1) return "hired";
  return ORDER[idx + 1];
}

export function stageOrderIndex(stage: StageId): number {
  return ORDER.indexOf(stage);
}

export function stageById(id: StageId): Stage {
  const found = STAGES.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown stage: ${id}`);
  return found;
}

const STAGE_EMAIL_TEMPLATES: Partial<Record<StageId, EmailTemplateId>> = {
  acknowledge: "application_received",
  interview_invite: "interview_invite",
  offer: "offer",
  rejected: "rejection",
};

export function emailTemplateForStage(stage: StageId): EmailTemplateId | undefined {
  return STAGE_EMAIL_TEMPLATES[stage];
}

/**
 * The "Glue" workflow automation from the proposal doc: system actions that
 * fire silently alongside the stage move and its email, distinct from the
 * four candidate-facing templates.
 */
const STAGE_AUTOMATION_EVENTS: Partial<Record<StageId, string[]>> = {
  screening_call: ["Interview prep pack sent", "Reminder scheduled for screening call"],
  team_interviews: [
    "Interviewer calendar holds booked",
    "Scorecards created for panel",
    "Reminder scheduled for candidate",
  ],
  preboard: ["Background check initiated", "Equipment order placed", "Welcome pack sent"],
};

export function automationEventsForStage(stage: StageId): string[] {
  return STAGE_AUTOMATION_EVENTS[stage] ?? [];
}
