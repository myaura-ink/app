"use client";

import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Container, IconButton, Stack, Typography } from "@mui/material";
import { useRef } from "react";
import { CreativeCard } from "../creative-card";

const PICKS = [
  {
    slug: "the-last-algorithm",
    title: "The Last Algorithm",
    author: "Author Name",
    genre: "Science Fiction",
    cover: "https://picsum.photos/seed/book1/120/180",
  },
  {
    slug: "shadows-of-the-forgotten",
    title: "Shadows of the Forgotten",
    author: "Author Name",
    genre: "Mystery",
    cover: "https://picsum.photos/seed/book2/120/180",
  },
  {
    slug: "the-unnamed-coast",
    title: "The Unnamed Coast",
    author: "Laura Hart",
    genre: "Literary Fiction",
    cover: "https://picsum.photos/seed/pick3/120/180",
  },
  {
    slug: "iron-meridian",
    title: "Iron Meridian",
    author: "Nathan Cross",
    genre: "Fantasy",
    cover: "https://picsum.photos/seed/pick4/120/180",
  },
  {
    slug: "after-the-monsoon",
    title: "After the Monsoon",
    author: "Emma Sutton",
    genre: "Romance",
    cover: "https://picsum.photos/seed/pick5/120/180",
  },
  {
    slug: "the-cartographer",
    title: "The Cartographer",
    author: "David Mercer",
    genre: "Historical Fiction",
    cover: "https://picsum.photos/seed/pick6/120/180",
  },
  {
    slug: "static-silence",
    title: "Static Silence",
    author: "Anna Ross",
    genre: "Thriller",
    cover: "https://picsum.photos/seed/pick7/120/180",
  },
  {
    slug: "roots-and-revolutions",
    title: "Roots & Revolutions",
    author: "Kate Barnes",
    genre: "Non-fiction",
    cover: "https://picsum.photos/seed/pick8/120/180",
  },
];

const SCROLL_AMOUNT = 640;

interface ListingProps {
  overline?: string;
  title: string;
  description: string;
}

export const Listing = ({ overline = "Curated for you", title, description }: ListingProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    listRef.current?.scrollBy({ left: direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT, behavior: "smooth" });
  };

  return (
    <Box component="section" sx={{ py: 8, bgcolor: "background.paper" }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" mb={4}>
          <Stack gap={0.5}>
            <Typography variant="overline" color="secondary.main" fontWeight={600}>
              {overline}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
              {description}
            </Typography>
          </Stack>
          <Stack direction="row" gap={1} pb={0.5}>
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
        </Stack>

        <Box
          ref={listRef}
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            pb: 1,
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {PICKS.map((book) => (
            <Box key={book.slug} sx={{ scrollSnapAlign: "start" }}>
              <CreativeCard {...book} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};
