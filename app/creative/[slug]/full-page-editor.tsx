"use client";

import CloseIcon from "@mui/icons-material/Close";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

interface FullPageEditorProps {
  open: boolean;
  mode: "create" | "edit";
  initialTitle?: string;
  initialContent?: string;
  contentLoading?: boolean;
  isSaving?: boolean;
  error?: string | null;
  onCancel: () => void;
  onSave: (data: { title: string; content: string; published?: boolean }) => void;
}

const FORMAT_TOOLS = [
  { cmd: "bold", Icon: FormatBoldIcon, label: "Bold", shortcut: "⌘B" },
  { cmd: "italic", Icon: FormatItalicIcon, label: "Italic", shortcut: "⌘I" },
  { cmd: "underline", Icon: FormatUnderlinedIcon, label: "Underline", shortcut: "⌘U" },
];

export function FullPageEditor({
  open,
  mode,
  initialTitle = "",
  initialContent = "",
  contentLoading = false,
  isSaving = false,
  error = null,
  onCancel,
  onSave,
}: FullPageEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [wordCount, setWordCount] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  // Sync title when opened with new initialTitle
  useEffect(() => {
    if (open) setTitle(initialTitle);
  }, [open, initialTitle]);

  // Focus title on open
  useEffect(() => {
    if (open && !contentLoading) {
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [open, contentLoading]);

  const updateWordCount = useCallback(() => {
    const text = editorRef.current?.innerText ?? "";
    setWordCount(text.trim() === "" ? 0 : text.trim().split(/\s+/).length);
  }, []);

  const execFormat = (cmd: string) => {
    document.execCommand(cmd, false);
    editorRef.current?.focus();
  };

  const getContent = () => editorRef.current?.innerHTML ?? "";

  const handleSave = (published?: boolean) => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), content: getContent(), published });
  };

  // Tab key → insert two spaces instead of moving focus
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
      document.execCommand("insertText", false, "  ");
    }
  };

  return (
    <Dialog open={open} fullScreen>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "background.paper" }}>
        {/* ── Top bar ── */}
        <AppBar
          position="static"
          elevation={0}
          sx={{ bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Toolbar sx={{ minHeight: { xs: 52, sm: 56 }, px: { xs: 1.5, sm: 2 }, gap: 1 }}>
            {/* Left: close */}
            <Tooltip title="Discard and close">
              <IconButton size="small" onClick={onCancel} sx={{ color: "text.secondary" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Centre: format tools */}
            <Stack direction="row" flex={1} justifyContent="center" gap={0.5}>
              {FORMAT_TOOLS.map(({ cmd, Icon, label, shortcut }) => (
                <Tooltip key={cmd} title={`${label} ${shortcut}`} placement="bottom">
                  <IconButton
                    size="small"
                    onMouseDown={(e) => { e.preventDefault(); execFormat(cmd); }}
                    sx={{ color: "text.secondary", "&:hover": { color: "text.primary" } }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>

            {/* Right: save actions */}
            <Stack direction="row" gap={1} alignItems="center" flexShrink={0}>
              {mode === "create" ? (
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleSave(false)}
                    disabled={isSaving || !title.trim()}
                    sx={{ display: { xs: "none", sm: "inline-flex" } }}
                  >
                    Save Draft
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => handleSave(true)}
                    disabled={isSaving || !title.trim()}
                  >
                    {isSaving ? <CircularProgress size={14} color="inherit" sx={{ mr: 1 }} /> : null}
                    Publish
                  </Button>
                </>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleSave()}
                  disabled={isSaving || contentLoading || !title.trim()}
                >
                  {isSaving ? <CircularProgress size={14} color="inherit" sx={{ mr: 1 }} /> : null}
                  Save
                </Button>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        {/* ── Writing area ── */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Box
            sx={{
              maxWidth: "46rem",
              mx: "auto",
              px: { xs: 2.5, sm: 5, md: 6 },
              pt: { xs: 5, sm: 8 },
              pb: 16,
            }}
          >
            {/* Title */}
            <InputBase
              inputRef={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Chapter title…"
              multiline
              fullWidth
              sx={{
                fontSize: { xs: "1.75rem", sm: "2.25rem" },
                fontWeight: 700,
                lineHeight: 1.2,
                color: "text.primary",
                mb: 3,
                "& textarea": { padding: 0 },
                "& textarea::placeholder": { color: "text.disabled", opacity: 1 },
              }}
            />

            {/* Divider */}
            <Box
              sx={{
                height: 1,
                bgcolor: "divider",
                mb: 4,
                mx: "auto",
                width: "3rem",
                borderRadius: 1,
              }}
            />

            {/* Content */}
            {contentLoading ? (
              <Box display="flex" justifyContent="center" pt={8}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <Box
                key={initialContent}
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: initialContent }}
                data-placeholder="Begin writing…"
                onInput={updateWordCount}
                onKeyDown={handleKeyDown}
                sx={{
                  outline: "none",
                  lineHeight: 1.95,
                  fontSize: { xs: "1rem", sm: "1.0625rem" },
                  fontFamily: "inherit",
                  color: "text.primary",
                  minHeight: "40vh",
                  caretColor: "primary.main",
                  "&:empty::before": {
                    content: "attr(data-placeholder)",
                    color: "text.disabled",
                    pointerEvents: "none",
                    fontStyle: "italic",
                  },
                }}
              />
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 4 }}>
                {error}
              </Alert>
            )}
          </Box>
        </Box>

        {/* ── Status bar ── */}
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            px: 3,
            py: 1,
            display: "flex",
            justifyContent: "flex-end",
            pointerEvents: "none",
          }}
        >
          <Typography variant="caption" color="text.disabled">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </Typography>
        </Box>
      </Box>
    </Dialog>
  );
}
