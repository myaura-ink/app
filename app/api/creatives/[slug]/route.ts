import { and, asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, creatives, chapters, users } from "@/lib";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const result = await db
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
      authorName: users.name,
      authorSlug: users.slug,
    })
    .from(creatives)
    .leftJoin(users, eq(creatives.authorId, users.id))
    .where(eq(creatives.slug, slug));

  if (result.length === 0) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const creative = result[0];

  // Determine if requester is author to include draft chapters
  let isAuthor = false;
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const payload = await verifyToken(authHeader.slice(7));
      isAuthor = payload.id === creative.authorId;
    } catch {
      // not authenticated — fine, show published chapters only
    }
  }

  const chapterRows = await db
    .select()
    .from(chapters)
    .where(
      isAuthor
        ? eq(chapters.creativeId, creative.id)
        : and(eq(chapters.creativeId, creative.id), eq(chapters.published, 1))
    )
    .orderBy(asc(chapters.order));

  return NextResponse.json({ ...creative, chapters: chapterRows, isAuthor });
}
