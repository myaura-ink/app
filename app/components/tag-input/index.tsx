"use client";

import { Autocomplete, Chip, TextField } from "@mui/material";
import { useState } from "react";
import { useTagSuggestions } from "@/app/hooks/useStories";
import { MAX_TAGS, normalizeTag, TAG_MAX_LENGTH, TAG_MIN_LENGTH } from "@/lib/utils/tags";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
}

// adds the normalized tags, skipping invalid ones and duplicates
const mergeTags = (current: string[], incoming: string[]) => {
  const next = [...current];
  for (const raw of incoming) {
    const { name } = normalizeTag(raw);
    if (name.length < TAG_MIN_LENGTH || name.length > TAG_MAX_LENGTH || next.includes(name)) continue;
    if (next.length >= MAX_TAGS) break;
    next.push(name);
  }
  return next;
};

export const TagInput = ({ value, onChange, disabled }: TagInputProps) => {
  const [input, setInput] = useState("");
  const { data: suggestions = [] } = useTagSuggestions(normalizeTag(input).name);
  const isFull = value.length >= MAX_TAGS;

  return (
    <Autocomplete
      multiple
      freeSolo
      disabled={disabled}
      options={suggestions.map((t) => t.name).filter((name) => !value.includes(name))}
      value={value}
      inputValue={input}
      onInputChange={(_, next, reason) => {
        // a comma commits the current tag, like pressing enter
        if (reason === "input" && next.includes(",")) {
          onChange(mergeTags(value, next.split(",")));
          setInput("");
          return;
        }
        setInput(next);
      }}
      onChange={(_, next) => onChange(mergeTags([], next))}
      filterOptions={(options) => options}
      renderValue={(tags, getItemProps) =>
        tags.map((tag, index) => {
          const { key, ...itemProps } = getItemProps({ index });
          return <Chip key={key} label={tag} size="small" {...itemProps} />;
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Tags"
          placeholder={isFull ? "" : "e.g. dark fantasy, slow burn"}
          helperText={`Press enter or comma to add. Up to ${MAX_TAGS} tags, used for search and discovery.`}
          slotProps={{
            ...params.slotProps,
            htmlInput: { ...params.slotProps.htmlInput, maxLength: TAG_MAX_LENGTH, readOnly: isFull },
          }}
        />
      )}
    />
  );
};
