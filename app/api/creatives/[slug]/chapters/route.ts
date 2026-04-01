import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, creatives, chapters } from "@/lib";
import { verifyToken } from "@/lib/auth";
import { toUniqueSlug } from "@/lib/utils/slug";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
  }

  const creativeResult = await db
    .select()
    .from(creatives)
    .where(eq(creatives.slug, slug));

  if (creativeResult.length === 0) {
    return NextResponse.json({ message: "Creative not found" }, { status: 404 });
  }

  const creative = creativeResult[0];
  if (creative.authorId !== payload.id) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { title, content, published } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ message: "Chapter title is required" }, { status: 400 });
  }

  // Determine next order
  const existing = await db
    .select({ order: chapters.order })
    .from(chapters)
    .where(eq(chapters.creativeId, creative.id))
    .orderBy(asc(chapters.order));

  const nextOrder = existing.length > 0 ? existing[existing.length - 1].order + 1 : 1;
  const chapterSlug = toUniqueSlug(title);

  const [chapter] = await db
    .insert(chapters)
    .values({
      creativeId: creative.id,
      title: title.trim(),
      slug: chapterSlug,
      content: content?.trim() || null,
      order: nextOrder,
      published: published ? 1 : 0,
    })
    .returning();

  // If publishing a chapter, also mark the creative as published
  if (published && creative.published === 0) {
    await db
      .update(creatives)
      .set({ published: 1 })
      .where(eq(creatives.id, creative.id));
  }

  return NextResponse.json(chapter, { status: 201 });
}
