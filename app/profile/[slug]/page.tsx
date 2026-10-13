import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Avatar } from "@/app/components";
import { getUserFromCookie } from "@/app/hooks/getUserFromCookie";
import { buildMetadata } from "@/app/utils";
import { profile as profileSeo } from "@/content";
import { getLibrary, getProfile, getStoriesByAuthorId } from "@/lib";
import { ProfilePageClient } from "./client-wrapper";

const getUser = cache(getProfile);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getUser(slug);
  if (!profile) return {};
  // always the public view, even when the owner is the one looking
  const published = await getStoriesByAuthorId(profile.id, false, -1);

  return buildMetadata({
    ...profileSeo({
      name: profile.name,
      slug: profile.slug,
      publishedTitles: published.map((c) => c.title).filter((t): t is string => !!t),
    }),
    path: `/profile/${slug}`,
    openGraph: { type: "profile", username: profile.slug },
  });
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getUserFromCookie();
  const profile = await getUser(slug);
  if (!profile) notFound();

  const isOwn = user?.slug === slug;
  const isWriter = user?.roles.find((r) => r === "writer") !== undefined;
  const [stories, library] = await Promise.all([getStoriesByAuthorId(profile.id, isOwn, -1), getLibrary(profile.id)]);
  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: 8, pb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            gap: { xs: 3, sm: 4 },
            alignItems: "center",
          }}
        >
          <Avatar slug={profile.slug} size={96} />
          <Stack
            sx={{
              gap: 1.5,
              alignItems: { xs: "center", sm: "flex-start" },
              flex: 1,
              minWidth: 0,
            }}
          >
            <Stack
              sx={{
                gap: 0,
                alignItems: { xs: "center", sm: "flex-start" },
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                }}
              >
                {profile.name ?? slug}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "text.secondary",
                }}
              >
                @{profile.slug}
              </Typography>

              <Stack
                direction="row"
                sx={{
                  gap: 3,
                  alignItems: "center",
                  mt: 2,
                  mb: 0,
                }}
              >
                <Stack
                  direction="column"
                  sx={{
                    gap: 0.25,
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {stories.length || "—"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Works
                  </Typography>
                </Stack>
                <Stack
                  direction="column"
                  sx={{
                    gap: 0.25,
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    {library.length || "—"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                    }}
                  >
                    Saved
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          {/* with no works yet, the empty state below offers "Start writing" instead */}
          {isOwn && isWriter && stories.length > 0 && (
            <Button
              variant="contained"
              href="/write"
              startIcon={<AddIcon />}
              sx={{ flexShrink: 0, alignSelf: { xs: "stretch", sm: "center" } }}
            >
              New story
            </Button>
          )}
        </Stack>
        <ProfilePageClient
          userSlug={slug}
          userName={profile.name}
          memberSince={profile.createdAt?.toISOString() ?? null}
          isOwn={isOwn}
          stories={stories}
          library={library}
        />
      </Container>
    </Box>
  );
}
