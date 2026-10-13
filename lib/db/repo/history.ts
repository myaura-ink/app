import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { chapterReads, chapters, db, readingHistory, searchHistory, stories, users } from "..";

const SEARCH_HISTORY_LIMIT = 50;
const READING_HISTORY_LIMIT = 100;

export interface ReadingHistoryItem {
  story: {
    id: string;
    slug: string;
    title: string;
    coverImage: string | null;
    author: { name: string | null; slug: string };
  };
  // null when the chapter was deleted or unpublished since; continue from the start then
  chapter: { slug: string; title: string; number: number } | null;
  totalChapters: number;
  readAt: Date;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  searchedAt: Date;
}

// position among published chapters, matching the numbers on the story page. Built per query,
// not at module load, since "@/lib" re-exports the tables in a circle and they may not exist yet
const chapterNumber = () => sql<number>`(
  select count(*) from ${chapters} c
  where c.story_id = ${chapters.storyId} and c.published = 1 and c."order" <= ${chapters.order}
)::int`;

// ─── Reading ────────────────────────────────────────────────────────────────

// moves the reader's place in a story to this chapter. Authors reading their own work aren't tracked
export const recordRead = async (userId: string, storySlug: string, chapterSlug: string): Promise<boolean> => {
  const [row] = await db
    .select({ storyId: stories.id, authorId: stories.authorId, chapterId: chapters.id })
    .from(chapters)
    .innerJoin(stories, eq(chapters.storyId, stories.id))
    .where(and(eq(stories.slug, storySlug), eq(chapters.slug, chapterSlug), eq(chapters.published, 1)))
    .limit(1);
  if (!row || row.authorId === userId) return false;

  const readAt = new Date();
  await db.transaction(async (tx) => {
    await tx
      .insert(readingHistory)
      .values({ userId, storyId: row.storyId, chapterId: row.chapterId, readAt })
      .onConflictDoUpdate({
        target: [readingHistory.userId, readingHistory.storyId],
        set: { chapterId: row.chapterId, readAt },
      });
    await tx
      .insert(chapterReads)
      .values({ userId, chapterId: row.chapterId, storyId: row.storyId, readAt })
      .onConflictDoUpdate({ target: [chapterReads.userId, chapterReads.chapterId], set: { readAt } });
  });
  return true;
};

export const getReadingHistory = async (
  userId: string,
  limit = READING_HISTORY_LIMIT,
): Promise<ReadingHistoryItem[]> => {
  const rows = await db
    .select({
      storyId: stories.id,
      storySlug: stories.slug,
      storyTitle: stories.title,
      coverImage: stories.coverImage,
      authorName: users.name,
      authorSlug: users.slug,
      chapterSlug: chapters.slug,
      chapterTitle: chapters.title,
      chapterPublished: chapters.published,
      chapterNumber: chapterNumber(),
      totalChapters: stories.totalChapters,
      readAt: readingHistory.readAt,
    })
    .from(readingHistory)
    .innerJoin(stories, eq(readingHistory.storyId, stories.id))
    .innerJoin(users, eq(stories.authorId, users.id))
    .leftJoin(chapters, eq(readingHistory.chapterId, chapters.id))
    // stories their authors have since unpublished drop out, as in the library
    .where(and(eq(readingHistory.userId, userId), eq(stories.published, 1)))
    .orderBy(desc(readingHistory.readAt))
    .limit(limit);

  return rows.map((r) => ({
    story: {
      id: r.storyId,
      slug: r.storySlug,
      title: r.storyTitle,
      coverImage: r.coverImage,
      author: { name: r.authorName, slug: r.authorSlug },
    },
    chapter:
      r.chapterSlug && r.chapterTitle && r.chapterPublished === 1
        ? { slug: r.chapterSlug, title: r.chapterTitle, number: r.chapterNumber }
        : null,
    totalChapters: r.totalChapters,
    readAt: r.readAt,
  }));
};

// the chapter to offer as "continue reading" on a story page
export const getLastReadChapter = async (
  userId: string,
  storyId: string,
): Promise<{ slug: string; title: string; number: number } | null> => {
  const [row] = await db
    .select({ slug: chapters.slug, title: chapters.title, number: chapterNumber() })
    .from(readingHistory)
    .innerJoin(chapters, eq(readingHistory.chapterId, chapters.id))
    .where(and(eq(readingHistory.userId, userId), eq(readingHistory.storyId, storyId), eq(chapters.published, 1)))
    .limit(1);
  return row ?? null;
};

// which of these chapters the reader has opened
export const getReadChapterIds = async (userId: string, chapterIds: string[]): Promise<string[]> => {
  if (chapterIds.length === 0) return [];
  const rows = await db
    .select({ chapterId: chapterReads.chapterId })
    .from(chapterReads)
    .where(and(eq(chapterReads.userId, userId), inArray(chapterReads.chapterId, chapterIds)));
  return rows.map((r) => r.chapterId);
};

// forgetting a story also forgets which of its chapters were read
export const removeReadingHistoryEntry = async (userId: string, storyId: string): Promise<void> => {
  await db.transaction(async (tx) => {
    await tx.delete(readingHistory).where(and(eq(readingHistory.userId, userId), eq(readingHistory.storyId, storyId)));
    await tx.delete(chapterReads).where(and(eq(chapterReads.userId, userId), eq(chapterReads.storyId, storyId)));
  });
};

export const clearReadingHistory = async (userId: string): Promise<void> => {
  await db.transaction(async (tx) => {
    await tx.delete(readingHistory).where(eq(readingHistory.userId, userId));
    await tx.delete(chapterReads).where(eq(chapterReads.userId, userId));
  });
};

// ─── Searches ───────────────────────────────────────────────────────────────

export const normalizeSearchQuery = (query: string) => query.trim().replace(/\s+/g, " ").slice(0, 100);

// saves a search, or moves a repeat to the top; only the latest few are kept per reader
export const recordSearch = async (userId: string, rawQuery: string): Promise<void> => {
  const query = normalizeSearchQuery(rawQuery);
  if (!query) return;

  const searchedAt = new Date();
  await db
    .insert(searchHistory)
    .values({ userId, query, queryKey: query.toLowerCase(), searchedAt })
    .onConflictDoUpdate({
      target: [searchHistory.userId, searchHistory.queryKey],
      set: { query, searchedAt },
    });

  const keep = db
    .select({ id: searchHistory.id })
    .from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.searchedAt))
    .limit(SEARCH_HISTORY_LIMIT);
  await db.delete(searchHistory).where(and(eq(searchHistory.userId, userId), notInArray(searchHistory.id, keep)));
};

export const getSearchHistory = async (userId: string): Promise<SearchHistoryItem[]> =>
  db
    .select({ id: searchHistory.id, query: searchHistory.query, searchedAt: searchHistory.searchedAt })
    .from(searchHistory)
    .where(eq(searchHistory.userId, userId))
    .orderBy(desc(searchHistory.searchedAt))
    .limit(SEARCH_HISTORY_LIMIT);

export const removeSearchHistoryEntry = async (userId: string, id: string): Promise<void> => {
  await db.delete(searchHistory).where(and(eq(searchHistory.userId, userId), eq(searchHistory.id, id)));
};

export const clearSearchHistory = async (userId: string): Promise<void> => {
  await db.delete(searchHistory).where(eq(searchHistory.userId, userId));
};
