# HR Automation

Automated candidate experience workflow for recruiting: a live pipeline dashboard plus the
process map, email templates, and AI/automation proposal it's built from.

## What's here

- `src/app/dashboard` — Candidate Pipeline dashboard. Kanban-style board across the 9 workflow
  stages (Intake → Preboard) plus Hired/Rejected, with per-candidate AI score, recruiter, and
  time-in-stage. Advance/Reject buttons move candidates through the pipeline.
- `public/candidate-experience-workflow.html` — the static process map: stage-by-stage flowchart,
  the four core email templates, and the automation/AI rollout proposal with KPIs and guardrails.
- `src/lib` — pipeline stage definitions (`stages.ts`), candidate/stage types (`types.ts`), and mock
  candidate data (`data.ts`).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The dashboard lives at `/dashboard`; the
workflow map is served statically at `/candidate-experience-workflow.html`.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS.
