import { Box } from "@mui/material";
import { getLatestCreatives } from "@/lib";
import { CallToAction, Footer, Hero, HowItWorks, Listing } from "./components";
import { getUserFromCookie } from "./hooks/getUserFromCookie";

export default async function Home() {
  const [creatives, user] = await Promise.all([getLatestCreatives(10), getUserFromCookie()]);
  // signed-out visitors need an account before they can write
  const writeHref = user ? "/write" : "/dive";

  return (
    <Box component="main">
      <Hero writeHref={writeHref} />
      <Listing
        id="latest"
        overline="Fresh off the press"
        title="Latest works"
        description="The newest stories published on Aura, from debut voices to ongoing serials."
        creatives={creatives}
      />
      <HowItWorks writeHref={writeHref} />
      <CallToAction writeHref={writeHref} />
      <Footer />
    </Box>
  );
}
