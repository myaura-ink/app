import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, creatives, users } from "@/lib";
import { verifyToken } from "@/lib/auth";
import { toUniqueSlug } from "@/lib/utils/slug";

export async function GET() {
  const results = await db
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
    .where(eq(creatives.published, 1));

  return NextResponse.json(results);
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

  const { title, description, coverImage, genre } = await request.json();

  if (!title?.trim()) {
    return NextResponse.json({ message: "Title is required" }, { status: 400 });
  }

  const slug = toUniqueSlug(title);

  const [creative] = await db
    .insert(creatives)
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

  return NextResponse.json(creative, { status: 201 });
}
