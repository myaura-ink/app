import { NextRequest, NextResponse } from "next/server";
import { getSupportSummary, setSupport } from "@/lib";
import { authenticateRequest } from "@/lib/auth";
import { PLEDGE_OPTIONS } from "@/lib/utils/support";

export async function GET(request: NextRequest) {
  const payload = await authenticateRequest(request);
  return NextResponse.json(await getSupportSummary(payload?.id));
}

export async function PUT(request: NextRequest) {
  const payload = await authenticateRequest(request);
  if (!payload) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const changes: { liked?: boolean; pledge?: number | null } = {};

  if ("liked" in body) {
    if (typeof body.liked !== "boolean") {
      return NextResponse.json({ message: "liked must be true or false" }, { status: 400 });
    }
    changes.liked = body.liked;
  }
  if ("pledge" in body) {
    if (body.pledge !== null && !(PLEDGE_OPTIONS as readonly unknown[]).includes(body.pledge)) {
      return NextResponse.json({ message: "Pick one of the listed amounts" }, { status: 400 });
    }
    changes.pledge = body.pledge;
  }
  if (Object.keys(changes).length === 0) {
    return NextResponse.json({ message: "Nothing to update" }, { status: 400 });
  }

  await setSupport(payload.id, changes);
  return NextResponse.json(await getSupportSummary(payload.id));
}
