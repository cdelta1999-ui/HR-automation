import type { EmailTemplateId } from "./emailTemplates";

export type StageId =
  | "intake"
  | "acknowledge"
  | "ai_screen"
  | "recruiter_review"
  | "interview_invite"
  | "screening_call"
  | "team_interviews"
  | "offer"
  | "preboard"
  | "hired"
  | "rejected";

export interface Stage {
  id: StageId;
  code: string;
  title: string;
  accent: "teal" | "violet" | "amber" | "green" | "rose" | "ink";
  terminal?: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  roleTitle: string;
  appliedOn: string;
  stage: StageId;
  daysInStage: number;
  recruiter: string;
  aiScore?: number;
  rejectedFromStage?: StageId;
  holdReleaseAt?: string;
}

export interface EmailLogEntry {
  id: string;
  candidateId: string;
  candidateName: string;
  templateId: EmailTemplateId;
  subject: string;
  body: string;
  sentAt: string;
}

export interface CandidateEvent {
  id: string;
  candidateId: string;
  label: string;
  at: string;
}
