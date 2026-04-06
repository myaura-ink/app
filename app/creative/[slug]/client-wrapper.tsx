"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";
import { Avatar, TabPanel } from "@/app/components";
import { useAuthContext } from "@/app/contexts";
import {
  useAddCritique,
  useChapterContent,
  useCreateChapter,
  useCritiques,
  useDeleteChapter,
  useEditChapter,
} from "@/app/hooks/useCreatives";
import { formatDate } from "@/app/utils";
import { SelectChapter } from "@/lib";
import { FullPageEditor } from "./full-page-editor";

interface Props {
  slug: string;
  authorId: string;
  description: string;
  initialChapters: Partial<SelectChapter>[];
}

// ─── Chapter Create (full-page) ─────────────────────────────────────────────

function ChapterCreate({ slug, open, onSaved, onCancel }: { slug: string; open: boolean; onSaved: (ch: SelectChapter) => void; onCancel: () => void }) {
  const createChapter = useCreateChapter(slug);

  return (
    <FullPageEditor
      open={open}
      mode="create"
      isSaving={createChapter.isPending}
      error={createChapter.isError ? createChapter.error.message : null}
      onCancel={onCancel}
      onSave={({ title, content, published }) => {
        createChapter.mutate(
          { title, content, published: published ?? false },
          { onSuccess: (ch) => onSaved(ch as unknown as SelectChapter) },
        );
      }}
    />
  );
}

// ─── Chapter Edit (full-page) ───────────────────────────────────────────────

function ChapterEdit({
  open,
  chapter,
  creativeSlug,
  onClose,
  onSaved,
}: {
  open: boolean;
  chapter: Partial<SelectChapter>;
  creativeSlug: string;
  onClose: () => void;
  onSaved: (updated: Partial<SelectChapter>) => void;
}) {
  const editChapter = useEditChapter(creativeSlug, chapter.slug ?? "");
  const { data: full, isLoading: contentLoading } = useChapterContent(
    creativeSlug,
    chapter.slug ?? "",
    open,
  );

  return (
    <FullPageEditor
      open={open}
      mode="edit"
      initialTitle={chapter.title ?? ""}
      initialContent={full?.content ?? ""}
      contentLoading={contentLoading}
      isSaving={editChapter.isPending}
      error={editChapter.isError ? editChapter.error.message : null}
      onCancel={onClose}
      onSave={({ title, content }) => {
        editChapter.mutate(
          { title, content },
          {
            onSuccess: (updated) => {
              onSaved({ ...chapter, title: updated.title });
              onClose();
            },
          },
        );
      }}
    />
  );
}

// ─── Delete Chapter Confirm Dialog ─────────────────────────────────────────

