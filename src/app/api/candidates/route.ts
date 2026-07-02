import { NextRequest, NextResponse } from "next/server";
import { createCandidate } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const roleTitle = typeof body?.roleTitle === "string" ? body.roleTitle.trim() : "";

  if (!name || !roleTitle || name.length > 80 || roleTitle.length > 80) {
    return NextResponse.json({ error: "A name and role are required" }, { status: 400 });
  }

  return NextResponse.json(createCandidate(name, roleTitle));
}
