import { Card, CardActionArea, CardContent, CardMedia, Chip, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

export interface CreativeCardProps {
  slug: string;
  title: string;
  author: string;
  genre: string;
  cover: string;
  description?: string;
  size?: "md" | "lg";
  variant?: "card" | "list";
}

const SIZES = {
  md: { width: 140, height: 195 },
  lg: { width: 220, height: 310 },
};

export const CreativeCard = ({
  slug,
  title,
  author,
  genre,
  cover,
  size = "md",
  variant = "card",
}: CreativeCardProps) => {
  const { width, height } = SIZES[size];

  // List variant - for mobile list display
  if (variant === "list") {
    return (
      <NextLink href={`/creative/${slug}`} style={{ textDecoration: "none", color: "inherit" }}>
        <Stack
          direction="row"
          gap={2}
          alignItems="flex-start"
          sx={{
            py: 2,
            px: 1,
            borderRadius: 1,
            color: "inherit",
            transition: "color 0.15s",
            width: "100%",
            "&:hover": { color: "primary.main" },
          }}
        >
          <CardMedia
            component="img"
            sx={{
              width: 100,
              height: 140,
              objectFit: "cover",
              flexShrink: 0,
              borderRadius: 0.5,
            }}
            image={cover}
            alt={title}
          />
          <Stack gap={0.5} minWidth={0} flex={1}>
            <Typography variant="subtitle2" fontWeight={600} color="inherit">
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {author}
            </Typography>
            <Chip label={genre} size="small" sx={{ alignSelf: "flex-start" }} />
          </Stack>
        </Stack>
      </NextLink>
    );
  }

  // Card variant - for desktop grid display
  return (
    <Card
      sx={{
        width,
        boxShadow: 0,
        border: "1px solid",
        borderColor: "divider",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardActionArea
        component={NextLink}
        href={`/creative/${slug}`}
        sx={{ display: "flex", flexDirection: "column", alignItems: "stretch", flex: 1 }}
      >
        <CardMedia
          component="img"
          sx={{
            width: "100%",
            height,
            objectFit: "cover",
            flexShrink: 0,
          }}
          image={cover}
          alt={title}
        />
        <CardContent
          sx={{
            p: 1.5,
            "&:last-child": { pb: 1.5 },
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Stack gap={0.5}>
            <Typography
              variant="body2"
              fontWeight={600}
              lineHeight={1.3}
              sx={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
            >
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {author}
            </Typography>
            <Chip label={genre} size="small" sx={{ mt: 0.25, alignSelf: "flex-start" }} />
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
