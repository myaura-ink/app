import { Button, Container, Stack, Typography } from "@mui/material";
import { config } from "@/app/config";

export const Hero = () => {
  return (
    <Container maxWidth="lg" component="section" sx={{ pt: 15, pb: 10, textAlign: "left" }}>
      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: "2.5rem", md: "6rem" },
          letterSpacing: "-0.02em",
          mb: 3,
          color: "primary.main",
        }}
      >
        Join the inner circle of <br />
        <span style={{ fontStyle: "italic", fontWeight: 400 }}>intentional storytelling.</span>
      </Typography>
      <Typography
        variant="h6"
        component="h2"
        sx={{
          color: "text.secondary",
          mb: 4,
          fontWeight: 400,
        }}
      >
        Read stories <strong>nurtured</strong> by readers who believe in a vision and have the means to bring it to
        life.
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button variant="outlined" size="large">
          Coming Soon...
        </Button>
        <Button href={config.socials.discord} variant="contained" size="large">
          Join discord community &rarr;
        </Button>
      </Stack>
    </Container>
  );
};
