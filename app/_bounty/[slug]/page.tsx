import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Chip, Container, Divider, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { Avatar, Footer } from "@/app/components";
import { BountyDetailClient } from "./client-wrapper";

const BOUNTY = {
  slug: "the-cartographer-of-forgotten-roads",
  title: "The Cartographer of Forgotten Roads",
  genre: "Fantasy",
  description: `A mapmaker in a secondary world discovers that her maps don't just record geography — they shape it. Every road she draws comes into existence, and every road she erases disappears, along with the villages, people, and memories tied to it.

The story should sit at the intersection of power and erasure — who gets to decide what's real, what gets remembered, and what disappears quietly from the record. A meditation on colonial cartography, complicity, and what it means to redraw something you cannot undo.

Length: 8,000 – 15,000 words. Complete, standalone. Secondary world setting only.`,
  amount: 4100,
  contributors: 51,
  wants: 741,
  applications: 3,
  deadline: "April 30, 2026",
  postedBy: { name: "Claire W.", avatar: "CW" },
  postedDate: "March 1, 2026",
};

const CONTRIBUTORS = [
  { id: 1, name: "James D.", avatar: "JD", amount: 250, date: "March 20, 2026" },
  { id: 2, name: "Sophie H.", avatar: "SH", amount: 500, date: "March 18, 2026" },
  { id: 3, name: "Oliver M.", avatar: "OM", amount: 150, date: "March 16, 2026" },
  { id: 4, name: "Sarah R.", avatar: "SR", amount: 100, date: "March 14, 2026" },
  { id: 5, name: "Thomas N.", avatar: "TN", amount: 300, date: "March 12, 2026" },
  { id: 6, name: "Laura J.", avatar: "LJ", amount: 200, date: "March 10, 2026" },
  { id: 7, name: "Alex B.", avatar: "AB", amount: 75, date: "March 8, 2026" },
  { id: 8, name: "Emma C.", avatar: "EC", amount: 400, date: "March 6, 2026" },
];

const INTERESTED = [
  { id: 1, name: "Chloe S.", avatar: "CS", date: "March 22, 2026" },
  { id: 2, name: "Ben M.", avatar: "BM", date: "March 21, 2026" },
  { id: 3, name: "Hannah H.", avatar: "HH", date: "March 20, 2026" },
  { id: 4, name: "Alice P.", avatar: "AP", date: "March 19, 2026" },
  { id: 5, name: "Ryan V.", avatar: "RV", date: "March 18, 2026" },
  { id: 6, name: "Fiona Z.", avatar: "FZ", date: "March 17, 2026" },
  { id: 7, name: "Sam K.", avatar: "SK", date: "March 16, 2026" },
  { id: 8, name: "Poppy L.", avatar: "PL", date: "March 15, 2026" },
];

const APPLICATIONS = [
  {
    id: 1,
    writer: "Eleanor Reed",
    avatar: "ER",
    credentials: "Author of 4 published novellas · Speculative Fiction",
    pitch:
      "I want to tell this story from the mapmaker's apprentice — someone who believes in her mentor's work completely, until she doesn't. The horror isn't that the maps are wrong. It's that they work exactly as intended, and she helped make them. I'd lean into the bureaucratic mundanity of erasure: forms filed, routes reclassified, names quietly corrected in the registry. The violence is in the paperwork.",
    votes: 84,
    appliedDate: "March 19, 2026",
  },
  {
    id: 2,
    writer: "Marcus Webb",
    avatar: "MW",
    credentials: "2x Pushcart nominee · Secondary World Specialist",
    pitch:
      "The map as unreliable narrator. I'd write it in the second person — you are the cartographer, you hold the pen, and the reader has to sit with that. Each section would be a different road: one that was made, one that was erased, one that refuses to stay gone. The ending I have in mind doesn't resolve cleanly, which I think is exactly right for this story.",
    votes: 61,
    appliedDate: "March 21, 2026",
  },
  {
    id: 3,
    writer: "Catherine Bell",
    avatar: "CB",
    credentials: "Debut writer · Literary short fiction background",
    pitch:
      "A quieter take: the cartographer is old, retired, and a young researcher arrives to digitise her life's work. The story moves between past and present. We see her making the maps, and then we see what the researcher finds — the gaps, the white spaces, the villages with no name. I'm interested in the cartographer as someone who genuinely believed she was recording the world faithfully.",
    votes: 38,
    appliedDate: "March 22, 2026",
  },
];

export default async function BountyDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider", py: { xs: 5, md: 7 } }}>
        <Container maxWidth="md">
          <Stack gap={3}>
            {/* Back link */}
            <NextLink href="/bounty" style={{ textDecoration: "none" }}>
              <Stack direction="row" gap={0.5} alignItems="center" sx={{ color: "text.secondary", width: "fit-content", "&:hover": { color: "primary.main" }, transition: "color 0.15s" }}>
                <ArrowBackIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" fontWeight={600}>
                  Back to Bounties
                </Typography>
              </Stack>
            </NextLink>

            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={{ xs: 3, md: 5 }}
              alignItems={{ md: "flex-start" }}
            >
              {/* Left: title block */}
              <Stack gap={2} flex={1}>
                <Stack gap={1.5}>
                  <Chip label={BOUNTY.genre} size="small" sx={{ alignSelf: "flex-start" }} />
                  <Typography variant="h4" fontWeight={800} lineHeight={1.2} sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                    {BOUNTY.title}
                  </Typography>
                </Stack>

                <Stack direction="row" gap={1} alignItems="center">
                  <Avatar slug={BOUNTY.postedBy.name} size={22} />
                  <Typography variant="caption" color="text.secondary">
                    requested by{" "}
                    <Typography component="span" variant="caption" fontWeight={600} color="text.primary">
                      {BOUNTY.postedBy.name}
                    </Typography>
                    {" · "}
                    {BOUNTY.postedDate}
                  </Typography>
                </Stack>

                {/* Stats */}
                <Stack direction="row" gap={4} mt={0.5} flexWrap="wrap">
                  {[
                    { label: "Raised", value: `$${BOUNTY.amount.toLocaleString()}` },
                    { label: "Contributors", value: BOUNTY.contributors },
                    { label: "Interested", value: BOUNTY.wants.toLocaleString() },
                    { label: "Applications", value: BOUNTY.applications },
                  ].map(({ label, value }) => (
                    <Stack key={label} alignItems="center" gap={0.25}>
                      <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
                        {value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>

              {/* Right: CTAs + deadline */}
              <Stack gap={1.5} sx={{ minWidth: { md: 200 } }}>
                <Button variant="contained" size="large" fullWidth>
                  Contribute
                </Button>
                <Button variant="outlined" size="large" fullWidth>
                  Apply as Writer
                </Button>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  Deadline:{" "}
                  <Typography component="span" variant="caption" fontWeight={600} color="text.primary">
                    {BOUNTY.deadline}
                  </Typography>
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Tabs */}
      <BountyDetailClient
        slug={slug}
        description={BOUNTY.description}
        contributors={CONTRIBUTORS}
        interested={INTERESTED}
        applications={APPLICATIONS}
      />

      <Footer />
    </Box>
  );
}
