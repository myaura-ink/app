"use client";

import AddIcon from "@mui/icons-material/Add";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  List,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useRef, useState } from "react";
import { TabPanel } from "@/app/components";
import { useAuthContext } from "@/app/contexts";
import { useCreateChapter } from "@/app/hooks/useCreatives";

interface Chapter {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  order: number;
  published: number;
  createdAt: string | null;
  updatedAt: string;
}

interface Props {
  slug: string;
  authorId: string;
  description: string;
  initialChapters: Chapter[];
}

function ChapterForm({ slug, onSaved }: { slug: string; onSaved: (ch: Chapter) => void }) {
  const createChapter = useCreateChapter(slug);
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState("");

  const execFormat = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const handleSave = (publish: boolean) => {
    const content = editorRef.current?.innerHTML ?? "";
    createChapter.mutate(
      { title, content, published: publish },
      {
        onSuccess: (ch) => {
          setTitle("");
          if (editorRef.current) editorRef.current.innerHTML = "";
          onSaved(ch as unknown as Chapter);
        },
      }
    );
  };

  const canSave = title.trim();

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: 3,
        mt: 2,
        bgcolor: "background.default",
      }}
    >
      <Typography variant="overline" color="secondary.main" fontWeight={600} letterSpacing="0.12em" mb={2} display="block">
        New Chapter
      </Typography>

      <Stack gap={2.5}>
        <TextField
          label="Chapter Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          placeholder="e.g. The Beginning"
          size="small"
        />

        {/* Editor */}
        <Box>
          <Stack
            direction="row"
            gap={0.5}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderBottom: "none",
              borderRadius: "8px 8px 0 0",
              px: 1,
              py: 0.5,
              bgcolor: "background.paper",
            }}
          >
            {[
              { cmd: "bold", Icon: FormatBoldIcon, label: "Bold" },
              { cmd: "italic", Icon: FormatItalicIcon, label: "Italic" },
              { cmd: "underline", Icon: FormatUnderlinedIcon, label: "Underline" },
            ].map(({ cmd, Icon, label }) => (
              <Tooltip key={cmd} title={label} placement="top">
                <IconButton
                  size="small"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execFormat(cmd);
                  }}
                >
                  <Icon fontSize="small" />
                </IconButton>
              </Tooltip>
            ))}
          </Stack>
          <Box
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Write your chapter here..."
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "0 0 8px 8px",
              p: 2,
              minHeight: 240,
              outline: "none",
              lineHeight: 1.9,
              fontSize: "1rem",
              fontFamily: "inherit",
              color: "text.primary",
              transition: "border-color 0.15s",
              "&:focus": { borderColor: "primary.main" },
              "&:empty::before": {
                content: "attr(data-placeholder)",
                color: "text.disabled",
                pointerEvents: "none",
              },
            }}
          />
        </Box>

        {createChapter.isError && (
          <Alert severity="error">{createChapter.error.message}</Alert>
        )}

        <Stack direction="row" gap={1.5} justifyContent="flex-end">
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleSave(false)}
            disabled={createChapter.isPending || !canSave}
          >
            Save as Draft
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => handleSave(true)}
            disabled={createChapter.isPending || !canSave}
          >
            {createChapter.isPending ? "Saving…" : "Publish Chapter"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export const CreativePageClient = ({ slug, authorId, description, initialChapters }: Props) => {
  const [tab, setTab] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuthContext();
  const isAuthor = user?.id === authorId;

  const handleChapterSaved = (ch: Chapter) => {
    setChapters((prev) => [...prev, ch]);
    setShowForm(false);
  };

  return (
    <Container maxWidth="md">
      <Divider />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 0 }}>
        <Tab label="About" />
        <Tab label={`Chapters (${chapters.length})`} />
      </Tabs>

      {/* About */}
      <TabPanel value={tab} index={0}>
        <Stack gap={3}>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
            {description || "No synopsis yet."}
          </Typography>
        </Stack>
      </TabPanel>

      {/* Chapters */}
      <TabPanel value={tab} index={1}>
        {chapters.length === 0 && !showForm ? (
          <Stack alignItems="center" py={6} gap={2}>
            <Typography color="text.secondary">
              {isAuthor ? "No chapters yet. Add the first one below." : "No chapters published yet."}
            </Typography>
          </Stack>
        ) : (
          <List disablePadding>
            <Stack gap={0} divider={<Divider />}>
              {chapters.map((ch, i) => (
                <Box
                  key={ch.id}
                  component={NextLink}
                  href={`/creative/${slug}/chapter/${ch.slug}`}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    py: 2,
                    px: 1,
                    borderRadius: 1,
                    textDecoration: "none",
                    color: "inherit",
                    transition: "background-color 0.15s",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 28, mt: 0.25, color: "text.secondary" }}>
                    {i + 1}
                  </Typography>
                  <Stack gap={0.5} flex={1}>
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {ch.title}
                      </Typography>
                      {isAuthor && ch.published === 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            px: 0.75,
                            py: 0.25,
                            borderRadius: 0.5,
                            bgcolor: "action.selected",
                            color: "text.secondary",
                            fontSize: "0.65rem",
                            fontWeight: 600,
                          }}
                        >
                          Draft
                        </Typography>
                      )}
                    </Stack>
                    {ch.content && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: ch.content.replace(/<[^>]+>/g, " ").slice(0, 160),
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </List>
        )}

        {isAuthor && (
          <Box mt={2}>
            {showForm ? (
              <>
                <ChapterForm slug={slug} onSaved={handleChapterSaved} />
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => setShowForm(false)}
                  sx={{ mt: 1.5, color: "text.secondary" }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowForm(true)}
                sx={{ mt: chapters.length > 0 ? 2 : 0 }}
              >
                Add Chapter
              </Button>
            )}
          </Box>
        )}
      </TabPanel>
    </Container>
  );
};
