import { NextResponse } from "next/server";
import { getConnectorState } from "@/lib/db";
import { CONNECTORS } from "@/lib/connectors";

export const dynamic = "force-dynamic";

export async function GET() {
  const state = getConnectorState();
  return NextResponse.json({
    connectors: CONNECTORS,
    state,
  });
}
