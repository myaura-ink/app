"use client";

import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { Box, Container, IconButton, Stack, Typography } from "@mui/material";
import { useRef } from "react";
import { SelectCreativeWithAuthor } from "@/lib";
import { CreativeCard } from "../creative-card";

const SCROLL_AMOUNT = 640;

interface ListingProps {
  overline?: string;
  title: string;
  description: string;
  creatives?: SelectCreativeWithAuthor[];
}

export const Listing = ({ overline = "Curated for you", title, description, creatives }: ListingProps) => {
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
          {creatives &&
            creatives.map((book) => (
              <Box key={book.slug} sx={{ scrollSnapAlign: "start" }}>
                <CreativeCard {...book} />
              </Box>
            ))}
        </Box>
      </Container>
    </Box>
  );
};
