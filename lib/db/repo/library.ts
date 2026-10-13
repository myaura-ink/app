import { and, desc, eq, inArray } from "drizzle-orm";
import { db, library, SelectStoryWithAuthor, stories, users } from "..";

export const isInLibrary = async (userId: string, storySlug: string): Promise<boolean> => {
  const [story] = await db.select({ id: stories.id }).from(stories).where(eq(stories.slug, storySlug)).limit(1);

  if (!story) return false;

  const [entry] = await db
    .select({ id: library.id })
    .from(library)
    .where(and(eq(library.userId, userId), eq(library.storyId, story.id)))
    .limit(1);

  return !!entry;
};

export const addToLibrary = async (userId: string, storySlug: string): Promise<void> => {
  const [story] = await db.select({ id: stories.id }).from(stories).where(eq(stories.slug, storySlug)).limit(1);

  if (!story) throw new Error("Story not found");

  await db.insert(library).values({ userId, storyId: story.id }).onConflictDoNothing();
};

export const removeFromLibrary = async (userId: string, storySlug: string): Promise<void> => {
  const [story] = await db.select({ id: stories.id }).from(stories).where(eq(stories.slug, storySlug)).limit(1);

  if (!story) return;

  await db.delete(library).where(and(eq(library.userId, userId), eq(library.storyId, story.id)));
};

// Removes several stories (by story id) from a user's list; returns the ids that were actually removed.
export const removeManyFromLibrary = async (userId: string, storyIds: string[]): Promise<string[]> => {
  const removed = await db
    .delete(library)
    .where(and(eq(library.userId, userId), inArray(library.storyId, storyIds)))
    .returning({ storyId: library.storyId });

  return removed.map((row) => row.storyId);
};

export const getLibrary = async (userId: string): Promise<SelectStoryWithAuthor[]> => {
  const result = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      description: stories.description,
      coverImage: stories.coverImage,
      genre: stories.genre,
      updatedAt: stories.updatedAt,
      author: {
        id: users.id,
        name: users.name,
        slug: users.slug,
      },
    })
    .from(library)
    .innerJoin(stories, eq(library.storyId, stories.id))
    .innerJoin(users, eq(stories.authorId, users.id))
    // libraries are public, so leave out stories their authors have unpublished
    .where(and(eq(library.userId, userId), eq(stories.published, 1)))
    .orderBy(desc(library.createdAt));

  return result;
};
