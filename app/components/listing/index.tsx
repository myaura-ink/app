"use client";

import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Button, Container, IconButton, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { useRef } from "react";
import { SelectStoryWithAuthor } from "@/lib";
import type { NormalizedTag } from "@/lib/utils/tags";
import { StoryCard } from "../story-card";

const SCROLL_AMOUNT = 640;
// covers visible before scrolling the row on a desktop screen
const EAGER_COVER_COUNT = 6;

interface ListingProps {
  id?: string;
  overline?: string;
  title: string;
  description: string;
  stories?: (SelectStoryWithAuthor & { tags?: NormalizedTag[] })[];
  viewAllHref?: string;
}

export const Listing = ({
  id,
  overline = "Curated for you",
  title,
  description,
  stories,
  viewAllHref,
}: ListingProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    listRef.current?.scrollBy({ left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <Box component="section" id={id} sx={{ py: 8, bgcolor: "background.paper", scrollMarginTop: 64 }}>
      <Container maxWidth="lg">
        <Stack
          direction="row"
          sx={{
            alignItems: "flex-end",
            justifyContent: "space-between",
            mb: 4,
          }}
        >
          <Stack
            sx={{
              gap: 0.5,
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: "secondary.main",
                fontWeight: 600,
              }}
            >
              {overline}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "primary.main",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                maxWidth: 480,
              }}
            >
              {description}
            </Typography>
          </Stack>
          {!!stories?.length && (
            <Stack
              direction="row"
              sx={{
                gap: 1,
                pb: 0.5,
                alignItems: "center",
              }}
            >
              {viewAllHref && (
                <Button component={NextLink} href={viewAllHref} size="small" sx={{ mr: 1, whiteSpace: "nowrap" }}>
                  Browse all
                </Button>
              )}
              <IconButton
                onClick={() => scroll("left")}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  "&:hover": { borderColor: "primary.main", color: "primary.main" },
                }}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton
                onClick={() => scroll("right")}
                size="small"
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  "&:hover": { borderColor: "primary.main", color: "primary.main" },
                }}
              >
                <ChevronRight />
              </IconButton>
            </Stack>
          )}
        </Stack>

        <Box
          ref={listRef}
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            // room for the cards' hover lift and shadow
            pt: 1,
            pb: 3,
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {stories?.length === 0 && (
            <Typography sx={{ color: "text.secondary", py: 4 }}>
              No works published yet. Yours could be the first.
            </Typography>
          )}
          {stories?.map((book, i) => (
            <Box key={book.slug} sx={{ scrollSnapAlign: "start", display: "flex" }}>
              <StoryCard {...book} eager={i < EAGER_COVER_COUNT} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
