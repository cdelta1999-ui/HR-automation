import type { Candidate } from "./types";

export type EmailTemplateId =
  | "application_received"
  | "interview_invite"
  | "rejection"
  | "offer";

export interface EmailTemplate {
  id: EmailTemplateId;
  label: string;
  accent: "teal" | "amber" | "rose" | "green";
  subject: string;
  preview: string;
  body: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "application_received",
    label: "Application Received",
    accent: "teal",
    subject: "Your application to {{Company}} is in, {{FirstName}}",
    preview: "Here's exactly what happens next — no black box.",
    body: `Hi {{FirstName}},

Thanks for applying for the {{RoleTitle}} role. Your application is safely with us, and a real person — with a little help from our tools — is reviewing it now.

Within a few business days you'll hear whether we're moving to a first conversation. Either way, we'll email you — we don't leave applications unanswered.

Questions in the meantime? Ask our assistant any time at {{FAQLink}}, or just reply here.

Thanks for your interest in {{Company}}.
— {{RecruiterName}}, Talent Team`,
  },
  {
    id: "interview_invite",
    label: "Interview Invite",
    accent: "amber",
    subject: "Let's talk — {{RoleTitle}} at {{Company}}",
    preview: "Pick a time that works for you.",
    body: `Hi {{FirstName}},

Good news — we'd love to talk with you about the {{RoleTitle}} role.

Grab whatever time suits you here: {{SchedulingLink}} (30 minutes, video).

Need to reschedule, or have any accessibility requirements? Just reply — we'll sort it.

Looking forward to it,
— {{RecruiterName}}`,
  },
  {
    id: "rejection",
    label: "Rejection",
    accent: "rose",
    subject: "An update on your {{RoleTitle}} application",
    preview: "A note from the team, and an open door.",
    body: `Hi {{FirstName}},

Thank you for the time and energy you put into your application for the {{RoleTitle}} role.

After a lot of thought, we've decided to move forward with another candidate for this position. It isn't a reflection of your ability.

We'd like to stay in touch, and would love for you to watch for future roles that fit.

Wishing you the very best in your search — truly.
— {{RecruiterName}}`,
  },
  {
    id: "offer",
    label: "Offer Extension",
    accent: "green",
    subject: "We'd love for you to join {{Company}}, {{FirstName}}",
    preview: "The details, and a time to talk it through.",
    body: `Hi {{FirstName}},

It's official — we'd love to offer you the {{RoleTitle}} role at {{Company}}. The whole team is excited about what you'll bring.

Everything to review and sign is here: {{OfferLink}}.

Let's find 15 minutes to walk through it together and answer anything: {{SchedulingLink}}.

Welcome (almost!),
— {{RecruiterName}} & the {{Company}} team`,
  },
];

export function templateById(id: EmailTemplateId): EmailTemplate {
  const found = EMAIL_TEMPLATES.find((t) => t.id === id);
  if (!found) throw new Error(`Unknown email template: ${id}`);
  return found;
}

const COMPANY_NAME = "Acme Corp";

function tokensForCandidate(candidate: Candidate): Record<string, string> {
  return {
    FirstName: candidate.name.split(" ")[0],
    RoleTitle: candidate.roleTitle,
    Company: COMPANY_NAME,
    RecruiterName: candidate.recruiter,
    SchedulingLink: "https://schedule.acme.example/interview",
    OfferLink: "https://offers.acme.example/sign",
    FAQLink: "/faq",
  };
}

function interpolate(text: string, tokens: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => tokens[key] ?? match);
}

export function renderTemplate(templateId: EmailTemplateId, candidate: Candidate) {
  const template = templateById(templateId);
  const tokens = tokensForCandidate(candidate);
  return {
    subject: interpolate(template.subject, tokens),
    preview: template.preview,
    body: interpolate(template.body, tokens),
  };
}
