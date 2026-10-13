"use client";

import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import { Box, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";
import { Avatar, CritiqueForm, StarDisplay } from "@/app/components";
import { useAuthContext } from "@/app/contexts";
import { useCritiques } from "@/app/hooks/useStories";
import { formatDate } from "@/app/utils";

export const CritiquesPanel = ({ slug, authorId }: { slug: string; authorId: string }) => {
  const { user } = useAuthContext();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useCritiques(slug);
  const critiques = data?.pages.flatMap((page) => page.items);
  // the newest page carries the most up-to-date total
  const total = data?.pages.at(-1)?.total ?? 0;
  const [showForm, setShowForm] = useState(false);

  const isAuthor = user?.id === authorId;
  const canCritique = user && !isAuthor;

  return (
    <Stack
      sx={{
        gap: 0,
        pt: 1,
      }}
    >
      {/* CTA bar */}
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
          }}
        >
          {isLoading ? "" : `${total} critique${total !== 1 ? "s" : ""}`}
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
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
            }}
          >
            <NextLink href="/login" style={{ color: "inherit", fontWeight: 600 }}>
              Sign in
            </NextLink>{" "}
            to leave a critique.
          </Typography>
        )}
      </Stack>

      {/* Form */}
      {showForm && canCritique && (
        <Box
          sx={{
            mb: 2,
          }}
        >
          <CritiqueForm slug={slug} onDone={() => setShowForm(false)} />
        </Box>
      )}

      <Divider />

      {/* List */}
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 6,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      ) : !critiques || critiques.length === 0 ? (
        <Stack
          sx={{
            alignItems: "center",
            py: 8,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "text.disabled",
            }}
          >
            No critiques yet.
          </Typography>
        </Stack>
      ) : (
        <Stack
          divider={<Divider />}
          sx={{
            gap: 0,
          }}
        >
          {critiques.map((c) => (
            <Stack
              key={c.id}
              direction="row"
              sx={{
                gap: 2,
                py: 2.5,
              }}
            >
              <Avatar slug={c.author.slug} size={34} />
              <Stack
                sx={{
                  gap: 0.5,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <Stack
                  direction="row"
                  sx={{
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <NextLink href={`/profile/${c.author.slug}`} style={{ textDecoration: "none" }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {c.author.name ?? c.author.slug}
                    </Typography>
                  </NextLink>
                  <StarDisplay rating={c.rating} />
                  {c.createdAt && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.disabled",
                      }}
                    >
                      {formatDate(c.createdAt)}
                    </Typography>
                  )}
                </Stack>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.8,
                    whiteSpace: "pre-line",
                  }}
                >
                  {c.body}
                </Typography>
              </Stack>
            </Stack>
          ))}
          {hasNextPage && (
            <Stack sx={{ alignItems: "center", py: 3 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                startIcon={isFetchingNextPage ? <CircularProgress size={14} color="inherit" /> : undefined}
              >
                {isFetchingNextPage ? "Loading..." : `Show more critiques (${total - (critiques?.length ?? 0)} more)`}
              </Button>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
};
