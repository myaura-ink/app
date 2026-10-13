import { NextRequest, NextResponse } from "next/server";
import { removeSearchHistoryEntry } from "@/lib";
import { authenticateRequest } from "@/lib/auth";
import { isUuid } from "@/lib/utils/uuid";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  await removeSearchHistoryEntry(user.id, id);
  return NextResponse.json({ removed: id });
}
