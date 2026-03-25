import { Avatar, Box, Container, Stack, Typography } from "@mui/material";
import { PortfolioPageClient } from "./client-wrapper";

const WORKS = [
  {
    id: 1,
    slug: "the-last-algorithm",
    title: "The Last Algorithm",
    author: "Author Name",
    genre: "Science Fiction",
    cover: "https://picsum.photos/seed/book1/120/180",
    description: "A gripping tale of AI consciousness and the ethics of creation.",
  },
  {
    id: 2,
    slug: "shadows-of-the-forgotten",
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
    slug: "klara-and-the-sun",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    genre: "Literary Fiction",
    cover: "https://picsum.photos/seed/read1/120/180",
  },
  {
    id: 2,
    slug: "project-hail-mary",
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    cover: "https://picsum.photos/seed/read2/120/180",
  },
  {
    id: 3,
    slug: "the-midnight-library",
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    cover: "https://picsum.photos/seed/read3/120/180",
  },
  {
    id: 4,
    slug: "educated",
    title: "Educated",
    author: "Tara Westover",
    genre: "Memoir",
    cover: "https://picsum.photos/seed/read4/120/180",
  },
];

export default async function PortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  console.log("portfolio slug:", slug);

  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: 8, pb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={{ xs: 3, sm: 4 }}
          alignItems={{ xs: "center", sm: "flex-start" }}
        >
          <Avatar sx={{ width: 96, height: 96, fontSize: 32, flexShrink: 0 }}>AP</Avatar>
          <Stack gap={1.5} pt={{ xs: 0, sm: 1 }}>
            <Stack gap={0} alignItems={{ xs: "center", sm: "flex-start" }}>
              <Typography variant="h4" fontWeight={700}>
                Author Name
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                @author_name
              </Typography>
            </Stack>
            <Stack direction="row" gap={4} justifyContent={{ xs: "center", sm: "flex-start" }}>
              <Stack direction="column" gap={0.25} alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  {WORKS.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Works
                </Typography>
              </Stack>
              <Stack direction="column" gap={0.25} alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  {READING_LIST.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reading List
                </Typography>
              </Stack>
              <Stack direction="column" gap={0.25} alignItems="center">
                <Typography variant="h6" fontWeight={700}>
                  100k
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Followers
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      <PortfolioPageClient works={WORKS} readingList={READING_LIST} />
    </Box>
  );
}
