export const toSlug = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

export const toUniqueSlug = (value: string): string => {
  const base = toSlug(value);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
};
