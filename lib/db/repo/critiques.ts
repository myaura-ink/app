import { and, desc, eq, sql } from "drizzle-orm";
import { critiques, db, SelectCritique, stories, users } from "..";

export type CritiqueWithAuthor = Pick<SelectCritique, "id" | "body" | "rating" | "createdAt"> & {
  author: { id: string; name: string | null; slug: string };
};

// critiques for a work, newest first, a page at a time.
// fetches one extra row to tell whether another page exists
export const getCritiquesByStorySlug = async (
  storySlug: string,
  { limit, offset }: { limit: number; offset: number },
): Promise<{ items: CritiqueWithAuthor[]; nextOffset: number | null }> => {
  const rows = await db
    .select({
      id: critiques.id,
      body: critiques.body,
      rating: critiques.rating,
      createdAt: critiques.createdAt,
      author: {
        id: users.id,
        name: users.name,
        slug: users.slug,
      },
    })
    .from(critiques)
    .innerJoin(stories, eq(critiques.storyId, stories.id))
    .innerJoin(users, eq(critiques.userId, users.id))
    .where(eq(stories.slug, storySlug))
    .orderBy(desc(critiques.createdAt), desc(critiques.id))
    .limit(limit + 1)
    .offset(offset);

  const hasMore = rows.length > limit;
  return { items: rows.slice(0, limit), nextOffset: hasMore ? offset + limit : null };
};

export const addCritique = async (
  storySlug: string,
  userId: string,
  body: string,
  rating: number,
): Promise<CritiqueWithAuthor> => {
  const [story] = await db.select({ id: stories.id }).from(stories).where(eq(stories.slug, storySlug)).limit(1);

  if (!story) throw new Error("Story not found");

  const [inserted] = await db.insert(critiques).values({ storyId: story.id, userId, body, rating }).returning();

  const [user] = await db
    .select({ id: users.id, name: users.name, slug: users.slug })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return { id: inserted.id, body: inserted.body, rating: inserted.rating, createdAt: inserted.createdAt, author: user };
};

export const hasUserCritiqued = async (storySlug: string, userId: string): Promise<boolean> => {
  const [story] = await db.select({ id: stories.id }).from(stories).where(eq(stories.slug, storySlug)).limit(1);

  if (!story) return false;

  const [existing] = await db
    .select({ id: critiques.id })
    .from(critiques)
    .where(and(eq(critiques.storyId, story.id), eq(critiques.userId, userId)))
    .limit(1);

  return !!existing;
};

export const isStoryAuthor = async (storySlug: string, userId: string): Promise<boolean> => {
  const [story] = await db
    .select({ authorId: stories.authorId })
    .from(stories)
    .where(and(eq(stories.slug, storySlug), eq(stories.authorId, userId)))
    .limit(1);
  return !!story;
};

export const getCritiqueCountByStorySlug = async (storySlug: string): Promise<number> => {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(critiques)
    .innerJoin(stories, eq(critiques.storyId, stories.id))
    .where(eq(stories.slug, storySlug));
  return row?.count ?? 0;
};