function DeleteChapterDialog({
  open,
  chapter,
  creativeSlug,
  onClose,
  onDeleted,
}: {
  open: boolean;
  chapter: Partial<SelectChapter>;
  creativeSlug: string;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const deleteChapter = useDeleteChapter(creativeSlug);

  const handleDelete = () => {
    deleteChapter.mutate(
      { chapterSlug: chapter.slug ?? "" },
      {
        onSuccess: () => {
          onDeleted(chapter.id ?? "");
          onClose();
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete Chapter?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <strong>&ldquo;{chapter.title}&rdquo;</strong> will be permanently deleted. This cannot be undone.
        </DialogContentText>
        {deleteChapter.isError && <Alert severity="error" sx={{ mt: 1.5 }}>{deleteChapter.error.message}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" color="inherit" onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" size="small" onClick={handleDelete} disabled={deleteChapter.isPending}>
          {deleteChapter.isPending ? "Deleting…" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Chapter Row ────────────────────────────────────────────────────────────

function ChapterRow({
  chapter,
  index,
  slug,
  isAuthor,
  onEdited,
  onDeleted,
}: {
  chapter: Partial<SelectChapter>;
  index: number;
  slug: string;
  isAuthor: boolean;
  onEdited: (updated: Partial<SelectChapter>) => void;
  onDeleted: (id: string) => void;
}) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        gap={1.5}
        sx={{
          py: 1.75,
          px: { xs: 0.5, sm: 1 },
          borderRadius: 1,
          transition: "background-color 0.15s",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        {/* Number */}
        <Typography
          variant="body2"
          fontWeight={700}
          sx={{ minWidth: 26, color: "text.disabled", flexShrink: 0, userSelect: "none" }}
        >
          {index + 1}
        </Typography>

        {/* Link area */}
        <Box
          component={NextLink}
          href={`/creative/${slug}/chapter/${chapter.slug}`}
          sx={{ flex: 1, textDecoration: "none", color: "inherit", minWidth: 0 }}
        >
          <Stack gap={0.4}>
            <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {chapter.title}
              </Typography>
              {isAuthor && chapter.published === 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 0.75, py: 0.2, borderRadius: 0.5,
                    bgcolor: "action.selected", color: "text.secondary",
                    fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.04em",
                    flexShrink: 0,
                  }}
                >
                  DRAFT
                </Typography>
              )}
            </Stack>
            {chapter.updatedAt && (
              <Typography variant="caption" color="text.disabled">
                Updated {formatDate(chapter.updatedAt)}
              </Typography>
            )}
          </Stack>
        </Box>

        {/* Author dots menu */}
        {isAuthor && (
          <>
            <IconButton
              size="small"
              onClick={(e) => { e.preventDefault(); setMenuAnchor(e.currentTarget); }}
              sx={{ flexShrink: 0, color: "text.disabled", "&:hover": { color: "text.primary" } }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{ paper: { sx: { minWidth: 160 } } }}
            >
              <MenuItem
                onClick={() => { setMenuAnchor(null); setEditOpen(true); }}
                dense
              >
                <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => { setMenuAnchor(null); setDeleteOpen(true); }}
                dense
                sx={{ color: "error.main" }}
              >
                <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>
          </>
        )}
      </Stack>

      {editOpen && (
        <ChapterEdit
          open={editOpen}
          chapter={chapter}
          creativeSlug={slug}
          onClose={() => setEditOpen(false)}
          onSaved={onEdited}
        />
      )}
      {deleteOpen && (
        <DeleteChapterDialog
          open={deleteOpen}
          chapter={chapter}
          creativeSlug={slug}
          onClose={() => setDeleteOpen(false)}
          onDeleted={onDeleted}
        />
      )}
    </>
  );
}

// ─── Star components ────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <Stack direction="row" gap={0.25} onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconButton
          key={n}
          size="small"
          disableRipple
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          sx={{ p: 0.25, color: n <= active ? "warning.main" : "action.disabled", transition: "color 0.1s" }}
        >
          {n <= active ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
        </IconButton>
      ))}
    </Stack>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <Stack direction="row" gap={0.125} alignItems="center">
      {[1, 2, 3, 4, 5].map((n) => (
        <Box key={n} component="span" sx={{ color: n <= rating ? "warning.main" : "action.disabled", display: "flex" }}>
          {n <= rating ? <StarIcon sx={{ fontSize: 13 }} /> : <StarBorderIcon sx={{ fontSize: 13 }} />}
        </Box>
      ))}
    </Stack>
  );
}

// ─── Critique Form ──────────────────────────────────────────────────────────

