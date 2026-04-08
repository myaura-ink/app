"use client";

import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import { CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useAuthContext } from "@/app/contexts";
import { useReadingListStatus, useToggleReadingList } from "@/app/hooks/useCreatives";

export function SaveButton({ slug }: { slug: string }) {
  const { user } = useAuthContext();
  const { data, isLoading } = useReadingListStatus(user ? slug : undefined);
  const toggle = useToggleReadingList(slug);
  const saved = data?.saved ?? false;

  if (!user) return null;

  const pending = isLoading || toggle.isPending;

  return (
    <Tooltip title={saved ? "Remove from reading list" : "Save to reading list"} placement="bottom">
      <span>
        <IconButton
          onClick={() => toggle.mutate({ saved })}
          disabled={pending}
          size="medium"
          color={saved ? "primary" : "default"}
          sx={{
            border: "1px solid",
            borderColor: saved ? "primary.main" : "divider",
            borderRadius: 2,
            bgcolor: saved ? "primary.main" : "transparent",
            color: saved ? "primary.contrastText" : "text.secondary",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: saved ? "primary.dark" : "action.hover",
              borderColor: saved ? "primary.dark" : "text.secondary",
            },
          }}
        >
          {pending ? (
            <CircularProgress size={18} color="inherit" />
          ) : saved ? (
            <BookmarkAddedIcon fontSize="small" />
          ) : (
            <BookmarkAddOutlinedIcon fontSize="small" />
          )}
        </IconButton>
      </span>
    </Tooltip>
  );
}
