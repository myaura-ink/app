import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, getTagsByStoryId, setStoryTags, stories } from "@/lib";
import { verifyToken } from "@/lib/auth";
import { parseTags } from "@/lib/utils/tags";

// replaces the full set of tags on a story; author only
export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
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

  const [story] = await db
    .select({ id: stories.id, authorId: stories.authorId })
    .from(stories)
    .where(eq(stories.slug, slug));
  if (!story) return NextResponse.json({ message: "Not found" }, { status: 404 });
  if (story.authorId !== payload.id) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const parsedTags = parseTags((await request.json())?.tags);
  if ("error" in parsedTags) {
    return NextResponse.json({ message: parsedTags.error }, { status: 400 });
  }

  await db.transaction((tx) => setStoryTags(story.id, parsedTags.tags, tx));
  return NextResponse.json({ tags: await getTagsByStoryId(story.id) });
}
