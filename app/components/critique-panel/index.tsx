"use client";

import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import { Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";
import { Avatar, CritiqueForm, StarDisplay } from "@/app/components";
import { useAuthContext } from "@/app/contexts";
import { useCritiques } from "@/app/hooks/useCreatives";
import { formatDate } from "@/app/utils";

export const CritiquesPanel = ({ slug, authorId }: { slug: string; authorId: string }) => {
  const { user } = useAuthContext();
  const { data: critiques, isLoading } = useCritiques(slug);
  const [showForm, setShowForm] = useState(false);

  const isAuthor = user?.id === authorId;
  const canCritique = user && !isAuthor;

  return (
    <Stack gap={0} pt={1}>
      {/* CTA bar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" py={2} flexWrap="wrap" gap={1}>
        <Typography variant="body2" color="text.secondary">
          {isLoading ? "" : `${critiques?.length ?? 0} critique${(critiques?.length ?? 0) !== 1 ? "s" : ""}`}
        </Typography>

        {canCritique && !showForm && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<RateReviewOutlinedIcon fontSize="small" />}
            onClick={() => setShowForm(true)}
            sx={{ borderRadius: 6, px: 2 }}
          >
            Write a Critique
          </Button>
        )}

        {!user && (
          <Typography variant="body2" color="text.secondary">
            <NextLink href="/login" style={{ color: "inherit", fontWeight: 600 }}>
              Sign in
            </NextLink>{" "}
            to leave a critique.
          </Typography>
        )}
      </Stack>

      {/* Form */}
      {showForm && canCritique && (
        <Box mb={2}>
          <CritiqueForm slug={slug} onDone={() => setShowForm(false)} />
        </Box>
      )}

      <Divider />

      {/* List */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={24} />
        </Box>
      ) : !critiques || critiques.length === 0 ? (
        <Stack alignItems="center" py={8}>
          <Typography color="text.disabled" variant="body2">
            No critiques yet.
          </Typography>
        </Stack>
      ) : (
        <Stack gap={0} divider={<Divider />}>
          {critiques.map((c) => (
            <Stack key={c.id} direction="row" gap={2} py={2.5}>
              <Avatar slug={c.author.slug} size={34} />
              <Stack gap={0.5} flex={1} minWidth={0}>
                <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                  <NextLink href={`/portfolio/${c.author.slug}`} style={{ textDecoration: "none" }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ "&:hover": { textDecoration: "underline" } }}
                    >
                      {c.author.name ?? c.author.slug}
                    </Typography>
                  </NextLink>
                  <StarDisplay rating={c.rating} />
                  {c.createdAt && (
                    <Typography variant="caption" color="text.disabled">
                      {formatDate(c.createdAt)}
                    </Typography>
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, whiteSpace: "pre-line" }}>
                  {c.body}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
};
