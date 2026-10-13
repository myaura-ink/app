"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { StoryCard, TabPanel } from "@/app/components";
import { useDeleteStories } from "@/app/hooks/useStories";
import { SelectStoryWithAuthor } from "@/lib";
import { LibraryTab } from "./library-tab";
import { Selectable, SelectionToolbar, useSelection } from "./selection";

// ─── Delete Works Confirm Dialog ─────────────────────────────────────────────

const MAX_TITLES_SHOWN = 5;

function DeleteWorksDialog({
  open,
  works,
  onClose,
  onDeleted,
}: {
  open: boolean;
  works: SelectStoryWithAuthor[];
  onClose: () => void;
  onDeleted: () => void;
}) {
  const deleteStories = useDeleteStories();
  const hidden = works.length - MAX_TITLES_SHOWN;

  return (
    <Dialog open={open} onClose={deleteStories.isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{works.length === 1 ? "Delete this story?" : `Delete ${works.length} stories?`}</DialogTitle>
      <DialogContent>
        <Box component="ul" sx={{ m: 0, mb: 1.5, pl: 2.5 }}>
          {works.slice(0, MAX_TITLES_SHOWN).map((work) => (
            <Typography component="li" variant="body2" key={work.id} sx={{ fontWeight: 600 }}>
              {work.title}
            </Typography>
          ))}
          {hidden > 0 && (
            <Typography component="li" variant="body2" sx={{ color: "text.secondary" }}>
              and {hidden} more
            </Typography>
          )}
        </Box>
        <DialogContentText variant="body2">
          Their chapters, critiques, and library entries will be permanently deleted. This cannot be undone.
        </DialogContentText>
        {deleteStories.isError && (
          <Alert severity="error" sx={{ mt: 1.5 }}>
            {deleteStories.error.message}
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button size="small" color="inherit" onClick={onClose} disabled={deleteStories.isPending}>
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          disabled={deleteStories.isPending}
          onClick={() =>
            deleteStories.mutate(
              works.map((w) => w.id as string),
              { onSuccess: onDeleted },
            )
          }
        >
          {deleteStories.isPending ? "Deleting..." : "Delete permanently"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface Props {
  userSlug: string;
  userName: string | null;
  memberSince: string | null;
  isOwn: boolean;
  stories: SelectStoryWithAuthor[];
  library: SelectStoryWithAuthor[];
}

export const ProfilePageClient = ({ userSlug, isOwn, userName, stories, library, memberSince }: Props) => {
  const [tab, setTab] = useState(0);
  const selection = useSelection(stories.map((c) => c.id as string));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const memberYear = memberSince ? new Date(memberSince).getFullYear() : null;

  const selectedWorks = stories.filter((c) => selection.selected.has(c.id as string));

  return (
    <Box sx={{ width: "100%" }}>
      <Container maxWidth="md" disableGutters sx={{ mt: 3 }}>
        <Divider />
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 0 }}>
          <Tab label="Works" />
          <Tab label="Library" />
          <Tab label="About" />
        </Tabs>

        {/* Works */}
        <TabPanel value={tab} index={0}>
          {stories.length === 0 ? (
            <Stack
              sx={{
                alignItems: "center",
                py: 6,
                gap: 2,
              }}
            >
              <Typography
                sx={{
                  color: "text.secondary",
                }}
              >
                {isOwn ? "You haven't written anything yet." : "No published works yet."}
              </Typography>
              {isOwn && (
                <Button variant="contained" href="/write" startIcon={<AddIcon />}>
                  Start writing
                </Button>
              )}
            </Stack>
          ) : (
            <>
              {isOwn && (
                <SelectionToolbar
                  selection={selection}
                  summary={`${stories.length} ${stories.length === 1 ? "work" : "works"}`}
                  selectAllLabel="Select all works"
                  canSelect
                  action={(count) => (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      startIcon={<DeleteOutlinedIcon />}
                      disabled={count === 0}
                      onClick={() => setConfirmOpen(true)}
                    >
                      Delete{count > 0 ? ` (${count})` : ""}
                    </Button>
                  )}
                />
              )}

              <Box sx={{ display: { xs: "none", sm: "flex" }, flexWrap: "wrap", gap: 2 }}>
                {stories.map((story) => (
                  <Box key={story.id} sx={{ position: "relative" }}>
                    <Selectable selection={selection} id={story.id as string} label={story.title ?? "story"}>
                      <>
                        {isOwn && story.published === 0 && (
                          <Chip
                            label="Draft"
                            size="small"
                            sx={{ position: "absolute", top: 8, left: 8, zIndex: 1, fontSize: "0.65rem" }}
                          />
                        )}
                        <StoryCard {...story} variant="card" />
                      </>
                    </Selectable>
                  </Box>
                ))}
              </Box>
              <Stack
                divider={<Divider />}
                sx={{
                  gap: 0,
                  display: { xs: "flex", sm: "none" },
                }}
              >
                {stories.map((story) => (
                  <Box key={story.id}>
                    <Selectable selection={selection} id={story.id as string} label={story.title ?? "story"}>
                      <StoryCard {...story} variant="list" />
                    </Selectable>
                  </Box>
                ))}
              </Stack>
            </>
          )}
        </TabPanel>

        {isOwn && (
          <DeleteWorksDialog
            open={confirmOpen}
            works={selectedWorks}
            onClose={() => setConfirmOpen(false)}
            onDeleted={() => {
              setConfirmOpen(false);
              selection.exit();
            }}
          />
        )}

        {/* Library */}
        <TabPanel value={tab} index={1}>
          <LibraryTab isOwn={isOwn} items={library} />
        </TabPanel>

        {/* About */}
        <TabPanel value={tab} index={2}>
          <Stack
            sx={{
              gap: 2,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                lineHeight: 1.8,
              }}
            >
              {userName ?? userSlug} is a writer on Aura.
            </Typography>
            <Divider />
            <Stack
              sx={{
                gap: 1,
              }}
            >
              {memberYear && (
                <Typography variant="body2">
                  <strong>Member since:</strong> {memberYear}
                </Typography>
              )}
            </Stack>
          </Stack>
        </TabPanel>
      </Container>
    </Box>
  );
};
