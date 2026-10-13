import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { SupportPanel } from "@/app/components";
import { buildMetadata } from "@/app/utils";
import { roadmap } from "@/content";

export const metadata: Metadata = buildMetadata({ ...roadmap, path: "/roadmap" });

type Status = "live" | "in-progress" | "planned";

interface Feature {
  title: string;
  body: string;
  status?: Status;
}

interface Phase {
  overline: string;
  title: string;
  description: string;
  features: Feature[];
}

const STATUS_CHIP: Record<Status, { label: string; color: "success" | "secondary" | "default" }> = {
  live: { label: "Live", color: "success" },
  "in-progress": { label: "In progress", color: "secondary" },
  planned: { label: "Planned", color: "default" },
};

const PRINCIPLES: { title: string; body: string }[] = [
  {
    title: "Free at the core",
    body: "Reading, writing, critiquing and discovery are never paywalled. No paying to promote.",
  },
  { title: "No ads", body: "Not now, not later." },
  {
    title: "Human-made",
    body: "Aura isn't built on generative AI, and AI-generated works are disclosed, never promoted.",
  },
  {
    title: "Clear, stable policies",
    body: "Short, readable rules that are easy to find and enforced consistently.",
  },
  { title: "Lightweight", body: "Fast on old devices, and nothing breaks across browser updates." },
  {
    title: "Authors over metrics",
    body: "Discovery rewards quality and gives new authors a fair shot, not just whatever is already popular.",
  },
];

const PHASES: Phase[] = [
  {
    overline: "Now",
    title: "Launch essentials",
    description: "The foundations a writing community can't do without.",
    features: [
      {
        title: "Critiques & star ratings",
        body: "Constructive feedback is the core loop between authors and readers.",
        status: "live",
      },
      { title: "Library", body: "Save the stories you follow and come back to them anytime.", status: "live" },
      {
        title: "Tagging",
        body: "Genre, sub-genre, tropes and content warnings on every work, powering search and filtering.",
        status: "in-progress",
      },
      {
        title: "Content ratings & warnings",
        body: "Every work is rated general, teen, mature or explicit, with warnings. Mis-tagged works can be reported.",
      },
      {
        title: "Mature content toggle",
        body: "Explicit works are hidden by default and readers opt in, without censoring authors.",
      },
      { title: "AI disclosure", body: "Authors declare AI-assisted or AI-generated text and covers." },
      {
        title: "Better discovery",
        body: "Fresh releases, most appreciated, most read and most critiqued views on the home page.",
      },
      {
        title: "Trending by genre",
        body: "Trending per genre group, so one dominant genre can't bury the rest.",
      },
      { title: "New author shelf", body: "A dedicated spot for debut and low-read works." },
      {
        title: "A reliable editor",
        body: "Autosave, no draft expiry and no silent data loss. Writing on Aura must be safe.",
      },
    ],
  },
  {
    overline: "Next",
    title: "Soon after launch",
    description: "Making it easier to move in, and keeping the community healthy.",
    features: [
      {
        title: "Bulk import",
        body: "Bring an entire library over from docx, Markdown or Google Docs in one go.",
      },
      { title: "Bulk export", body: "Export all your works and drafts in one click. You own your work." },
      {
        title: "Weighted ratings",
        body: "Readers who read and critique more carry more weight in ratings.",
      },
      {
        title: "Community AI flagging",
        body: "Trusted readers can flag suspected AI works; every flag goes to human review.",
      },
      { title: "Block and mute", body: "Mute hides someone from you; block stops them interacting with you." },
      { title: "Spellcheck that cooperates", body: "The editor never fights your browser or device spellcheck." },
      { title: "Human support", body: "A real, reachable person for bugs and account issues." },
    ],
  },
  {
    overline: "Later",
    title: "Nice to have",
    description: "Features that make Aura a richer place to write and read.",
    features: [
      {
        title: "Multiple drafts",
        body: "Publish labelled versions of a chapter so readers can see your process, and rewrites never lose old words.",
      },
      {
        title: "Inline annotations",
        body: "Footnote-style tooltips for glossaries, lore and translations, without leaving the page.",
      },
      {
        title: "Top reader recognition",
        body: "Badges, early access and featured critiques for the most active readers.",
      },
      {
        title: "Community curation",
        body: "Reader votes help decide what gets featured.",
      },
      {
        title: "Reader & author modes",
        body: "A clean reading-only interface, with the writing workspace on top for authors.",
      },
    ],
  },
  {
    overline: "Exploring",
    title: "On the horizon",
    description: "Ideas we're thinking through carefully before committing.",
    features: [
      { title: "Reader tips", body: "Small, optional tips to authors. Never gating content." },
      {
        title: "Optional paid works",
        body: "Authors can choose to monetize specific works. Free remains the default.",
      },
      {
        title: "Mobile app",
        body: "Web comes first. An app needs a clear plan for app store rules around mature content.",
      },
    ],
  },
];

