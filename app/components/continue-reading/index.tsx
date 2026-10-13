"use client";

import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Box, Button, Chip, Container, LinearProgress, Link, Stack, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { formatRelativeTime } from "@/app/utils";
import type { ReadingHistoryItem } from "@/lib";

const clamp = (lines: number) => ({
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical" as const,
});

// the story a signed-in reader most recently read, so they can pick it straight back up
export const ContinueReading = ({ item }: { item: ReadingHistoryItem }) => {
  const { story, chapter, totalChapters } = item;
  const storyHref = `/story/${story.slug}`;
  // on the newest chapter there's nothing further to continue to, so point at the story instead
  const caughtUp = !!chapter && chapter.number >= totalChapters;
  const href = chapter && !caughtUp ? `${storyHref}/chapter/${chapter.slug}` : storyHref;
  const progress = chapter && totalChapters > 0 ? Math.round((chapter.number / totalChapters) * 100) : 0;
  // same placeholder as the story cards and story page
  const cover = story.coverImage || `https://picsum.photos/seed/${story.slug}/500/700`;

  return (
    <Box
      component="section"
      aria-labelledby="continue-reading"
      sx={{ bgcolor: "background.default", py: { xs: 4, md: 5 } }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            gap: { xs: 2, sm: 3 },
            alignItems: { sm: "center" },
            p: { xs: 2, sm: 2.5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            bgcolor: "background.paper",
          }}
        >
          <Stack direction="row" sx={{ gap: 2, alignItems: "center", flex: 1, minWidth: 0 }}>
            <Box
              component={NextLink}
              href={href}
              sx={{
                position: "relative",
                width: { xs: 64, sm: 84 },
                aspectRatio: "5 / 7",
                flexShrink: 0,
                borderRadius: 1.5,
                overflow: "hidden",
                boxShadow: "0 4px 12px -6px rgba(30, 24, 14, 0.35)",
              }}
            >
              <Image src={cover} alt="" fill sizes="84px" style={{ objectFit: "cover" }} />
            </Box>

            <Stack sx={{ gap: 0.5, flex: 1, minWidth: 0 }}>
              <Typography
                id="continue-reading"
                variant="overline"
                sx={{ color: "secondary.main", fontWeight: 600, lineHeight: 1.4, letterSpacing: "0.1em" }}
              >
                Continue reading
              </Typography>
              <Typography
                component={NextLink}
                href={storyHref}
                variant="h6"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: "text.primary",
                  textDecoration: "none",
                  "&:hover": { color: "primary.main" },
                  ...clamp(1),
                }}
              >
                {story.title}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", ...clamp(1) }}>
                {chapter
                  ? `Chapter ${chapter.number} of ${totalChapters} · ${chapter.title}`
                  : "Pick up where you left off"}
              </Typography>
              {chapter && (
                <Stack direction="row" sx={{ gap: 1.5, alignItems: "center", mt: 0.5, maxWidth: 360 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    aria-label={`${progress}% through the story`}
                    sx={{ flex: 1, height: 6, borderRadius: 3 }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, minWidth: 32 }}>
                    {progress}%
                  </Typography>
                </Stack>
              )}
              {/* "x minutes ago" can tick over between the server render and hydration */}
              <Typography variant="caption" sx={{ color: "text.disabled" }} suppressHydrationWarning>
                {story.author.name ?? story.author.slug} · read {formatRelativeTime(item.readAt)}
              </Typography>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "row", sm: "column" }}
            sx={{ gap: 1, alignItems: "center", flexShrink: 0, "& > a:first-of-type": { flex: { xs: 1, sm: "none" } } }}
          >
            {caughtUp ? (
              <>
                <Button component={NextLink} href={storyHref} variant="outlined">
                  View story
                </Button>
                <Chip label="All caught up" size="small" color="primary" variant="outlined" />
              </>
            ) : (
              <Button component={NextLink} href={href} variant="contained" startIcon={<PlayArrowRoundedIcon />}>
                {chapter ? "Continue" : "Open story"}
              </Button>
            )}
            <Link component={NextLink} href="/history" variant="caption" color="text.secondary" underline="hover">
              View history
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
