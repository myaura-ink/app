import { and, asc, desc, eq, ilike, inArray, or, SQL, sql } from "drizzle-orm";
import type { NormalizedTag } from "@/lib/utils/tags";
import { chapters, critiques, db, library, SelectChapter, SelectStoryWithAuthor, stories, users } from "..";
import { getTagsForStories, storyIdsWithAllTags } from "./tags";

export type StoryListItem = SelectStoryWithAuthor & { tags: NormalizedTag[] };

export const getChaptersByStorySlug = async (storySlug: string): Promise<Partial<SelectChapter>[]> => {
  const result = await db
    .select({
      id: chapters.id,
      title: chapters.title,
      slug: chapters.slug,
      order: chapters.order,
      updatedAt: chapters.updatedAt,
    })
    .from(chapters)
    .innerJoin(stories, eq(chapters.storyId, stories.id))
    .where(and(eq(stories.slug, storySlug), eq(chapters.published, 1)))
    .orderBy(asc(chapters.order));
  return result;
};

const CHAPTER_PAGE_SIZE = 20;
export type ChapterOrder = "oldest" | "newest";
type ChapterListItem = Pick<SelectChapter, "id" | "title" | "slug" | "order" | "published" | "updatedAt"> & {
  // position among the chapters the viewer can see, so numbering holds across pages and sort orders
  number: number;
};
export interface ChapterPage {
  chapters: ChapterListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  order: ChapterOrder;
}

// one page of a story's chapter list; drafts are included only for the author
export const getChapterPage = async (
  storyId: string,
  {
    page = 1,
    order = "newest",
    includeDrafts = false,
  }: { page?: number; order?: ChapterOrder; includeDrafts?: boolean },
): Promise<ChapterPage> => {
  const visible = includeDrafts
    ? eq(chapters.storyId, storyId)
    : and(eq(chapters.storyId, storyId), eq(chapters.published, 1));

  const [{ total }] = await db.select({ total: sql<number>`count(*)::int` }).from(chapters).where(visible);
  const pageCount = Math.max(1, Math.ceil(total / CHAPTER_PAGE_SIZE));
  // past the end (e.g. after deleting the last chapter on a page) falls back to the last page
  const current = Math.min(Math.max(1, Math.floor(page) || 1), pageCount);

  const rows = await db
    .select({
      id: chapters.id,
      title: chapters.title,
      slug: chapters.slug,
      order: chapters.order,
      published: chapters.published,
      updatedAt: chapters.updatedAt,
      // window functions run before ORDER BY and LIMIT, so this numbers the whole visible list
      number: sql<number>`(row_number() over (order by ${chapters.order}))::int`,
    })
    .from(chapters)
    .where(visible)
    .orderBy(order === "newest" ? desc(chapters.order) : asc(chapters.order))
    .limit(CHAPTER_PAGE_SIZE)
    .offset((current - 1) * CHAPTER_PAGE_SIZE);

  return { chapters: rows, total, page: current, pageSize: CHAPTER_PAGE_SIZE, pageCount, order };
};

export const getFirstPublishedChapterSlug = async (storyId: string): Promise<string | null> => {
  const [first] = await db
    .select({ slug: chapters.slug })
    .from(chapters)
    .where(and(eq(chapters.storyId, storyId), eq(chapters.published, 1)))
    .orderBy(asc(chapters.order))
    .limit(1);
  return first?.slug ?? null;
};

export const parseChapterOrder = (value: string | null | undefined): ChapterOrder =>
  value === "oldest" ? "oldest" : "newest";

export const getChapterByStorySlugAndChapterSlug = async (
  storySlug: string,
  chapterSlug: string,
): Promise<SelectChapter | null> => {
  const result = await db
    .select()
    .from(chapters)
    .innerJoin(stories, eq(chapters.storyId, stories.id))
    .where(and(eq(stories.slug, storySlug), eq(chapters.slug, chapterSlug)))
    .orderBy(asc(chapters.order))
    .limit(1);
  return result[0]?.chapters ?? null;
};

