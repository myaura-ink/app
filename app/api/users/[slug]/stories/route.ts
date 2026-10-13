import { and, asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { chapters, db, stories, users } from "@/lib";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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
    })
    .from(stories)
    .where(isOwner ? eq(stories.authorId, user.id) : and(eq(stories.authorId, user.id), eq(stories.published, 1)))
    .orderBy(asc(stories.createdAt));

  // Attach chapter counts
  const results = await Promise.all(
    rows.map(async (story) => {
      const chapterRows = await db
        .select({ id: chapters.id, published: chapters.published })
        .from(chapters)
        .where(eq(chapters.storyId, story.id));
      return {
        ...story,
        chapterCount: chapterRows.length,
        publishedChapterCount: chapterRows.filter((c) => c.published === 1).length,
      };
    }),
  );

  return NextResponse.json({
    user: { id: user.id, name: user.name, slug: user.slug, image: user.image, createdAt: user.createdAt },
    stories: results,
  });
}
