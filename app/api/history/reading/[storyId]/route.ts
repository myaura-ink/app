import { NextRequest, NextResponse } from "next/server";
import { removeReadingHistoryEntry } from "@/lib";
import { authenticateRequest } from "@/lib/auth";
import { isUuid } from "@/lib/utils/uuid";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ storyId: string }> }) {
  const user = await authenticateRequest(request);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { storyId } = await params;
  if (!isUuid(storyId)) return NextResponse.json({ message: "Invalid story id" }, { status: 400 });

  await removeReadingHistoryEntry(user.id, storyId);
  return NextResponse.json({ removed: storyId });
}
