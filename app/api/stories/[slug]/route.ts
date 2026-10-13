import { del } from "@vercel/blob";
import { and, asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { chapters, db, getChapterPage, getTagsByStoryId, setStoryTags, stories, users } from "@/lib";
import { verifyToken } from "@/lib/auth";
import { isAllowedCoverUrl, isBlobUrl } from "@/lib/utils/cover";
import { parseTags } from "@/lib/utils/tags";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const result = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      description: stories.description,
      coverImage: stories.coverImage,
      genre: stories.genre,
      published: stories.published,
      authorId: stories.authorId,
      createdAt: stories.createdAt,
      updatedAt: stories.updatedAt,
      authorName: users.name,
      authorSlug: users.slug,
    })
    .from(stories)
    .leftJoin(users, eq(stories.authorId, users.id))
    .where(eq(stories.slug, slug));

  if (result.length === 0) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const story = result[0];

  // Determine if requester is author to include draft chapters
  let isAuthor = false;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = await verifyToken(authHeader.slice(7));
      isAuthor = payload.id === story.authorId;
    } catch {
      // not authenticated — fine, show published chapters only
    }
  }

  // first page only; the rest comes from /api/stories/[slug]/chapters?page=
  const [tagRows, chapterPage] = await Promise.all([
    getTagsByStoryId(story.id),
    getChapterPage(story.id, { includeDrafts: isAuthor }),
  ]);

  return NextResponse.json({ ...story, tags: tagRows, chapters: chapterPage, isAuthor });
}

// updates a story's details, tags, or published state; author only. the slug stays stable so links keep working
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

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

  const [existing] = await db
    .select({ id: stories.id, authorId: stories.authorId, coverImage: stories.coverImage })
    .from(stories)
    .where(eq(stories.slug, slug));
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (existing.authorId !== payload.id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { title, description, coverImage, genre, published, tags } = await request.json();

  // always touch updatedAt so tag-only edits still count as an update
  const updates: Partial<typeof stories.$inferInsert> = { updatedAt: new Date() };
  if (title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }
    updates.title = title.trim();
  }
  if (description !== undefined) updates.description = description?.trim() || null;
  if (coverImage !== undefined) {
    const cover = coverImage?.trim() || null;
    if (cover && cover !== existing.coverImage && !isAllowedCoverUrl(cover)) {
      return NextResponse.json({ message: "Upload a cover image instead of linking one" }, { status: 400 });
    }
    updates.coverImage = cover;
  }
  if (genre !== undefined) updates.genre = genre?.trim() || null;
  if (published !== undefined) updates.published = published ? 1 : 0;

  const parsedTags = tags === undefined ? null : parseTags(tags);
  if (parsedTags && "error" in parsedTags) {
    return NextResponse.json({ message: parsedTags.error }, { status: 400 });
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx.update(stories).set(updates).where(eq(stories.id, existing.id)).returning();
    if (parsedTags) await setStoryTags(existing.id, parsedTags.tags, tx);
    return row;
  });

  // the old cover is unreachable once replaced; best effort, like bulk delete
  if (isBlobUrl(existing.coverImage) && existing.coverImage !== updated.coverImage) {
    await del(existing.coverImage).catch((err) => console.error("Failed to delete old cover", err));
  }

  return NextResponse.json({ ...updated, tags: await getTagsByStoryId(existing.id) });
}
