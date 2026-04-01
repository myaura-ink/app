import { and, asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, creatives, users, chapters } from "@/lib";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const userResult = await db.select().from(users).where(eq(users.slug, slug));
  if (userResult.length === 0) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const user = userResult[0];

  // Check if requester is the owner
  let isOwner = false;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = await verifyToken(authHeader.slice(7));
      isOwner = payload.id === user.id;
    } catch {
      // not authenticated
    }
  }

  const rows = await db
    .select({
      id: creatives.id,
      title: creatives.title,
      slug: creatives.slug,
      description: creatives.description,
      coverImage: creatives.coverImage,
      genre: creatives.genre,
      published: creatives.published,
      authorId: creatives.authorId,
      createdAt: creatives.createdAt,
      updatedAt: creatives.updatedAt,
    })
    .from(creatives)
    .where(
      isOwner
        ? eq(creatives.authorId, user.id)
        : and(eq(creatives.authorId, user.id), eq(creatives.published, 1))
    )
    .orderBy(asc(creatives.createdAt));

  // Attach chapter counts
  const results = await Promise.all(
    rows.map(async (creative) => {
      const chapterRows = await db
        .select({ id: chapters.id, published: chapters.published })
        .from(chapters)
        .where(eq(chapters.creativeId, creative.id));
      return {
        ...creative,
        chapterCount: chapterRows.length,
        publishedChapterCount: chapterRows.filter((c) => c.published === 1).length,
      };
    })
  );

  return NextResponse.json({ user: { id: user.id, name: user.name, slug: user.slug, image: user.image, createdAt: user.createdAt }, creatives: results });
}
