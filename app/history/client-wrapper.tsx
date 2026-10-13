"use client";

import CloseIcon from "@mui/icons-material/Close";
import HistoryIcon from "@mui/icons-material/History";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useState } from "react";
import {
  useClearReadingHistory,
  useClearSearchHistory,
  useReadingHistory,
  useRemoveReadingEntry,
  useRemoveSearchEntry,
  useSearchHistory,
} from "@/app/hooks/useHistory";
import { formatRelativeTime } from "@/app/utils";
import type { ReadingHistoryItem, SearchHistoryItem } from "@/lib";

// same placeholder as the story cards and story page
const coverSrc = (slug: string, coverImage: string | null) =>
  coverImage || `https://picsum.photos/seed/${slug}/500/700`;

const clamp = (lines: number) => ({
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical" as const,
});

export const HistoryPageClient = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        <Typography
          variant="overline"
          sx={{ color: "secondary.main", fontWeight: 600, letterSpacing: "0.12em", display: "block" }}
        >
          Your activity
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2, mt: 1 }}>
          History
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
          Only you can see this. Remove anything you don&apos;t want kept.
        </Typography>

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 4, borderBottom: 1, borderColor: "divider" }}>
          <Tab label="Reading" />
          <Tab label="Searches" />
        </Tabs>

        <Box sx={{ pt: 2 }}>{tab === 0 ? <ReadingTab /> : <SearchesTab />}</Box>
      </Container>
    </Box>
  );
};

// ─── Reading ────────────────────────────────────────────────────────────────

const ReadingTab = () => {
  const { data: items, isPending, isError, error } = useReadingHistory();
  const removeEntry = useRemoveReadingEntry();
  const clearAll = useClearReadingHistory();

  if (isPending) return <RowsSkeleton cover />;
  if (isError) return <Message>{error.message || "Couldn't load your reading history."}</Message>;
  if (items.length === 0) {
    return (
      <Message
        action={
          <Button component={NextLink} href="/search" variant="outlined">
            Browse stories
          </Button>
        }
      >
        Stories you read will show up here, so you can pick up where you left off.
      </Message>
    );
  }

  return (
    <>
      <ClearAllBar
        countLabel={`${items.length} ${items.length === 1 ? "story" : "stories"}`}
        title="Clear reading history?"
        body="You'll lose your place and read marks in every story. Your library isn't affected."
        pending={clearAll.isPending}
        onConfirm={() => clearAll.mutateAsync()}
      />
      <Stack divider={<Divider />}>
        {items.map((item) => (
          <ReadingRow key={item.story.id} item={item} onRemove={() => removeEntry.mutate(item.story.id)} />
        ))}
      </Stack>
    </>
  );
};

