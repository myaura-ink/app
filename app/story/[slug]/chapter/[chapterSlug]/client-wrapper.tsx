"use client";

import {
  ArrowBack,
  ArrowForward,
  FormatListBulleted,
  KeyboardDoubleArrowLeft,
  KeyboardDoubleArrowRight,
} from "@mui/icons-material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
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
  LinearProgress,
  Link,
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
import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "@/app/contexts";
import { useRecordRead } from "@/app/hooks/useHistory";
import { useDeleteChapter, useEditChapter } from "@/app/hooks/useStories";
import { SelectChapter } from "@/lib";
import { FullPageEditor, MarkdownViewer } from "../../../../components";
import { FullscreenButton, ReaderSettingsButton, useFullscreen, useReaderSettings } from "./reader-settings";

const SIDEBAR_WIDTH = 272;
const SIDEBAR_RAIL_WIDTH = 60;

// ─── Edit Chapter (full-page) ───────────────────────────────────────────────

function EditChapterEditor({
  open,
  chapter,
  storySlug,
  onClose,
  onSaved,
}: {
  open: boolean;
  chapter: SelectChapter;
  storySlug: string;
  onClose: () => void;
  onSaved: (updated: Pick<SelectChapter, "title" | "content">) => void;
}) {
  const editChapter = useEditChapter(storySlug, chapter.slug);

  return (
    <FullPageEditor
      key={chapter.slug}
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
  storySlug,
  onClose,
}: {
  open: boolean;
  chapter: SelectChapter;
  storySlug: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const deleteChapter = useDeleteChapter(storySlug);

  const handleDelete = () => {
    deleteChapter.mutate({ chapterSlug: chapter.slug }, { onSuccess: () => router.push(`/story/${storySlug}`) });
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

// ─── Author Menu ────────────────────────────────────────────────────────────

function AuthorMenu({
  chapter,
  storySlug,
  onSaved,
}: {
  chapter: SelectChapter;
  storySlug: string;
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
          onClick={() => {
            setAnchor(null);
            setEditOpen(true);
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          dense
          onClick={() => {
            setAnchor(null);
            setDeleteOpen(true);
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {editOpen && (
        <EditChapterEditor
          open={editOpen}
          chapter={chapter}
          storySlug={storySlug}
          onClose={() => setEditOpen(false)}
          onSaved={onSaved}
        />
      )}
      {deleteOpen && (
        <DeleteChapterDialog
          open={deleteOpen}
          chapter={chapter}
          storySlug={storySlug}
          onClose={() => setDeleteOpen(false)}
        />
      )}
    </>
  );
}

// ─── Reading progress ───────────────────────────────────────────────────────

// The site header scrolls away on reader pages (see Header), so the reader's sticky
// parts pin to the very top of the viewport.

// hides the toolbar while the reader scrolls down into the text, and brings it back
// as soon as they scroll up, like most e-reader apps
const TOOLBAR_REVEAL_DELTA = 6;
const TOOLBAR_HIDE_AFTER = 160;

// keeps a sticky sidebar exactly as tall as the visible part of the viewport, so its
// footer stays on screen while the site header above it is still scrolled into view
// `mounted` re-runs the effect when the element is rendered conditionally
function useFitToViewport<T extends HTMLElement>(mounted: boolean) {
  const ref = useRef<T>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: mounted is a trigger, not a value the effect reads
  useEffect(() => {
    let frame = 0;
    const fit = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      el.style.height = `${window.innerHeight - Math.max(0, el.getBoundingClientRect().top)}px`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };
    fit();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [mounted]);

  return ref;
}

function useHideOnScrollDown() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < TOOLBAR_HIDE_AFTER) setHidden(false);
      else if (y > lastY + TOOLBAR_REVEAL_DELTA) setHidden(true);
      else if (y < lastY - TOOLBAR_REVEAL_DELTA) setHidden(false);
      else return; // ignore tiny jitters without moving the baseline
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return hidden;
}

function ReadingProgress({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = target.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const scrollable = height - window.innerHeight;
      setProgress(scrollable <= 0 ? 1 : Math.min(1, Math.max(0, -top / scrollable)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [target]);

  return (
    <LinearProgress
      variant="determinate"
      value={progress * 100}
      aria-label="Reading progress"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: (theme) => theme.zIndex.appBar,
        bgcolor: "transparent",
        "& .MuiLinearProgress-bar": { transition: "none" },
      }}
    />
  );
}

// ─── Chapter navigation ─────────────────────────────────────────────────────

function NavCard({ href, direction, title }: { href: string; direction: "prev" | "next"; title: string | undefined }) {
  const isNext = direction === "next";
  return (
    <Button
      component={NextLink}
      href={href}
      variant="outlined"
      color="inherit"
      sx={{
        flex: 1,
        minWidth: 0,
        justifyContent: isNext ? "flex-end" : "flex-start",
        textAlign: isNext ? "right" : "left",
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderColor: "divider",
        "&:hover": { borderColor: "text.secondary", bgcolor: "action.hover" },
      }}
    >
      {!isNext && <ArrowBack fontSize="small" sx={{ color: "text.secondary" }} />}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ display: "block", color: "text.secondary", fontWeight: 500 }}>
          {isNext ? "Next chapter" : "Previous chapter"}
        </Typography>
        <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      {isNext && <ArrowForward fontSize="small" sx={{ color: "text.secondary" }} />}
    </Button>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

const WORDS_PER_MINUTE = 230;

const isTypingTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

export const ChapterPageClient = ({
  slug,
  chapterSlug,
  book,
  chapters,
  chapter,
  authorId,
  prev,
  next,
  readChapterIds,
}: {
  slug: string;
  chapterSlug: string;
  book: { slug: string; title: string };
  chapters: Partial<SelectChapter>[];
  chapter: SelectChapter;
  authorId: string;
  prev: Partial<SelectChapter> | null;
  next: Partial<SelectChapter> | null;
  readChapterIds: string[];
}) => {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthContext();
  const isAuthor = user?.id === authorId;

  // remember this as where the reader left off; the server ignores authors and drafts
  const userId = user?.id;
  const { mutate: recordRead } = useRecordRead();
  const readIds = new Set(readChapterIds);
  useEffect(() => {
    if (userId && !isAuthor && chapter.published === 1) recordRead({ storySlug: slug, chapterSlug });
  }, [userId, isAuthor, chapter.published, slug, chapterSlug, recordRead]);

  const { settings, update, readerProps } = useReaderSettings();
  const fullscreen = useFullscreen();
  const toolbarHidden = useHideOnScrollDown();
  const sidebarRef = useFitToViewport<HTMLElement>(!settings.focus);
  const articleRef = useRef<HTMLElement>(null);

  // Track local title/content so edits reflect immediately without reload
  const [localTitle, setLocalTitle] = useState(chapter.title);
  const [localContent, setLocalContent] = useState(chapter.content ?? "");
  const onSaved = ({ title, content }: Pick<SelectChapter, "title" | "content">) => {
    setLocalTitle(title);
    setLocalContent(content ?? "");
  };

  const position = chapters.findIndex((c) => c.slug === chapterSlug) + 1;
  const minutes = Math.max(1, Math.round(localContent.trim().split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE));
  const prevHref = prev ? `/story/${slug}/chapter/${prev.slug}` : null;
  const nextHref = next ? `/story/${slug}/chapter/${next.slug}` : null;

  // ← / → move between chapters
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || isTypingTarget(e.target)) return;
      if (document.querySelector(".MuiDialog-root, .MuiPopover-root, .MuiDrawer-modal")) return;
      const href = e.key === "ArrowLeft" ? prevHref : e.key === "ArrowRight" ? nextHref : null;
      if (href) router.push(href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevHref, nextHref, router]);

  const authorMenu = isAuthor && (
    <AuthorMenu chapter={{ ...chapter, title: localTitle, content: localContent }} storySlug={slug} onSaved={onSaved} />
  );

  const collapseContents = (contentsCollapsed: boolean) => update({ contentsCollapsed });

  // collapsible is set for the desktop sidebar only; the drawer closes instead
  const renderSidebar = (collapsible: boolean) => (
    <Box sx={{ width: SIDEBAR_WIDTH, display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <Tooltip title="Back to story">
            <IconButton component={NextLink} href={`/story/${slug}?tab=chapters`} size="small" sx={{ ml: -1 }}>
              <ArrowBack fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: "text.secondary", fontWeight: 600 }}>
              Contents
            </Typography>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700, color: "text.primary" }}>
              {book?.title || "Untitled"}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Divider />
      <List dense sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {chapters.map((ch) => {
          const isActive = ch.slug === chapterSlug;
          const isRead = readIds.has(ch.id as string);
          return (
            <ListItem key={ch.slug} disablePadding>
              <ListItemButton
                component={NextLink}
                href={`/story/${slug}/chapter/${ch.slug}`}
                onClick={() => isMobile && setSidebarOpen(false)}
                selected={isActive}
                aria-current={isActive ? "page" : undefined}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  "&.Mui-selected": {
                    bgcolor: "action.selected",
                    boxShadow: (t) => `inset 2px 0 0 ${t.vars?.palette.primary.main}`,
                    "&:hover": { bgcolor: "action.selected" },
                  },
                }}
              >
                <ListItemText
                  disableTypography
                  primary={
                    <Stack direction="row" sx={{ gap: 1.5, alignItems: "baseline" }}>
                      <Typography
                        variant="caption"
                        sx={{ color: isActive ? "primary.main" : "text.disabled", minWidth: 20, fontWeight: 600 }}
                      >
                        {ch.order}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          fontWeight: isActive ? 600 : 400,
                          // unread chapters read darker than ones already opened
                          color: isActive || !isRead ? "text.primary" : "text.disabled",
                        }}
                      >
                        {ch.title}
                      </Typography>
                      {isRead && !isActive && (
                        <CheckCircleRoundedIcon
                          aria-label="Read"
                          sx={{ fontSize: 14, color: "primary.main", opacity: 0.6, alignSelf: "center" }}
                        />
                      )}
                    </Stack>
                  }
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      {collapsible && (
        <>
          <Divider />
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              size="small"
              color="inherit"
              onClick={() => collapseContents(true)}
              startIcon={<KeyboardDoubleArrowLeft fontSize="small" />}
              sx={{ justifyContent: "flex-start", color: "text.secondary", px: 1.5 }}
            >
              Collapse
            </Button>
          </Box>
        </>
      )}
    </Box>
  );

  // the collapsed sidebar: an expand button and one numbered button per chapter
  const sidebarRail = (
    <Stack sx={{ width: SIDEBAR_RAIL_WIDTH, height: "100%", alignItems: "center" }}>
      <Box sx={{ pt: 2.5, pb: 1.5 }}>
        <Tooltip title="Back to story" placement="right">
          <IconButton component={NextLink} href={`/story/${slug}?tab=chapters`} size="small" aria-label="Back to story">
            <ArrowBack fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider flexItem />
      <Stack
        component="ol"
        sx={{
          listStyle: "none",
          m: 0,
          p: 0,
          py: 1,
          gap: 0.5,
          flex: 1,
          width: "100%",
          alignItems: "center",
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        {chapters.map((ch) => {
          const isActive = ch.slug === chapterSlug;
          return (
            <li key={ch.slug}>
              <Tooltip title={ch.title} placement="right">
                <ListItemButton
                  component={NextLink}
                  href={`/story/${slug}/chapter/${ch.slug}`}
                  selected={isActive}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Chapter ${ch.order}: ${ch.title}`}
                  sx={{
                    width: 36,
                    height: 36,
                    p: 0,
                    flex: "none",
                    justifyContent: "center",
                    borderRadius: 1,
                    typography: "caption",
                    fontWeight: 600,
                    color: isActive ? "primary.main" : readIds.has(ch.id as string) ? "text.disabled" : "text.primary",
                    "&.Mui-selected": {
                      bgcolor: "action.selected",
                      boxShadow: (t) => `inset 2px 0 0 ${t.vars?.palette.primary.main}`,
                      "&:hover": { bgcolor: "action.selected" },
                    },
                  }}
                >
                  {ch.order}
                </ListItemButton>
              </Tooltip>
            </li>
          );
        })}
      </Stack>
      {/* same spot as the Collapse button in the open list */}
      <Divider flexItem />
      <Box sx={{ p: 1 }}>
        <Tooltip title="Expand chapter list" placement="right">
          <IconButton onClick={() => collapseContents(false)} aria-label="Expand chapter list">
            <KeyboardDoubleArrowRight fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Stack>
  );

  return (
    <Box className="reader" {...readerProps} sx={{ display: "flex", bgcolor: "background.default", flex: 1 }}>
      <ReadingProgress target={articleRef} />

      {/* Sidebar - Desktop */}
      {!settings.focus && (
        <Box
          component="nav"
          ref={sidebarRef}
          aria-label="Chapters"
          sx={{
            display: { xs: "none", md: "block" },
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            width: settings.contentsCollapsed ? SIDEBAR_RAIL_WIDTH : SIDEBAR_WIDTH,
            transition: (t) => t.transitions.create("width", { duration: t.transitions.duration.shorter }),
            overflow: "hidden",
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100dvh",
            alignSelf: "flex-start",
          }}
        >
          {settings.contentsCollapsed ? sidebarRail : renderSidebar(true)}
        </Box>
      )}

      {/* Sidebar - Mobile, and desktop in focus mode */}
      <Drawer anchor="left" open={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        {renderSidebar(false)}
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Toolbar */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            transform: toolbarHidden ? "translateY(-100%)" : "none",
            transition: (t) => t.transitions.create("transform", { duration: t.transitions.duration.shorter }),
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: { xs: 1, sm: 2 },
            py: 0.75,
            bgcolor: "background.default",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Tooltip title="Contents">
            <IconButton
              size="small"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open contents"
              sx={{ display: { xs: "inline-flex", md: settings.focus ? "inline-flex" : "none" } }}
            >
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </Tooltip>
          <Typography
            variant="body2"
            noWrap
            sx={{ flex: 1, minWidth: 0, px: 1, color: "text.secondary", fontWeight: 500 }}
          >
            {book.title}
            <Box component="span" sx={{ color: "text.disabled" }}>
              {"  ·  "}
              {localTitle}
            </Box>
          </Typography>
          <ReaderSettingsButton settings={settings} update={update} fullscreen={fullscreen} />
          <FullscreenButton fullscreen={fullscreen} />
          {authorMenu}
        </Box>

        {/* Article */}
        <Box
          component="article"
          ref={articleRef}
          sx={{
            px: { xs: 2.5, sm: 4 },
            pt: { xs: 5, md: 8 },
            pb: 6,
            maxWidth: "calc(var(--reader-measure) + 64px)",
            mx: "auto",
            width: "100%",
          }}
        >
          <Box component="header" sx={{ mb: { xs: 4, md: 6 }, textAlign: "center" }}>
            <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 600, letterSpacing: "0.12em" }}>
              Chapter {chapter.order}
              {chapters.length > 0 && position > 0 && ` of ${chapters.length}`}
            </Typography>
            <Typography
              component="h1"
              sx={{
                fontFamily: "var(--reader-font)",
                fontWeight: 600,
                fontSize: { xs: "2rem", md: "2.75rem" },
                lineHeight: 1.15,
                letterSpacing: "-0.01em",
                mt: 1,
                textWrap: "balance",
              }}
            >
              {localTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
              <Link component={NextLink} href={`/story/${slug}`} color="inherit" underline="hover">
                {book.title}
              </Link>
              {" · "}
              {minutes} min read
            </Typography>
          </Box>

          <MarkdownViewer content={localContent} />

          {/* End-of-chapter ornament */}
          <Typography aria-hidden sx={{ textAlign: "center", color: "text.disabled", letterSpacing: "0.75em", mt: 6 }}>
            ⁂
          </Typography>
        </Box>

        {/* Chapter navigation */}
        <Box
          component="nav"
          aria-label="Chapter navigation"
          sx={{
            px: { xs: 2.5, sm: 4 },
            pb: 8,
            maxWidth: "calc(var(--reader-measure) + 64px)",
            mx: "auto",
            width: "100%",
          }}
        >
          {nextHref || prevHref ? (
            <Stack direction={{ xs: "column-reverse", sm: "row" }} sx={{ gap: 1.5 }}>
              {prevHref ? <NavCard href={prevHref} direction="prev" title={prev?.title} /> : <Box sx={{ flex: 1 }} />}
              {nextHref ? <NavCard href={nextHref} direction="next" title={next?.title} /> : <Box sx={{ flex: 1 }} />}
            </Stack>
          ) : null}
          {!nextHref && (
            <Stack sx={{ alignItems: "center", gap: 1.5, mt: prevHref ? 5 : 0, textAlign: "center" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                You&rsquo;re all caught up
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                That&rsquo;s the latest chapter of {book.title}. Leave a critique or save it for when more arrives.
              </Typography>
              <Button component={NextLink} href={`/story/${slug}`} variant="contained" sx={{ mt: 1 }}>
                Back to story
              </Button>
            </Stack>
          )}
          {(prevHref || nextHref) && (
            <Typography
              variant="caption"
              sx={{ display: { xs: "none", md: "block" }, textAlign: "center", color: "text.disabled", mt: 3 }}
            >
              Tip: use ← and → to move between chapters
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};
