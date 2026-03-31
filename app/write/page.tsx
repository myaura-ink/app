"use client";

import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRef, useState } from "react";
import { Footer, Header } from "../components";
import { useSupabase } from "../hooks/useSupabase";

const GENRES = [
  "Literary Fiction",
  "Fantasy",
  "Science Fiction",
  "Romance",
  "Mystery",
  "Thriller",
  "Horror",
  "Historical Fiction",
  "Climate Fiction",
  "Contemporary",
  "Slice of Life",
  "Magical Realism",
];

export default function WritePage() {
  const supabase = useSupabase();
  const editorRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");
  const [chapterTitle, setChapterTitle] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");

  const execFormat = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError("");
    setPublished(false);

    try {
      const chapterContent = editorRef.current?.innerHTML ?? "";

      const { error: dbError } = await supabase.from("stories").insert({
        title,
        cover_image: coverImage || null,
        description,
        genre,
        chapter_title: chapterTitle || null,
        chapter_content: chapterContent,
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;
      setPublished(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to publish. Please try again.");
    } finally {
      setPublishing(false);
    }
  };

  const canPublish = title.trim() && description.trim() && genre;

  return (
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        {/* Page heading */}
        <Stack gap={1} mb={6}>
          <Typography variant="overline" color="secondary.main" fontWeight={600} letterSpacing="0.12em">
            New Story
          </Typography>
          <Typography variant="h4" fontWeight={800} lineHeight={1.2}>
            Write something
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Fill in the details below and write your opening chapter.
          </Typography>
        </Stack>

        <Stack gap={3.5}>
          {/* Title */}
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            placeholder="The name of your story"
          />

          {/* Cover image */}
          <TextField
            label="Cover Image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            fullWidth
            placeholder="https://..."
            helperText="Paste a URL to an image for your story cover"
          />

          {/* Description */}
          <TextField
            label="Synopsis"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            multiline
            rows={4}
            placeholder="A short description of your story — what readers can expect"
          />

          {/* Genre */}
          <FormControl fullWidth required>
            <InputLabel>Genre</InputLabel>
            <Select value={genre} label="Genre" onChange={(e) => setGenre(e.target.value)}>
              {GENRES.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 1 }} />

          {/* Chapter section */}
          <Stack gap={0.5}>
            <Typography variant="overline" color="secondary.main" fontWeight={600} letterSpacing="0.12em">
              Chapter 1
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Write the opening chapter of your story.
            </Typography>
          </Stack>

          <TextField
            label="Chapter Title"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            fullWidth
            placeholder="e.g. The Beginning, or leave blank"
          />

          {/* Rich text editor */}
          <Box>
            {/* Formatting toolbar */}
            <Stack
              direction="row"
              gap={0.5}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderBottom: "none",
                borderRadius: "8px 8px 0 0",
                px: 1,
                py: 0.75,
                bgcolor: "background.default",
              }}
            >
              {[
                { cmd: "bold", Icon: FormatBoldIcon, label: "Bold" },
                { cmd: "italic", Icon: FormatItalicIcon, label: "Italic" },
                { cmd: "underline", Icon: FormatUnderlinedIcon, label: "Underline" },
              ].map(({ cmd, Icon, label }) => (
                <Tooltip key={cmd} title={label} placement="top">
                  <IconButton size="small" onMouseDown={(e) => { e.preventDefault(); execFormat(cmd); }}>
                    <Icon fontSize="small" />
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>

            {/* Editable area */}
            <Box
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Start writing your first chapter..."
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "0 0 8px 8px",
                p: 2.5,
                minHeight: 320,
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

          {/* Feedback */}
          {error && <Alert severity="error">{error}</Alert>}
          {published && <Alert severity="success">Story published successfully!</Alert>}

          {/* Publish */}
          <Stack direction="row" justifyContent="flex-end" pt={1}>
            <Button
              variant="contained"
              size="large"
              onClick={handlePublish}
              disabled={publishing || !canPublish}
              sx={{ px: 5 }}
            >
              {publishing ? "Publishing..." : "Publish"}
            </Button>
          </Stack>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}
