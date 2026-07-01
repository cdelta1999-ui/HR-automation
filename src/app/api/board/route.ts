import { NextResponse } from "next/server";
import { getBoardState } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getBoardState());
}
