import { Box, Container, Typography } from "@mui/material";
import type { Metadata } from "next";
import { Suspense } from "react";
import { buildMetadata } from "@/app/utils";
import { browseResults } from "@/content";
import { SearchPageClient } from "./client-wrapper";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const query = (typeof params.q === "string" ? params.q : "").trim().slice(0, 60);
  const tags = [params.tag ?? []].flat().slice(0, 3);
  // filtered results are thin, near-duplicate pages; keep only the plain /search in the index
  const filtered = Boolean(query || tags.length);
  return buildMetadata({ ...browseResults({ query, tags }), path: "/search", noindex: filtered });
}

export default function SearchPage() {
  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Box
        sx={{ bgcolor: "background.default", borderBottom: "1px solid", borderColor: "divider", py: { xs: 5, md: 7 } }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="overline"
            sx={{ color: "secondary.main", fontWeight: 600, letterSpacing: "0.12em", display: "block" }}
          >
            Discover
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.15, mt: 1, color: "primary.main" }}>
            Browse stories
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mt: 1.5, maxWidth: 520, lineHeight: 1.8 }}>
            Search by title, author or genre, and narrow it down with tags.
          </Typography>
        </Container>
      </Box>
      {/* useSearchParams needs a suspense boundary */}
      <Suspense>
        <SearchPageClient />
      </Suspense>
    </Box>
  );
}
