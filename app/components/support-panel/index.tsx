"use client";

import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import { Box, Button, Skeleton, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import NextLink from "next/link";
import { useAuthContext } from "@/app/contexts";
import { useSupport, useUpdateSupport } from "@/app/hooks/useSupport";
import { PLEDGE_OPTIONS } from "@/lib/utils/support";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const SupportPanel = () => {
  const { user } = useAuthContext();
  const { data, isLoading } = useSupport();
  const update = useUpdateSupport();

  const liked = data?.me?.liked ?? false;
  const pledge = data?.me?.pledge ?? null;

  return (
    <Box
      id="support"
      component="section"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1.4fr" },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "background.default",
        overflow: "hidden",
        // keep the anchor clear of the sticky header
        scrollMarginTop: 80,
      }}
    >
      <Stack sx={{ gap: 2, p: { xs: 3, md: 4 }, alignItems: "flex-start" }}>
        <Typography variant="overline" sx={{ color: "secondary.main", fontWeight: 600 }}>
          Like it?
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.3 }}>
          Tell us you like where Aura is going.
        </Typography>
        <Button
          {...(user
            ? { onClick: () => update.mutate({ liked: !liked }), disabled: isLoading || update.isPending }
            : { component: NextLink, href: "/dive" })}
          variant={liked ? "contained" : "outlined"}
          color="secondary"
          aria-pressed={user ? liked : undefined}
          startIcon={liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          sx={{ borderRadius: 999, px: 2.5 }}
        >
          {!user ? "Sign in to like" : liked ? "You like Aura" : "I like it"}
        </Button>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {isLoading ? (
            <Skeleton width={140} />
          ) : (
            `${plural(data?.likes ?? 0, "person likes", "people like")} it so far`
          )}
        </Typography>
      </Stack>

      <Stack
        sx={{
          gap: 2,
          p: { xs: 3, md: 4 },
          borderTop: { xs: "1px solid", md: "none" },
          borderLeft: { md: "1px solid" },
          borderColor: "divider",
        }}
      >
        <Stack direction="row" sx={{ gap: 1, alignItems: "center", color: "secondary.main" }}>
          <VolunteerActivismOutlinedIcon fontSize="small" />
          <Typography variant="overline" sx={{ fontWeight: 600 }}>
            Would you support it?
          </Typography>
        </Stack>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.main", lineHeight: 1.3 }}>
          What would you pay each month to keep Aura ad-free and independent?
        </Typography>

        <ToggleButtonGroup
          exclusive
          value={pledge}
          disabled={!user || isLoading || update.isPending}
          onChange={(_, value: number | null) => update.mutate({ pledge: value })}
          aria-label="Monthly support amount"
          sx={{
            flexWrap: "wrap",
            gap: 1,
            "& .MuiToggleButtonGroup-grouped": {
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "999px !important",
              m: 0,
            },
          }}
        >
          {PLEDGE_OPTIONS.map((amount) => (
            <ToggleButton key={amount} value={amount} sx={{ px: 2, py: 0.75, textTransform: "none" }}>
              {amount === 0 ? "Not right now" : `$${amount} / month`}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {!user && (
          <Button component={NextLink} href="/dive" variant="text" sx={{ alignSelf: "flex-start", px: 0 }}>
            Sign in to answer
          </Button>
        )}

        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
          Nothing is charged, and the core of Aura stays free either way. This tells us whether paid support is worth
          building. If it is, we'll email you before anything goes live.
          {!isLoading &&
            (data?.pledgers ?? 0) > 0 &&
            ` ${plural(data!.pledgers, "person has", "people have")} pledged so far.`}
        </Typography>
      </Stack>
    </Box>
  );
};
