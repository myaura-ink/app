import { Box } from "@mui/material";
import type { Metadata } from "next";
import { home } from "@/content";
import { getLatestStories, getReadingHistory } from "@/lib";
import { CallToAction, ContinueReading, Hero, HowItWorks, Listing } from "./components";
import { getUserFromCookie } from "./hooks/getUserFromCookie";
import { buildMetadata } from "./utils";

export const metadata: Metadata = buildMetadata({ ...home, path: "/", absoluteTitle: true });

export default async function Home() {
  const [stories, user] = await Promise.all([getLatestStories(10), getUserFromCookie()]);
  // the one story a returning reader was last in, if any
  const [lastRead] = user ? await getReadingHistory(user.id, 1) : [];
  // signed-out visitors need an account before they can write
  const writeHref = user ? "/write" : "/dive";

  return (
    <Box component="main">
      <Hero writeHref={writeHref} />
      {lastRead && <ContinueReading item={lastRead} />}
      <Listing
        id="latest"
        overline="Fresh off the press"
        title="Latest works"
        description="The newest stories published on Aura, from debut voices to ongoing serials."
        stories={stories}
        viewAllHref="/search"
      />
      <HowItWorks writeHref={writeHref} />
      <CallToAction writeHref={writeHref} />
    </Box>
  );
}
