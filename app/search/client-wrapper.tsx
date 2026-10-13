"use client";

import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { StoryCard } from "@/app/components";
import { useClearSearchHistory, useRecordSearch, useRemoveSearchEntry, useSearchHistory } from "@/app/hooks/useHistory";
import { useSearchStories, useTagSuggestions } from "@/app/hooks/useStories";
import { normalizeTag } from "@/lib/utils/tags";

const QUERY_DEBOUNCE_MS = 350;
const POPULAR_TAG_COUNT = 10;
// roughly the first row on desktop / first screen on phones
const EAGER_COVER_COUNT = 6;

const GRID_SX = {
  display: { xs: "none", sm: "grid" },
  gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
  gap: 2.5,
} as const;

export const SearchPageClient = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const tagsParam = searchParams.getAll("tag").join(",");
  const activeTags = useMemo(
    () => [
      ...new Set(
        tagsParam
          .split(",")
          .filter(Boolean)
          .map((t) => normalizeTag(t).slug)
          .filter(Boolean),
      ),
    ],
    [tagsParam],
  );

  const updateUrl = (next: { q?: string; tags?: string[] }) => {
    const params = new URLSearchParams();
    const q = (next.q ?? query).trim();
    if (q) params.set("q", q);
    for (const tag of next.tags ?? activeTags) params.append("tag", tag);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // the text box updates the URL after a pause, so typing doesn't fire a request per keystroke
  const [input, setInput] = useState(query);
  // queries this page has pushed to the URL that haven't landed yet. Anything else
  // (back button, a tag link) is an outside change the text box should adopt, but a
  // slow navigation must not overwrite what the reader typed since
  const pendingQueries = useRef(new Set<string>());
  const pushQuery = (value: string, tags = activeTags) => {
    if (value.trim() !== query) pendingQueries.current.add(value.trim());
    updateUrl({ q: value, tags });
  };
  // biome-ignore lint/correctness/useExhaustiveDependencies: reacts to URL changes only, reading input as of then
  useEffect(() => {
    if (pendingQueries.current.has(query)) {
      if (query === input.trim()) pendingQueries.current.clear();
      return;
    }
    pendingQueries.current.clear();
    setInput(query);
  }, [query]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: pushQuery is recreated every render; tagsParam covers what it reads
  useEffect(() => {
    if (input.trim() === query) return;
    const timer = setTimeout(() => pushQuery(input), QUERY_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [input, query, tagsParam]);

  // tag changes carry the typed text along, so a pending debounce can't drop them
  const addTag = (slug: string) => !activeTags.includes(slug) && pushQuery(input, [...activeTags, slug]);
  const removeTag = (slug: string) =>
    pushQuery(
      input,
      activeTags.filter((t) => t !== slug),
    );
  const clearAll = () => {
    pendingQueries.current.clear();
    setInput("");
    router.replace(pathname, { scroll: false });
  };

  // a search counts once the reader commits to it (enter, or opening a result), not on every keystroke
  const { mutate: recordSearch } = useRecordSearch();
  const { data: recentSearches } = useSearchHistory();
  const removeSearch = useRemoveSearchEntry();
  const clearSearches = useClearSearchHistory();
  const runSearch = (value: string) => {
    setInput(value);
    pushQuery(value);
    recordSearch(value);
  };

  const { data: popularTags } = useTagSuggestions("");
  const suggestedTags = (popularTags ?? [])
    .filter((t) => !activeTags.includes(t.slug) && (t.uses ?? 0) > 0)
    .slice(0, POPULAR_TAG_COUNT);

  const { data, isPending, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useSearchStories(
    query,
    activeTags,
  );
  const items = data?.pages.flatMap((page) => page.items) ?? [];

  // load the next page when the sentinel below the results scrolls into view
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const hasFilters = !!query || activeTags.length > 0;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      <Stack sx={{ gap: 2, mb: 4 }}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (input.trim() !== query) pushQuery(input);
            recordSearch(input);
          }}
          placeholder="Search stories, authors, genres…"
          slotProps={{
            htmlInput: { "aria-label": "Search stories", maxLength: 100 },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
              endAdornment: input ? (
                <InputAdornment position="end">
                  <IconButton size="small" aria-label="Clear search" onClick={() => setInput("")}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
              sx: { borderRadius: 3, bgcolor: "background.default" },
            },
          }}
        />

        {!input.trim() && !!recentSearches?.length && (
          <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mr: 0.5 }}>
              Recent
            </Typography>
            {recentSearches.slice(0, 8).map((item) => (
              <Chip
                key={item.id}
                icon={<HistoryIcon />}
                label={item.query}
                size="small"
                variant="outlined"
                clickable
                onClick={() => runSearch(item.query)}
                onDelete={() => removeSearch.mutate(item.id)}
              />
            ))}
            <Button size="small" onClick={() => clearSearches.mutate()} disabled={clearSearches.isPending}>
              Clear
            </Button>
          </Stack>
        )}

        {activeTags.length > 0 && (
          <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mr: 0.5 }}>
              Tagged
            </Typography>
            {activeTags.map((slug) => (
              <Chip
                key={slug}
                label={`#${slug.replace(/-/g, " ")}`}
                color="primary"
                size="small"
                onDelete={() => removeTag(slug)}
              />
            ))}
            <Button size="small" onClick={clearAll} sx={{ ml: "auto" }}>
              Clear all
            </Button>
          </Stack>
        )}

        {suggestedTags.length > 0 && (
          <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mr: 0.5 }}>
              {activeTags.length ? "Narrow by" : "Popular tags"}
            </Typography>
            {suggestedTags.map((tag) => (
              <Chip
                key={tag.slug}
                label={`#${tag.name}`}
                size="small"
                variant="outlined"
                clickable
                onClick={() => addTag(tag.slug)}
              />
            ))}
          </Stack>
        )}
      </Stack>

      <Divider sx={{ mb: 4 }} />

      {isPending ? (
        <ResultsSkeleton />
      ) : isError ? (
        <Stack sx={{ alignItems: "center", py: 8, gap: 2 }}>
          <Typography sx={{ color: "text.secondary" }}>{error.message || "Couldn't load stories."}</Typography>
          <Button variant="outlined" onClick={() => refetch()}>
            Try again
          </Button>
        </Stack>
      ) : items.length === 0 ? (
        <Stack sx={{ alignItems: "center", py: 8, gap: 2, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            No stories found
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 420 }}>
            {hasFilters
              ? "Nothing matches these filters yet. Try fewer tags or a different search."
              : "No works published yet. Yours could be the first."}
          </Typography>
          {hasFilters && (
            <Button variant="outlined" onClick={clearAll}>
              Clear filters
            </Button>
          )}
        </Stack>
      ) : (
        <Box
          onClickCapture={(e) => {
            // opening a result is a good sign the search was worth keeping
            if (query && (e.target as HTMLElement).closest('a[href^="/story/"]')) recordSearch(query);
          }}
        >
          <Box sx={GRID_SX}>
            {items.map((story, i) => (
              <StoryCard key={story.id} {...story} size="fluid" eager={i < EAGER_COVER_COUNT} />
            ))}
          </Box>
          <Stack divider={<Divider />} sx={{ display: { xs: "flex", sm: "none" } }}>
            {items.map((story, i) => (
              <StoryCard key={story.id} {...story} variant="list" eager={i < EAGER_COVER_COUNT} />
            ))}
          </Stack>

          <Box ref={sentinelRef} sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            {isFetchingNextPage ? (
              <CircularProgress size={28} />
            ) : hasNextPage ? (
              // fallback for when the observer doesn't fire, e.g. very tall screens
              <Button variant="outlined" onClick={() => fetchNextPage()}>
                Load more
              </Button>
            ) : (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                You've reached the end.
              </Typography>
            )}
          </Box>
        </Box>
      )}
    </Container>
  );
};

const ResultsSkeleton = () => (
  <Box sx={{ ...GRID_SX, display: "grid" }}>
    {Array.from({ length: 8 }, (_, i) => (
      <Stack key={i} sx={{ gap: 1 }}>
        <Skeleton variant="rounded" sx={{ width: "100%", height: "auto", aspectRatio: "5 / 7", borderRadius: 2 }} />
        <Skeleton width="80%" />
        <Skeleton width="50%" />
      </Stack>
    ))}
  </Box>
);
