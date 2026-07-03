import { NextRequest, NextResponse } from "next/server";
import { setConnectorEnabled } from "@/lib/db";
import { CONNECTORS, type ConnectorId } from "@/lib/connectors";

export const dynamic = "force-dynamic";

const VALID_IDS = new Set(CONNECTORS.map((c) => c.id));

function isConnectorId(value: unknown): value is ConnectorId {
  return typeof value === "string" && VALID_IDS.has(value as ConnectorId);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!isConnectorId(id)) {
    return NextResponse.json({ error: "Unknown connector" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const enabled = body?.enabled;
  if (typeof enabled !== "boolean") {
    return NextResponse.json({ error: "enabled must be a boolean" }, { status: 400 });
  }

  const state = setConnectorEnabled(id, enabled);
  return NextResponse.json({ state });
}
