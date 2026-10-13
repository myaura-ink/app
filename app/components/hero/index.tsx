import { Button, Container, Link, Stack, Typography } from "@mui/material";
import { config } from "@/app/config";

interface HeroProps {
  writeHref: string;
}

export const Hero = ({ writeHref }: HeroProps) => {
  return (
    <Container maxWidth="lg" component="section" sx={{ pt: { xs: 10, md: 15 }, pb: 10, textAlign: "left" }}>
      <Typography
        variant="overline"
        sx={{
          color: "secondary.dark",
          fontWeight: 600,
          letterSpacing: "0.12em",
        }}
      >
        A home for serialized fiction
      </Typography>
      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "2.5rem", md: "5.5rem" },
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          mt: 1,
          mb: 3,
          color: "primary.main",
        }}
      >
        Write it. Publish it. <br />
        <span style={{ fontStyle: "italic", fontWeight: 400 }}>Find the readers it deserves.</span>
      </Typography>
      <Typography
        variant="h6"
        component="h2"
        sx={{
          color: "text.secondary",
          mb: 4,
          fontWeight: 400,
          maxWidth: 680,
          lineHeight: 1.6,
        }}
      >
        Aura is where authors publish their stories <strong>chapter by chapter</strong>, and readers follow along, save
        the works they love, and leave critiques that help authors grow.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ alignItems: { sm: "center" } }}>
        <Button href={writeHref} variant="contained" size="large">
          Start writing
        </Button>
        <Button href="#latest" variant="outlined" size="large">
          Explore stories
        </Button>
        <Link href={config.socials.discord} underline="hover" sx={{ color: "text.secondary", pl: { sm: 1 } }}>
          Join the community on Discord &rarr;
        </Link>
      </Stack>
    </Container>
  );
};
