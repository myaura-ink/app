"use client";

import BookmarkRemoveOutlinedIcon from "@mui/icons-material/BookmarkRemoveOutlined";
import { Box, Button, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { StoryCard } from "@/app/components";
import { useRemoveFromLibrary } from "@/app/hooks/useStories";
import { SelectStoryWithAuthor } from "@/lib";
import { Selectable, SelectionToolbar, useSelection } from "./selection";

type SortKey = "saved" | "title" | "author";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "saved", label: "Recently saved" },
  { value: "title", label: "Title" },
  { value: "author", label: "Author" },
];

const byText = (pick: (c: SelectStoryWithAuthor) => string | null | undefined) => {
  return (a: SelectStoryWithAuthor, b: SelectStoryWithAuthor) =>
    (pick(a) ?? "").localeCompare(pick(b) ?? "", undefined, { sensitivity: "base" });
};

const sorters: Record<SortKey, ((a: SelectStoryWithAuthor, b: SelectStoryWithAuthor) => number) | null> = {
  // the server already returns newest saves first
  saved: null,
  title: byText((c) => c.title),
  author: byText((c) => c.author.name ?? c.author.slug),
};

interface LibraryTabProps {
  isOwn: boolean;
  items: SelectStoryWithAuthor[];
}

export const LibraryTab = ({ isOwn, items }: LibraryTabProps) => {
  const [sort, setSort] = useState<SortKey>("saved");
  const selection = useSelection(items.map((c) => c.id as string));
  const remove = useRemoveFromLibrary();

  const sorted = useMemo(() => {
    const sorter = sorters[sort];
    return sorter ? [...items].sort(sorter) : items;
  }, [items, sort]);

  if (items.length === 0) {
    return (
      <Stack sx={{ alignItems: "center", py: 6, gap: 2 }}>
        <Typography sx={{ color: "text.secondary" }}>
          {isOwn ? "You haven't saved any stories yet." : "No saved stories yet."}
        </Typography>
        {isOwn && (
          <Button variant="outlined" href="/">
            Find something to read
          </Button>
        )}
      </Stack>
    );
  }

  const card = (story: SelectStoryWithAuthor, variant: "card" | "list") => (
    <Selectable selection={selection} id={story.id as string} label={story.title ?? "story"}>
      <StoryCard {...story} variant={variant} />
    </Selectable>
  );

  return (
    <>
      <SelectionToolbar
        selection={selection}
        summary={`${items.length} ${items.length === 1 ? "story" : "stories"} saved`}
        selectAllLabel="Select all saved stories"
        canSelect={isOwn}
        controls={
          <TextField
            select
            size="small"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            slotProps={{ htmlInput: { "aria-label": "Sort library" } }}
            sx={{ minWidth: 150, "& .MuiInputBase-input": { py: 0.75, fontSize: "0.8125rem" } }}
          >
            {SORT_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        }
        action={(count) => (
          <Button
            size="small"
            variant="contained"
            startIcon={<BookmarkRemoveOutlinedIcon />}
            disabled={count === 0 || remove.isPending}
            onClick={() => remove.mutate([...selection.selected], { onSuccess: selection.exit })}
          >
            {remove.isPending ? "Removing..." : `Remove${count > 0 ? ` (${count})` : ""}`}
          </Button>
        )}
      />

      <Box sx={{ display: { xs: "none", sm: "flex" }, flexWrap: "wrap", gap: 2 }}>
        {sorted.map((story) => (
          <Box key={story.id}>{card(story, "card")}</Box>
        ))}
      </Box>
      <Stack divider={<Divider />} sx={{ display: { xs: "flex", sm: "none" } }}>
        {sorted.map((story) => (
          <Box key={story.id}>{card(story, "list")}</Box>
        ))}
      </Stack>
    </>
  );
};
