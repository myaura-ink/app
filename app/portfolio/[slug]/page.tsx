import { Avatar, Box, Container, Stack, Typography } from "@mui/material";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db, users } from "@/lib";
import { PortfolioPageClient } from "./client-wrapper";

export default async function PortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const result = await db.select().from(users).where(eq(users.slug, slug));
  if (result.length === 0) notFound();

  const user = result[0];
  const initials = (user.name ?? user.slug)
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
          <Avatar src={user.image ?? undefined} sx={{ width: 96, height: 96, fontSize: 32, flexShrink: 0 }}>
            {initials}
          </Avatar>
          <Stack gap={1.5} pt={{ xs: 0, sm: 1 }} alignItems={{ xs: "center", sm: "flex-start" }} width="100%">
            <Stack gap={0} alignItems={{ xs: "center", sm: "flex-start" }}>
              <Typography variant="h4" fontWeight={700}>
                {user.name ?? slug}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                @{user.slug}
              </Typography>
            </Stack>
            <PortfolioPageClient
              userSlug={slug}
              userId={user.id}
              userName={user.name}
              memberSince={user.createdAt?.toISOString() ?? null}
            />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
