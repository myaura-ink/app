import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { chapters, db, SelectChapter, stories } from "..";

export type ManagedChapter = Pick<SelectChapter, "id" | "title" | "slug" | "order" | "published" | "updatedAt">;

// every chapter of a story, drafts included, in reading order; for the author's management view
export const getAllChaptersForAuthor = async (storyId: string): Promise<ManagedChapter[]> =>
  db
    .select({
      id: chapters.id,
      title: chapters.title,
      slug: chapters.slug,
      order: chapters.order,
      published: chapters.published,
      updatedAt: chapters.updatedAt,
    })
    .from(chapters)
    .where(eq(chapters.storyId, storyId))
    .orderBy(asc(chapters.order));

const sameIds = (a: string[], b: string[]) => a.length === b.length && new Set([...a, ...b]).size === a.length;

// rewrites `order` to 1..n following `orderedIds`. The list must name every chapter of the
// story exactly once, so a stale list (e.g. a chapter added in another tab) is rejected
// instead of leaving gaps or duplicates. Returns false when the list doesn't match.
export const reorderChapters = async (storyId: string, orderedIds: string[]): Promise<boolean> =>
  db.transaction(async (tx) => {
    const existing = await tx.select({ id: chapters.id }).from(chapters).where(eq(chapters.storyId, storyId));
    if (
      !sameIds(
        existing.map((row) => row.id),
        orderedIds,
      )
    ) {
      return false;
    }
    if (orderedIds.length === 0) return true;

    // one statement: pair each id with its position. Raw SQL on purpose, so reordering
    // doesn't bump updatedAt ("last edited") on every chapter
    const idList = sql.join(
      orderedIds.map((id) => sql`${id}`),
      sql`, `,
    );
    await tx.execute(sql`
      update ${chapters} set "order" = v.position
      from unnest(array[${idList}]::uuid[]) with ordinality as v(id, position)
      where ${chapters.id} = v.id and ${chapters.storyId} = ${storyId}
    `);
    return true;
  });

// ids that belong to this story, so bulk actions can't reach another story's chapters
const ownedChapterIds = async (storyId: string, ids: string[]) => {
  const rows = await db
    .select({ id: chapters.id })
    .from(chapters)
    .where(and(eq(chapters.storyId, storyId), inArray(chapters.id, ids)));
  return rows.map((row) => row.id);
};

// publishes or unpublishes several chapters; publishing any chapter also publishes the
// story, matching the single-chapter endpoints. Returns null if some ids aren't this story's.
export const setChaptersPublished = async (
  storyId: string,
  ids: string[],
  published: boolean,
): Promise<string[] | null> => {
  const owned = await ownedChapterIds(storyId, ids);
  if (owned.length !== ids.length) return null;

  return db.transaction(async (tx) => {
    const updated = await tx
      .update(chapters)
      .set({ published: published ? 1 : 0 })
      .where(and(eq(chapters.storyId, storyId), inArray(chapters.id, ids)))
      .returning({ id: chapters.id });
    if (published) {
      await tx
        .update(stories)
        .set({ published: 1 })
        .where(and(eq(stories.id, storyId), eq(stories.published, 0)));
    }
    return updated.map((row) => row.id);
  });
};

// deletes several chapters at once; all or nothing. Returns null if some ids aren't this story's.
export const deleteChapters = async (storyId: string, ids: string[]): Promise<string[] | null> => {
  const owned = await ownedChapterIds(storyId, ids);
  if (owned.length !== ids.length) return null;

  const deleted = await db
    .delete(chapters)
    .where(and(eq(chapters.storyId, storyId), inArray(chapters.id, ids)))
    .returning({ id: chapters.id });
  return deleted.map((row) => row.id);
};
