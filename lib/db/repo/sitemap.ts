import { and, desc, eq, max } from "drizzle-orm";
import { chapters, db, stories, users } from "..";

// everything a search engine should find: published works, their published chapters, and their authors
export const getSitemapEntries = async () => {
  const [works, chapterRows, authors] = await Promise.all([
    db
      .select({ slug: stories.slug, updatedAt: stories.updatedAt })
      .from(stories)
      .where(eq(stories.published, 1))
      .orderBy(desc(stories.updatedAt)),
    db
      .select({ slug: chapters.slug, storySlug: stories.slug, updatedAt: chapters.updatedAt })
      .from(chapters)
      .innerJoin(stories, eq(chapters.storyId, stories.id))
      .where(and(eq(stories.published, 1), eq(chapters.published, 1))),
    db
      .select({ slug: users.slug, updatedAt: max(stories.updatedAt) })
      .from(users)
      .innerJoin(stories, and(eq(stories.authorId, users.id), eq(stories.published, 1)))
      .groupBy(users.slug),
  ]);
  return { works, chapters: chapterRows, authors };
};