const NOT_DOING = [
  "A social feed or timeline. The focus stays on works and critiques, not engagement farming.",
  "Pay-to-promote, or paying for basic features.",
];

const SectionHeading = ({
  overline,
  title,
  description,
}: {
  overline: string;
  title: string;
  description?: string;
}) => (
  <Stack sx={{ gap: 1, mb: 4, maxWidth: 560 }}>
    <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 600 }}>
      {overline}
    </Typography>
    <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.2 }}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
        {description}
      </Typography>
    )}
  </Stack>
);

const FeatureCard = ({ title, body, status = "planned" }: Feature) => {
  const chip = STATUS_CHIP[status];
  return (
    <Stack
      component="li"
      sx={{
        gap: 1,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        p: 2.5,
      }}
    >
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
          {title}
        </Typography>
        <Chip
          label={chip.label}
          color={chip.color}
          size="small"
          variant={status === "planned" ? "outlined" : "filled"}
          sx={{ flexShrink: 0 }}
        />
      </Stack>
      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
        {body}
      </Typography>
    </Stack>
  );
};

export default function RoadmapPage() {
  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Box
        sx={{ bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider", py: { xs: 5, md: 7 } }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{ color: "secondary.main", fontWeight: 600, letterSpacing: "0.12em", display: "block" }}
          >
            Roadmap
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 1, color: "primary.main" }}>
            What we're building
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mt: 1.5, maxWidth: 560, lineHeight: 1.8 }}>
            Aura's roadmap is shaped by feedback from authors and readers. Here's what's live, what's in the works, and
            what's coming next.
          </Typography>
          <Button
            href="#support"
            variant="outlined"
            color="secondary"
            startIcon={<FavoriteBorderIcon />}
            sx={{ mt: 3, borderRadius: 999, px: 2.5 }}
          >
            Show your support
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Box sx={{ mb: { xs: 8, md: 10 } }}>
          <SupportPanel />
        </Box>

        <Box component="section" sx={{ mb: { xs: 8, md: 10 } }}>
          <SectionHeading
            overline="Principles"
            title="What every feature has to respect."
            description="These aren't features. They're the stance behind everything on this page."
          />
          <Box
            component="ul"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
              gap: 3,
              m: 0,
              p: 0,
              listStyle: "none",
            }}
          >
            {PRINCIPLES.map((principle) => (
              <Box
                component="li"
                key={principle.title}
                sx={{ borderLeft: "2px solid", borderColor: "secondary.light", pl: 2 }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {principle.title}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {principle.body}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Stack sx={{ gap: { xs: 8, md: 10 } }}>
          {PHASES.map((phase) => (
            <Box component="section" key={phase.overline}>
              <SectionHeading overline={phase.overline} title={phase.title} description={phase.description} />
              <Box
                component="ul"
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" },
                  gap: 2,
                  m: 0,
                  p: 0,
                  listStyle: "none",
                }}
              >
                {phase.features.map((feature) => (
                  <FeatureCard key={feature.title} {...feature} />
                ))}
              </Box>
            </Box>
          ))}

          <Box component="section">
            <SectionHeading overline="Not doing" title="What Aura won't become." />
            <Stack component="ul" sx={{ gap: 1.5, m: 0, pl: 2.5 }}>
              {NOT_DOING.map((item) => (
                <Typography component="li" variant="body1" key={item} sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                  {item}
                </Typography>
              ))}
            </Stack>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
