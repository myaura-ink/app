"use client";

import AddIcon from "@mui/icons-material/Add";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import UnpublishedOutlinedIcon from "@mui/icons-material/UnpublishedOutlined";
import { Box, Button, Chip, Link, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { useAuthContext } from "@/app/contexts";
import { useUpdateStory } from "@/app/hooks/useStories";
import { SaveButton } from "../library-button";

interface StoryActionsProps {
  slug: string;
  authorId: string;
  published: boolean;
  firstChapterSlug?: string;
  lastRead?: { slug: string; title: string; number: number } | null;
  onAddChapter: () => void;
  onCritique: () => void;
}

// full-width buttons on phones, natural width from sm up
const buttonRowSx = {
  gap: 1.5,
  flexWrap: "wrap",
  "& > *": { flex: { xs: "1 1 100%", sm: "0 0 auto" } },
} as const;

export const StoryActions = ({
  slug,
  authorId,
  published,
  firstChapterSlug,
  lastRead,
  onAddChapter,
  onCritique,
}: StoryActionsProps) => {
  const { user } = useAuthContext();
  const updateStory = useUpdateStory(slug);
  const isAuthor = user?.id === authorId;

  if (isAuthor) {
    return (
      <Box
        component="section"
        aria-label="Manage your story"
        sx={{
          border: "1px solid",
          borderColor: published ? "divider" : "secondary.light",
          borderRadius: 2,
          bgcolor: published ? "background.default" : "rgba(var(--mui-palette-secondary-mainChannel) / 0.08)",
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{ gap: 2, alignItems: { md: "center" }, justifyContent: "space-between" }}
        >
          <Stack sx={{ gap: 0.5, flex: 1, minWidth: 0 }}>
            <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
              <Chip
                label={published ? "Published" : "Draft"}
                size="small"
                color={published ? "primary" : "warning"}
                variant={published ? "filled" : "outlined"}
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {published ? "Your story is live" : "Your story is a draft"}
              </Typography>
            </Stack>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {published
                ? "Readers can find it in listings and tag searches."
                : "It's hidden from listings. Publishing it, or any chapter, makes it visible to readers."}
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ ...buttonRowSx, flexShrink: 0, flexWrap: { xs: "wrap", md: "nowrap" } }}>
            <Button
              variant={published ? "outlined" : "contained"}
              color={published ? "inherit" : "primary"}
              startIcon={published ? <UnpublishedOutlinedIcon /> : <PublishOutlinedIcon />}
              disabled={updateStory.isPending}
              onClick={() => updateStory.mutate({ published: !published })}
            >
              {published ? "Move to drafts" : "Publish story"}
            </Button>
            <Button variant="outlined" startIcon={<EditOutlinedIcon />} href={`/story/${slug}/edit`}>
              Edit details
            </Button>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={onAddChapter}>
              Add chapter
            </Button>
          </Stack>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      component="section"
      aria-label="Story actions"
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.default",
        p: { xs: 2, sm: 2.5 },
      }}
    >
      <Stack direction="row" sx={buttonRowSx}>
        {lastRead ? (
          <Button
            variant="contained"
            startIcon={<PlayArrowRoundedIcon />}
            component={NextLink}
            href={`/story/${slug}/chapter/${lastRead.slug}`}
          >
            Continue reading
          </Button>
        ) : (
          <Button
            variant="contained"
            startIcon={<AutoStoriesOutlinedIcon />}
            href={firstChapterSlug ? `/story/${slug}/chapter/${firstChapterSlug}` : undefined}
            disabled={!firstChapterSlug}
          >
            {firstChapterSlug ? "Start reading" : "No chapters yet"}
          </Button>
        )}
        <SaveButton slug={slug} />
        {user && (
          <Button variant="text" startIcon={<RateReviewOutlinedIcon />} onClick={onCritique}>
            Write a critique
          </Button>
        )}
      </Stack>
      {lastRead && (
        <Typography variant="caption" component="p" sx={{ color: "text.secondary", mt: 1.5 }}>
          You left off at Chapter {lastRead.number}: {lastRead.title}
          {firstChapterSlug && firstChapterSlug !== lastRead.slug && (
            <>
              {" · "}
              <Link component={NextLink} href={`/story/${slug}/chapter/${firstChapterSlug}`} color="inherit">
                Start from the beginning
              </Link>
            </>
          )}
        </Typography>
      )}
    </Box>
  );
};
