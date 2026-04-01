"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { CreativeCard, TabPanel } from "@/app/components";
import { useAuthContext } from "@/app/contexts";
import { useUserCreatives } from "@/app/hooks/useCreatives";

interface Props {
  userSlug: string;
  userId: string;
  userName: string | null;
  memberSince: string | null;
}

export const PortfolioPageClient = ({ userSlug, userId, userName, memberSince }: Props) => {
  const [tab, setTab] = useState(0);
  const { user: authUser, token } = useAuthContext();
  const isOwn = authUser?.id === userId;

  const { data, isLoading } = useUserCreatives(userSlug, isOwn ? token : null);
  const works = data?.creatives ?? [];

  const memberYear = memberSince ? new Date(memberSince).getFullYear() : null;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Write button + stats row */}
      <Stack direction="row" gap={3} alignItems="center" mb={0}>
        {isOwn && (
          <Button
            variant="contained"
            size="small"
            href="/write"
            startIcon={<AddIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Write
          </Button>
        )}
        <Stack direction="row" gap={4}>
          <Stack direction="column" gap={0.25} alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              {isLoading ? "—" : works.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Works
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Container maxWidth="md" disableGutters sx={{ mt: 3 }}>
        <Divider />
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 0 }}>
          <Tab label="Works" />
          <Tab label="About" />
        </Tabs>

        {/* Works */}
        <TabPanel value={tab} index={0}>
          {isLoading ? (
            <Typography color="text.secondary" variant="body2">Loading…</Typography>
          ) : works.length === 0 ? (
            <Stack alignItems="center" py={6} gap={2}>
              <Typography color="text.secondary">
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
              <Box sx={{ display: { xs: "none", sm: "flex" }, flexWrap: "wrap", gap: 2 }}>
                {works.map((creative) => (
                  <Box key={creative.id} sx={{ position: "relative" }}>
                    {isOwn && creative.published === 0 && (
                      <Chip
                        label="Draft"
                        size="small"
                        sx={{ position: "absolute", top: 8, left: 8, zIndex: 1, fontSize: "0.65rem" }}
                      />
                    )}
                    <CreativeCard
                      slug={creative.slug}
                      title={creative.title}
                      author={userName ?? userSlug}
                      genre={creative.genre ?? ""}
                      cover={creative.coverImage ?? ""}
                      description={creative.description ?? undefined}
                      variant="card"
                    />
                  </Box>
                ))}
              </Box>
              <Stack sx={{ display: { xs: "flex", sm: "none" } }} gap={0} divider={<Divider />}>
                {works.map((creative) => (
                  <CreativeCard
                    key={creative.id}
                    slug={creative.slug}
                    title={creative.title}
                    author={userName ?? userSlug}
                    genre={creative.genre ?? ""}
                    cover={creative.coverImage ?? ""}
                    description={creative.description ?? undefined}
                    variant="list"
                  />
                ))}
              </Stack>
            </>
          )}
        </TabPanel>

        {/* About */}
        <TabPanel value={tab} index={1}>
          <Stack gap={2}>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              {userName ?? userSlug} is a writer on Aura.
            </Typography>
            <Divider />
            <Stack gap={1}>
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
