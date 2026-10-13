import { Box } from "@mui/material";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getUserFromCookie } from "@/app/hooks/getUserFromCookie";
import { buildMetadata, coverSeoImage, toExcerpt } from "@/app/utils";
import { chapter as chapterSeo } from "@/content";
import {
  getChapterByStorySlugAndChapterSlug,
  getChaptersByStorySlug,
  getReadChapterIds,
  getStoryBySlug,
  getTagsByStoryId,
} from "@/lib";
import { ChapterPageClient } from "./client-wrapper";

type Params = Promise<{ slug: string; chapterSlug: string }>;

// shared by generateMetadata and the page so each request queries once
const getStory = cache(getStoryBySlug);
const getChapter = cache(getChapterByStorySlugAndChapterSlug);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, chapterSlug } = await params;
  const [story, chapter] = await Promise.all([getStory(slug), getChapter(slug, chapterSlug)]);
  if (!story || !chapter) return {};
  const tags = (await getTagsByStoryId(story.id as string)).map((t) => t.name);
  const storyTitle = story.title ?? "Untitled";

  return buildMetadata({
    ...chapterSeo({
      title: chapter.title,
      order: chapter.order,
      excerpt: toExcerpt(chapter.content),
      storyTitle,
      authorName: story.author.name,
      genre: story.genre ?? null,
      tags,
    }),
    path: `/story/${slug}/chapter/${chapterSlug}`,
    image: coverSeoImage(story.coverImage, `Cover of ${storyTitle}`),
    noindex: story.published !== 1 || chapter.published !== 1,
    openGraph: {
      type: "article",
      authors: [`/profile/${story.author.slug}`],
      section: story.genre ?? undefined,
      tags,
      publishedTime: chapter.createdAt?.toISOString(),
      modifiedTime: chapter.updatedAt.toISOString(),
    },
  });
}

export default async function ChapterPage({ params }: { params: Params }) {
  const { slug, chapterSlug } = await params;

  const [story, chapter, chapters, viewer] = await Promise.all([
    getStory(slug),
    getChapter(slug, chapterSlug),
    getChaptersByStorySlug(slug),
    getUserFromCookie(),
  ]);

  if (!story || !chapter) {
    notFound();
  }

  const currentChapter = chapter;
  // read marks for the contents sidebar
  const readChapterIds = viewer
    ? await getReadChapterIds(
        viewer.id,
        chapters.map((c) => c.id as string),
      )
    : [];
  const currentIndex = chapters.findIndex((c) => c.slug === chapterSlug);
  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <Box>
      <ChapterPageClient
        slug={slug}
        chapterSlug={chapterSlug}
        book={{ slug: story.slug!, title: story.title! }}
        chapters={chapters}
        chapter={currentChapter}
        authorId={story.author.id}
        prev={prev}
        next={next}
        readChapterIds={readChapterIds}
      />
    </Box>
  );
}
