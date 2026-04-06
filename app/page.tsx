import { Box } from "@mui/material";
import { getLatestCreatives } from "@/lib";
import { Footer, Hero, Listing, Mission } from "./components";

export default async function Home() {
  const creatives = await getLatestCreatives(10);
  return (
    <Box component="main">
      <Hero />
      <Listing
        overline="Fresh off the press"
        title="Rising Voices"
        description="First-time authors and debut works making waves — stories from writers who have something urgent to say and the craft to say it."
        creatives={creatives}
      />
      <Mission />
      <Footer />
    </Box>
  );
}
