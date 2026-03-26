"use client";

import { Box, Container, Divider, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { CreativeCard, TabPanel } from "@/app/components";

interface Book {
  id: number;
  slug: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
  description?: string;
}

export const PortfolioPageClient = ({ works, readingList }: { works: Book[]; readingList: Book[] }) => {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="md">
      <Divider />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 0 }}>
        <Tab label="Works" />
        <Tab label="Reading List" />
        <Tab label="About" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Box sx={{ display: { xs: "none", sm: "flex" }, flexWrap: "wrap", gap: 2 }}>
          {works.map((book) => (
            <CreativeCard
              key={book.id}
              slug={book.slug}
              title={book.title}
              author={book.author}
              genre={book.genre}
              cover={book.cover}
              description={book.description}
              variant="card"
            />
          ))}
        </Box>
        <Stack sx={{ display: { xs: "block", sm: "none" } }}>
          <Stack gap={0} divider={<Divider />}>
            {works.map((book) => (
              <CreativeCard
                key={book.id}
                slug={book.slug}
                title={book.title}
                author={book.author}
                genre={book.genre}
                cover={book.cover}
                description={book.description}
                variant="list"
              />
            ))}
          </Stack>
        </Stack>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Box sx={{ display: { xs: "none", sm: "flex" }, flexWrap: "wrap", gap: 2 }}>
          {readingList.map((book) => (
            <CreativeCard
              key={book.id}
              slug={book.slug}
              title={book.title}
              author={book.author}
              genre={book.genre}
              cover={book.cover}
              variant="card"
            />
          ))}
        </Box>
        <Stack sx={{ display: { xs: "block", sm: "none" } }}>
          <Stack gap={0} divider={<Divider />}>
            {readingList.map((book) => (
              <CreativeCard
                key={book.id}
                slug={book.slug}
                title={book.title}
                author={book.author}
                genre={book.genre}
                cover={book.cover}
                variant="list"
              />
            ))}
          </Stack>
        </Stack>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Stack gap={3}>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            Author Name is a fiction and science-fiction writer based in London. With a passion for exploring the
            intersection of technology and humanity, their stories challenge readers to think differently about the
            world around them.
          </Typography>
          <Divider />
          <Stack gap={1}>
            <Typography variant="body2">
              <strong>Location:</strong> London, UK
            </Typography>
            <Typography variant="body2">
              <strong>Member since:</strong> January 2023
            </Typography>
            <Typography variant="body2">
              <strong>Genres:</strong> Science Fiction, Mystery, Literary Fiction
            </Typography>
            <Typography variant="body2">
              <strong>Website:</strong> authorname.com
            </Typography>
          </Stack>
        </Stack>
      </TabPanel>
    </Container>
  );
}
