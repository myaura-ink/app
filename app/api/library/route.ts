import { NextRequest, NextResponse } from "next/server";
import { removeManyFromLibrary } from "@/lib";
import { verifyToken } from "@/lib/auth";
import { isUuid } from "@/lib/utils/uuid";

const MAX_BULK_REMOVE = 100;

export async function DELETE(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  let payload;
  try {
    payload = await verifyToken(authHeader.slice(7));
  } catch {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }

  const { ids } = await request.json().catch(() => ({}));
  if (!Array.isArray(ids) || ids.length === 0 || !ids.every(isUuid)) {
    return NextResponse.json({ message: "Provide a list of story ids to remove" }, { status: 400 });
  }
  const uniqueIds = [...new Set<string>(ids)];
  if (uniqueIds.length > MAX_BULK_REMOVE) {
    return NextResponse.json({ message: `You can remove at most ${MAX_BULK_REMOVE} stories at once` }, { status: 400 });
  }

  const removed = await removeManyFromLibrary(payload.id, uniqueIds);
  return NextResponse.json({ removed });
}
