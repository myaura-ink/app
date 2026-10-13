import { del } from "@vercel/blob";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, searchStories, setStoryTags, stories } from "@/lib";
import { verifyToken } from "@/lib/auth";
import { isAllowedCoverUrl, isBlobUrl } from "@/lib/utils/cover";
import { toUniqueSlug } from "@/lib/utils/slug";
import { normalizeTag, parseTags } from "@/lib/utils/tags";
import { isUuid } from "@/lib/utils/uuid";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 48;

// ?q=text&tag=a&tag=b&limit=12&offset=0 returns published works matching the text
// and all of the given tags, newest first, a page at a time
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tagSlugs = [
    ...new Set(
      params
        .getAll("tag")
        .map((t) => normalizeTag(t).slug)
        .filter(Boolean),
    ),
  ];
  const query = (params.get("q") ?? "").trim().slice(0, 100);
  const limit = Math.min(Math.max(Math.floor(Number(params.get("limit"))) || DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const offset = Math.max(Math.floor(Number(params.get("offset"))) || 0, 0);

  return NextResponse.json(await searchStories({ query, tagSlugs, limit, offset }));
}

export async function POST(request: NextRequest) {
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

  const { title, description, coverImage, genre, tags } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }
  if (coverImage?.trim() && !isAllowedCoverUrl(coverImage.trim())) {
    return NextResponse.json({ message: "Upload a cover image instead of linking one" }, { status: 400 });
  }

  const parsedTags = parseTags(tags);
  if ("error" in parsedTags) {
    return NextResponse.json({ message: parsedTags.error }, { status: 400 });
  }

  const slug = toUniqueSlug(title);

  const story = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(stories)
      .values({
        title: title.trim(),
        slug,
        description: description?.trim() || null,
        coverImage: coverImage?.trim() || null,
        genre: genre?.trim() || null,
        authorId: payload.id,
        published: 0,
      })
      .returning();
    await setStoryTags(created.id, parsedTags.tags, tx);
    return created;
  });

  return NextResponse.json({ ...story, tags: parsedTags.tags }, { status: 201 });
}

const MAX_BULK_DELETE = 100;

// deletes several of the requester's own stories at once; all or nothing.
// chapters, critiques, library entries and tag links cascade with them
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
    return NextResponse.json({ message: "Provide a list of work ids to delete" }, { status: 400 });
  }
  const uniqueIds = [...new Set<string>(ids)];
  if (uniqueIds.length > MAX_BULK_DELETE) {
    return NextResponse.json({ message: `You can delete at most ${MAX_BULK_DELETE} works at once` }, { status: 400 });
  }

  const deleted = await db.transaction(async (tx) => {
    const owned = await tx
      .select({ id: stories.id })
      .from(stories)
      .where(and(inArray(stories.id, uniqueIds), eq(stories.authorId, payload.id)));
    if (owned.length !== uniqueIds.length) return null;
    return tx
      .delete(stories)
      .where(inArray(stories.id, uniqueIds))
      .returning({ id: stories.id, coverImage: stories.coverImage });
  });

  if (!deleted) {
    return NextResponse.json({ message: "Some of these works don't exist or aren't yours" }, { status: 403 });
  }

  // best effort: an orphaned cover in blob storage isn't worth failing the request over
  const blobCovers = deleted.map((row) => row.coverImage).filter(isBlobUrl);
  if (blobCovers.length) await del(blobCovers).catch((err) => console.error("Failed to delete covers", err));

  return NextResponse.json({ deleted: deleted.map((row) => row.id) });
}
