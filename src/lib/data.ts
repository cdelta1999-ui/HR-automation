import type { Candidate } from "./types";

export const CANDIDATES: Candidate[] = [
  { id: "c1", name: "Priya Nair", roleTitle: "Senior Frontend Engineer", appliedOn: "2026-06-29", stage: "intake", daysInStage: 0, recruiter: "Dana Kim" },
  { id: "c2", name: "Marcus Webb", roleTitle: "Product Designer", appliedOn: "2026-06-28", stage: "intake", daysInStage: 1, recruiter: "Dana Kim" },
  { id: "c3", name: "Elena Petrova", roleTitle: "Backend Engineer", appliedOn: "2026-06-27", stage: "acknowledge", daysInStage: 1, recruiter: "Sam Osei" },
  { id: "c4", name: "Jordan Blake", roleTitle: "Customer Success Manager", appliedOn: "2026-06-26", stage: "acknowledge", daysInStage: 2, recruiter: "Sam Osei" },
  { id: "c5", name: "Aiko Tanaka", roleTitle: "Senior Frontend Engineer", appliedOn: "2026-06-24", stage: "ai_screen", daysInStage: 1, recruiter: "Dana Kim", aiScore: 88 },
  { id: "c6", name: "Ravi Chandran", roleTitle: "Data Analyst", appliedOn: "2026-06-23", stage: "ai_screen", daysInStage: 2, recruiter: "Priya Sharma", aiScore: 61 },
  { id: "c7", name: "Sofia Marquez", roleTitle: "Product Designer", appliedOn: "2026-06-22", stage: "recruiter_review", daysInStage: 1, recruiter: "Dana Kim", aiScore: 92 },
  { id: "c8", name: "Noah Fischer", roleTitle: "Backend Engineer", appliedOn: "2026-06-21", stage: "recruiter_review", daysInStage: 3, recruiter: "Sam Osei", aiScore: 74 },
  { id: "c9", name: "Grace Oládipọ", roleTitle: "Senior Frontend Engineer", appliedOn: "2026-06-18", stage: "interview_invite", daysInStage: 2, recruiter: "Dana Kim", aiScore: 90 },
  { id: "c10", name: "Liam O'Connell", roleTitle: "Sales Development Rep", appliedOn: "2026-06-17", stage: "interview_invite", daysInStage: 1, recruiter: "Priya Sharma", aiScore: 79 },
  { id: "c11", name: "Hana Suzuki", roleTitle: "Product Designer", appliedOn: "2026-06-15", stage: "screening_call", daysInStage: 2, recruiter: "Dana Kim", aiScore: 85 },
  { id: "c12", name: "Tomás Herrera", roleTitle: "Backend Engineer", appliedOn: "2026-06-14", stage: "screening_call", daysInStage: 4, recruiter: "Sam Osei", aiScore: 70 },
  { id: "c13", name: "Zainab Yusuf", roleTitle: "Senior Frontend Engineer", appliedOn: "2026-06-10", stage: "team_interviews", daysInStage: 3, recruiter: "Dana Kim", aiScore: 94 },
  { id: "c14", name: "Ethan Park", roleTitle: "Data Analyst", appliedOn: "2026-06-08", stage: "team_interviews", daysInStage: 5, recruiter: "Priya Sharma", aiScore: 82 },
  { id: "c15", name: "Ines Duarte", roleTitle: "Customer Success Manager", appliedOn: "2026-06-05", stage: "offer", daysInStage: 2, recruiter: "Sam Osei", aiScore: 88 },
  { id: "c16", name: "Wei Zhang", roleTitle: "Senior Frontend Engineer", appliedOn: "2026-05-30", stage: "preboard", daysInStage: 3, recruiter: "Dana Kim", aiScore: 91 },
  { id: "c17", name: "Amara Diallo", roleTitle: "Backend Engineer", appliedOn: "2026-05-20", stage: "hired", daysInStage: 0, recruiter: "Sam Osei", aiScore: 89 },
  { id: "c18", name: "Ben Whitfield", roleTitle: "Data Analyst", appliedOn: "2026-06-19", stage: "rejected", daysInStage: 0, recruiter: "Priya Sharma", aiScore: 42, rejectedFromStage: "ai_screen" },
  { id: "c19", name: "Chloe Bennett", roleTitle: "Product Designer", appliedOn: "2026-06-12", stage: "rejected", daysInStage: 0, recruiter: "Dana Kim", aiScore: 58, rejectedFromStage: "recruiter_review" },
];
