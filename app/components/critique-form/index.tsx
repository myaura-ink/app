"use client";

import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { Alert, Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useAddCritique } from "@/app/hooks/useCreatives";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <Stack direction="row" gap={0.25} onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <IconButton
          key={n}
          size="small"
          disableRipple
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          sx={{ p: 0.25, color: n <= active ? "warning.main" : "action.disabled", transition: "color 0.1s" }}
        >
          {n <= active ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
        </IconButton>
      ))}
    </Stack>
  );
}

export const CritiqueForm = ({ slug, onDone }: { slug: string; onDone: () => void }) => {
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(0);
  const addCritique = useAddCritique(slug);

  const handleSubmit = () => {
    if (!body.trim() || rating === 0) return;
    addCritique.mutate({ body, rating }, { onSuccess: onDone });
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        p: { xs: 2, sm: 2.5 },
        bgcolor: "background.default",
      }}
    >
      <Typography
        variant="overline"
        color="secondary.main"
        fontWeight={600}
        letterSpacing="0.12em"
        mb={2}
        display="block"
      >
        Your Critique
      </Typography>
      <Stack gap={2}>
        <Stack gap={0.75}>
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Rating
          </Typography>
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <Typography variant="caption" color="text.disabled">
              {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
            </Typography>
          )}
        </Stack>
        <TextField
          placeholder="Share your honest thoughts on this story…"
          multiline
          minRows={4}
          fullWidth
          value={body}
          onChange={(e) => setBody(e.target.value)}
          size="small"
        />
        {addCritique.isError && <Alert severity="error">{addCritique.error.message}</Alert>}
        <Stack direction="row" gap={1.5} justifyContent="flex-end">
          <Button size="small" color="inherit" onClick={onDone} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmit}
            disabled={addCritique.isPending || !body.trim() || rating === 0}
          >
            {addCritique.isPending ? "Posting…" : "Post Critique"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
