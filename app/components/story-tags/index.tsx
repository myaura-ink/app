"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { Button, Chip, IconButton, Stack, Tooltip } from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";
import { useAuthContext } from "@/app/contexts";
import { useUpdateStoryTags } from "@/app/hooks/useStories";
import { normalizeTag } from "@/lib/utils/tags";
import { tagSearchHref } from "../story-card";
import { TagInput } from "../tag-input";

interface StoryTagsProps {
  storySlug: string;
  authorId: string;
  tags: string[];
}

export const StoryTags = ({ storySlug, authorId, tags }: StoryTagsProps) => {
  const { user } = useAuthContext();
  const isAuthor = user?.id === authorId;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(tags);
  const updateTags = useUpdateStoryTags(storySlug);

  if (editing) {
    return (
      <Stack sx={{ gap: 1, width: "100%" }}>
        <TagInput value={draft} onChange={setDraft} disabled={updateTags.isPending} />
        <Stack direction="row" sx={{ gap: 1, justifyContent: "flex-end" }}>
          <Button size="small" onClick={() => setEditing(false)} disabled={updateTags.isPending}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={updateTags.isPending}
            onClick={() => updateTags.mutate(draft, { onSuccess: () => setEditing(false) })}
          >
            {updateTags.isPending ? "Saving..." : "Save tags"}
          </Button>
        </Stack>
      </Stack>
    );
  }

  if (tags.length === 0 && !isAuthor) return null;

  return (
    <Stack
      direction="row"
      sx={{
        gap: 0.75,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: { xs: "center", sm: "flex-start" },
      }}
    >
      {tags.map((tag) => (
        <Chip
          key={tag}
          component={NextLink}
          href={tagSearchHref(normalizeTag(tag).slug)}
          clickable
          label={`#${tag}`}
          size="small"
          variant="outlined"
        />
      ))}
      {isAuthor &&
        (tags.length === 0 ? (
          <Button size="small" startIcon={<EditOutlinedIcon />} onClick={() => setEditing(true)}>
            Add tags
          </Button>
        ) : (
          <Tooltip title="Edit tags">
            <IconButton
              size="small"
              aria-label="Edit tags"
              onClick={() => {
                setDraft(tags);
                setEditing(true);
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ))}
    </Stack>
  );
};
