import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib";
import { config } from "./config";

// regenerate at most weekly instead of querying on every crawler hit
export const revalidate = 604800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { works, chapters, authors } = await getSitemapEntries();
  const url = (path: string) => `${config.platform}${path}`;

  return [
    { url: url("/"), changeFrequency: "daily", priority: 1 },
    { url: url("/search"), changeFrequency: "daily", priority: 0.6 },
    { url: url("/roadmap"), changeFrequency: "monthly", priority: 0.4 },
    ...works.map((w) => ({
      url: url(`/story/${w.slug}`),
      lastModified: w.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...chapters.map((c) => ({
      url: url(`/story/${c.storySlug}/chapter/${c.slug}`),
      lastModified: c.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...authors.map((a) => ({
      url: url(`/profile/${a.slug}`),
      lastModified: a.updatedAt ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
