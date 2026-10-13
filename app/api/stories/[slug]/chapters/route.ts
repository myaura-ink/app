import { asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  chapters,
  db,
  deleteChapters,
  getChapterPage,
  parseChapterOrder,
  reorderChapters,
  setChaptersPublished,
  stories,
} from "@/lib";
import { verifyToken } from "@/lib/auth";
import { toUniqueSlug } from "@/lib/utils/slug";
import { isUuid } from "@/lib/utils/uuid";

// GET ?page=2&order=oldest — one page of the chapter list, newest first by default. The author also sees drafts.
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const [story] = await db
    .select({ id: stories.id, authorId: stories.authorId })
    .from(stories)
    .where(eq(stories.slug, slug));
  if (!story) {
    return NextResponse.json({ message: "Story not found" }, { status: 404 });
  }

  let isAuthor = false;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      isAuthor = (await verifyToken(authHeader.slice(7))).id === story.authorId;
    } catch {
      // not authenticated — fine, show published chapters only
    }
  }

  const { searchParams } = request.nextUrl;
  const page = await getChapterPage(story.id, {
    page: Number(searchParams.get("page")) || 1,
    order: parseChapterOrder(searchParams.get("order")),
    includeDrafts: isAuthor,
  });
  return NextResponse.json(page);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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

  const storyResult = await db.select().from(stories).where(eq(stories.slug, slug));

  if (storyResult.length === 0) {
    return NextResponse.json({ message: "Story not found" }, { status: 404 });
  }

  const story = storyResult[0];
  if (story.authorId !== payload.id) {
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
    .where(eq(chapters.storyId, story.id))
    .orderBy(asc(chapters.order));

  const nextOrder = existing.length > 0 ? existing[existing.length - 1].order + 1 : 1;
  const chapterSlug = toUniqueSlug(title);

  const [chapter] = await db
    .insert(chapters)
    .values({
      storyId: story.id,
      title: title.trim(),
      slug: chapterSlug,
      content: content?.trim() || null,
      order: nextOrder,
      published: published ? 1 : 0,
    })
    .returning();

  // If publishing a chapter, also mark the story as published
  if (published && story.published === 0) {
    await db.update(stories).set({ published: 1 }).where(eq(stories.id, story.id));
  }

  return NextResponse.json(chapter, { status: 201 });
}

// ─── Author-only bulk management ────────────────────────────────────────────

const MAX_BULK_CHAPTERS = 1000;

// the story's id when the request comes from its author, otherwise the error response to send
async function authorizeAuthor(request: NextRequest, slug: string): Promise<{ storyId: string } | NextResponse> {
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

  const [story] = await db
    .select({ id: stories.id, authorId: stories.authorId })
    .from(stories)
    .where(eq(stories.slug, slug));
  if (!story) return NextResponse.json({ message: "Story not found" }, { status: 404 });
  if (story.authorId !== payload.id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  return { storyId: story.id };
}

// a non-empty, duplicate-free list of chapter ids, or null
const parseIds = (value: unknown): string[] | null => {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_BULK_CHAPTERS || !value.every(isUuid)) {
    return null;
  }
  const unique = [...new Set<string>(value)];
  return unique.length === value.length ? unique : null;
};

// PUT { order: [chapterId, ...] } — sets reading order. Must list every chapter exactly once.
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const auth = await authorizeAuthor(request, slug);
  if (auth instanceof NextResponse) return auth;

  const { order } = await request.json().catch(() => ({}));
  const ids = parseIds(order);
  if (!ids) return NextResponse.json({ message: "Provide the chapter ids in their new order" }, { status: 400 });

  if (!(await reorderChapters(auth.storyId, ids))) {
    return NextResponse.json(
      { message: "The chapter list changed since you loaded it. Refresh and try again." },
      { status: 409 },
    );
  }
  return NextResponse.json({ order: ids });
}

// PATCH { ids: [...], published: boolean } — publishes or unpublishes several chapters
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const auth = await authorizeAuthor(request, slug);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json().catch(() => ({}));
  const ids = parseIds(body.ids);
  if (!ids || typeof body.published !== "boolean") {
    return NextResponse.json({ message: "Provide chapter ids and a published flag" }, { status: 400 });
  }

  const updated = await setChaptersPublished(auth.storyId, ids, body.published);
  if (!updated) return NextResponse.json({ message: "Some of these chapters aren't in this story" }, { status: 403 });
  return NextResponse.json({ updated, published: body.published });
}

// DELETE { ids: [...] } — deletes several chapters at once; all or nothing
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const auth = await authorizeAuthor(request, slug);
  if (auth instanceof NextResponse) return auth;

  const { ids: raw } = await request.json().catch(() => ({}));
  const ids = parseIds(raw);
  if (!ids) return NextResponse.json({ message: "Provide the chapter ids to delete" }, { status: 400 });

  const deleted = await deleteChapters(auth.storyId, ids);
  if (!deleted) return NextResponse.json({ message: "Some of these chapters aren't in this story" }, { status: 403 });
  return NextResponse.json({ deleted });
}
