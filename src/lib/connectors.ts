import type { EmailTemplateId } from "./emailTemplates";
import type { StageId } from "./types";

export type ConnectorId =
  | "gmail"
  | "calendly"
  | "ashby_ai"
  | "docusign"
  | "faq_concierge"
  | "checkr"
  | "rippling";

export type ConnectorCategory =
  | "Email"
  | "Scheduling"
  | "AI Screening"
  | "E-Sign"
  | "Candidate Chat"
  | "Background Check"
  | "IT & Equipment";

export type ConnectorMode = "native" | "connector-glue";

export type ConnectorAccent = "teal" | "amber" | "rose" | "green" | "violet" | "ink";

export interface Connector {
  id: ConnectorId;
  name: string;
  provider: string;
  category: ConnectorCategory;
  mode: ConnectorMode;
  accent: ConnectorAccent;
  tagline: string;
  description: string;
}

export const CONNECTORS: Connector[] = [
  {
    id: "gmail",
    name: "Gmail",
    provider: "Google Workspace",
    category: "Email",
    mode: "native",
    accent: "teal",
    tagline: "Sends every candidate-facing email from a shared talent inbox.",
    description:
      "Native OAuth to Google Workspace. Renders the four candidate email templates and delivers on the stage transition — no drafts, no back-and-forth.",
  },
  {
    id: "calendly",
    name: "Calendly",
    provider: "Calendly Teams",
    category: "Scheduling",
    mode: "native",
    accent: "amber",
    tagline: "Self-serve booking for screens, panels, and offer walk-throughs.",
    description:
      "Hooks into every recruiter and interviewer calendar. Personalized booking links, holds, reminders, and reschedules — the candidate never waits on a coordinator.",
  },
  {
    id: "ashby_ai",
    name: "Résumé Screener",
    provider: "Ashby AI",
    category: "AI Screening",
    mode: "native",
    accent: "violet",
    tagline: "Scores every résumé against the role's rubric within seconds.",
    description:
      "Reads the parsed résumé, rates it against the role's scorecard, and pushes strong-match, borderline, or below-bar into the pipeline for a human decision.",
  },
  {
    id: "docusign",
    name: "DocuSign",
    provider: "DocuSign",
    category: "E-Sign",
    mode: "native",
    accent: "green",
    tagline: "Prepares and countersigns the offer packet.",
    description:
      "Populates the offer letter from the role template, sends for signature, and stores the countersigned copy on the candidate's record.",
  },
  {
    id: "faq_concierge",
    name: "Talent FAQ Assistant",
    provider: "In-house LLM",
    category: "Candidate Chat",
    mode: "native",
    accent: "ink",
    tagline: "Answers 'what's the status of my application?' any hour.",
    description:
      "Always-on companion linked from every candidate email. Handles status, timing, benefits, and process questions so the recruiter's inbox doesn't.",
  },
  {
    id: "checkr",
    name: "Checkr",
    provider: "Checkr",
    category: "Background Check",
    mode: "connector-glue",
    accent: "rose",
    tagline: "Runs the pre-hire background check on Preboard.",
    description:
      "Kicked off through a Zapier bridge — the ATS webhook fires on Preboard, Zapier calls Checkr's API, results flow back into the candidate timeline.",
  },
  {
    id: "rippling",
    name: "Rippling",
    provider: "Rippling",
    category: "IT & Equipment",
    mode: "connector-glue",
    accent: "teal",
    tagline: "Orders the laptop, files the IT ticket, ships the welcome pack.",
    description:
      "Zapier watches the Preboard stage, creates the Rippling onboarding record, and triggers device provisioning + welcome-pack fulfilment.",
  },
];

const CONNECTOR_BY_ID: Record<ConnectorId, Connector> = Object.fromEntries(
  CONNECTORS.map((c) => [c.id, c]),
) as Record<ConnectorId, Connector>;

export function connectorById(id: ConnectorId): Connector {
  return CONNECTOR_BY_ID[id];
}

export interface StageTrigger {
  connectorId: ConnectorId;
  /** Action the connector performs. Logged as an event when no email is attached. */
  action: string;
  /** When set, the trigger renders + sends this email template instead of logging an event. */
  emailTemplateId?: EmailTemplateId;
}

/**
 * The single wiring diagram of the ATS.
 *
 * When a candidate lands on a stage, every trigger for that stage fires
 * through its connector — provided the connector is enabled. Emails,
 * calendar holds, e-sign packets and background checks are all just
 * entries in this map. To add an integration, add a connector and a row
 * here; nothing else in the pipeline needs to change.
 */
export const STAGE_TRIGGERS: Record<StageId, StageTrigger[]> = {
  intake: [],
  acknowledge: [
    { connectorId: "gmail", action: "Application Received email sent", emailTemplateId: "application_received" },
  ],
  ai_screen: [
    { connectorId: "ashby_ai", action: "Résumé scored against role rubric" },
  ],
  recruiter_review: [],
  interview_invite: [
    { connectorId: "gmail", action: "Interview Invite email sent", emailTemplateId: "interview_invite" },
    { connectorId: "calendly", action: "Self-scheduling link personalized for candidate" },
  ],
  screening_call: [
    { connectorId: "gmail", action: "Interview prep pack sent" },
    { connectorId: "calendly", action: "Reminder scheduled for screening call" },
  ],
  team_interviews: [
    { connectorId: "calendly", action: "Interviewer calendar holds booked" },
    { connectorId: "ashby_ai", action: "Scorecards created for panel" },
    { connectorId: "calendly", action: "Reminder scheduled for candidate" },
  ],
  offer: [
    { connectorId: "gmail", action: "Offer email sent", emailTemplateId: "offer" },
    { connectorId: "docusign", action: "Offer packet prepared for signature" },
    { connectorId: "calendly", action: "15-min offer walk-through link included" },
  ],
  preboard: [
    { connectorId: "checkr", action: "Background check initiated" },
    { connectorId: "rippling", action: "Equipment order placed" },
    { connectorId: "rippling", action: "IT provisioning ticket created" },
    { connectorId: "gmail", action: "Welcome pack sent" },
  ],
  hired: [],
  rejected: [
    { connectorId: "gmail", action: "Rejection email sent", emailTemplateId: "rejection" },
  ],
};

export function triggersForStage(stage: StageId): StageTrigger[] {
  return STAGE_TRIGGERS[stage] ?? [];
}

export function stagesForConnector(connectorId: ConnectorId): StageId[] {
  const stages: StageId[] = [];
  for (const [stage, triggers] of Object.entries(STAGE_TRIGGERS) as [StageId, StageTrigger[]][]) {
    if (triggers.some((t) => t.connectorId === connectorId)) stages.push(stage);
  }
  return stages;
}