export const getStoryBySlug = async (slug: string): Promise<SelectStoryWithAuthor | null> => {
  const result = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      description: stories.description,
      coverImage: stories.coverImage,
      updatedAt: stories.updatedAt,
      genre: stories.genre,
      published: stories.published,
      totalChapters: stories.totalChapters,
      totalCritiques: stories.totalCritiques,
      totalCountOfLibraryAdds: stories.totalCountOfLibraryAdds,
      author: {
        id: users.id,
        name: users.name,
        slug: users.slug,
      },
    })
    .from(stories)
    .innerJoin(users, eq(stories.authorId, users.id))
    .where(eq(stories.slug, slug));
  return result[0] || null;
};

export const getLatestStories = async (limit: 10 | 20 | 50 = 10): Promise<StoryListItem[]> => {
  const { items } = await searchStories({ query: "", tagSlugs: [], limit, offset: 0 });
  return items;
};

export const getStoriesByAuthorId = async (
  authorId: string,
  isOwn: boolean, // if user is looking up their own profile, show unpublished works as well
  limit: 10 | 20 | 50 | -1 = 10,
): Promise<SelectStoryWithAuthor[]> => {
  const result = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      description: stories.description,
      coverImage: stories.coverImage,
      updatedAt: stories.updatedAt,
      genre: stories.genre,
      published: stories.published,
      author: {
        id: users.id,
        name: users.name,
        slug: users.slug,
      },
    })
    .from(stories)
    .innerJoin(users, eq(stories.authorId, users.id))
    .where(isOwn ? eq(stories.authorId, authorId) : and(eq(stories.authorId, authorId), eq(stories.published, 1)))
    .orderBy(asc(stories.updatedAt))
    .limit(limit);

  return result;
};

const escapeLike = (value: string) => value.replace(/[%_\\]/g, "\\$&");

// published works matching a free-text query and every given tag, newest first.
// fetches one extra row to tell whether another page exists
export const searchStories = async ({
  query,
  tagSlugs,
  limit,
  offset,
}: {
  query: string;
  tagSlugs: string[];
  limit: number;
  offset: number;
}): Promise<{ items: StoryListItem[]; nextOffset: number | null }> => {
  const filters: (SQL | undefined)[] = [eq(stories.published, 1)];
  if (tagSlugs.length) filters.push(inArray(stories.id, storyIdsWithAllTags(tagSlugs)));
  if (query) {
    const pattern = `%${escapeLike(query)}%`;
    filters.push(
      or(
        ilike(stories.title, pattern),
        ilike(stories.description, pattern),
        ilike(stories.genre, pattern),
        ilike(users.name, pattern),
      ),
    );
  }

  const rows = await db
    .select({
      id: stories.id,
      title: stories.title,
      slug: stories.slug,
      description: stories.description,
      coverImage: stories.coverImage,
      updatedAt: stories.updatedAt,
      genre: stories.genre,
      // counted live: the denormalized total_* columns aren't kept up to date
      totalChapters: sql<number>`(select count(*) from ${chapters} where ${chapters.storyId} = ${stories.id} and ${chapters.published} = 1)::int`,
      totalCritiques: sql<number>`(select count(*) from ${critiques} where ${critiques.storyId} = ${stories.id})::int`,
      totalCountOfLibraryAdds: sql<number>`(select count(*) from ${library} where ${library.storyId} = ${stories.id})::int`,
      author: {
        id: users.id,
        name: users.name,
        slug: users.slug,
      },
    })
    .from(stories)
    .innerJoin(users, eq(stories.authorId, users.id))
    .where(and(...filters))
    .orderBy(desc(stories.updatedAt), desc(stories.id))
    .limit(limit + 1)
    .offset(offset);

  const page = rows.slice(0, limit);
  const tagsById = await getTagsForStories(page.map((row) => row.id));
  return {
    items: page.map((row) => ({ ...row, tags: tagsById.get(row.id) ?? [] })),
    nextOffset: rows.length > limit ? offset + limit : null,
  };
};
