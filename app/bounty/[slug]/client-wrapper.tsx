"use client";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { TabPanel } from "@/app/components";

interface Contributor {
  id: number;
  name: string;
  avatar: string;
  amount: number;
  date: string;
}

interface Interested {
  id: number;
  name: string;
  avatar: string;
  date: string;
}

interface Application {
  id: number;
  writer: string;
  avatar: string;
  credentials: string;
  pitch: string;
  votes: number;
  appliedDate: string;
}

export const BountyDetailClient = ({
  description,
  contributors,
  interested,
  applications,
}: {
  slug: string;
  description: string;
  contributors: Contributor[];
  interested: Interested[];
  applications: Application[];
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [tab, setTab] = useState(0);
  const [votes, setVotes] = useState<Record<number, number>>(
    Object.fromEntries(applications.map((a) => [a.id, a.votes]))
  );
  const [voted, setVoted] = useState<Set<number>>(new Set());
  const [proposalOpen, setProposalOpen] = useState<Application | null>(null);

  const handleVote = (id: number) => {
    if (voted.has(id)) return;
    setVotes((prev) => ({ ...prev, [id]: prev[id] + 1 }));
    setVoted((prev) => new Set([...prev, id]));
  };

  const sortedApplications = [...applications].sort((a, b) => votes[b.id] - votes[a.id]);
  const topId = sortedApplications[0]?.id;

  return (
    <Container maxWidth="md">
      <Divider />

      {/* Scrollable tabs — prevents overflow on narrow screens */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons={false}
      >
        <Tab label="Details" />
        <Tab label={`Contributors (${contributors.length})`} />
        <Tab label={`Interested (${interested.length})`} />
        <Tab label={`Applications (${applications.length})`} />
      </Tabs>

      {/* Details */}
      <TabPanel value={tab} index={0}>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ whiteSpace: "pre-line", lineHeight: 1.9, maxWidth: 640 }}
        >
          {description}
        </Typography>
      </TabPanel>

      {/* Contributors */}
      <TabPanel value={tab} index={1}>
        <Stack gap={0} divider={<Divider />}>
          {contributors.map((c) => (
            <Stack
              key={c.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
              sx={{ py: 2.5 }}
            >
              <Stack direction="row" gap={1.5} alignItems="center">
                <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: "primary.main" }}>
                  {c.avatar}
                </Avatar>
                <Stack gap={0}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {c.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {c.date}
                  </Typography>
                </Stack>
              </Stack>
              <Typography variant="subtitle2" fontWeight={700} color="secondary.dark">
                ${c.amount.toLocaleString()}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </TabPanel>

      {/* Interested */}
      <TabPanel value={tab} index={2}>
        <Stack gap={0} divider={<Divider />}>
          {interested.map((u) => (
            <Stack
              key={u.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
              sx={{ py: 2.5 }}
            >
              <Stack direction="row" gap={1.5} alignItems="center">
                <Avatar sx={{ width: 36, height: 36, fontSize: 13, bgcolor: "primary.light" }}>
                  {u.avatar}
                </Avatar>
                <Typography variant="subtitle2" fontWeight={600}>
                  {u.name}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {u.date}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </TabPanel>

      {/* Applications */}
      <TabPanel value={tab} index={3}>
        <Typography variant="body2" color="text.secondary" lineHeight={1.7} mb={3}>
          Writer applications are voted on by contributors and readers. The most supported
          proposal gets the commission — but the requester makes the final call.
        </Typography>

        <Stack gap={3}>
          {sortedApplications.map((app, index) => {
            const hasVoted = voted.has(app.id);
            const isTop = app.id === topId;

            return (
              <Box
                key={app.id}
                sx={{
                  border: "1px solid",
                  borderColor: isTop ? "primary.light" : "divider",
                  borderRadius: 2,
                  p: { xs: 2.5, sm: 3.5 },
                  bgcolor: isTop ? "background.default" : "background.paper",
                  transition: "border-color 0.15s",
                }}
              >
                <Stack gap={2.5}>
                  {/* Writer header */}
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
                    <Stack direction="row" gap={1.5} alignItems="center" flex={1} minWidth={0}>
                      <Avatar sx={{ width: 40, height: 40, fontSize: 14, bgcolor: "primary.main", flexShrink: 0 }}>
                        {app.avatar}
                      </Avatar>
                      <Stack gap={0.25} minWidth={0}>
                        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                            {app.writer}
                          </Typography>
                          {isTop && (
                            <Chip
                              label="Top Pick"
                              size="small"
                              sx={{
                                bgcolor: "secondary.light",
                                color: "secondary.dark",
                                fontWeight: 700,
                                fontSize: "0.65rem",
                                height: 20,
                              }}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {app.credentials}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Vote block */}
                    <Stack alignItems="center" gap={0} sx={{ flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleVote(app.id)}
                        disabled={hasVoted}
                        sx={{
                          border: "1px solid",
                          borderColor: hasVoted ? "primary.main" : "divider",
                          borderRadius: 1.5,
                          color: hasVoted ? "primary.main" : "text.secondary",
                          bgcolor: hasVoted ? "action.selected" : "transparent",
                          transition: "all 0.15s",
                          "&:hover:not(:disabled)": { borderColor: "primary.main", color: "primary.main" },
                          width: 36,
                          height: 36,
                        }}
                        aria-label="upvote"
                      >
                        <KeyboardArrowUpIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        color={hasVoted ? "primary.main" : "text.primary"}
                        sx={{ mt: 0.25 }}
                      >
                        {votes[app.id]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                        votes
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider />

                  {/* Pitch */}
                  <Typography variant="body2" color="text.secondary" lineHeight={1.8}>
                    {app.pitch}
                  </Typography>

                  {/* Footer — stacks on mobile */}
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent={{ sm: "space-between" }}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    gap={1.5}
                  >
                    <Typography variant="caption" color="text.disabled">
                      Applied {app.appliedDate}
                    </Typography>
                    <Stack direction="row" gap={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth={isMobile}
                        onClick={() => setProposalOpen(app)}
                      >
                        View Full Proposal
                      </Button>
                      {index === 0 && (
                        <Button variant="contained" size="small" fullWidth={isMobile}>
                          Select Writer
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </TabPanel>

      {/* Proposal modal — full screen on mobile */}
      <Dialog
        open={!!proposalOpen}
        onClose={() => setProposalOpen(null)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "background.paper",
              boxShadow: 0,
              border: isMobile ? "none" : "1px solid",
              borderColor: "divider",
              borderRadius: isMobile ? 0 : 2,
            },
          },
        }}
      >
        {proposalOpen && (() => {
          const app = proposalOpen;
          const hasVoted = voted.has(app.id);
          const isTop = app.id === topId;

          return (
            <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>
              {/* Header */}
              <Stack
                sx={{
                  px: { xs: 3, sm: 4 },
                  pt: { xs: 3, sm: 4 },
                  pb: 3,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
                gap={2}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" gap={2} alignItems="center" flex={1} minWidth={0}>
                    <Avatar sx={{ width: 48, height: 48, fontSize: 16, bgcolor: "primary.main", flexShrink: 0 }}>
                      {app.avatar}
                    </Avatar>
                    <Stack gap={0.25} minWidth={0}>
                      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
                          {app.writer}
                        </Typography>
                        {isTop && (
                          <Chip
                            label="Top Pick"
                            size="small"
                            sx={{
                              bgcolor: "secondary.light",
                              color: "secondary.dark",
                              fontWeight: 700,
                              fontSize: "0.65rem",
                              height: 20,
                            }}
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {app.credentials}
                      </Typography>
                    </Stack>
                  </Stack>
                  <IconButton
                    size="small"
                    onClick={() => setProposalOpen(null)}
                    sx={{ color: "text.secondary", mt: -0.5, mr: -1 }}
                    aria-label="close"
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>

                {/* Vote row */}
                <Stack direction="row" gap={2} alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() => handleVote(app.id)}
                    disabled={hasVoted}
                    sx={{
                      border: "1px solid",
                      borderColor: hasVoted ? "primary.main" : "divider",
                      borderRadius: 1.5,
                      color: hasVoted ? "primary.main" : "text.secondary",
                      bgcolor: hasVoted ? "action.selected" : "transparent",
                      transition: "all 0.15s",
                      "&:hover:not(:disabled)": { borderColor: "primary.main", color: "primary.main" },
                      width: 32,
                      height: 32,
                    }}
                    aria-label="upvote"
                  >
                    <KeyboardArrowUpIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2" color={hasVoted ? "primary.main" : "text.secondary"}>
                    <Typography component="span" variant="body2" fontWeight={700} color={hasVoted ? "primary.main" : "text.primary"}>
                      {votes[app.id]}
                    </Typography>
                    {" "}votes from the community
                  </Typography>
                </Stack>
              </Stack>

              {/* Scrollable pitch */}
              <Stack sx={{ px: { xs: 3, sm: 4 }, py: 3, flex: 1, overflowY: "auto" }} gap={1.5}>
                <Typography variant="overline" color="secondary.main" fontWeight={600} letterSpacing="0.1em">
                  Writer&apos;s Proposal
                </Typography>
                <Typography variant="body1" color="text.secondary" lineHeight={1.85} sx={{ whiteSpace: "pre-line" }}>
                  {app.pitch}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
                  Applied {app.appliedDate}
                </Typography>
              </Stack>

              {/* Sticky footer */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                gap={1.5}
                sx={{
                  px: { xs: 3, sm: 4 },
                  pb: { xs: 3, sm: 4 },
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              >
                {isTop && (
                  <Button variant="contained" size="large" fullWidth>
                    Select Writer
                  </Button>
                )}
                <Button
                  variant={isTop ? "outlined" : "contained"}
                  size="large"
                  fullWidth
                  disabled={hasVoted}
                  onClick={() => handleVote(app.id)}
                >
                  {hasVoted ? "Voted" : "Vote for This Proposal"}
                </Button>
              </Stack>
            </DialogContent>
          );
        })()}
      </Dialog>
    </Container>
  );
};
