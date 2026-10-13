import { Box, Container } from "@mui/material";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getUserFromCookie } from "@/app/hooks/getUserFromCookie";
import { buildMetadata } from "@/app/utils";
import { manageChapters } from "@/content";
import { getAllChaptersForAuthor, getStoryBySlug } from "@/lib";
import { ManageChaptersClient } from "./client-wrapper";

const getStory = cache(getStoryBySlug);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) return {};
  return buildMetadata({
    ...manageChapters({ title: story.title ?? "Untitled" }),
    path: `/story/${slug}/chapters`,
    noindex: true,
  });
}

export default async function ManageChaptersPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [story, user] = await Promise.all([getStory(slug), getUserFromCookie()]);
  if (!story) notFound();
  // authors only; everyone else gets the public chapter list
  if (user?.id !== story.author.id) redirect(`/story/${slug}?tab=chapters`);

  const chapters = await getAllChaptersForAuthor(story.id as string);

  return (
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
        <ManageChaptersClient slug={slug} storyTitle={story.title ?? "Untitled"} chapters={chapters} />
      </Container>
    </Box>
  );
}
