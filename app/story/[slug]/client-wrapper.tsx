"use client";

import AddIcon from "@mui/icons-material/Add";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import {
  Box,
  Button,
  Container,
  Divider,
  Pagination,
  PaginationItem,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ChapterCreate, ChapterRow, CritiquesPanel, StoryActions, TabPanel } from "@/app/components";
import { useAuthContext } from "@/app/contexts";
import type { ChapterOrder, ChapterPage } from "@/lib";

interface Props {
  slug: string;
  authorId: string;
  published: boolean;
  description: string;
  chapterPage: ChapterPage;
  firstChapterSlug: string | null;
  // where the signed-in reader left off, if they've read this story before
  lastRead: { slug: string; title: string; number: number } | null;
  // chapters on this page the signed-in reader has opened
  readChapterIds: string[];
}

// pages are real URLs rendered on the server; defaults are left out to keep links clean
const chaptersHref = (page: number, order: ChapterOrder) => {
  const params = new URLSearchParams({ tab: "chapters" });
  if (page > 1) params.set("page", String(page));
  if (order === "oldest") params.set("order", order);
  return `?${params}#chapters`;
};

export const StoryPageClient = ({
  slug,
  authorId,
  published,
  description,
  chapterPage,
  firstChapterSlug,
  lastRead,
  readChapterIds,
}: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const TABS = ["about", "chapters", "critiques"];
  const [tab, setTab] = useState(Math.max(0, TABS.indexOf(searchParams.get("tab") ?? "")));
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuthContext();
  const isAuthor = user?.id === authorId;
  const { chapters, total, page, pageSize, pageCount, order } = chapterPage;

  // re-render from the server so numbering and page boundaries stay right
  const handleChapterSaved = () => {
    setShowForm(false);
    // a new chapter lands last: on the final page oldest-first, on page 1 newest-first
    const target = order === "newest" ? 1 : Math.ceil((total + 1) / pageSize);
    if (target === page) router.refresh();
    else router.push(chaptersHref(target, order));
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>
      <Box sx={{ mb: 3 }}>
        <StoryActions
          slug={slug}
          authorId={authorId}
          published={published}
          firstChapterSlug={firstChapterSlug ?? undefined}
          lastRead={lastRead}
          onAddChapter={() => {
            setTab(1);
            setShowForm(true);
          }}
          onCritique={() => setTab(2)}
        />
      </Box>

      <Divider />

      <Tabs id="chapters" value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 0, scrollMarginTop: 80 }}>
        <Tab label="About" />
        <Tab label={`Chapters (${total})`} />
        <Tab label="Critiques" />
      </Tabs>

      {/* About */}
      <TabPanel value={tab} index={0}>
        <Typography
          variant="body1"
          sx={{
            color: "text.secondary",
            whiteSpace: "pre-line",
            lineHeight: 1.9,
          }}
        >
          {description || "No synopsis yet."}
        </Typography>
      </TabPanel>

      {/* Chapters */}
      <TabPanel value={tab} index={1}>
        {total > 1 && (
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {pageCount > 1
                ? `${(page - 1) * pageSize + 1}–${(page - 1) * pageSize + chapters.length} of ${total}`
                : `${total} chapters`}
            </Typography>
            <Button
              component={NextLink}
              href={chaptersHref(1, order === "newest" ? "oldest" : "newest")}
              size="small"
              color="inherit"
              startIcon={<SwapVertIcon />}
              sx={{ color: "text.secondary" }}
            >
              {order === "newest" ? "Newest first" : "Oldest first"}
            </Button>
          </Stack>
        )}

        {total === 0 && !showForm ? (
          <Stack
            sx={{
              alignItems: "center",
              py: 8,
              gap: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
              }}
            >
              {isAuthor ? "No chapters yet." : "No chapters published yet."}
            </Typography>
          </Stack>
        ) : (
          <Stack
            divider={<Divider />}
            sx={{
              gap: 0,
            }}
          >
            {chapters.map((ch) => (
              <ChapterRow
                key={ch.id}
                chapter={ch}
                number={ch.number}
                read={readChapterIds.includes(ch.id)}
                lastRead={ch.slug === lastRead?.slug}
                slug={slug}
                isAuthor={isAuthor}
                onEdited={() => router.refresh()}
                onDeleted={() => router.refresh()}
              />
            ))}
          </Stack>
        )}

        {pageCount > 1 && (
          <Pagination
            page={page}
            count={pageCount}
            shape="rounded"
            siblingCount={1}
            sx={{ mt: 3, "& ul": { justifyContent: "center" } }}
            renderItem={(item) => (
              <PaginationItem component={NextLink} href={chaptersHref(item.page ?? 1, order)} {...item} />
            )}
          />
        )}

        {isAuthor && (
          <Box
            sx={{
              mt: total > 0 ? 3 : 0,
            }}
          >
            <ChapterCreate
              slug={slug}
              open={showForm}
              onSaved={handleChapterSaved}
              onCancel={() => setShowForm(false)}
            />
            {!showForm && (
              <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShowForm(true)} size="small">
                  Add Chapter
                </Button>
                {total > 0 && (
                  <Button
                    component={NextLink}
                    href={`/story/${slug}/chapters`}
                    color="inherit"
                    startIcon={<TuneIcon />}
                    size="small"
                    sx={{ color: "text.secondary" }}
                  >
                    Manage chapters
                  </Button>
                )}
              </Stack>
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
