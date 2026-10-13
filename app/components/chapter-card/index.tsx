"use client";

import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";
import { FullPageEditor } from "@/app/components";
import { useChapterContent, useDeleteChapter, useEditChapter } from "@/app/hooks/useStories";
import { formatDate } from "@/app/utils";
import { SelectChapter } from "@/lib";

export function ChapterEdit({
  open,
  chapter,
  storySlug,
  onClose,
  onSaved,
}: {
  open: boolean;
  chapter: Partial<SelectChapter>;
  storySlug: string;
  onClose: () => void;
  onSaved: (updated: Partial<SelectChapter>) => void;
}) {
  const editChapter = useEditChapter(storySlug, chapter.slug ?? "");
  const { data: full, isLoading: contentLoading } = useChapterContent(storySlug, chapter.slug ?? "", open);
  return (
    <FullPageEditor
      key={chapter.slug}
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
  storySlug,
  onClose,
  onDeleted,
}: {
  open: boolean;
  chapter: Partial<SelectChapter>;
  storySlug: string;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const deleteChapter = useDeleteChapter(storySlug);

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
        {deleteChapter.isError && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            {deleteChapter.error.message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          size="small"
          onClick={handleDelete}
          disabled={deleteChapter.isPending}
        >
          {deleteChapter.isPending ? "Deleting…" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export const ChapterRow = ({
  chapter,
  number,
  read = false,
  lastRead = false,
  slug,
  isAuthor,
  onEdited,
  onDeleted,
}: {
  chapter: Partial<SelectChapter>;
  number: number;
  // the signed-in reader has opened this chapter
  read?: boolean;
  // where the reader left off in the story
  lastRead?: boolean;
  slug: string;
  isAuthor: boolean;
  onEdited: (updated: Partial<SelectChapter>) => void;
  onDeleted: (id: string) => void;
}) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          gap: 1.5,
          py: 1.75,
          px: { xs: 0.5, sm: 1 },
          borderRadius: 1,
          transition: "background-color 0.15s",
          "&:hover": { bgcolor: "action.hover" },
          // a slim bar marks where the reader left off
          boxShadow: lastRead ? (theme) => `inset 3px 0 0 ${theme.palette.primary.main}` : undefined,
        }}
      >
        {/* Number */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            minWidth: 26,
            color: "text.disabled",
            flexShrink: 0,
            userSelect: "none",
          }}
        >
          {number}
        </Typography>

        {/* Link area */}
        <Box
          component={NextLink}
          href={`/story/${slug}/chapter/${chapter.slug}`}
          sx={{ flex: 1, textDecoration: "none", color: "inherit", minWidth: 0 }}
        >
          <Stack
            sx={{
              gap: 0.4,
            }}
          >
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  // read chapters step back so the unread ones stand out
                  fontWeight: read ? 500 : 600,
                  color: read ? "text.secondary" : "text.primary",
                }}
              >
                {chapter.title}
              </Typography>
              {lastRead && (
                <Chip
                  icon={<BookmarkRoundedIcon />}
                  label="Last read"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, "& .MuiChip-icon": { fontSize: 13 } }}
                />
              )}
              {isAuthor && chapter.published === 0 && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 0.75,
                    py: 0.2,
                    borderRadius: 0.5,
                    bgcolor: "action.selected",
                    color: "text.secondary",
                    fontSize: "0.6rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    flexShrink: 0,
                  }}
                >
                  DRAFT
                </Typography>
              )}
            </Stack>
            {chapter.updatedAt && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.disabled",
                }}
              >
                Updated {formatDate(chapter.updatedAt)}
              </Typography>
            )}
          </Stack>
        </Box>

        {read && (
          <Tooltip title="Read">
            <CheckCircleRoundedIcon
              aria-label="Read"
              sx={{ fontSize: 18, color: "primary.main", opacity: 0.7, flexShrink: 0 }}
            />
          </Tooltip>
        )}

        {/* Author dots menu */}
        {isAuthor && (
          <>
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                setMenuAnchor(e.currentTarget);
              }}
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
                onClick={() => {
                  setMenuAnchor(null);
                  setEditOpen(true);
                }}
                dense
              >
                <ListItemIcon>
                  <EditOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenuAnchor(null);
                  setDeleteOpen(true);
                }}
                dense
                sx={{ color: "error.main" }}
              >
                <ListItemIcon>
                  <DeleteOutlineIcon fontSize="small" color="error" />
                </ListItemIcon>
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
          storySlug={slug}
          onClose={() => setEditOpen(false)}
          onSaved={onEdited}
        />
      )}
      {deleteOpen && (
        <DeleteChapterDialog
          open={deleteOpen}
          chapter={chapter}
          storySlug={slug}
          onClose={() => setDeleteOpen(false)}
          onDeleted={onDeleted}
        />
      )}
    </>
  );
};
