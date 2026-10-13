"use client";

import { Alert, Button, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { CoverInput } from "../cover-input";
import { TagInput } from "../tag-input";

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

export interface StoryFormValues {
  title: string;
  coverImage: string;
  description: string;
  genre: string;
  tags: string[];
}

interface StoryFormProps {
  initialValues?: Partial<StoryFormValues>;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  error?: string;
  onSubmit: (values: StoryFormValues) => void;
  onCancel?: () => void;
}

export const StoryForm = ({
  initialValues,
  submitLabel,
  pendingLabel,
  isPending,
  error,
  onSubmit,
  onCancel,
}: StoryFormProps) => {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [coverImage, setCoverImage] = useState(initialValues?.coverImage ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [genre, setGenre] = useState(initialValues?.genre ?? "");
  const [tags, setTags] = useState<string[]>(initialValues?.tags ?? []);
  const [coverUploading, setCoverUploading] = useState(false);

  const canSubmit = title.trim() && description.trim() && genre && !coverUploading;
  // keep a genre that's no longer in the list selectable when editing older works
  const genres = genre && !GENRES.includes(genre) ? [genre, ...GENRES] : GENRES;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ title, coverImage, description, genre, tags });
  };

  return (
    <Stack
      sx={{
        gap: 3.5,
      }}
    >
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        fullWidth
        required
        placeholder="The name of your story"
      />

      <CoverInput
        value={coverImage}
        onChange={setCoverImage}
        onUploadingChange={setCoverUploading}
        disabled={isPending}
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
          {genres.map((g) => (
            <MenuItem key={g} value={g}>
              {g}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TagInput value={tags} onChange={setTags} disabled={isPending} />

      {error && <Alert severity="error">{error}</Alert>}

      <Stack
        direction="row"
        sx={{
          justifyContent: "flex-end",
          gap: 2,
          pt: 1,
        }}
      >
        {onCancel && (
          <Button size="large" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
        )}
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={isPending || !canSubmit}
          sx={{ px: 5 }}
        >
          {isPending ? pendingLabel : submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
};
