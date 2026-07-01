# HR Automation

Automated candidate experience workflow for recruiting: a live pipeline dashboard plus the
process map, email templates, and AI/automation proposal it's built from.

## What's here

- `src/app/dashboard` — Candidate Pipeline dashboard. Kanban-style board across the 9 workflow
  stages (Intake → Preboard) plus Hired/Rejected, with per-candidate AI score, recruiter, and
  time-in-stage. Advance/Reject/Run AI Screen actions call the backend and persist.
- `src/components/CandidateDetailPanel.tsx` — click a candidate's name for a slide-over with their
  full activity timeline (application, stage moves, AI screen results).
- `public/candidate-experience-workflow.html` — the static process map: stage-by-stage flowchart,
  the four core email templates, and the automation/AI rollout proposal with KPIs and guardrails.
- `src/lib` — stage definitions (`stages.ts`), the email template suite (`emailTemplates.ts`), the
  AI screening/recommendation logic (`aiScreening.ts`), shared types (`types.ts`), and mock seed
  data (`data.ts`).
- `src/lib/db.ts` — the backend: a SQLite-backed store (Node's built-in `node:sqlite`) with
  `getBoardState`, `advanceCandidate`, `rejectCandidate`, and `scoreCandidateAi`. Seeds itself from
  `data.ts` on first run and persists to `data/hr-automation.db` (gitignored).
- `src/app/api` — route handlers exposing the backend: `GET /api/board` returns the full board
  state; `POST /api/candidates/:id` with `{ "action": "advance" | "reject" | "score" }` mutates a
  candidate (moving stage, firing the matching email, or running the AI screen) and returns the
  updated board.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard lives at `/dashboard` and reads/
writes through the API routes above; the workflow map is served statically at
`/candidate-experience-workflow.html`.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · SQLite (`node:sqlite`).
