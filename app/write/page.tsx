"use client";

import { Box, Container, Stack, Typography } from "@mui/material";
import { StoryForm } from "../components";
import { useCreateStory } from "../hooks/useStories";

export default function WritePage() {
  const createStory = useCreateStory();

  return (
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="sm" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack
          sx={{
            gap: 1,
            mb: 6,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: "secondary.main",
              fontWeight: 600,
              letterSpacing: "0.12em",
            }}
          >
            New Story
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            Start writing
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mt: 0.5,
            }}
          >
            Give your story a title and a brief synopsis. You can add chapters once it&apos;s created.
          </Typography>
        </Stack>

        <StoryForm
          submitLabel="Create Story"
          pendingLabel="Creating..."
          isPending={createStory.isPending}
          error={createStory.isError ? createStory.error.message : undefined}
          onSubmit={(values) => createStory.mutate(values)}
        />
      </Container>
    </Box>
  );
}
