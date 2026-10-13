"use client";

import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import BookmarkAddOutlinedIcon from "@mui/icons-material/BookmarkAddOutlined";
import { Button, CircularProgress } from "@mui/material";
import { useAuthContext } from "@/app/contexts";
import { useLibraryStatus, useToggleLibrary } from "@/app/hooks/useStories";

export function SaveButton({ slug }: { slug: string }) {
  const { user } = useAuthContext();
  const { data, isLoading } = useLibraryStatus(user ? slug : undefined);
  const toggle = useToggleLibrary(slug);
  const saved = data?.saved ?? false;

  if (!user) {
    return (
      <Button variant="outlined" href="/dive" startIcon={<BookmarkAddOutlinedIcon />}>
        Sign in to save
      </Button>
    );
  }

  const pending = isLoading || toggle.isPending;

  return (
    <Button
      variant={saved ? "contained" : "outlined"}
      onClick={() => toggle.mutate({ saved })}
      disabled={pending}
      aria-pressed={saved}
      startIcon={
        pending ? (
          <CircularProgress size={16} color="inherit" />
        ) : saved ? (
          <BookmarkAddedIcon />
        ) : (
          <BookmarkAddOutlinedIcon />
        )
      }
    >
      {saved ? "In your library" : "Save to library"}
    </Button>
  );
}
