import { Box, Container, Divider, Stack, Typography } from "@mui/material";

export const Mission = () => {
  return (
    <Box component="section" sx={{ py: 10, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Box sx={{ flex: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, p: 4 }}>
            <Typography
              variant="overline"
              sx={{
                color: "secondary.main",
                fontWeight: 600,
              }}
            >
              The Discovery Gap
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                mt: 1,
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              Stop writing into the void.
            </Typography>
            <Typography
              component="p"
              variant="body1"
              sx={{
                color: "text.secondary",
                lineHeight: 1.8,
              }}
            >
              Every day, brilliant writing goes unread, buried under noise and algorithms. Aura puts craft first, so
              every work has a chance to find the readers it deserves.
            </Typography>
            <Divider sx={{ my: 3, width: "15%", borderColor: "divider" }} />
            <Typography
              component="p"
              variant="body1"
              sx={{
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              &quot;Aura bridges the gap between creative ambition and intentional readers.&quot;
            </Typography>
          </Box>

          <Box sx={{ flex: 1, border: "1px solid", borderColor: "divider", borderRadius: 2, p: 4 }}>
            <Typography
              variant="overline"
              sx={{
                color: "secondary.main",
                fontWeight: 600,
              }}
            >
              The Missing Piece
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                mt: 1,
                mb: 2,
                lineHeight: 1.2,
              }}
            >
              Stop finding a needle in a haystack.
            </Typography>
            <Typography
              component="p"
              variant="body1"
              sx={{
                color: "text.secondary",
                lineHeight: 1.8,
              }}
            >
              Discover stories worth your time, build your reading list, and leave critiques that help authors grow.
            </Typography>
            <Divider sx={{ my: 3, width: "15%", borderColor: "divider" }} />
            <Typography
              component="p"
              variant="body1"
              sx={{
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              &quot;Aura is the missing piece in the puzzle of storytelling.&quot;
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
