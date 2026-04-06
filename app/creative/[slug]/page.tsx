import { Box, Card, CardMedia, Chip, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getChaptersByCreativSlug, getCreativeBySlug } from "@/lib";
import { CreativePageClient } from "./client-wrapper";
import { SaveButton } from "./save-button";

export default async function CreativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const creative = await getCreativeBySlug(slug);
  if (!creative) notFound();

  const chapters = await getChaptersByCreativSlug(slug);
  const coverSrc = creative.coverImage || `https://picsum.photos/seed/${creative.slug}/800/500`;

  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: { xs: 5, sm: 8 }, pb: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={{ xs: 3, sm: 4 }}
          alignItems={{ xs: "center", sm: "flex-start" }}
        >
          {/* Cover */}
          <Card
            sx={{
              boxShadow: 0,
              border: "1px solid",
              borderColor: "divider",
              flexShrink: 0,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <CardMedia
              sx={{
                width: { xs: 110, sm: 148 },
                height: { xs: 158, sm: 212 },
                position: "relative",
                display: "block",
                overflow: "hidden",
              }}
            >
              <Image
                src={coverSrc}
                alt={creative.title || "Creative Cover"}
                fill
                sizes="(max-width: 600px) 110px, 148px"
                style={{ objectFit: "cover" }}
                priority
              />
            </CardMedia>
          </Card>

          {/* Info */}
          <Stack
            gap={1.25}
            pt={{ xs: 0, sm: 1 }}
            alignItems={{ xs: "center", sm: "flex-start" }}
            width={{ xs: "100%", sm: "auto" }}
            flex={1}
            minWidth={0}
          >
            {creative.genre && (
              <Chip label={creative.genre} size="small" sx={{ alignSelf: { xs: "center", sm: "flex-start" } }} />
            )}

            <Typography
              variant="h5"
              fontWeight={700}
              lineHeight={1.25}
              textAlign={{ xs: "center", sm: "left" }}
              sx={{ wordBreak: "break-word" }}
            >
              {creative.title}
            </Typography>

            <Typography variant="body2" color="text.secondary" textAlign={{ xs: "center", sm: "left" }}>
              by{" "}
              <NextLink href={`/portfolio/${creative.author.slug}`} style={{ textDecoration: "none" }}>
                <Typography
                  component="span"
                  variant="body2"
                  fontWeight={600}
                  color="primary"
                  sx={{ "&:hover": { textDecoration: "underline" } }}
                >
                  {creative.author.name ?? creative.author.slug}
                </Typography>
              </NextLink>
            </Typography>

            {/* Stats + Save button row */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent={{ xs: "center", sm: "flex-start" }}
              gap={3}
              mt={0.5}
              width="100%"
              flexWrap="wrap"
            >
              <Stack alignItems="center" gap={0.25}>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1}>
                  {chapters.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Chapters
                </Typography>
              </Stack>
              <Stack alignItems="center" gap={0.25}>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1}>
                  {creative.totalCritiques}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Critiques
                </Typography>
              </Stack>
              <Stack alignItems="center" gap={0.25}>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1}>
                  {creative.totalCountOfReadingListAdds}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Reading List Adds
                </Typography>
              </Stack>
            </Stack>

            {/* Actions */}

            {/* Save button lives right next to stats */}
            <SaveButton slug={slug} />
          </Stack>
        </Stack>
      </Container>

      <CreativePageClient
        slug={slug}
        authorId={creative.author.id}
        description={creative.description ?? ""}
        initialChapters={chapters}
      />
    </Box>
  );
}
