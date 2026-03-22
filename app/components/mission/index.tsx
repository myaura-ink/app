import { Box, Container, Divider, Stack, Typography } from "@mui/material";

export const Mission = () => {
  return (
    <Box component="section" className="py-20 bg-[#fdfcf8] space-y-20">
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Container sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
            <Typography variant="overline" color="secondary.main" fontWeight={600}>
              THE DISCOVERY GAP
            </Typography>
            <Typography variant="h3" fontWeight={600} color="primary.main">
              Stop writing into the void.
            </Typography>
            <Typography mt={2} component="p" variant="body1" color="text.secondary">
              Every day, brilliant creativity is lost because writers are forced to guess what the world wants.
              Meanwhile, readers search for specific arcs and characters that simply don&apos;t exist yet.
            </Typography>
            <Divider sx={{ width: "16%", borderColor: "stone.300", mb: 4 }} />
            <Typography component="p" variant="body1" color="text.secondary" className="italic">
              &quot;Aura bridges the gap between creative ambition and intentional demand.&quot;
            </Typography>
          </Container>

          <Container sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2 }}>
            <Typography variant="overline" color="secondary.main" fontWeight={600}>
              THE MISSING PIECE
            </Typography>
            <Typography variant="h3" fontWeight={600} color="primary.main">
              Stop finding a needle in a haystack.
            </Typography>
            <Typography mt={2} component="p" variant="body1" color="text.secondary">
              Tell the creator what you want to bring to life. Help writers find their muse.
            </Typography>
            <Divider sx={{ width: "16%", borderColor: "stone.300", mb: 4 }} />
            <Typography component="p" variant="body1" color="text.secondary" className="italic">
              &quot;Aura is the missing piece in the puzzle of storytelling.&quot;
            </Typography>
          </Container>
        </Stack>
      </Container>
    </Box>
  );
};
