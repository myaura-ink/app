"use client";

import { ArrowBack, FormatListBulleted } from "@mui/icons-material";
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
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuthContext } from "@/app/contexts";
import { useDeleteChapter, useEditChapter } from "@/app/hooks/useCreatives";
import { SelectChapter } from "@/lib";
import { FullPageEditor } from "../../full-page-editor";

const SIDEBAR_WIDTH = 272;

// ─── Edit Chapter (full-page) ───────────────────────────────────────────────

function EditChapterEditor({
  open,
  chapter,
  creativeSlug,
  onClose,
  onSaved,
}: {
  open: boolean;
  chapter: SelectChapter;
  creativeSlug: string;
  onClose: () => void;
  onSaved: (updated: Pick<SelectChapter, "title" | "content">) => void;
}) {
  const editChapter = useEditChapter(creativeSlug, chapter.slug);

  return (
    <FullPageEditor
      open={open}
      mode="edit"
      initialTitle={chapter.title}
      initialContent={chapter.content ?? ""}
      isSaving={editChapter.isPending}
      error={editChapter.isError ? editChapter.error.message : null}
      onCancel={onClose}
      onSave={({ title, content }) => {
        editChapter.mutate(
          { title, content },
          {
            onSuccess: () => {
              onSaved({ title, content });
              onClose();
            },
          },
        );
      }}
    />
  );
}

// ─── Delete Chapter Dialog ──────────────────────────────────────────────────

