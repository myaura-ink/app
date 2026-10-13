import { and, asc, count, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import type { NormalizedTag } from "@/lib/utils/tags";
import { db, stories, storyTags, tags } from "..";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// replaces all tags on a story, creating any tags that don't exist yet
export const setStoryTags = async (storyId: string, input: NormalizedTag[], tx: Tx | typeof db = db) => {
  await tx.delete(storyTags).where(eq(storyTags.storyId, storyId));
  if (input.length === 0) return;

  await tx.insert(tags).values(input).onConflictDoNothing({ target: tags.slug });
  const rows = await tx
    .select({ id: tags.id })
    .from(tags)
    .where(
      inArray(
        tags.slug,
        input.map((t) => t.slug),
      ),
    );
  await tx.insert(storyTags).values(rows.map((row) => ({ storyId, tagId: row.id })));
};

export const getTagsByStoryId = async (storyId: string): Promise<NormalizedTag[]> => {
  return db
    .select({ name: tags.name, slug: tags.slug })
    .from(storyTags)
    .innerJoin(tags, eq(storyTags.tagId, tags.id))
    .where(eq(storyTags.storyId, storyId))
    .orderBy(asc(tags.name));
};

// tag suggestions ranked by how many published stories use them
export const searchTags = async (query: string, limit = 10) => {
  const uses = count(stories.id);
  return db
    .select({ name: tags.name, slug: tags.slug, uses })
    .from(tags)
    .leftJoin(storyTags, eq(storyTags.tagId, tags.id))
    .leftJoin(stories, and(eq(stories.id, storyTags.storyId), eq(stories.published, 1)))
    .where(query ? ilike(tags.name, `%${query.replace(/[%_\\]/g, "\\$&")}%`) : undefined)
    .groupBy(tags.id)
    .orderBy(desc(uses), asc(tags.name))
    .limit(limit);
};

// subquery of story ids that have every one of the given tag slugs, for use with inArray()
export const storyIdsWithAllTags = (slugs: string[]) =>
  db
    .select({ storyId: storyTags.storyId })
    .from(storyTags)
    .innerJoin(tags, eq(storyTags.tagId, tags.id))
    .where(inArray(tags.slug, slugs))
    .groupBy(storyTags.storyId)
    .having(sql`count(distinct ${tags.slug}) = ${slugs.length}`);

// tags for several stories in one query, keyed by story id
export const getTagsForStories = async (storyIds: string[]): Promise<Map<string, NormalizedTag[]>> => {
  const byStory = new Map<string, NormalizedTag[]>();
  if (storyIds.length === 0) return byStory;

  const rows = await db
    .select({ storyId: storyTags.storyId, name: tags.name, slug: tags.slug })
    .from(storyTags)
    .innerJoin(tags, eq(storyTags.tagId, tags.id))
    .where(inArray(storyTags.storyId, storyIds))
    .orderBy(asc(tags.name));

  for (const { storyId, name, slug } of rows) {
    const list = byStory.get(storyId) ?? [];
    list.push({ name, slug });
    byStory.set(storyId, list);
  }
  return byStory;
};