function CritiqueForm({ slug, onDone }: { slug: string; onDone: () => void }) {
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);
  const addCritique = useAddCritique(slug);

  const handleSubmit = () => {
    if (!body.trim() || rating === 0) return;
    addCritique.mutate({ body, rating }, { onSuccess: onDone });
  };

  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: { xs: 2, sm: 2.5 }, bgcolor: "background.default" }}>
      <Typography variant="overline" color="secondary.main" fontWeight={600} letterSpacing="0.12em" mb={2} display="block">
        Your Critique
      </Typography>
      <Stack gap={2}>
        <Stack gap={0.75}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Rating
          </Typography>
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <Typography variant="caption" color="text.disabled">
              {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
            </Typography>
          )}
        </Stack>
        <TextField
          placeholder="Share your honest thoughts on this story…"
          multiline
          minRows={4}
          fullWidth
          value={body}
          onChange={(e) => setBody(e.target.value)}
          size="small"
        />
        {addCritique.isError && <Alert severity="error">{addCritique.error.message}</Alert>}
        <Stack direction="row" gap={1.5} justifyContent="flex-end">
          <Button size="small" color="inherit" onClick={onDone} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={addCritique.isPending || !body.trim() || rating === 0}
          >
            {addCritique.isPending ? "Posting…" : "Post Critique"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

// ─── Critiques Panel ────────────────────────────────────────────────────────

function CritiquesPanel({ slug, authorId }: { slug: string; authorId: string }) {
  const { user } = useAuthContext();
  const { data: critiques, isLoading } = useCritiques(slug);
  const [showForm, setShowForm] = useState(false);

  const isAuthor = user?.id === authorId;
  const canCritique = user && !isAuthor;

  return (
    <Stack gap={0} pt={1}>
      {/* CTA bar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" py={2} flexWrap="wrap" gap={1}>
        <Typography variant="body2" color="text.secondary">
          {isLoading ? "" : `${critiques?.length ?? 0} critique${(critiques?.length ?? 0) !== 1 ? "s" : ""}`}
        </Typography>

        {canCritique && !showForm && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RateReviewOutlinedIcon fontSize="small" />}
            onClick={() => setShowForm(true)}
            sx={{ borderRadius: 6, px: 2 }}
          >
            Write a Critique
          </Button>
        )}

        {!user && (
          <Typography variant="body2" color="text.secondary">
            <NextLink href="/login" style={{ color: "inherit", fontWeight: 600 }}>Sign in</NextLink> to leave a critique.
          </Typography>
        )}
      </Stack>

      {/* Form */}
      {showForm && canCritique && (
        <Box mb={2}>
          <CritiqueForm slug={slug} onDone={() => setShowForm(false)} />
        </Box>
      )}

      <Divider />

      {/* List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={24} />
        </Box>
      ) : !critiques || critiques.length === 0 ? (
        <Stack alignItems="center" py={8}>
          <Typography color="text.disabled" variant="body2">
            No critiques yet.
          </Typography>
        </Stack>
      ) : (
        <Stack gap={0} divider={<Divider />}>
          {critiques.map((c) => (
            <Stack key={c.id} direction="row" gap={2} py={2.5}>
              <Avatar slug={c.author.slug} size={34} />
              <Stack gap={0.5} flex={1} minWidth={0}>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  <NextLink href={`/portfolio/${c.author.slug}`} style={{ textDecoration: "none" }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ "&:hover": { textDecoration: "underline" } }}
                    >
                      {c.author.name ?? c.author.slug}
                    </Typography>
                  </NextLink>
                  <StarDisplay rating={c.rating} />
                  {c.createdAt && (
                    <Typography variant="caption" color="text.disabled">
                      {formatDate(c.createdAt)}
                    </Typography>
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
                  {c.body}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export const CreativePageClient = ({ slug, authorId, description, initialChapters }: Props) => {
  const [tab, setTab] = useState(0);
  const [chapters, setChapters] = useState<Partial<SelectChapter>[]>(initialChapters);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuthContext();
  const isAuthor = user?.id === authorId;

  const handleChapterSaved = (ch: Partial<SelectChapter>) => {
    setChapters((prev) => [...prev, ch]);
    setShowForm(false);
  };

  const handleChapterEdited = (updated: Partial<SelectChapter>) => {
    setChapters((prev) => prev.map((ch) => (ch.id === updated.id ? { ...ch, ...updated } : ch)));
  };

  const handleChapterDeleted = (id: string) => {
    setChapters((prev) => prev.filter((ch) => ch.id !== id));
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>
      <Divider />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 0 }}>
        <Tab label="About" />
        <Tab label={`Chapters (${chapters.length})`} />
        <Tab label="Critiques" />
      </Tabs>

      {/* About */}
      <TabPanel value={tab} index={0}>
        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.9 }}>
          {description || "No synopsis yet."}
        </Typography>
      </TabPanel>

      {/* Chapters */}
      <TabPanel value={tab} index={1}>
        {chapters.length === 0 && !showForm ? (
          <Stack alignItems="center" py={8} gap={2}>
            <Typography color="text.disabled" variant="body2">
              {isAuthor ? "No chapters yet." : "No chapters published yet."}
            </Typography>
          </Stack>
        ) : (
          <Stack gap={0} divider={<Divider />}>
            {chapters.map((ch, i) => (
              <ChapterRow
                key={ch.id}
                chapter={ch}
                index={i}
                slug={slug}
                isAuthor={isAuthor}
                onEdited={handleChapterEdited}
                onDeleted={handleChapterDeleted}
              />
            ))}
          </Stack>
        )}

        {isAuthor && (
          <Box mt={chapters.length > 0 ? 3 : 0}>
            <ChapterCreate
              slug={slug}
              open={showForm}
              onSaved={handleChapterSaved}
              onCancel={() => setShowForm(false)}
            />
            {!showForm && (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
                size="small"
              >
                Add Chapter
              </Button>
            )}
          </Box>
        )}
      </TabPanel>

      {/* Critiques */}
      <TabPanel value={tab} index={2}>
        <CritiquesPanel slug={slug} authorId={authorId} />
      </TabPanel>
    </Container>
  );
};
