import { NextRequest, NextResponse } from "next/server";
import { clearReadingHistory, getReadingHistory, recordRead } from "@/lib";
import { authenticateRequest } from "@/lib/auth";

const unauthorized = () => NextResponse.json({ message: "Unauthorized" }, { status: 401 });

// the signed-in reader's stories, most recently read first
export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return unauthorized();
  return NextResponse.json({ items: await getReadingHistory(user.id) });
}

// { storySlug, chapterSlug } — called by the reader when a chapter is opened
export async function PUT(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return unauthorized();

  const { storySlug, chapterSlug } = await request.json().catch(() => ({}));
  if (typeof storySlug !== "string" || typeof chapterSlug !== "string") {
    return NextResponse.json({ message: "storySlug and chapterSlug are required" }, { status: 400 });
  }
  const recorded = await recordRead(user.id, storySlug, chapterSlug);
  return NextResponse.json({ recorded });
}

export async function DELETE(request: NextRequest) {
  const user = await authenticateRequest(request);
  if (!user) return unauthorized();
  await clearReadingHistory(user.id);
  return NextResponse.json({ cleared: true });
}
