import { Box, Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getUserFromCookie } from "@/app/hooks/getUserFromCookie";
import { buildMetadata } from "@/app/utils";
import { editStory } from "@/content";
import { getStoryBySlug, getTagsByStoryId } from "@/lib";
import { EditStoryClient } from "./client-wrapper";

const getStory = cache(getStoryBySlug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return {};
  return buildMetadata({
    ...editStory({ title: story.title ?? "Untitled" }),
    path: `/story/${slug}/edit`,
    noindex: true,
  });
}

export default async function EditStoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [story, user] = await Promise.all([getStory(slug), getUserFromCookie()]);
  if (!story) notFound();
  // only the author can edit; everyone else gets the public page
  if (user?.id !== story.author.id) redirect(`/story/${slug}`);

  const tags = await getTagsByStoryId(story.id as string);

  return (
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack
          sx={{
            gap: 1,
            mb: 6,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "secondary.main",
              fontWeight: 600,
              letterSpacing: "0.12em",
            }}
          >
            Edit Story
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {story.title}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            Update your story&apos;s details. Its link stays the same even if you change the title.
          </Typography>
        </Stack>

        <EditStoryClient
          slug={slug}
          initialValues={{
            title: story.title ?? "",
            coverImage: story.coverImage ?? "",
            description: story.description ?? "",
            genre: story.genre ?? "",
            tags: tags.map((t) => t.name),
          }}
        />
      </Container>
    </Box>
  );
}
