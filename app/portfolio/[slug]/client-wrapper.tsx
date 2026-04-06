"use client";

import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Chip, Container, Divider, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { CreativeCard, TabPanel } from "@/app/components";
import { SelectCreativeWithAuthor } from "@/lib";

interface Props {
  userSlug: string;
  userName: string | null;
  memberSince: string | null;
  isOwn: boolean;
  creatives: SelectCreativeWithAuthor[];
}

export const PortfolioPageClient = ({ userSlug, isOwn, userName, creatives, memberSince }: Props) => {
  const [tab, setTab] = useState(0);
  const memberYear = memberSince ? new Date(memberSince).getFullYear() : null;

  return (
    <Box sx={{ width: "100%" }}>
      <Container maxWidth="md" disableGutters sx={{ mt: 3 }}>
        <Divider />
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 0 }}>
          <Tab label="Works" />
          <Tab label="About" />
        </Tabs>

        {/* Works */}
        <TabPanel value={tab} index={0}>
          {creatives.length === 0 ? (
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
                {creatives.map((creative) => (
                  <Box key={creative.id} sx={{ position: "relative" }}>
                    {isOwn && creative.published === 0 && (
                      <Chip
                        label="Draft"
                        size="small"
                        sx={{ position: "absolute", top: 8, left: 8, zIndex: 1, fontSize: "0.65rem" }}
                      />
                    )}
                    <CreativeCard key={creative.id} {...creative} variant="card" />
                  </Box>
                ))}
              </Box>
              <Stack sx={{ display: { xs: "flex", sm: "none" } }} gap={0} divider={<Divider />}>
                {creatives.map((creative) => (
                  <CreativeCard key={creative.id} {...creative} variant="list" />
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
