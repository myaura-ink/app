import { Box, Container, Typography } from "@mui/material";
import { Footer, Listing } from "@/app/components";

export default function ExplorePage() {
  return (
    <Box component="main" sx={{ bgcolor: "background.paper" }}>
      <Box sx={{ bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Typography variant="overline" color="secondary.main" fontWeight={600} letterSpacing="0.12em" display="block">
            Discover
          </Typography>
          <Typography variant="h3" fontWeight={800} lineHeight={1.15} mt={1}>
            Explore Stories
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 520, lineHeight: 1.8 }}>
            Browse the full catalogue — from debut voices to seasoned authors, across every genre we carry.
          </Typography>
        </Container>
      </Box>

      <Listing
        overline="Editor's Pick"
        title="Best of the Month"
        description="Stories handpicked by our editors — bold voices, unexpected worlds, and narratives that stay with you long after the last page."
      />
      <Listing
        overline="Fresh off the press"
        title="Rising Voices"
        description="First-time authors and debut works making waves — stories from writers who have something urgent to say and the craft to say it."
      />
      <Listing
        overline="Science Fiction"
        title="Futures & Machines"
        description="Speculative fiction that uses tomorrow to interrogate today — AI, climate, consciousness, and the shape of what comes next."
      />
      <Listing
        overline="Literary Fiction"
        title="The Quiet Ones"
        description="Slow, precise, and devastating. Stories that trust the reader to sit with ambiguity and find meaning in the ordinary."
      />
      <Listing
        overline="Fantasy"
        title="Other Worlds"
        description="Secondary worlds, mythologies reimagined, and the kind of magic that feels like it has real weight and consequence."
      />
      <Listing
        overline="Short Fiction"
        title="One Sitting Reads"
        description="Complete in a single hour. Stories that prove length has nothing to do with how much a piece of writing can hold."
      />

      <Footer />
    </Box>
  );
}
