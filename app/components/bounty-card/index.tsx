import { Button, Card, Chip, Stack, Typography } from "@mui/material";
import NextLink from "next/link";

interface BountyCardProps {
  slug: string;
  genre: string;
  title: string;
  description: string;
  amount: number;
  contributors: number;
  wants: number;
}

export const BountyCard = ({ slug, genre, title, description, amount, contributors, wants }: BountyCardProps) => {
  return (
    <Card
      sx={{
        boxShadow: 0,
        border: "1px solid",
        borderColor: "divider",
        p: { xs: 2.5, sm: 4 },
        transition: "border-color 0.15s",
        "&:hover": { borderColor: "primary.light" },
      }}
    >
      <NextLink href={`/bounty/${slug}`} passHref>
        <Stack gap={2}>
          {/* Genre + title */}
          <Stack gap={1}>
            <Chip label={genre} size="small" sx={{ alignSelf: "flex-start" }} />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "flex-start" }}
              gap={{ xs: 1.5, sm: 2 }}
            >
              <Typography variant="h6" fontWeight={700} lineHeight={1.3} sx={{ flex: 1, minWidth: 0 }}>
                {title}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ flexShrink: 0, alignSelf: { xs: "flex-start", sm: "flex-start" } }}
              >
                Contribute
              </Button>
            </Stack>
          </Stack>

          {/* Description */}
          <Typography
            variant="body2"
            color="text.secondary"
            lineHeight={1.75}
            sx={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 3,
              overflow: "hidden",
            }}
          >
            {description}
          </Typography>

          {/* Stats */}
          <Stack direction="row" gap={1} alignItems="baseline" flexWrap="wrap">
            <Typography variant="subtitle2" fontWeight={700} color="secondary.dark">
              ${amount.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              · {contributors} contributors
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ display: { xs: "none", sm: "inline" } }}>
              ·
            </Typography>
            <Typography variant="caption" color="text.secondary">
              <Typography component="span" variant="caption" fontWeight={600} color="text.primary">
                {wants.toLocaleString()}
              </Typography>{" "}
              want this written
            </Typography>
          </Stack>
        </Stack>
      </NextLink>
    </Card>
  );
};
