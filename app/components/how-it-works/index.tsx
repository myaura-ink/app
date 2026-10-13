import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface AudienceCardProps {
  icon: ReactNode;
  overline: string;
  title: string;
  points: { title: string; body: string }[];
  cta: { label: string; href: string };
}

const AudienceCard = ({ icon, overline, title, points, cta }: AudienceCardProps) => (
  <Stack
    sx={{
      flex: 1,
      gap: 3,
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      bgcolor: "background.paper",
      p: { xs: 3, md: 4 },
    }}
  >
    <Stack sx={{ gap: 1 }}>
      <Box sx={{ color: "secondary.dark", display: "flex" }}>{icon}</Box>
      <Typography variant="overline" sx={{ color: "secondary.dark", fontWeight: 600 }}>
        {overline}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.2 }}>
        {title}
      </Typography>
    </Stack>

    <Stack component="ul" sx={{ gap: 2.5, m: 0, p: 0, listStyle: "none" }}>
      {points.map((point) => (
        <Box component="li" key={point.title} sx={{ borderLeft: "2px solid", borderColor: "secondary.light", pl: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {point.title}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            {point.body}
          </Typography>
        </Box>
      ))}
    </Stack>

    <Button href={cta.href} variant="outlined" sx={{ alignSelf: "flex-start", mt: "auto" }}>
      {cta.label}
    </Button>
  </Stack>
);

interface HowItWorksProps {
  writeHref: string;
}

export const HowItWorks = ({ writeHref }: HowItWorksProps) => {
  return (
    <Box component="section" sx={{ py: 10, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Stack sx={{ gap: 1, mb: 5, maxWidth: 560 }}>
          <Typography variant="overline" sx={{ color: "secondary.dark", fontWeight: 600 }}>
            How it works
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.2 }}>
            Built for both sides of the page.
          </Typography>
        </Stack>

        <Stack direction={{ xs: "column", md: "row" }} sx={{ gap: 3 }}>
          <AudienceCard
            icon={<EditNoteOutlinedIcon fontSize="large" />}
            overline="For authors"
            title="Publish on your own terms."
            points={[
              {
                title: "Write in Markdown",
                body: "A focused editor with live preview, so you can format as you write.",
              },
              {
                title: "Release chapter by chapter",
                body: "Keep chapters as drafts until they're ready, then publish when you are.",
              },
              {
                title: "Build your portfolio",
                body: "Every work you publish lives on your public portfolio for readers to find.",
              },
            ]}
            cta={{ label: "Start writing", href: writeHref }}
          />
          <AudienceCard
            icon={<AutoStoriesOutlinedIcon fontSize="large" />}
            overline="For readers"
            title="Read with intention."
            points={[
              {
                title: "Discover new voices",
                body: "Browse the latest works across genres, from fantasy to literary fiction.",
              },
              {
                title: "Keep a reading list",
                body: "Save the works you want to follow and come back to them anytime.",
              },
              {
                title: "Leave a critique",
                body: "Rate a work and share thoughtful feedback that helps its author grow.",
              },
            ]}
            cta={{ label: "Explore stories", href: "#latest" }}
          />
        </Stack>
      </Container>
    </Box>
  );
};
