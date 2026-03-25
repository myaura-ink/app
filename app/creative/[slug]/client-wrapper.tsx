"use client";

import { Avatar, Container, Divider, List, ListItemButton, Rating, Stack, Tab, Tabs, Typography } from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";
import { TabPanel } from "@/app/components";

interface Chapter {
  id: number;
  slug: string;
  title: string;
  teaser: string;
}

interface Critique {
  id: number;
  user: string;
  avatar: string;
  date: string;
  rating: number;
  text: string;
}

export const CreativePageClient = ({
  slug,
  chapters,
  critiques,
  description,
}: {
  slug: string;
  chapters: Chapter[];
  critiques: Critique[];
  description: string;
}) => {
  const [tab, setTab] = useState(0);

  return (
    <Container maxWidth="md">
      <Divider />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 0 }}>
        <Tab label="About" />
        <Tab label="Chapters" />
        <Tab label="Critiques" />
      </Tabs>

      {/* About */}
      <TabPanel value={tab} index={0}>
        <Stack gap={3}>
          <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>
            {description}
          </Typography>
        </Stack>
      </TabPanel>

      {/* Chapters */}
      <TabPanel value={tab} index={1}>
        <List>
          <Stack gap={0} divider={<Divider />}>
            {chapters.map((ch) => (
              <ListItemButton key={ch.id} component={NextLink} href={`/creative/${slug}/chapter/${ch.slug}`}>
                <Stack
                  direction="row"
                  gap={2}
                  alignItems="flex-start"
                  sx={{
                    py: 2,
                    px: 1,
                    borderRadius: 1,
                    color: "inherit",
                    transition: "color 0.15s",
                  }}
                >
                  <Typography variant="body2" fontWeight={700} sx={{ minWidth: 28, mt: 0.25, color: "inherit" }}>
                    {ch.id}
                  </Typography>
                  <Stack gap={0.5}>
                    <Typography variant="subtitle2" fontWeight={600} color="inherit">
                      {ch.title}
                    </Typography>
                    <Typography variant="body2" color="inherit" sx={{ opacity: 0.75 }}>
                      {ch.teaser}
                    </Typography>
                  </Stack>
                </Stack>
              </ListItemButton>
            ))}
          </Stack>
        </List>
      </TabPanel>

      {/* Critiques */}
      <TabPanel value={tab} index={2}>
        <Stack gap={3}>
          {critiques.map((c) => (
            <Stack key={c.id} gap={1.5}>
              <Stack direction="row" gap={1.5} alignItems="center">
                <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: "primary.main" }}>{c.avatar}</Avatar>
                <Stack gap={0}>
                  <Stack direction="row" gap={0.5} alignItems="center">
                    <Typography variant="subtitle2" fontWeight={600}>
                      {c.user}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.date}
                    </Typography>
                  </Stack>
                  <Rating value={c.rating} readOnly size="small" />
                </Stack>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {c.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </TabPanel>
    </Container>
  );
};
