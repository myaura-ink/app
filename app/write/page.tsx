"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Footer } from "../components";
import { useCreateCreative } from "../hooks/useCreatives";

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
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [description, setDescription] = useState("");
  const [genre, setGenre] = useState("");

  const createCreative = useCreateCreative();
  const canCreate = title.trim() && description.trim() && genre;

  const handleCreate = () => {
    if (!canCreate) return;
    createCreative.mutate({ title, description, coverImage, genre });
  };

  return (
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack gap={1} mb={6}>
          <Typography variant="overline" color="secondary.main" fontWeight={600} letterSpacing="0.12em">
            New Story
          </Typography>
          <Typography variant="h4" fontWeight={800} lineHeight={1.2}>
            Start writing
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Give your story a title and a brief synopsis. You can add chapters once it&apos;s created.
          </Typography>
        </Stack>

        <Stack gap={3.5}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            placeholder="The name of your story"
          />

          <TextField
            label="Cover Image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            fullWidth
            placeholder="https://..."
            helperText="Paste a URL to an image for your story cover"
          />

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

          {createCreative.isError && (
            <Alert severity="error">{createCreative.error.message}</Alert>
          )}

          <Stack direction="row" justifyContent="flex-end" gap={2} pt={1}>
            <Button
              variant="contained"
              size="large"
              onClick={handleCreate}
              disabled={createCreative.isPending || !canCreate}
              sx={{ px: 5 }}
            >
              {createCreative.isPending ? "Creating..." : "Create Story"}
            </Button>
          </Stack>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}
