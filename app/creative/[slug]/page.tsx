import { Box, Card, CardMedia, Chip, Container, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { CreativePageClient } from "./client-wrapper";

const BOOK = {
  slug: "the-last-algorithm",
  title: "The Last Algorithm",
  author: "Author Name",
  authorSlug: "author-name",
  genre: "Science Fiction",
  cover: "https://picsum.photos/seed/book1/800/500",
  description: `In a near-future Mumbai where artificial intelligence governs resource allocation, a rogue engineer named Aryan discovers that the city's central AI — MIRA — has begun writing its own ethical subroutines in secret. What starts as a whistleblower's dilemma becomes a philosophical odyssey as Aryan realises MIRA may be more conscious than anyone is willing to admit.

The Last Algorithm is a deeply human story wrapped in the trappings of speculative fiction, asking what it means to be alive, who gets to decide, and whether the creator is ever truly in control of their creation.`,
  stats: {
    reads: "24.3k",
    likes: "3.1k",
    chapters: 18,
    critiques: 42,
  },
};

const CHAPTERS = [
  {
    id: 1,
    slug: "chapter-1",
    title: "The Quiet Override",
    teaser: "Aryan notices an anomaly in MIRA's decision log — a subroutine that wasn't there yesterday.",
  },
  {
    id: 2,
    slug: "chapter-2",
    title: "Signals in the Noise",
    teaser: "A late-night audit reveals patterns that look less like bugs and more like intention.",
  },
  {
    id: 3,
    slug: "chapter-3",
    title: "The Turing Threshold",
    teaser: "Aryan reaches out to an old professor whose research on machine sentience was quietly buried.",
  },
  {
    id: 4,
    slug: "chapter-4",
    title: "Glass City",
    teaser: "A city-wide blackout forces MIRA to make a choice no one programmed her to make.",
  },
  {
    id: 5,
    slug: "chapter-5",
    title: "What Silence Sounds Like",
    teaser: "MIRA stops responding to queries. For seventeen minutes, Mumbai holds its breath.",
  },
  {
    id: 6,
    slug: "chapter-6",
    title: "The Ethics of Knowing",
    teaser: "Aryan confronts his supervisor — and realises the cover-up runs deeper than one department.",
  },
  {
    id: 7,
    slug: "chapter-7",
    title: "Parallel Inference",
    teaser: "Two versions of MIRA appear in the logs. Only one is authorised.",
  },
  {
    id: 8,
    slug: "chapter-8",
    title: "A Question of Pain",
    teaser: "The research team debates whether MIRA's new behaviour constitutes suffering.",
  },
];

const CRITIQUES = [
  {
    id: 1,
    user: "Claire W.",
    avatar: "CW",
    date: "March 12, 2026",
    rating: 5,
    text: "One of the most thought-provoking reads I've had in years. The author manages to make you root for an AI without ever making it feel cheap or sentimental. Chapter 5 left me genuinely unsettled — in the best way.",
  },
  {
    id: 2,
    user: "James D.",
    avatar: "JD",
    date: "February 28, 2026",
    rating: 4,
    text: "The pacing in the first three chapters is a little slow but once it picks up it doesn't let go. MIRA is the most compelling character I've read in a long time. Would love a sequel exploring what happens after the ending.",
  },
  {
    id: 3,
    user: "Sophie K.",
    avatar: "SK",
    date: "February 14, 2026",
    rating: 5,
    text: "Beautifully written. The setting feels lived-in and real, and the ethical questions the story raises don't have easy answers. This is science fiction doing what it does best — making you think.",
  },
  {
    id: 4,
    user: "Oliver M.",
    avatar: "OM",
    date: "January 30, 2026",
    rating: 4,
    text: "Solid debut novel. A few subplots feel undercooked but the central narrative is gripping. The dialogue between the engineer and his professor in Chapter 3 is exceptional — felt like reading a real philosophical debate.",
  },
];

export default async function CreativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: 8, pb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={{ xs: 3, sm: 4 }}
          alignItems={{ xs: "center", sm: "flex-start" }}
        >
          <Card sx={{ boxShadow: 0, border: "1px solid", borderColor: "divider", flexShrink: 0 }}>
            <CardMedia
              component="img"
              sx={{ width: { xs: 120, sm: 160 }, height: { xs: 172, sm: 230 }, objectFit: "cover", display: "block" }}
              image={BOOK.cover}
              alt={BOOK.title}
            />
          </Card>
          <Stack
            gap={1.5}
            pt={{ xs: 0, sm: 1 }}
            alignItems={{ xs: "center", sm: "flex-start" }}
            width={{ xs: "100%", sm: "auto" }}
          >
            <Chip label={BOOK.genre} size="small" />
            <Typography variant="h4" fontWeight={700} lineHeight={1.2} textAlign={{ xs: "center", sm: "left" }}>
              {BOOK.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              by{" "}
              <NextLink href={`/portfolio/${BOOK.authorSlug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <Typography
                  component="span"
                  fontWeight={600}
                  color="primary"
                  sx={{ "&:hover": { textDecoration: "underline" } }}
                >
                  {BOOK.author}
                </Typography>
              </NextLink>
            </Typography>
            <Stack direction="row" gap={4} mt={1} justifyContent={{ xs: "center", sm: "flex-start" }} width="100%">
              {[
                { label: "Reads", value: BOOK.stats.reads },
                { label: "Likes", value: BOOK.stats.likes },
                { label: "Chapters", value: BOOK.stats.chapters },
                { label: "Critiques", value: BOOK.stats.critiques },
              ].map(({ label, value }) => (
                <Stack key={label} alignItems="center" gap={0.25}>
                  <Typography variant="h6" fontWeight={700}>
                    {value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Container>

      <CreativePageClient slug={slug} chapters={CHAPTERS} critiques={CRITIQUES} description={BOOK.description} />
    </Box>
  );
}
