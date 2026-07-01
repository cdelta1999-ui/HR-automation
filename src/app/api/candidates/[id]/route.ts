import { NextRequest, NextResponse } from "next/server";
import { advanceCandidate, rejectCandidate, scoreCandidateAi } from "@/lib/db";

export const dynamic = "force-dynamic";

const ACTIONS = {
  advance: advanceCandidate,
  reject: rejectCandidate,
  score: scoreCandidateAi,
} as const;

type Action = keyof typeof ACTIONS;

function isAction(value: unknown): value is Action {
  return typeof value === "string" && value in ACTIONS;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action;

  if (!isAction(action)) {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const board = ACTIONS[action](id);
  if (!board) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }

  return NextResponse.json(board);
}
