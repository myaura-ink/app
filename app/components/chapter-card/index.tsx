"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Alert,
  Box,
  Button,
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
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";
import { FullPageEditor } from "@/app/components";
import { useChapterContent, useDeleteChapter, useEditChapter } from "@/app/hooks/useCreatives";
import { formatDate } from "@/app/utils";
import { SelectChapter } from "@/lib";

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
  const { data: full, isLoading: contentLoading } = useChapterContent(creativeSlug, chapter.slug ?? "", open);
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
}) => {
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
};
