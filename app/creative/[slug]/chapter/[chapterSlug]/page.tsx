import { Box } from "@mui/material";
import { getChapterByCreativeSlugAndChapterSlug, getChaptersByCreativSlug, getCreativeBySlug } from "@/lib";
import { ChapterPageClient } from "./client-wrapper";

export default async function ChapterPage({ params }: { params: Promise<{ slug: string; chapterSlug: string }> }) {
  const { slug, chapterSlug } = await params;
  console.log("Received params:", { slug, chapterSlug });

  const [creative, chapter, chapters] = await Promise.all([
    getCreativeBySlug(slug),
    getChapterByCreativeSlugAndChapterSlug(slug, chapterSlug),
    getChaptersByCreativSlug(slug),
  ]);

  if (!creative || !chapter) {
    return { status: 404 };
  }

  const currentChapter = chapter;
  const currentIndex = chapters.findIndex((c) => c.slug === chapterSlug);
  const prev = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const next = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <Box>
      <ChapterPageClient
        slug={slug}
        chapterSlug={chapterSlug}
        book={creative}
        chapters={chapters}
        chapter={currentChapter}
        prev={prev}
        next={next}
      />
    </Box>
  );
}
