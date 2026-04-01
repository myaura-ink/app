import { Box, Card, CardMedia, Chip, Container, Stack, Typography } from "@mui/material";
import { and, asc, eq } from "drizzle-orm";
import Image from "next/image";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { chapters, creatives, db, users } from "@/lib";
import { CreativePageClient } from "./client-wrapper";

export default async function CreativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const result = await db
    .select({
      id: creatives.id,
      title: creatives.title,
      slug: creatives.slug,
      description: creatives.description,
      coverImage: creatives.coverImage,
      genre: creatives.genre,
      published: creatives.published,
      authorId: creatives.authorId,
      createdAt: creatives.createdAt,
      updatedAt: creatives.updatedAt,
      authorName: users.name,
      authorSlug: users.slug,
    })
    .from(creatives)
    .leftJoin(users, eq(creatives.authorId, users.id))
    .where(eq(creatives.slug, slug));

  if (result.length === 0) notFound();

  const creative = result[0];

  const chapterRows = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.creativeId, creative.id), eq(chapters.published, 1)))
    .orderBy(asc(chapters.order));

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
                alt={creative.title}
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
              <NextLink href={`/portfolio/${creative.authorSlug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <Typography
                  component="span"
                  fontWeight={600}
                  color="primary"
                  sx={{ "&:hover": { textDecoration: "underline" } }}
                >
                  {creative.authorName ?? creative.authorSlug}
                </Typography>
              </NextLink>
            </Typography>
            <Stack direction="row" gap={4} mt={1} justifyContent={{ xs: "center", sm: "flex-start" }} width="100%">
              {[
                { label: "Chapters", value: chapterRows.length },
              ].map(({ label, value }) => (
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
        authorId={creative.authorId}
        description={creative.description ?? ""}
        initialChapters={chapterRows.map((ch) => ({
          id: ch.id,
          slug: ch.slug,
          title: ch.title,
          content: ch.content,
          order: ch.order,
          published: ch.published,
          createdAt: ch.createdAt?.toISOString() ?? null,
          updatedAt: ch.updatedAt.toISOString(),
        }))}
      />
    </Box>
  );
}
