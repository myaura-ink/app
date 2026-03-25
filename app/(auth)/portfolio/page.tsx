"use client";

import { Avatar, Box, Container, Divider, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { CreativeCard } from "@/app/components";

const WORKS = [
  {
    id: 1,
    title: "The Last Algorithm",
    author: "Author Name",
    genre: "Science Fiction",
    cover: "https://picsum.photos/seed/book1/120/180",
    description: "A gripping tale of AI consciousness and the ethics of creation.",
  },
  {
    id: 2,
    title: "Shadows of the Forgotten",
    author: "Author Name",
    genre: "Mystery",
    cover: "https://picsum.photos/seed/book2/120/180",
    description: "A detective unravels a decades-old secret buried in a small coastal town.",
  },
];

const READING_LIST = [
  {
    id: 1,
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    genre: "Literary Fiction",
    cover: "https://picsum.photos/seed/read1/120/180",
  },
  {
    id: 2,
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    cover: "https://picsum.photos/seed/read2/120/180",
  },
  {
    id: 3,
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    cover: "https://picsum.photos/seed/read3/120/180",
  },
  {
    id: 4,
    title: "Educated",
    author: "Tara Westover",
    genre: "Memoir",
    cover: "https://picsum.photos/seed/read4/120/180",
  },
];


function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return value === index ? <Box sx={{ mt: 3 }}>{children}</Box> : null;
}

export default function Portfolio() {
  const [tab, setTab] = useState(0);

  return (
    <Box component="main" sx={{ py: 10, backgroundColor: "white" }}>
      <Container maxWidth="md">
        <Stack direction="column" gap={2} justifyContent={"center"} alignItems={"center"}>
          <Avatar sx={{ width: 72, height: 72, fontSize: 24 }}>AP</Avatar>
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={600}>Author Name</Typography>
            <Typography variant="caption" color="text.secondary">@author_name</Typography>
          </Box>
          <Stack direction={"row"} gap={4}>
            <Stack direction={"column"} gap={0.5} alignItems={"center"}>
              <Typography fontWeight={600}>{WORKS.length}</Typography>
              <Typography variant="caption" color="text.secondary">Works</Typography>
            </Stack>
            <Stack direction={"column"} gap={0.5} alignItems={"center"}>
              <Typography fontWeight={600}>{READING_LIST.length}</Typography>
              <Typography variant="caption" color="text.secondary">Reading List</Typography>
            </Stack>
            <Stack direction={"column"} gap={0.5} alignItems={"center"}>
              <Typography fontWeight={600}>100k</Typography>
              <Typography variant="caption" color="text.secondary">Followers</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
          <Tab label="Works" />
          <Tab label="Reading List" />
          <Tab label="About" />
        </Tabs>

        <TabPanel value={tab} index={0}>
          <Stack gap={2}>
            {WORKS.map((book) => (
              <CreativeCard
                key={book.id}
                title={book.title}
                author={book.author}
                genre={book.genre}
                cover={book.cover}
                description={book.description}
              />
            ))}
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={1}>
          <Stack gap={2}>
            {READING_LIST.map((book) => (
              <CreativeCard
                key={book.id}
                title={book.title}
                author={book.author}
                genre={book.genre}
                cover={book.cover}
              />
            ))}
          </Stack>
        </TabPanel>

        <TabPanel value={tab} index={2}>
          <Stack maxWidth={480} mx="auto" gap={2}>
            <Typography variant="h6" fontWeight={600}>About</Typography>
            <Typography variant="body1" color="text.secondary">
              Author Name is a fiction and science-fiction writer based in Mumbai. With a passion for
              exploring the intersection of technology and humanity, their stories challenge readers to
              think differently about the world around them.
            </Typography>
            <Divider />
            <Stack gap={1}>
              <Typography variant="body2"><strong>Location:</strong> Mumbai, India</Typography>
              <Typography variant="body2"><strong>Member since:</strong> January 2023</Typography>
              <Typography variant="body2"><strong>Genres:</strong> Science Fiction, Mystery, Literary Fiction</Typography>
              <Typography variant="body2"><strong>Website:</strong> authorname.com</Typography>
            </Stack>
          </Stack>
        </TabPanel>
      </Container>
    </Box>
  );
}
