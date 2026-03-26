import { Box, Button, Container, Divider, Stack, Typography } from "@mui/material";
import { BountyCard, Footer } from "../components";
import { HowItWorks } from "./how-it-works";

const BOUNTIES = [
  {
    id: 1,
    slug: "the-last-monsoon",
    title: "The Last Monsoon",
    genre: "Climate Fiction",
    description:
      "A climate fiction story set in 2047 Mumbai, where the last monsoon season is approaching and a hydrologist must navigate political corruption and corporate greed to save the city's water reserves. The story should explore themes of environmental grief, intergenerational trauma, and what it means to fight for something you know you might lose. Bonus points if it ends with ambiguity rather than a neat resolution.",
    contributors: 34,
    amount: 2840,
    wants: 512,
  },
  {
    id: 2,
    slug: "letters-never-sent",
    title: "Letters Never Sent",
    genre: "Literary Fiction",
    description:
      "An epistolary novel told entirely through unsent letters spanning three generations of a family — letters written in anger, grief, longing, and love that were never given to the intended recipient. The final chapter should reveal why each letter stayed sealed. Something quiet, devastating, and full of the ordinary moments that make up a life.",
    contributors: 28,
    amount: 1950,
    wants: 389,
  },
  {
    id: 3,
    slug: "the-cartographer-of-forgotten-roads",
    title: "The Cartographer of Forgotten Roads",
    genre: "Fantasy",
    description:
      "A mapmaker in a secondary world discovers that her maps don't just record geography — they shape it. Every road she draws comes into existence, and every road she erases disappears, along with the villages, people, and memories tied to it. A meditation on history, power, and what gets left out of the official record.",
    contributors: 51,
    amount: 4100,
    wants: 741,
  },
  {
    id: 4,
    slug: "second-language",
    title: "Second Language",
    genre: "Contemporary",
    description:
      "A story about a first-generation immigrant who moves back to their home country after twenty years abroad, only to find they are now foreign there too. Told through the language gaps — words that exist in one language and not the other, the things that can only be said in one tongue, and what it means to lose fluency in who you used to be.",
    contributors: 19,
    amount: 1200,
    wants: 298,
  },
  {
    id: 5,
    slug: "the-weight-of-small-things",
    title: "The Weight of Small Things",
    genre: "Slice of Life",
    description:
      "A character study set over a single weekend, following five strangers who all share a laundromat in a mid-size city. No dramatic reveals, no grand plot — just the accumulation of small details that make a person legible. Written with warmth and without irony. The kind of story that makes you feel less alone.",
    contributors: 22,
    amount: 1540,
    wants: 433,
  },
];

export default function BountyPage() {
  const totalContributed = BOUNTIES.reduce((sum, b) => sum + b.amount, 0);
  const totalContributors = BOUNTIES.reduce((sum, b) => sum + b.contributors, 0);
  const totalWants = BOUNTIES.reduce((sum, b) => sum + b.wants, 0);

  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      {/* Hero */}
      <Box
        sx={{ bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider", py: { xs: 6, md: 8 } }}
      >
        <Container maxWidth="md">
          <Stack gap={2.5}>
            <Typography variant="overline" color="secondary.main" fontWeight={600} letterSpacing="0.12em">
              Community
            </Typography>
            <Typography variant="h3" fontWeight={800} lineHeight={1.15}>
              Story Bounties
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 540, lineHeight: 1.8 }}>
              Readers pool together to commission the stories they most want to read. Back an existing request — or
              submit your own and see who else is waiting for it.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} mt={0.5}>
              <Button variant="contained" size="large">
                Request a Story
              </Button>
              <HowItWorks />
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Stats */}
      <Container maxWidth="md">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: { xs: 3, sm: 0 },
            py: { xs: 4, sm: 4 },
          }}
        >
          {[
            { label: "Active Bounties", value: BOUNTIES.length },
            { label: "Total Contributors", value: totalContributors },
            { label: "Total Contributed", value: `$${totalContributed.toLocaleString()}` },
            { label: "Readers Interested", value: totalWants.toLocaleString() },
          ].map(({ label, value }) => (
            <Stack key={label} gap={0.5} sx={{ px: { sm: 4 } }}>
              <Typography variant="h5" fontWeight={700} lineHeight={1.2}>
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Container>

      <Divider />

      {/* Bounty list */}
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
        <Stack gap={3}>
          {BOUNTIES.map((bounty) => (
            <BountyCard
              key={bounty.id}
              slug={bounty.slug}
              genre={bounty.genre}
              title={bounty.title}
              description={bounty.description}
              amount={bounty.amount}
              contributors={bounty.contributors}
              wants={bounty.wants}
            />
          ))}
        </Stack>

        {/* Bottom CTA */}
        <Box
          sx={{
            mt: 6,
            p: { xs: 4, sm: 5 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.default",
            textAlign: "center",
          }}
        >
          <Stack gap={2} alignItems="center">
            <Typography variant="overline" color="secondary.main" fontWeight={600} letterSpacing="0.12em">
              Don&apos;t see what you&apos;re looking for?
            </Typography>
            <Typography variant="h5" fontWeight={700} lineHeight={1.3}>
              Request a story you&apos;d love to read
            </Typography>
            <Typography variant="body2" color="text.secondary" lineHeight={1.8} sx={{ maxWidth: 440 }}>
              Submit a bounty request and let the community rally behind it. When a story gets enough backing, writers
              take notice.
            </Typography>
            <Button variant="contained" size="large" sx={{ mt: 1 }}>
              Submit a Bounty Request
            </Button>
          </Stack>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
}
