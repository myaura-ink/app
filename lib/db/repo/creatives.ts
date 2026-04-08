import { and, asc, eq } from "drizzle-orm";
import { chapters, creatives, db, SelectChapter, SelectCreativeWithAuthor, users } from "..";

export const getChaptersByCreativSlug = async (creativeSlug: string): Promise<Partial<SelectChapter>[]> => {
  const result = await db
    .select({
      id: chapters.id,
      title: chapters.title,
      slug: chapters.slug,
      order: chapters.order,
      updatedAt: chapters.updatedAt,
    })
    .from(chapters)
    .innerJoin(creatives, eq(chapters.creativeId, creatives.id))
    .where(and(eq(creatives.slug, creativeSlug), eq(chapters.published, 1)))
    .orderBy(asc(chapters.order));
  return result;
};

export const getChapterByCreativeSlugAndChapterSlug = async (
  creativeSlug: string,
  chapterSlug: string,
): Promise<SelectChapter> => {
  const result = await db
    .select()
    .from(chapters)
    .innerJoin(creatives, eq(chapters.creativeId, creatives.id))
    .where(and(eq(creatives.slug, creativeSlug), eq(chapters.slug, chapterSlug)))
    .orderBy(asc(chapters.order))
    .limit(1);
  return result[0].chapters;
};

export const getCreativeBySlug = async (slug: string): Promise<SelectCreativeWithAuthor | null> => {
  const result = await db
    .select({
      id: creatives.id,
      title: creatives.title,
      slug: creatives.slug,
      description: creatives.description,
      coverImage: creatives.coverImage,
      updatedAt: creatives.updatedAt,
      genre: creatives.genre,
      totalChapters: creatives.totalChapters,
      totalCritiques: creatives.totalCritiques,
      totalCountOfReadingListAdds: creatives.totalCountOfReadingListAdds,
      author: {
        id: users.id,
        name: users.name,
        slug: users.slug,
      },
    })
    .from(creatives)
    .innerJoin(users, eq(creatives.authorId, users.id))
    .where(eq(creatives.slug, slug));
  return result[0] || null;
};

export const getLatestCreatives = async (limit: 10 | 20 | 50 = 10): Promise<SelectCreativeWithAuthor[]> => {
  const result = await db
    .select({
      id: creatives.id,
      title: creatives.title,
      slug: creatives.slug,
      description: creatives.description,
      coverImage: creatives.coverImage,
      updatedAt: creatives.updatedAt,
      genre: creatives.genre,
      author: {
        id: users.id,
        name: users.name,
        slug: users.slug,
      },
    })
    .from(creatives)
    .innerJoin(users, eq(creatives.authorId, users.id))
    .where(eq(creatives.published, 1))
    .orderBy(asc(creatives.updatedAt))
    .limit(limit);

  return result;
};

export const getCreativesByAuthorId = async (
  authorId: string,
  isOwn: boolean, // if user is looking up their own portfolio, show unpublished works as well
  limit: 10 | 20 | 50 | -1 = 10,
): Promise<SelectCreativeWithAuthor[]> => {
  const result = await db
    .select({
      id: creatives.id,
      title: creatives.title,
      slug: creatives.slug,
      description: creatives.description,
      coverImage: creatives.coverImage,
      updatedAt: creatives.updatedAt,
      genre: creatives.genre,
      author: {
        id: users.id,
        name: users.name,
        slug: users.slug,
      },
    })
    .from(creatives)
    .innerJoin(users, eq(creatives.authorId, users.id))
    .where(isOwn ? eq(creatives.authorId, authorId) : and(eq(creatives.authorId, authorId), eq(creatives.published, 1)))
    .orderBy(asc(creatives.updatedAt))
    .limit(limit);

  return result;
};
