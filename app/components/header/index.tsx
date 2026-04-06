"use client";

import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Link,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthButton } from "../auth-button";

const NAV_LINKS = [
  // { label: "Explore", href: "/explore" },
  // { label: "Bounties", href: "/bounty" },
];

export const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        variant="elevation"
        elevation={0}
        sx={{ borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Container maxWidth="lg">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              {/* Left: brand + desktop nav */}
              <Stack direction="row" alignItems="center" gap={2}>
                <Brand />
                <Stack direction="row" alignItems="center" sx={{ display: { xs: "none", sm: "flex" }, ml: 2 }}>
                  {NAV_LINKS.map(({ label, href }) => (
                    <Button
                      key={href}
                      href={href}
                      disableRipple
                      sx={{
                        color: isActive(href) ? "primary.main" : "text.secondary",
                        fontWeight: isActive(href) ? 600 : 500,
                        fontSize: "0.875rem",
                        position: "relative",
                        "&:hover": { bgcolor: "transparent", color: "primary.main" },
                        "&::after": isActive(href)
                          ? {
                              content: '""',
                              position: "absolute",
                              bottom: 6,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "60%",
                              height: "2px",
                              bgcolor: "primary.main",
                              borderRadius: 1,
                            }
                          : {},
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>
              </Stack>

              {/* Right: auth + mobile menu */}
              <Stack direction="row" alignItems="center" gap={1}>
                <AuthButton />
                <IconButton
                  size="small"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="open menu"
                  sx={{ display: { xs: "flex", sm: "none" } }}
                >
                  <MenuIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: "72vw",
              maxWidth: 280,
              bgcolor: "background.paper",
              boxShadow: 0,
              borderLeft: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        {/* Drawer header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "divider" }}
        >
          <Brand />
          <IconButton
            size="small"
            onClick={() => setDrawerOpen(false)}
            aria-label="close menu"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Drawer nav */}
        <Stack sx={{ px: 2, pt: 2, pb: 3 }} gap={0.5}>
          {NAV_LINKS.map(({ label, href }) => (
            <Box
              key={href}
              component="a"
              href={href}
              onClick={() => setDrawerOpen(false)}
              sx={{
                display: "block",
                px: 2,
                py: 1.25,
                borderRadius: 1.5,
                textDecoration: "none",
                bgcolor: isActive(href) ? "action.selected" : "transparent",
                transition: "background-color 0.15s",
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Typography
                variant="body1"
                fontWeight={isActive(href) ? 600 : 500}
                color={isActive(href) ? "primary.main" : "text.primary"}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Divider />

        {/* Drawer footer */}
        <Stack sx={{ px: 3, pt: 3 }}>
          <Button href="/dive" variant="outlined" fullWidth>
            dive in
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

const Brand = () => (
  <Link href="/" sx={{ textDecoration: "none" }}>
    <Typography
      component="span"
      variant="h6"
      color="primary.main"
      fontWeight={700}
      sx={{ letterSpacing: "-0.02em", opacity: 1, transition: "opacity 0.15s", ":hover": { opacity: 0.7 } }}
    >
      <Typography component="span" variant="h5" color="primary.main" fontWeight={800}>
        a
      </Typography>
      ura
    </Typography>
  </Link>
);
