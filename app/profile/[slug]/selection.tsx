"use client";

import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import { Box, Button, Checkbox, Stack, Typography } from "@mui/material";
import { type KeyboardEvent, type ReactNode, useState } from "react";

// Multi-select state for a list of items, shared by the profile tabs.
export const useSelection = (ids: string[]) => {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = ids.length > 0 && selected.size === ids.length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return {
    selecting,
    selected,
    allSelected,
    toggle,
    toggleAll: () => setSelected(allSelected ? new Set() : new Set(ids)),
    start: () => setSelecting(true),
    exit: () => {
      setSelecting(false);
      setSelected(new Set());
    },
  };
};

export type Selection = ReturnType<typeof useSelection>;

interface SelectionToolbarProps {
  selection: Selection;
  /** e.g. "3 works", shown when not selecting */
  summary: string;
  /** label for the select-all checkbox */
  selectAllLabel: string;
  canSelect: boolean;
  /** controls shown next to the Select button, such as sorting */
  controls?: ReactNode;
  /** the bulk action, rendered with the selected count */
  action: (count: number) => ReactNode;
}

export const SelectionToolbar = ({
  selection,
  summary,
  selectAllLabel,
  canSelect,
  controls,
  action,
}: SelectionToolbarProps) => {
  const { selecting, selected, allSelected } = selection;

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        mb: 2,
        minHeight: 48,
        px: selecting ? 1 : 0,
        borderRadius: 2,
        bgcolor: selecting ? "background.default" : "transparent",
        border: "1px solid",
        borderColor: selecting ? "divider" : "transparent",
        position: selecting ? "sticky" : "static",
        top: 72,
        zIndex: 3,
      }}
    >
      {selecting ? (
        <>
          <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={selected.size > 0 && !allSelected}
              onChange={selection.toggleAll}
              slotProps={{ input: { "aria-label": selectAllLabel } }}
            />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {selected.size} selected
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: 1 }}>
            <Button size="small" color="inherit" onClick={selection.exit}>
              Cancel
            </Button>
            {action(selected.size)}
          </Stack>
        </>
      ) : (
        <>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {summary}
          </Typography>
          <Stack direction="row" sx={{ gap: 1, alignItems: "center" }}>
            {controls}
            {canSelect && (
              <Button size="small" variant="outlined" startIcon={<CheckBoxOutlinedIcon />} onClick={selection.start}>
                Select
              </Button>
            )}
          </Stack>
        </>
      )}
    </Stack>
  );
};

interface SelectableProps {
  selection: Selection;
  id: string;
  label: string;
  children: ReactNode;
}

// In selection mode a card toggles its checkbox instead of navigating.
export const Selectable = ({ selection, id, label, children }: SelectableProps) => {
  if (!selection.selecting) return <>{children}</>;
  const checked = selection.selected.has(id);

  return (
    <Box
      role="checkbox"
      aria-checked={checked}
      aria-label={`Select ${label}`}
      tabIndex={0}
      onClickCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
        selection.toggle(id);
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          selection.toggle(id);
        }
      }}
      sx={{
        position: "relative",
        cursor: "pointer",
        borderRadius: 2,
        outline: "2px solid",
        outlineColor: checked ? "primary.main" : "transparent",
        outlineOffset: 2,
        transition: "outline-color 0.15s",
        "&:focus-visible": { outlineColor: checked ? "primary.dark" : "secondary.main" },
      }}
    >
      <Checkbox
        checked={checked}
        tabIndex={-1}
        size="small"
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          zIndex: 2,
          p: 0.5,
          bgcolor: "background.paper",
          borderRadius: 1,
          pointerEvents: "none",
          "&:hover": { bgcolor: "background.paper" },
        }}
      />
      {children}
    </Box>
  );
};
