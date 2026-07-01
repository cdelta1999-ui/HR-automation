interface FaqRule {
  keywords: string[];
  answer: string;
}

const RULES: FaqRule[] = [
  {
    keywords: ["status", "update", "where", "hear back", "review"],
    answer:
      "Your application is being reviewed right now. We follow up within a few business days — always, even if it's a no.",
  },
  {
    keywords: ["timeline", "how long", "process", "steps", "stages"],
    answer:
      "Typical path: application review (2-3 business days) → screening call → team interviews → decision. Most roles take about 2-3 weeks start to finish.",
  },
  {
    keywords: ["location", "remote", "office", "onsite", "hybrid"],
    answer:
      "Most roles are hybrid out of our main office, with remote-friendly options depending on the team — check the job post for specifics on this one.",
  },
  {
    keywords: ["benefit", "salary", "compensation", "pay", "pto", "insurance", "equity"],
    answer:
      "We share full compensation and benefits detail once we reach the offer stage, so you have the complete picture before deciding — nothing hidden, just sequenced.",
  },
  {
    keywords: ["reschedule", "interview time", "change my interview", "different time"],
    answer:
      "No problem — use the scheduling link in your interview invite email to pick a new time, or just reply to that email directly.",
  },
  {
    keywords: ["reject", "rejected", "not selected", "didn't get", "turned down"],
    answer:
      "If you weren't moving forward, we always send a note explaining that so you're never left wondering — check your inbox, and feel free to ask for feedback.",
  },
];

const ESCALATION_KEYWORDS = ["recruiter", "human", "talk to someone", "real person", "manager"];

export interface FaqResponse {
  answer: string;
  escalate: boolean;
}

export function answerFaq(message: string): FaqResponse {
  const text = message.toLowerCase();

  if (ESCALATION_KEYWORDS.some((k) => text.includes(k))) {
    return {
      answer: "Of course — connecting you with a recruiter now. Someone will follow up by email shortly.",
      escalate: true,
    };
  }

  let best: FaqRule | null = null;
  let bestScore = 0;
  for (const rule of RULES) {
    const score = rule.keywords.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }

  if (best) {
    return { answer: best.answer, escalate: false };
  }

  return {
    answer:
      "I don't have a confident answer for that one — let me connect you with a recruiter instead.",
    escalate: true,
  };
}