function DeleteChapterDialog({
  open,
  chapter,
  creativeSlug,
  onClose,
}: {
  open: boolean;
  chapter: SelectChapter;
  creativeSlug: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const deleteChapter = useDeleteChapter(creativeSlug);

  const handleDelete = () => {
    deleteChapter.mutate(
      { chapterSlug: chapter.slug },
      { onSuccess: () => router.push(`/creative/${creativeSlug}`) },
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
          <Alert severity="error" sx={{ mt: 1.5 }}>{deleteChapter.error.message}</Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" color="inherit" onClick={onClose}>Cancel</Button>
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

// ─── Author Menu ────────────────────────────────────────────────────────────

function AuthorMenu({
  chapter,
  creativeSlug,
  onSaved,
}: {
  chapter: SelectChapter;
  creativeSlug: string;
  onSaved: (updated: Pick<SelectChapter, "title" | "content">) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <Tooltip title="Chapter options">
        <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{ paper: { sx: { minWidth: 160 } } }}
      >
        <MenuItem
          dense
          onClick={() => { setAnchor(null); setEditOpen(true); }}
        >
          <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => { setAnchor(null); setDeleteOpen(true); }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {editOpen && (
        <EditChapterEditor
          open={editOpen}
          chapter={chapter}
          creativeSlug={creativeSlug}
          onClose={() => setEditOpen(false)}
          onSaved={onSaved}
        />
      )}
      {deleteOpen && (
        <DeleteChapterDialog
          open={deleteOpen}
          chapter={chapter}
          creativeSlug={creativeSlug}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export const ChapterPageClient = ({
  slug,
  chapterSlug,
  book,
  chapters,
  chapter,
  authorId,
  prev,
  next,
}: {
  slug: string;
  chapterSlug: string;
  book: { slug: string; title: string };
  chapters: Partial<SelectChapter>[];
  chapter: SelectChapter;
  authorId: string;
  prev: Partial<SelectChapter> | null;
  next: Partial<SelectChapter> | null;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthContext();
  const isAuthor = user?.id === authorId;

  // Track local title/content so edits reflect immediately without reload
  const [localTitle, setLocalTitle] = useState(chapter.title);
  const [localContent, setLocalContent] = useState(chapter.content ?? "");

  const sidebarContent = (
    <Box sx={{ width: SIDEBAR_WIDTH, display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Tooltip title="Back to creative">
            <IconButton
              component={NextLink}
              href={`/creative/${slug}`}
              size="small"
              sx={{ ml: -1, display: { xs: "none", md: "flex" } }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" color="text.disabled" fontWeight={600}>
              Chapters
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" noWrap>
              {book?.title || "Untitled"}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Divider />
      <List dense sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {chapters.map((ch) => {
          const isActive = ch.slug === chapterSlug;
          return (
            <ListItem key={ch.slug} disablePadding>
              <ListItemButton
                component={NextLink}
                href={`/creative/${slug}/chapter/${ch.slug}`}
                onClick={() => isMobile && setSidebarOpen(false)}
                selected={isActive}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  "&.Mui-selected": { bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } },
                }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" gap={1.5} alignItems="baseline">
                      <Typography
                        variant="caption"
                        sx={{ color: isActive ? "rgba(255,255,255,0.6)" : "text.disabled", minWidth: 20 }}
                      >
                        {ch.order}
                      </Typography>
                      <Typography variant="body2" fontWeight={isActive ? 600 : 400}>
                        {ch.title}
                      </Typography>
                    </Stack>
                  }
                  disableTypography
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" } }}>
      {/* Mobile toolbar */}
      <Box
        sx={{
          flexShrink: 0,
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          px: 2,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
          gap: 1,
        }}
      >
        <IconButton component={NextLink} href={`/creative/${slug}`} size="small">
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {localTitle}
        </Typography>
        <IconButton onClick={() => setSidebarOpen(true)}>
          <FormatListBulleted fontSize="small" />
        </IconButton>
        {isAuthor && (
          <AuthorMenu
            chapter={{ ...chapter, title: localTitle, content: localContent }}
            creativeSlug={slug}
            onSaved={({ title, content }) => { setLocalTitle(title); setLocalContent(content ?? ""); }}
          />
        )}
      </Box>

      {/* Main content */}
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar - Desktop */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100%",
            alignSelf: "flex-start",
          }}
        >
          {sidebarContent}
        </Box>

        {/* Sidebar - Mobile */}
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          {sidebarContent}
        </Drawer>

        {/* Reading area */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" }}>
          {/* Desktop title + author menu bar */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "space-between",
              px: { md: 6, lg: 8 },
              pt: 5,
              pb: 1,
              maxWidth: "calc(45rem + 128px)",
              mx: "auto",
              width: "100%",
            }}
          >
            <Typography variant="h4" fontWeight={700} lineHeight={1.2} sx={{ flex: 1 }}>
              {localTitle}
            </Typography>
            {isAuthor && (
              <AuthorMenu
                chapter={{ ...chapter, title: localTitle, content: localContent }}
                creativeSlug={slug}
              />
            )}
          </Box>

          <Box sx={{ px: { xs: 2, sm: 4, md: 6, lg: 8 }, pb: 4, maxWidth: "calc(45rem + 128px)", mx: "auto", width: "100%" }}>
            <Typography
              component="div"
              variant="body1"
              color="text.primary"
              lineHeight={1.9}
              sx={{ textAlign: "justify" }}
              dangerouslySetInnerHTML={{ __html: localContent }}
            />
          </Box>

          {/* Chapter navigation */}
          <Divider sx={{ mt: "auto" }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: 2, sm: 4 },
              py: 2,
              maxWidth: "45rem",
              mx: "auto",
              width: "100%",
            }}
          >
            {prev ? (
              <Tooltip title={prev.title}>
                <IconButton component={NextLink} href={`/creative/${slug}/chapter/${prev.slug}`} size="small">
                  <ArrowBack fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Box />
            )}
            <Typography variant="caption" color="text.disabled">
              {localTitle}
            </Typography>
            {next ? (
              <Tooltip title={next.title}>
                <IconButton component={NextLink} href={`/creative/${slug}/chapter/${next.slug}`} size="small">
                  <ArrowBack fontSize="small" sx={{ transform: "rotate(180deg)" }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Box />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
