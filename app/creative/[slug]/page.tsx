import { Box, Card, CardMedia, Chip, Container, Stack, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { getChaptersByCreativSlug, getCreativeBySlug } from "@/lib";
import { CreativePageClient } from "./client-wrapper";

export default async function CreativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const creative = await getCreativeBySlug(slug);
  if (!creative) notFound();

  const chapters = await getChaptersByCreativSlug(slug);
  const coverSrc = creative.coverImage || `https://picsum.photos/seed/${creative.slug}/800/500`;

  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: 8, pb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={{ xs: 3, sm: 4 }}
          alignItems={{ xs: "center", sm: "flex-start" }}
        >
          <Card sx={{ boxShadow: 0, border: "1px solid", borderColor: "divider", flexShrink: 0 }}>
            <CardMedia
              sx={{
                width: { xs: 120, sm: 160 },
                height: { xs: 172, sm: 230 },
                flexShrink: 0,
                position: "relative",
                display: "block",
                overflow: "hidden",
              }}
            >
              <Image
                src={coverSrc}
                alt={creative.title || "Creative Cover"}
                fill
                sizes="(max-width: 600px) 120px, 160px"
                style={{ objectFit: "cover" }}
                priority
              />
            </CardMedia>
          </Card>

          <Stack
            gap={1.5}
            pt={{ xs: 0, sm: 1 }}
            alignItems={{ xs: "center", sm: "flex-start" }}
            width={{ xs: "100%", sm: "auto" }}
          >
            {creative.genre && <Chip label={creative.genre} size="small" />}
            <Typography variant="h4" fontWeight={700} lineHeight={1.2} textAlign={{ xs: "center", sm: "left" }}>
              {creative.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              by{" "}
              <NextLink
                href={`/portfolio/${creative.author.slug}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <Typography
                  component="span"
                  fontWeight={600}
                  color="primary"
                  sx={{ "&:hover": { textDecoration: "underline" } }}
                >
                  {creative.author.name ?? creative.author.slug}
                </Typography>
              </NextLink>
            </Typography>
            <Stack direction="row" gap={4} mt={1} justifyContent={{ xs: "center", sm: "flex-start" }} width="100%">
              {[{ label: "Chapters", value: chapters.length }].map(({ label, value }) => (
                <Stack key={label} alignItems="center" gap={0.25}>
                  <Typography variant="h6" fontWeight={700}>
                    {value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                </Stack>
              ))}
            </Stack>
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
