import { Box, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { DivePageClient } from "./client-wrapper";

export default function Dive() {
  return (
    <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* Left — brand panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          width: "42%",
          flexShrink: 0,
          bgcolor: "primary.dark",
          p: 6,
        }}
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Typography variant="h4" fontWeight={800} sx={{ color: "primary.contrastText", letterSpacing: "-0.02em" }}>
            <Typography component="span" variant="h3" fontWeight={800} sx={{ color: "secondary.light" }}>
              a
            </Typography>
            ura
          </Typography>
        </Link>

        <Stack gap={3}>
          <Typography
            variant="h3"
            fontWeight={700}
            lineHeight={1.2}
            sx={{ color: "primary.contrastText", letterSpacing: "-0.02em" }}
          >
            Stories that find their reader.
          </Typography>
          <Divider sx={{ borderColor: "rgba(255,255,255,0.15)", width: "20%" }} />
          <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.75 }}>
            A space where writers write with intention and readers read with purpose. Join the inner circle of
            intentional storytelling.
          </Typography>
        </Stack>

        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>
          © {new Date().getFullYear()} Aura. All rights reserved.
        </Typography>
      </Box>

      {/* Right — form panel */}
      <DivePageClient />
    </Box>
  );
}
