import { Box, Card, CardMedia, Chip, Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { StoryTags } from "@/app/components";
import { getUserFromCookie } from "@/app/hooks/getUserFromCookie";
import { buildMetadata, coverSeoImage } from "@/app/utils";
import { story as storySeo } from "@/content";
import {
  getChapterPage,
  getFirstPublishedChapterSlug,
  getLastReadChapter,
  getReadChapterIds,
  getStoryBySlug,
  getTagsByStoryId,
  parseChapterOrder,
} from "@/lib";
import { StoryPageClient } from "./client-wrapper";

// shared by generateMetadata and the page so each request queries once
const getStory = cache(getStoryBySlug);
const getTags = cache(getTagsByStoryId);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return {};
  const tags = await getTags(story.id as string);
  const title = story.title ?? "Untitled";

  return buildMetadata({
    ...storySeo({
      title,
      description: story.description ?? null,
      genre: story.genre ?? null,
      authorName: story.author.name,
      tags: tags.map((t) => t.name),
      totalChapters: story.totalChapters ?? 0,
    }),
    path: `/story/${slug}`,
    image: coverSeoImage(story.coverImage, `Cover of ${title}`),
    noindex: story.published !== 1,
    openGraph: { type: "book", authors: [`/profile/${story.author.slug}`], tags: tags.map((t) => t.name) },
  });
}

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; order?: string }>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const story = await getStory(slug);
  if (!story) notFound();

  // the author also sees their drafts in the chapter list
  const viewer = await getUserFromCookie();
  const storyId = story.id as string;
  const [chapterPage, firstChapterSlug, lastRead, tags] = await Promise.all([
    getChapterPage(storyId, {
      page: Number(query.page) || 1,
      order: parseChapterOrder(query.order),
      includeDrafts: viewer?.id === story.author.id,
    }),
    getFirstPublishedChapterSlug(storyId),
    viewer ? getLastReadChapter(viewer.id, storyId) : null,
    getTags(storyId),
  ]);
  // read marks for just the chapters on this page
  const readChapterIds = viewer
    ? await getReadChapterIds(
        viewer.id,
        chapterPage.chapters.map((ch) => ch.id),
      )
    : [];
  const coverSrc = story.coverImage || `https://picsum.photos/seed/${story.slug}/800/500`;

  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: { xs: 5, sm: 8 }, pb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            gap: { xs: 3, sm: 4 },
            alignItems: { xs: "center", sm: "flex-start" },
          }}
        >
          {/* Cover */}
          <Card
            sx={{
              boxShadow: 0,
              border: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <CardMedia
              sx={{
                width: { xs: 110, sm: 148 },
                height: { xs: 158, sm: 212 },
                position: "relative",
                display: "block",
                overflow: "hidden",
              }}
            >
              <Image
                src={coverSrc}
                alt={story.title || "Story Cover"}
                fill
                sizes="(max-width: 600px) 110px, 148px"
                style={{ objectFit: "cover" }}
                priority
              />
            </CardMedia>
          </Card>

          {/* Info */}
          <Stack
            sx={{
              gap: 1.25,
              pt: { xs: 0, sm: 1 },
              alignItems: { xs: "center", sm: "flex-start" },
              width: { xs: "100%", sm: "auto" },
              flex: 1,
              minWidth: 0,
            }}
          >
            {story.genre && (
              <Chip label={story.genre} size="small" sx={{ alignSelf: { xs: "center", sm: "flex-start" } }} />
            )}

            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                lineHeight: 1.25,
                textAlign: { xs: "center", sm: "left" },
                wordBreak: "break-word",
              }}
            >
              {story.title}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              by{" "}
              <NextLink href={`/profile/${story.author.slug}`} style={{ textDecoration: "none" }}>
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  sx={{
                    fontWeight: 600,
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {story.author.name ?? story.author.slug}
                </Typography>
              </NextLink>
            </Typography>

            <StoryTags storySlug={story.slug as string} authorId={story.author.id} tags={tags.map((t) => t.name)} />

            {/* Stats + Save button row */}
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                justifyContent: { xs: "center", sm: "flex-start" },
                gap: 3,
                mt: 0.5,
                width: "100%",
                flexWrap: "wrap",
              }}
            >
              <Stack
                sx={{
                  alignItems: "center",
                  gap: 0.25,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {story.totalChapters ?? 0}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  Chapters
                </Typography>
              </Stack>
              <Stack
                sx={{
                  alignItems: "center",
                  gap: 0.25,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {story.totalCritiques}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  Critiques
                </Typography>
              </Stack>
              <Stack
                sx={{
                  alignItems: "center",
                  gap: 0.25,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {story.totalCountOfLibraryAdds}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  Library Adds
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      <StoryPageClient
        slug={slug}
        authorId={story.author.id}
        published={story.published === 1}
        description={story.description ?? ""}
        chapterPage={chapterPage}
        firstChapterSlug={firstChapterSlug}
        lastRead={lastRead}
        readChapterIds={readChapterIds}
      />
    </Box>
  );
}
