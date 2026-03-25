import { Box, Container, Divider, Stack, Typography } from "@mui/material";

export const Mission = () => {
  return (
    <Box component="section" sx={{ py: 10, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Box sx={{ flex: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, p: 4 }}>
            <Typography variant="overline" color="secondary.main" fontWeight={600}>
              The Discovery Gap
            </Typography>
            <Typography variant="h3" fontWeight={700} color="primary.main" mt={1} mb={2} lineHeight={1.2}>
              Stop writing into the void.
            </Typography>
            <Typography component="p" variant="body1" color="text.secondary" lineHeight={1.8}>
              Every day, brilliant creativity is lost because writers are forced to guess what the world wants.
              Meanwhile, readers search for specific arcs and characters that simply don&apos;t exist yet.
            </Typography>
            <Divider sx={{ my: 3, width: "15%", borderColor: "divider" }} />
            <Typography component="p" variant="body1" color="text.secondary" fontStyle="italic">
              &quot;Aura bridges the gap between creative ambition and intentional demand.&quot;
            </Typography>
          </Box>

          <Box sx={{ flex: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, p: 4 }}>
            <Typography variant="overline" color="secondary.main" fontWeight={600}>
              The Missing Piece
            </Typography>
            <Typography variant="h3" fontWeight={700} color="primary.main" mt={1} mb={2} lineHeight={1.2}>
              Stop finding a needle in a haystack.
            </Typography>
            <Typography component="p" variant="body1" color="text.secondary" lineHeight={1.8}>
              Tell the creator what you want to bring to life. Help writers find their muse.
            </Typography>
            <Divider sx={{ my: 3, width: "15%", borderColor: "divider" }} />
            <Typography component="p" variant="body1" color="text.secondary" fontStyle="italic">
              &quot;Aura is the missing piece in the puzzle of storytelling.&quot;
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
