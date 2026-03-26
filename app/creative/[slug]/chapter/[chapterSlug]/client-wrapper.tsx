"use client";

import { ArrowBack, FormatListBulleted } from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";

const SIDEBAR_WIDTH = 272;

interface ChapterData {
  id: number;
  slug: string;
  title: string;
}

interface ChapterContent {
  title: string;
  body: string[];
}

export const ChapterPageClient = ({
  slug,
  chapterSlug,
  book,
  chapters,
  chapter,
  prev,
  next,
}: {
  slug: string;
  chapterSlug: string;
  book: { slug: string; title: string };
  chapters: ChapterData[];
  chapter: ChapterContent;
  prev: ChapterData | null;
  next: ChapterData | null;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarContent = (
    <Box sx={{ width: SIDEBAR_WIDTH, display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ px: 2.5, pt: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <Tooltip title="Back to creative">
            <IconButton
              component={NextLink}
              href={`/creative/${slug}`}
              size="small"
              sx={{ ml: -1, display: { xs: "none", md: "flex" } }}
            >
              <ArrowBack fontSize="small" />
            </IconButton>
          </Tooltip>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" color="text.disabled" fontWeight={600}>
              Chapters
            </Typography>
            <Typography variant="subtitle2" fontWeight={700} color="text.primary" noWrap>
              {book?.title || "Untitled"}
            </Typography>
          </Box>
        </Stack>
      </Box>
      <Divider />
      <List dense sx={{ flex: 1, overflowY: "auto", py: 1 }}>
        {chapters.map((ch) => {
          const isActive = ch.slug === chapterSlug;
          return (
            <ListItem key={ch.slug} disablePadding>
              <ListItemButton
                component={NextLink}
                href={`/creative/${slug}/chapter/${ch.slug}`}
                onClick={() => isMobile && setSidebarOpen(false)}
                selected={isActive}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  "&.Mui-selected": { bgcolor: "primary.main", color: "white", "&:hover": { bgcolor: "primary.dark" } },
                }}
              >
                <ListItemText
                  primary={
                    <Stack direction="row" gap={1.5} alignItems="baseline">
                      <Typography
                        variant="caption"
                        sx={{ color: isActive ? "rgba(255,255,255,0.6)" : "text.disabled", minWidth: 20 }}
                      >
                        {ch.id}
                      </Typography>
                      <Typography variant="body2" fontWeight={isActive ? 600 : 400}>
                        {ch.title}
                      </Typography>
                    </Stack>
                  }
                  disableTypography
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)" } }}
    >
      {/* Reader toolbar */}
      <Box
        sx={{
          flexShrink: 0,
          display: { xs: "flex", md: "none" },
          alignItems: "center",
          px: 2,
          py: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <IconButton component={NextLink} href={`/creative/${slug}`} size="small">
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ flex: 1, ml: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
        >
          {chapter.title}
        </Typography>
        <IconButton onClick={() => setSidebarOpen(true)} sx={{ display: { md: "none" } }}>
          <FormatListBulleted fontSize="small" />
        </IconButton>
      </Box>

      {/* Main content */}
      <Box sx={{ display: "flex", flex: 1 }}>
        {/* Sidebar - Desktop */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: "sticky",
            top: 0,
            height: "100%",
            alignSelf: "flex-start",
          }}
        >
          {sidebarContent}
        </Box>

        {/* Sidebar - Mobile */}
        <Drawer
          anchor="left"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{ display: { xs: "block", md: "none" } }}
        >
          {sidebarContent}
        </Drawer>

        {/* Reading area */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            px: { xs: 2, sm: 4 },
            py: 4,
          }}
        >
          <Box sx={{ maxWidth: "45rem", mx: "auto", width: "100%" }}>
            <Typography
              variant="h3"
              fontWeight={700}
              mb={4}
              lineHeight={1.2}
              sx={{ display: { xs: "none", md: "block" } }}
            >
              {chapter.title}
            </Typography>
            <Stack gap={3}>
              {chapter.body.map((paragraph, i) => (
                <Typography key={i} variant="body1" color="text.primary" lineHeight={1.8} sx={{ textAlign: "justify" }}>
                  {paragraph}
                </Typography>
              ))}
            </Stack>
          </Box>

          {/* Navigation */}
          <Divider sx={{ mt: 6, mb: 2 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: { xs: 2, sm: 4 },
              py: 2,
              maxWidth: "45rem",
              mx: "auto",
              width: "100%",
            }}
          >
            {prev ? (
              <Tooltip title={prev.title}>
                <IconButton component={NextLink} href={`/creative/${slug}/chapter/${prev.slug}`} size="small">
                  <ArrowBack fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Box />
            )}
            <Typography variant="caption" color="text.disabled">
              {(chapter as { title: string }).title || "?"}
            </Typography>
            {next ? (
              <Tooltip title={next.title}>
                <IconButton component={NextLink} href={`/creative/${slug}/chapter/${next.slug}`} size="small">
                  <ArrowBack fontSize="small" sx={{ transform: "rotate(180deg)" }} />
                </IconButton>
              </Tooltip>
            ) : (
              <Box />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
