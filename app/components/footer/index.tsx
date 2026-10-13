import { Box, Container, Divider, Link, Stack, Typography } from "@mui/material";
import { config } from "@/app/config";

export const Footer = () => {
  return (
    <Box component="footer" sx={{ bgcolor: "background.default", pt: 6, pb: 8 }}>
      <Container maxWidth="lg">
        <Divider sx={{ mb: 4 }} />
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: { sm: "center" },
            gap: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              letterSpacing: "-0.02em",
            }}
          >
            <Typography
              component="span"
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "primary.main",
              }}
            >
              a
            </Typography>
            ura
          </Typography>
          <Stack
            direction="row"
            sx={{
              gap: 1,
              alignItems: "center",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              built with ❤️ by{" "}
              <Link
                href={config.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  fontWeight: 600,
                }}
              >
                atul
              </Link>
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.disabled",
              }}
            >
              ·
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
              }}
            >
              &copy; {new Date().getFullYear()}{" "}
              <Link
                href={config.platform}
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  fontWeight: 600,
                }}
              >
                aura
              </Link>
            </Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};
