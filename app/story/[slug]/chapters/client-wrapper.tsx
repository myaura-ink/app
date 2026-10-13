"use client";

import AddIcon from "@mui/icons-material/Add";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Slide,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { type DragEvent, useEffect, useMemo, useState } from "react";
import { ChapterCreate, ChapterEdit } from "@/app/components";
import { useDeleteChapters, useReorderChapters, useSetChaptersPublished } from "@/app/hooks/useStories";
import { formatDate } from "@/app/utils";
import type { ManagedChapter } from "@/lib";

type Filter = "all" | "published" | "drafts";

interface Props {
  slug: string;
  storyTitle: string;
  chapters: ManagedChapter[];
}

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export const ManageChaptersClient = ({ slug, storyTitle, chapters }: Props) => {
  const router = useRouter();
  const reorder = useReorderChapters(slug);
  const setPublished = useSetChaptersPublished(slug);
  const deleteChapters = useDeleteChapters(slug);

  // local reading order; differs from the server's until saved
  const [items, setItems] = useState(chapters);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<ManagedChapter | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string[] | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  // fresh server data (after any save) replaces local state and drops vanished selections
  useEffect(() => {
    setItems(chapters);
    setSelected((prev) => new Set([...prev].filter((id) => chapters.some((ch) => ch.id === id))));
  }, [chapters]);

  const orderChanged = useMemo(() => items.some((ch, i) => ch.id !== chapters[i]?.id), [items, chapters]);
  const busy = reorder.isPending || setPublished.isPending || deleteChapters.isPending;

  const publishedCount = chapters.filter((ch) => ch.published === 1).length;
  const draftCount = chapters.length - publishedCount;

  const visible = items.filter(
    (ch) => filter === "all" || (filter === "published" ? ch.published === 1 : ch.published === 0),
  );
  // reordering only makes sense on the full list
  const canReorder = filter === "all" && !busy;

  const allVisibleSelected = visible.length > 0 && visible.every((ch) => selected.has(ch.id));
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAllVisible = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      for (const ch of visible) {
        if (allVisibleSelected) next.delete(ch.id);
        else next.add(ch.id);
      }
      return next;
    });

  const selectedIds = [...selected];
  const selectedChapters = items.filter((ch) => selected.has(ch.id));

  const moveBy = (id: string, delta: number) => {
    const from = items.findIndex((ch) => ch.id === id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= items.length) return;
    setItems(move(items, from, to));
  };

  // live reordering: the dragged row moves as it passes over others. It only swaps once
  // the pointer crosses the middle of the row it's over; swapping on the edge makes the
  // two rows trade places back and forth while the pointer sits near the boundary
  const onDragOver = (e: DragEvent<HTMLElement>, overId: string) => {
    if (!dragId) return;
    e.preventDefault();
    if (dragId === overId) return;
    const from = items.findIndex((ch) => ch.id === dragId);
    const to = items.findIndex((ch) => ch.id === overId);
    if (from < 0 || to < 0) return;
    const { top, height } = e.currentTarget.getBoundingClientRect();
    const pastMiddle = from < to ? e.clientY > top + height / 2 : e.clientY < top + height / 2;
    if (pastMiddle) setItems(move(items, from, to));
  };
  const endDrag = () => setDragId(null);

  return (
    <>
      {/* Header */}
      <Stack sx={{ gap: 2, mb: 4 }}>
        <Button
          component={NextLink}
          href={`/story/${slug}?tab=chapters`}
          size="small"
          color="inherit"
          startIcon={<ArrowBack />}
          sx={{ alignSelf: "flex-start", color: "text.secondary", ml: -1 }}
        >
          Back to story
        </Button>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{ gap: 2, alignItems: { xs: "flex-start", sm: "flex-end" }, justifyContent: "space-between" }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 600, letterSpacing: "0.12em" }}>
              Manage chapters
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              {storyTitle}
            </Typography>
          </Box>
          <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => setCreating(true)}>
            New chapter
          </Button>
        </Stack>

        {/* Status overview */}
        <Stack direction="row" sx={{ gap: 1.5, flexWrap: "wrap" }}>
          <StatTile label="Chapters" value={chapters.length} />
          <StatTile label="Published" value={publishedCount} tone="primary" />
          <StatTile label="Drafts" value={draftCount} tone="muted" />
        </Stack>
      </Stack>

      {/* Toolbar: filter + bulk actions */}
      <Paper
        variant="outlined"
        sx={{
          position: "sticky",
          top: { xs: 64, sm: 72 },
          zIndex: 3,
          mb: 1.5,
          px: 1,
          py: 0.75,
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          borderRadius: 2,
          bgcolor: selected.size ? "background.default" : "background.paper",
        }}
      >
        <Checkbox
          size="small"
          checked={allVisibleSelected}
          indeterminate={!allVisibleSelected && visible.some((ch) => selected.has(ch.id))}
          onChange={toggleAllVisible}
          disabled={visible.length === 0}
          slotProps={{ input: { "aria-label": "Select all shown chapters" } }}
        />
        {selected.size > 0 ? (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, mr: "auto" }}>
              {selected.size} selected
            </Typography>
            <Button
              size="small"
              startIcon={<VisibilityOutlinedIcon />}
              disabled={busy || selectedChapters.every((ch) => ch.published === 1)}
              onClick={() => setPublished.mutate({ ids: selectedIds, published: true })}
            >
              Publish
            </Button>
            <Button
              size="small"
              color="inherit"
              startIcon={<VisibilityOffOutlinedIcon />}
              disabled={busy || selectedChapters.every((ch) => ch.published === 0)}
              onClick={() => setPublished.mutate({ ids: selectedIds, published: false })}
            >
              Unpublish
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              disabled={busy}
              onClick={() => setConfirmDelete(selectedIds)}
            >
              Delete
            </Button>
            <Button
              size="small"
              color="inherit"
              onClick={() => setSelected(new Set())}
              sx={{ color: "text.secondary" }}
            >
              Clear
            </Button>
          </>
        ) : (
          <>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={filter}
              onChange={(_, value: Filter | null) => value && setFilter(value)}
              sx={{ mr: "auto", "& .MuiToggleButton-root": { textTransform: "none", px: 1.5, py: 0.25 } }}
            >
              <ToggleButton value="all">All</ToggleButton>
              <ToggleButton value="published">Published</ToggleButton>
              <ToggleButton value="drafts">Drafts</ToggleButton>
            </ToggleButtonGroup>
            {filter === "all" && chapters.length > 1 && (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", pr: 1, display: { xs: "none", sm: "block" } }}
              >
                Drag <DragIndicatorIcon sx={{ fontSize: 14, verticalAlign: "-3px" }} /> or use the arrows to reorder
              </Typography>
            )}
          </>
        )}
      </Paper>

      {/* Unsaved order: floats over the page instead of sitting above the list, so showing
          it mid-drag doesn't shift the rows under the pointer */}
      <Slide direction="up" in={orderChanged} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          role="status"
          sx={{
            position: "fixed",
            left: "50%",
            bottom: { xs: 16, sm: 24 },
            transform: "translateX(-50%) !important",
            zIndex: (t) => t.zIndex.snackbar,
            width: "min(560px, calc(100vw - 32px))",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
            px: 2,
            py: 1.25,
            borderRadius: 3,
            bgcolor: "text.primary",
            color: "background.paper",
          }}
        >
          <Typography variant="body2" sx={{ flex: 1, minWidth: 180, fontWeight: 500 }}>
            Chapter order changed. Readers see it once you save.
          </Typography>
          <Button
            size="small"
            onClick={() => setItems(chapters)}
            disabled={reorder.isPending}
            sx={{ color: "inherit", opacity: 0.8 }}
          >
            Discard
          </Button>
          <Button
            size="small"
            variant="contained"
            disableElevation
            disabled={reorder.isPending}
            onClick={() => reorder.mutate(items.map((ch) => ch.id))}
          >
            {reorder.isPending ? "Saving…" : "Save order"}
          </Button>
        </Paper>
      </Slide>

      {/* List */}
      {chapters.length === 0 ? (
        <Stack sx={{ alignItems: "center", py: 10, gap: 2, textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            No chapters yet
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            Write the first one; you can publish it when it&rsquo;s ready.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCreating(true)}>
            New chapter
          </Button>
        </Stack>
      ) : visible.length === 0 ? (
        <Typography sx={{ color: "text.secondary", textAlign: "center", py: 8 }}>
          {filter === "drafts" ? "No drafts. Everything is published." : "Nothing published yet."}
        </Typography>
      ) : (
        <Stack component="ol" sx={{ listStyle: "none", m: 0, p: 0, pb: 10, gap: 0.75 }}>
          {visible.map((ch) => {
            const position = items.findIndex((item) => item.id === ch.id);
            const isDraft = ch.published === 0;
            const isSelected = selected.has(ch.id);
            return (
              <Box
                component="li"
                key={ch.id}
                onDragOver={(e) => onDragOver(e, ch.id)}
                onDrop={(e) => e.preventDefault()}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 0.5, sm: 1 },
                  pl: 0.5,
                  pr: 1,
                  py: 0.75,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: isSelected ? "primary.main" : "divider",
                  bgcolor: isSelected ? "action.selected" : "background.paper",
                  opacity: dragId === ch.id ? 0.45 : 1,
                  transition: "border-color 0.15s, background-color 0.15s",
                  "&:hover .row-actions": { opacity: 1 },
                }}
              >
                <Checkbox
                  size="small"
                  checked={isSelected}
                  onChange={() => toggle(ch.id)}
                  slotProps={{ input: { "aria-label": `Select ${ch.title}` } }}
                />

                {/* drag handle: pointer only; touch and keyboard use the arrow buttons */}
                <Box
                  aria-hidden
                  // only the handle is draggable, so text in the row stays selectable
                  draggable={canReorder}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    // some browsers won't start a drag without data
                    e.dataTransfer.setData("text/plain", ch.id);
                    // show the whole row under the pointer, not just the handle
                    const row = e.currentTarget.closest("li");
                    if (row) {
                      const { left, top } = row.getBoundingClientRect();
                      e.dataTransfer.setDragImage(row, e.clientX - left, e.clientY - top);
                    }
                    setDragId(ch.id);
                  }}
                  onDragEnd={endDrag}
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    color: canReorder ? "text.disabled" : "action.disabled",
                    cursor: canReorder ? "grab" : "not-allowed",
                    "&:hover": canReorder ? { color: "text.primary" } : undefined,
                    "&:active": { cursor: "grabbing" },
                  }}
                >
                  <DragIndicatorIcon fontSize="small" />
                </Box>

                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, minWidth: 28, textAlign: "right", color: "text.disabled", userSelect: "none" }}
                >
                  {position + 1}
                </Typography>

                <Box sx={{ flex: 1, minWidth: 0, px: 1 }}>
                  <Typography
                    component={NextLink}
                    href={`/story/${slug}/chapter/${ch.slug}`}
                    variant="subtitle2"
                    noWrap
                    sx={{
                      display: "block",
                      fontWeight: 600,
                      color: "text.primary",
                      textDecoration: "none",
                      "&:hover": { color: "primary.main", textDecoration: "underline" },
                    }}
                  >
                    {ch.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.disabled" }}>
                    Edited {formatDate(ch.updatedAt)}
                  </Typography>
                </Box>

                <Tooltip title={isDraft ? "Draft: click to publish" : "Published: click to move to drafts"}>
                  <Chip
                    size="small"
                    label={isDraft ? "Draft" : "Published"}
                    color={isDraft ? "default" : "success"}
                    variant={isDraft ? "outlined" : "filled"}
                    icon={isDraft ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    onClick={() => setPublished.mutate({ ids: [ch.id], published: isDraft })}
                    disabled={busy}
                    sx={{ fontWeight: 600, flexShrink: 0 }}
                  />
                </Tooltip>

                <Stack
                  direction="row"
                  className="row-actions"
                  sx={{ flexShrink: 0, opacity: { xs: 1, md: 0.55 }, transition: "opacity 0.15s" }}
                >
                  {filter === "all" && (
                    <>
                      <Tooltip title="Move up">
                        <span>
                          <IconButton
                            size="small"
                            aria-label={`Move ${ch.title} up`}
                            disabled={!canReorder || position === 0}
                            onClick={() => moveBy(ch.id, -1)}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move down">
                        <span>
                          <IconButton
                            size="small"
                            aria-label={`Move ${ch.title} down`}
                            disabled={!canReorder || position === items.length - 1}
                            onClick={() => moveBy(ch.id, 1)}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </>
                  )}
                  <Tooltip title="Edit">
                    <IconButton size="small" aria-label={`Edit ${ch.title}`} onClick={() => setEditing(ch)}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      size="small"
                      aria-label={`Delete ${ch.title}`}
                      disabled={busy}
                      onClick={() => setConfirmDelete([ch.id])}
                      sx={{ "&:hover": { color: "error.main" } }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}

      <ChapterCreate
        slug={slug}
        open={creating}
        onSaved={() => {
          setCreating(false);
          router.refresh();
        }}
        onCancel={() => setCreating(false)}
      />

      {editing && (
        <ChapterEdit
          open
          chapter={editing}
          storySlug={slug}
          onClose={() => setEditing(null)}
          onSaved={() => router.refresh()}
        />
      )}

      <Dialog open={!!confirmDelete} onClose={() => setConfirmDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>
          {confirmDelete?.length === 1 ? "Delete chapter?" : `Delete ${confirmDelete?.length} chapters?`}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDelete?.length === 1 ? (
              <>
                <strong>&ldquo;{items.find((ch) => ch.id === confirmDelete[0])?.title}&rdquo;</strong> will be
                permanently deleted.
              </>
            ) : (
              "These chapters will be permanently deleted."
            )}{" "}
            Readers lose their place in them. This can&rsquo;t be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button size="small" color="inherit" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            disableElevation
            disabled={deleteChapters.isPending}
            onClick={() =>
              confirmDelete &&
              deleteChapters.mutate(confirmDelete, {
                onSuccess: () => setConfirmDelete(null),
              })
            }
          >
            {deleteChapters.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const StatTile = ({ label, value, tone }: { label: string; value: number; tone?: "primary" | "muted" }) => (
  <Box
    sx={{
      px: 2,
      py: 1.25,
      minWidth: 112,
      borderRadius: 2,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.default",
    }}
  >
    <Typography
      variant="h5"
      sx={{
        fontWeight: 800,
        lineHeight: 1.1,
        color: tone === "primary" ? "primary.main" : tone === "muted" ? "text.secondary" : "text.primary",
      }}
    >
      {value}
    </Typography>
    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
      {label}
    </Typography>
  </Box>
);
