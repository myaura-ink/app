import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { Box, Card, CardActionArea, Chip, Stack, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { SelectStoryWithAuthor } from "@/lib";
import type { NormalizedTag } from "@/lib/utils/tags";

interface StoryCardProps extends SelectStoryWithAuthor {
  tags?: NormalizedTag[];
  /** md and lg are fixed widths for carousels; fluid fills its grid cell */
  size?: "md" | "lg" | "fluid";
  variant?: "card" | "list";
  /** load the cover right away; set for the first cards on screen so they don't hurt LCP */
  eager?: boolean;
}

const WIDTHS = { md: 176, lg: 208, fluid: "100%" };
// manga / light novel cover proportions (B6 is roughly 5:7)
const COVER_RATIO = "5 / 7";
const MAX_LIST_TAGS = 3;

export const tagSearchHref = (slug: string) => `/search?tag=${encodeURIComponent(slug)}`;

// a stable placeholder per story, matching the one on the story page
const coverSrc = (slug: string | undefined, coverImage: string | null | undefined) =>
  coverImage || `https://picsum.photos/seed/${slug ?? "aura"}/500/700`;

const clamp = (lines: number) => ({
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical" as const,
});

const Stat = ({ icon, value, label }: { icon: ReactNode; value: number; label: string }) => (
  <Stack
    direction="row"
    aria-label={`${value} ${label}`}
    sx={{ alignItems: "center", gap: 0.5, "& svg": { fontSize: 14 } }}
  >
    {icon}
    <Typography variant="caption" sx={{ fontWeight: 500, lineHeight: 1 }}>
      {value}
    </Typography>
  </Stack>
);

const Stats = ({
  totalChapters,
  totalCritiques,
  totalCountOfLibraryAdds,
  onCover = false,
}: Pick<StoryCardProps, "totalChapters" | "totalCritiques" | "totalCountOfLibraryAdds"> & {
  onCover?: boolean;
}) => {
  if (totalChapters === undefined && totalCritiques === undefined && totalCountOfLibraryAdds === undefined) {
    return null;
  }
  return (
    <Stack
      direction="row"
      sx={{
        gap: 1.5,
        alignItems: "center",
        color: onCover ? "#fff" : "text.secondary",
        textShadow: onCover ? "0 1px 2px rgba(0,0,0,0.4)" : undefined,
      }}
    >
      {totalChapters !== undefined && <Stat icon={<MenuBookOutlinedIcon />} value={totalChapters} label="chapters" />}
      {totalCritiques !== undefined && (
        <Stat icon={<ChatBubbleOutlineIcon />} value={totalCritiques} label="critiques" />
      )}
      {totalCountOfLibraryAdds !== undefined && (
        <Stat icon={<BookmarkBorderIcon />} value={totalCountOfLibraryAdds} label="saves" />
      )}
    </Stack>
  );
};

// tag chips sit outside the card's main link, so each one can link to its own search
const TagLinks = ({ tags, max }: { tags: NormalizedTag[]; max: number }) => {
  if (tags.length === 0) return null;
  const extra = tags.length - max;
  return (
    <Stack direction="row" sx={{ gap: 0.5, flexWrap: "wrap", alignItems: "center", minWidth: 0 }}>
      {tags.slice(0, max).map((tag) => (
        <Chip
          key={tag.slug}
          component={NextLink}
          href={tagSearchHref(tag.slug)}
          clickable
          label={`#${tag.name}`}
          size="small"
          variant="outlined"
          sx={{
            height: 22,
            fontSize: "0.7rem",
            maxWidth: "100%",
            minWidth: 0,
            flexShrink: 1,
            position: "relative",
            zIndex: 1,
          }}
        />
      ))}
      {extra > 0 && (
        <Typography variant="caption" sx={{ color: "text.secondary", flexShrink: 0 }}>
          +{extra}
        </Typography>
      )}
    </Stack>
  );
};

const GenreBadge = ({ genre }: { genre: string }) => (
  <Box
    sx={{
      position: "absolute",
      top: 8,
      left: 8,
      px: 1,
      py: 0.25,
      borderRadius: 1,
      bgcolor: "rgba(20, 18, 15, 0.62)",
      backdropFilter: "blur(6px)",
      color: "#fff",
      fontSize: "0.65rem",
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      maxWidth: "calc(100% - 16px)",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    }}
  >
    {genre}
  </Box>
);

export const StoryCard = ({
  slug,
  title,
  author,
  genre,
  description,
  coverImage,
  tags = [],
  totalChapters,
  totalCritiques,
  totalCountOfLibraryAdds,
  size = "md",
  variant = "card",
  eager = false,
}: StoryCardProps) => {
  const href = `/story/${slug}`;
  const stats = { totalChapters, totalCritiques, totalCountOfLibraryAdds };

  // List variant - compact rows for narrow screens
  if (variant === "list") {
    return (
      <Stack
        direction="row"
        sx={{
          gap: 2,
          alignItems: "flex-start",
          py: 2,
          px: 1,
          width: "100%",
          position: "relative",
          borderRadius: 1,
          "&:hover .story-title": { color: "primary.main" },
        }}
      >
        <Box
          sx={{
            width: 84,
            aspectRatio: COVER_RATIO,
            flexShrink: 0,
            borderRadius: 1,
            overflow: "hidden",
            position: "relative",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Image
            src={coverSrc(slug, coverImage)}
            loading={eager ? "eager" : "lazy"}
            alt=""
            fill
            sizes="84px"
            style={{ objectFit: "cover" }}
          />
        </Box>
        <Stack sx={{ gap: 0.5, minWidth: 0, flex: 1 }}>
          {genre && (
            <Typography
              variant="overline"
              sx={{
                color: "secondary.main",
                fontWeight: 600,
                lineHeight: 1.4,
                letterSpacing: "0.08em",
              }}
            >
              {genre}
            </Typography>
          )}
          {/* the title's link stretches over the whole row */}
          <NextLink href={href} style={{ textDecoration: "none", color: "inherit" }}>
            <Box component="span" sx={{ position: "absolute", inset: 0 }} />
            <Typography
              className="story-title"
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                lineHeight: 1.3,
                transition: "color 0.15s",
                ...clamp(2),
              }}
            >
              {title}
            </Typography>
          </NextLink>
          <Typography variant="caption" noWrap sx={{ color: "text.secondary" }}>
            by {author?.name || "anonymous"}
          </Typography>
          {description && (
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.5, ...clamp(2) }}>
              {description}
            </Typography>
          )}
          <Stack sx={{ gap: 1, mt: 0.5 }}>
            <Stats {...stats} />
            <TagLinks tags={tags} max={MAX_LIST_TAGS} />
          </Stack>
        </Stack>
      </Stack>
    );
  }

  // Card variant - a clean cover with the title underneath, for grids and carousels.
  // The synopsis and stats only show on hover, so the grid stays scannable.
  return (
    <Card
      sx={{
        width: WIDTHS[size],
        height: "100%",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        // borderless: the cover is the card, so the card itself is see-through
        boxShadow: 0,
        border: 0,
        borderRadius: 0,
        bgcolor: "transparent",
        overflow: "visible",
        "&:hover .story-cover, &:focus-within .story-cover": {
          transform: "translateY(-4px)",
          boxShadow: "0 14px 28px -12px rgba(30, 24, 14, 0.5)",
        },
        "&:hover .story-title": { color: "primary.main" },
        // only reveal on devices that can hover, so taps go straight to the story
        "@media (hover: hover)": {
          "&:hover .story-blurb": { opacity: 1 },
          "&:hover .story-blurb > *": { transform: "none" },
        },
        "&:focus-within .story-blurb": { opacity: 1 },
      }}
    >
      <CardActionArea
        component={NextLink}
        href={href}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          borderRadius: 2,
          flex: 1,
        }}
      >
        <Box
          className="story-cover"
          sx={{
            position: "relative",
            width: "100%",
            aspectRatio: COVER_RATIO,
            overflow: "hidden",
            borderRadius: 2,
            bgcolor: "action.hover",
            boxShadow: "0 4px 12px -6px rgba(30, 24, 14, 0.3)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          <Image
            src={coverSrc(slug, coverImage)}
            loading={eager ? "eager" : "lazy"}
            alt={title || "cover"}
            fill
            sizes={size === "fluid" ? "(max-width: 600px) 50vw, (max-width: 1200px) 20vw, 220px" : "208px"}
            style={{ objectFit: "cover" }}
          />
          {genre && <GenreBadge genre={genre} />}
          {(description || totalChapters !== undefined) && (
            <Stack
              className="story-blurb"
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                p: 1.5,
                gap: 1,
                justifyContent: "flex-end",
                color: "#fff",
                background:
                  "linear-gradient(to top, rgba(12,10,8,0.94) 0%, rgba(12,10,8,0.8) 60%, rgba(12,10,8,0.45) 100%)",
                opacity: 0,
                transition: "opacity 0.2s ease",
                "& > *": {
                  transform: "translateY(6px)",
                  transition: "transform 0.25s ease",
                },
              }}
            >
              {description && (
                <Typography variant="caption" sx={{ lineHeight: 1.5, opacity: 0.92, ...clamp(7) }}>
                  {description}
                </Typography>
              )}
              <Stats {...stats} onCover />
            </Stack>
          )}
        </Box>
        <Stack sx={{ pt: 1.25, px: 0.25, gap: 0.25, minWidth: 0 }}>
          <Typography
            className="story-title"
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              lineHeight: 1.3,
              transition: "color 0.15s",
              ...clamp(2),
            }}
          >
            {title}
          </Typography>
          <Typography variant="caption" noWrap sx={{ color: "text.secondary", lineHeight: 1.4 }}>
            {author?.name || "anonymous"}
            {totalChapters !== undefined && ` · ${totalChapters} ${totalChapters === 1 ? "chapter" : "chapters"}`}
          </Typography>
        </Stack>
      </CardActionArea>
    </Card>
  );
};
