import { and, eq } from "drizzle-orm";
import { creatives, db, readingList, SelectCreativeWithAuthor, users } from "..";

export const isInReadingList = async (userId: string, creativeSlug: string): Promise<boolean> => {
  const [creative] = await db
    .select({ id: creatives.id })
    .from(creatives)
    .where(eq(creatives.slug, creativeSlug))
    .limit(1);

  if (!creative) return false;

  const [entry] = await db
    .select({ id: readingList.id })
    .from(readingList)
    .where(and(eq(readingList.userId, userId), eq(readingList.creativeId, creative.id)))
    .limit(1);

  return !!entry;
};

export const addToReadingList = async (userId: string, creativeSlug: string): Promise<void> => {
  const [creative] = await db
    .select({ id: creatives.id })
    .from(creatives)
    .where(eq(creatives.slug, creativeSlug))
    .limit(1);

  if (!creative) throw new Error("Creative not found");

  await db
    .insert(readingList)
    .values({ userId, creativeId: creative.id })
    .onConflictDoNothing();
};

export const removeFromReadingList = async (userId: string, creativeSlug: string): Promise<void> => {
  const [creative] = await db
    .select({ id: creatives.id })
    .from(creatives)
    .where(eq(creatives.slug, creativeSlug))
    .limit(1);

  if (!creative) return;

  await db
    .delete(readingList)
    .where(and(eq(readingList.userId, userId), eq(readingList.creativeId, creative.id)));
};

export const getReadingList = async (userId: string): Promise<SelectCreativeWithAuthor[]> => {
  const result = await db
    .select({
      id: creatives.id,
      title: creatives.title,
      slug: creatives.slug,
      description: creatives.description,
      coverImage: creatives.coverImage,
      genre: creatives.genre,
      updatedAt: creatives.updatedAt,
      author: {
        id: users.id,
        name: users.name,
        slug: users.slug,
      },
    })
    .from(readingList)
    .innerJoin(creatives, eq(readingList.creativeId, creatives.id))
    .innerJoin(users, eq(creatives.authorId, users.id))
    .where(eq(readingList.userId, userId));

  return result;
};
