import { Box } from "@mui/material";
import { Footer, Hero, Listing, Mission } from "./components";

export default function Home() {
  return (
    <Box component="main">
      <Hero />
      <Listing
        title="Editor's Pick"
        description="Stories handpicked by our editors — bold voices, unexpected worlds, and narratives that stay with you long after the last page."
      />
      <Listing
        overline="Fresh off the press"
        title="Rising Voices"
        description="First-time authors and debut works making waves — stories from writers who have something urgent to say and the craft to say it."
      />
      <Mission />
      <Footer />
    </Box>
  );
}
