import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { config } from "@/app/config";

interface CallToActionProps {
  writeHref: string;
}

export const CallToAction = ({ writeHref }: CallToActionProps) => {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, bgcolor: "primary.dark" }}>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            color: "common.white",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          Every story starts with <span style={{ fontStyle: "italic", fontWeight: 400 }}>a first chapter.</span>
        </Typography>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)", mt: 2, mb: 4, lineHeight: 1.75 }}>
          Create an account and publish your first work today, or join other authors and readers on Discord.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "center" }}>
          <Button
            href={writeHref}
            variant="contained"
            size="large"
            // light brass reads better than the text-weight accent on the dark brand panel
            sx={{
              bgcolor: "secondary.light",
              color: "#1f170b",
              "&:hover": { bgcolor: "secondary.light", opacity: 0.9 },
            }}
          >
            Start writing
          </Button>
          <Button
            href={config.socials.discord}
            variant="outlined"
            size="large"
            sx={{ color: "common.white", borderColor: "rgba(255,255,255,0.4)" }}
          >
            Join Discord
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};
