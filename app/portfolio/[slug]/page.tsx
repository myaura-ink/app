import AddIcon from "@mui/icons-material/Add";
import { Avatar, Box, Button, Container, Stack, Typography } from "@mui/material";
import { notFound } from "next/navigation";
import { getUserFromCookie } from "@/app/hooks/getUserFromCookie";
import { getCreativesByAuthorId, getPortfolio } from "@/lib";
import { PortfolioPageClient } from "./client-wrapper";

export default async function PortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getUserFromCookie();
  const portfolio = await getPortfolio(slug);
  if (!portfolio) notFound();

  const isOwn = user?.slug === slug;
  const isWriter = user?.roles.find((r) => r === "writer") !== undefined;
  const creatives = await getCreativesByAuthorId(portfolio.id, isOwn, -1);
  const initials = (portfolio.name ?? portfolio.slug)
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Box component="main" sx={{ bgcolor: "background.paper", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ pt: 8, pb: 4 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={{ xs: 3, sm: 4 }}
          alignItems={{ xs: "center", sm: "flex-start" }}
        >
          <Avatar src={portfolio.image ?? undefined} sx={{ width: 96, height: 96, fontSize: 32, flexShrink: 0 }}>
            {initials}
          </Avatar>
          <Stack gap={1.5} pt={{ xs: 0, sm: 1 }} alignItems={{ xs: "center", sm: "flex-start" }} width="100%">
            <Stack gap={0} alignItems={{ xs: "center", sm: "flex-start" }}>
              <Typography variant="h4" fontWeight={700}>
                {portfolio.name ?? slug}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                @{portfolio.slug}
              </Typography>

              {isOwn && isWriter && (
                <Button
                  variant="contained"
                  size="small"
                  href="/write"
                  startIcon={<AddIcon />}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Write
                </Button>
              )}

              <Stack direction="row" gap={3} alignItems="center" mt={2} mb={0}>
                <Stack direction="column" gap={0.25} alignItems="center">
                  <Typography variant="h6" fontWeight={700}>
                    {creatives.length || "—"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Works
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        <PortfolioPageClient
          userSlug={slug}
          userName={portfolio.name}
          memberSince={portfolio.createdAt?.toISOString() ?? null}
          isOwn={isOwn}
          creatives={creatives}
        />
      </Container>
    </Box>
  );
}
