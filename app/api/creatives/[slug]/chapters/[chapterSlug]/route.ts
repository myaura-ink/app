import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { chapters, creatives, db } from "@/lib";
import { verifyToken } from "@/lib/auth";

async function resolveChapter(creativeSlug: string, chapterSlug: string) {
  const [row] = await db
    .select({
      chapter: chapters,
      authorId: creatives.authorId,
    })
    .from(chapters)
    .innerJoin(creatives, eq(chapters.creativeId, creatives.id))
    .where(and(eq(creatives.slug, creativeSlug), eq(chapters.slug, chapterSlug)))
    .limit(1);
  return row ?? null;
}

async function authenticate(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return await verifyToken(authHeader.slice(7));
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; chapterSlug: string }> },
) {
  const { slug, chapterSlug } = await params;

  const payload = await authenticate(request);
  if (!payload) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const row = await resolveChapter(slug, chapterSlug);
  if (!row) return NextResponse.json({ message: "Chapter not found" }, { status: 404 });
  if (row.authorId !== payload.id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  return NextResponse.json(row.chapter);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; chapterSlug: string }> },
) {
  const { slug, chapterSlug } = await params;

  const payload = await authenticate(request);
  if (!payload) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const row = await resolveChapter(slug, chapterSlug);
  if (!row) return NextResponse.json({ message: "Chapter not found" }, { status: 404 });
  if (row.authorId !== payload.id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { title, content, published } = await request.json();

  const updates: Partial<typeof chapters.$inferInsert> = {};
  if (title !== undefined) updates.title = title.trim();
  if (content !== undefined) updates.content = content;
  if (published !== undefined) updates.published = published ? 1 : 0;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ message: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(chapters)
    .set(updates)
    .where(eq(chapters.id, row.chapter.id))
    .returning();

  // If publishing, also mark creative as published
  if (published && row.chapter.published === 0) {
    await db
      .update(creatives)
      .set({ published: 1 })
      .where(eq(creatives.slug, slug));
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; chapterSlug: string }> },
) {
  const { slug, chapterSlug } = await params;

  const payload = await authenticate(request);
  if (!payload) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const row = await resolveChapter(slug, chapterSlug);
  if (!row) return NextResponse.json({ message: "Chapter not found" }, { status: 404 });
  if (row.authorId !== payload.id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  await db.delete(chapters).where(eq(chapters.id, row.chapter.id));

  return new NextResponse(null, { status: 204 });
}
