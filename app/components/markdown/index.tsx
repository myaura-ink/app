"use client";

import CloseIcon from "@mui/icons-material/Close";
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
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const MdEditor = dynamic(() => import("./md-editor-inner"), { ssr: false });

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
  const [content, setContent] = useState(initialContent);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  useEffect(() => {
    if (open && !contentLoading) {
      setTimeout(() => titleRef.current?.focus(), 80);
    }
  }, [open, contentLoading]);

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

  const handleSave = (published?: boolean) => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), content, published });
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
            <Tooltip title="Discard and close">
              <IconButton size="small" onClick={onCancel} sx={{ color: "text.secondary" }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Box flex={1} />

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
                    {isSaving && <CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />}
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
                  {isSaving && <CircularProgress size={14} color="inherit" sx={{ mr: 1 }} />}
                  Save
                </Button>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        {/* ── Writing area ── */}
        <Box sx={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <Box
            sx={{
              maxWidth: "52rem",
              mx: "auto",
              width: "100%",
              px: { xs: 2.5, sm: 5, md: 6 },
              pt: { xs: 4, sm: 6 },
              pb: 10,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 2,
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
                "& textarea": { padding: 0 },
                "& textarea::placeholder": { color: "text.disabled", opacity: 1 },
              }}
            />

            {/* Editor */}
            {contentLoading ? (
              <Box display="flex" justifyContent="center" pt={8}>
                <CircularProgress size={28} />
              </Box>
            ) : (
              <Box data-color-mode="light" sx={{ flex: 1 }}>
                <MdEditor value={content} onChange={setContent} />
              </Box>
            )}

            {error && <Alert severity="error">{error}</Alert>}
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

export { MarkdownViewer } from "./markdown-viewer";
