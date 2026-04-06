import { and, desc, eq, sql } from "drizzle-orm";
import { creatives, critiques, db, SelectCritique, users } from "..";

export type CritiqueWithAuthor = Pick<SelectCritique, "id" | "body" | "rating" | "createdAt"> & {
  author: { id: string; name: string | null; slug: string };
};

export const getCritiquesByCreativeSlug = async (creativeSlug: string): Promise<CritiqueWithAuthor[]> => {
  const result = await db
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
    .innerJoin(creatives, eq(critiques.creativeId, creatives.id))
    .innerJoin(users, eq(critiques.userId, users.id))
    .where(eq(creatives.slug, creativeSlug))
    .orderBy(desc(critiques.createdAt));

  return result;
};

export const addCritique = async (
  creativeSlug: string,
  userId: string,
  body: string,
  rating: number,
): Promise<CritiqueWithAuthor> => {
  const [creative] = await db
    .select({ id: creatives.id })
    .from(creatives)
    .where(eq(creatives.slug, creativeSlug))
    .limit(1);

  if (!creative) throw new Error("Creative not found");

  const [inserted] = await db
    .insert(critiques)
    .values({ creativeId: creative.id, userId, body, rating })
    .returning();

  const [user] = await db
    .select({ id: users.id, name: users.name, slug: users.slug })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return { id: inserted.id, body: inserted.body, rating: inserted.rating, createdAt: inserted.createdAt, author: user };
};

export const hasUserCritiqued = async (creativeSlug: string, userId: string): Promise<boolean> => {
  const [creative] = await db
    .select({ id: creatives.id })
    .from(creatives)
    .where(eq(creatives.slug, creativeSlug))
    .limit(1);

  if (!creative) return false;

  const [existing] = await db
    .select({ id: critiques.id })
    .from(critiques)
    .where(and(eq(critiques.creativeId, creative.id), eq(critiques.userId, userId)))
    .limit(1);

  return !!existing;
};

export const isCreativeAuthor = async (creativeSlug: string, userId: string): Promise<boolean> => {
  const [creative] = await db
    .select({ authorId: creatives.authorId })
    .from(creatives)
    .where(and(eq(creatives.slug, creativeSlug), eq(creatives.authorId, userId)))
    .limit(1);
  return !!creative;
};

export const getCritiqueCountByCreativeSlug = async (creativeSlug: string): Promise<number> => {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(critiques)
    .innerJoin(creatives, eq(critiques.creativeId, creatives.id))
    .where(eq(creatives.slug, creativeSlug));
  return row?.count ?? 0;
};
