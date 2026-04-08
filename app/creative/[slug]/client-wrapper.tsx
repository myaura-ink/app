"use client";

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Container, Divider, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChapterCreate, ChapterRow, CritiquesPanel, TabPanel } from "@/app/components";
import { useAuthContext } from "@/app/contexts";
import { SelectChapter } from "@/lib";

interface Props {
  slug: string;
  authorId: string;
  description: string;
  initialChapters: Partial<SelectChapter>[];
}

export const CreativePageClient = ({ slug, authorId, description, initialChapters }: Props) => {
  const searchParams = useSearchParams();
  const isChapterTab = searchParams.get("tab") === "chapters";
  const [tab, setTab] = useState(isChapterTab ? 1 : 0);
  const [chapters, setChapters] = useState<Partial<SelectChapter>[]>(initialChapters);
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuthContext();
  const isAuthor = user?.id === authorId;

  const handleChapterSaved = (ch: Partial<SelectChapter>) => {
    setChapters((prev) => [...prev, ch]);
    setShowForm(false);
  };

  const handleChapterEdited = (updated: Partial<SelectChapter>) => {
    setChapters((prev) => prev.map((ch) => (ch.id === updated.id ? { ...ch, ...updated } : ch)));
  };

  const handleChapterDeleted = (id: string) => {
    setChapters((prev) => prev.filter((ch) => ch.id !== id));
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>
      <Divider />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 0 }}>
        <Tab label="About" />
        <Tab label={`Chapters (${chapters.length})`} />
        <Tab label="Critiques" />
      </Tabs>

      {/* About */}
      <TabPanel value={tab} index={0}>
        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.9 }}>
          {description || "No synopsis yet."}
        </Typography>
      </TabPanel>

      {/* Chapters */}
      <TabPanel value={tab} index={1}>
        {chapters.length === 0 && !showForm ? (
          <Stack alignItems="center" py={8} gap={2}>
            <Typography color="text.disabled" variant="body2">
              {isAuthor ? "No chapters yet." : "No chapters published yet."}
            </Typography>
          </Stack>
        ) : (
          <Stack gap={0} divider={<Divider />}>
            {chapters.map((ch, i) => (
              <ChapterRow
                key={ch.id}
                chapter={ch}
                index={i}
                slug={slug}
                isAuthor={isAuthor}
                onEdited={handleChapterEdited}
                onDeleted={handleChapterDeleted}
              />
            ))}
          </Stack>
        )}

        {isAuthor && (
          <Box mt={chapters.length > 0 ? 3 : 0}>
            <ChapterCreate
              slug={slug}
              open={showForm}
              onSaved={handleChapterSaved}
              onCancel={() => setShowForm(false)}
            />
            {!showForm && (
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowForm(true)} size="small">
                Add Chapter
              </Button>
            )}
          </Box>
        )}
      </TabPanel>

      {/* Critiques */}
      <TabPanel value={tab} index={2}>
        <CritiquesPanel slug={slug} authorId={authorId} />
      </TabPanel>
    </Container>
  );
};
