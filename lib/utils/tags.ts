import { toSlug } from "./slug";

export const MAX_TAGS = 10;
export const TAG_MIN_LENGTH = 2;
export const TAG_MAX_LENGTH = 30;

export type NormalizedTag = { name: string; slug: string };

export const normalizeTag = (value: string): NormalizedTag => {
  const name = value
    .toLowerCase()
    .replace(/[-_]+/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return { name, slug: toSlug(name) };
};

// validates raw input from a request body; returns deduplicated tags or an error message
export const parseTags = (input: unknown): { tags: NormalizedTag[] } | { error: string } => {
  if (input === undefined || input === null) return { tags: [] };
  if (!Array.isArray(input) || input.some((t) => typeof t !== "string")) {
    return { error: "Tags must be a list of strings" };
  }

  const bySlug = new Map<string, NormalizedTag>();
  for (const raw of input as string[]) {
    const tag = normalizeTag(raw);
    if (!tag.slug) continue;
    if (tag.name.length < TAG_MIN_LENGTH || tag.name.length > TAG_MAX_LENGTH) {
      return { error: `Each tag must be ${TAG_MIN_LENGTH}-${TAG_MAX_LENGTH} characters` };
    }
    bySlug.set(tag.slug, tag);
  }

  if (bySlug.size > MAX_TAGS) return { error: `A work can have at most ${MAX_TAGS} tags` };
  return { tags: [...bySlug.values()] };
};