const ReadingRow = ({ item, onRemove }: { item: ReadingHistoryItem; onRemove: () => void }) => {
  const { story, chapter } = item;
  const storyHref = `/story/${story.slug}`;
  const continueHref = chapter ? `${storyHref}/chapter/${chapter.slug}` : storyHref;

  return (
    <Stack direction="row" sx={{ gap: 2, py: 2, alignItems: "center" }}>
      <Box
        component={NextLink}
        href={storyHref}
        sx={{
          position: "relative",
          width: 56,
          aspectRatio: "5 / 7",
          flexShrink: 0,
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Image src={coverSrc(story.slug, story.coverImage)} alt="" fill sizes="56px" style={{ objectFit: "cover" }} />
      </Box>

      <Stack sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
        <Typography
          component={NextLink}
          href={storyHref}
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            textDecoration: "none",
            "&:hover": { color: "primary.main" },
            ...clamp(1),
          }}
        >
          {story.title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", ...clamp(1) }}>
          {chapter
            ? `Chapter ${chapter.number} of ${item.totalChapters} · ${chapter.title}`
            : "That chapter is no longer available"}
        </Typography>
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {story.author.name ?? story.author.slug} · read {formatRelativeTime(item.readAt)}
        </Typography>
      </Stack>

      <Button
        component={NextLink}
        href={continueHref}
        size="small"
        variant="outlined"
        sx={{ flexShrink: 0, display: { xs: "none", sm: "inline-flex" } }}
      >
        {chapter ? "Continue" : "Open story"}
      </Button>
      <RemoveButton label={`Remove ${story.title} from history`} onClick={onRemove} />
    </Stack>
  );
};

// ─── Searches ───────────────────────────────────────────────────────────────

const SearchesTab = () => {
  const { data: items, isPending, isError, error } = useSearchHistory();
  const removeEntry = useRemoveSearchEntry();
  const clearAll = useClearSearchHistory();

  if (isPending) return <RowsSkeleton />;
  if (isError) return <Message>{error.message || "Couldn't load your searches."}</Message>;
  if (items.length === 0) return <Message>Searches you make will show up here.</Message>;

  return (
    <>
      <ClearAllBar
        countLabel={`${items.length} ${items.length === 1 ? "search" : "searches"}`}
        title="Clear search history?"
        body="All of your saved searches will be removed."
        pending={clearAll.isPending}
        onConfirm={() => clearAll.mutateAsync()}
      />
      <Stack divider={<Divider />}>
        {items.map((item) => (
          <SearchRow key={item.id} item={item} onRemove={() => removeEntry.mutate(item.id)} />
        ))}
      </Stack>
    </>
  );
};

const SearchRow = ({ item, onRemove }: { item: SearchHistoryItem; onRemove: () => void }) => (
  <Stack direction="row" sx={{ gap: 1.5, py: 1.25, alignItems: "center" }}>
    <HistoryIcon fontSize="small" sx={{ color: "text.disabled", flexShrink: 0 }} />
    <Typography
      component={NextLink}
      href={`/search?q=${encodeURIComponent(item.query)}`}
      variant="body2"
      sx={{
        flex: 1,
        minWidth: 0,
        color: "text.primary",
        textDecoration: "none",
        "&:hover": { color: "primary.main" },
        ...clamp(1),
      }}
    >
      {item.query}
    </Typography>
    <Typography variant="caption" sx={{ color: "text.disabled", flexShrink: 0 }}>
      {formatRelativeTime(item.searchedAt)}
    </Typography>
    <RemoveButton label={`Remove search ${item.query}`} onClick={onRemove} />
  </Stack>
);

// ─── Shared ─────────────────────────────────────────────────────────────────

const RemoveButton = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Tooltip title="Remove">
    <IconButton size="small" aria-label={label} onClick={onClick} sx={{ color: "text.disabled", flexShrink: 0 }}>
      <CloseIcon fontSize="small" />
    </IconButton>
  </Tooltip>
);

const ClearAllBar = ({
  countLabel,
  title,
  body,
  pending,
  onConfirm,
}: {
  countLabel: string;
  title: string;
  body: string;
  pending: boolean;
  onConfirm: () => Promise<unknown>;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", pb: 1 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {countLabel}
        </Typography>
        <Button size="small" color="inherit" onClick={() => setOpen(true)} sx={{ color: "text.secondary" }}>
          Clear all
        </Button>
      </Stack>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{body} This can&apos;t be undone.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" color="inherit" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            disabled={pending}
            onClick={() =>
              onConfirm().then(
                () => setOpen(false),
                () => undefined,
              )
            }
          >
            {pending ? "Clearing…" : "Clear all"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Message = ({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) => (
  <Stack sx={{ alignItems: "center", textAlign: "center", py: 8, gap: 2 }}>
    <Typography sx={{ color: "text.secondary", maxWidth: 420 }}>{children}</Typography>
    {action}
  </Stack>
);

const RowsSkeleton = ({ cover = false }: { cover?: boolean }) => (
  <Stack divider={<Divider />}>
    {Array.from({ length: 4 }, (_, i) => (
      <Stack key={i} direction="row" sx={{ gap: 2, py: 2, alignItems: "center" }}>
        {cover && <Skeleton variant="rounded" width={56} height={78} />}
        <Stack sx={{ flex: 1, gap: 0.5 }}>
          <Skeleton width="45%" />
          <Skeleton width="70%" />
        </Stack>
      </Stack>
    ))}
  </Stack>
);
