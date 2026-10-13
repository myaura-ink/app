"use client";

import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import { useAuthContext } from "@/app/contexts";
import { useRecordSearch } from "@/app/hooks/useHistory";
import { useSupport } from "@/app/hooks/useSupport";
import { AuthButton } from "../auth-button";

const NAV_LINKS: { label: string; href: string; icon: ReactNode }[] = [
  { label: "Browse", href: "/search", icon: <ExploreOutlinedIcon fontSize="small" /> },
  { label: "Roadmap", href: "/roadmap", icon: <MapOutlinedIcon fontSize="small" /> },
];

export const Header = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthContext();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  // on chapter pages the header scrolls away so it doesn't sit over the text;
  // the reader has its own toolbar
  const isReading = /^\/story\/[^/]+\/chapter\//.test(pathname);
  // the search page has its own, bigger search box
  const showSearch = !isActive("/search");
  // signed-out visitors need an account before they can write
  const writeHref = user ? "/write" : "/dive";

  return (
    <>
      <AppBar
        position={isReading ? "static" : "sticky"}
        color="inherit"
        elevation={0}
        sx={{
          // frosted glass over whatever scrolls underneath
          bgcolor: "rgba(var(--mui-palette-background-paperChannel) / 0.78)",
          backdropFilter: "saturate(1.4) blur(14px)",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <Container maxWidth="lg">
            <Stack direction="row" sx={{ alignItems: "center", gap: { xs: 1, md: 3 } }}>
              <Brand />

              {/* Desktop nav */}
              <Stack direction="row" component="nav" sx={{ gap: 0.5, display: { xs: "none", sm: "flex" } }}>
                {NAV_LINKS.map(({ label, href, icon }) => (
                  <NavPill key={href} href={href} icon={icon} active={isActive(href)}>
                    {label}
                  </NavPill>
                ))}
              </Stack>

              <Box sx={{ flex: 1 }} />

              {showSearch && <HeaderSearch sx={{ display: { xs: "none", md: "flex" } }} />}

              <Stack direction="row" sx={{ alignItems: "center", gap: { xs: 0.5, sm: 1.5 } }}>
                {showSearch && (
                  <IconButton
                    component={NextLink}
                    href="/search"
                    aria-label="Search stories"
                    size="small"
                    sx={{ display: { xs: "inline-flex", md: "none" }, color: "text.secondary" }}
                  >
                    <SearchIcon fontSize="small" />
                  </IconButton>
                )}
                <SupportHeart />
                {user && (
                  <Button
                    component={NextLink}
                    href={writeHref}
                    variant="contained"
                    size="small"
                    disableElevation
                    startIcon={<EditOutlinedIcon sx={{ fontSize: "1rem !important" }} />}
                    sx={{ display: { xs: "none", sm: "inline-flex" }, borderRadius: 999, px: 2 }}
                  >
                    Write
                  </Button>
                )}
                <AuthButton />
                <IconButton
                  size="small"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Open menu"
                  sx={{ display: { xs: "inline-flex", sm: "none" }, color: "text.secondary" }}
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
              width: "80vw",
              maxWidth: 320,
              bgcolor: "background.paper",
              boxShadow: 0,
              borderLeft: "1px solid",
              borderColor: "divider",
            },
          },
        }}
      >
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            px: 2.5,
            py: 1.5,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Brand onClick={() => setDrawerOpen(false)} />
          <IconButton
            size="small"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack sx={{ gap: 2, p: 2 }}>
          {showSearch && <HeaderSearch onSubmitted={() => setDrawerOpen(false)} />}
          <Stack component="nav" sx={{ gap: 0.5 }}>
            {NAV_LINKS.map(({ label, href, icon }) => (
              <NavPill
                key={href}
                href={href}
                icon={icon}
                active={isActive(href)}
                onClick={() => setDrawerOpen(false)}
                block
              >
                {label}
              </NavPill>
            ))}
          </Stack>
        </Stack>

        <Divider />

        <Stack sx={{ p: 2 }}>
          <Button
            component={NextLink}
            href={writeHref}
            onClick={() => setDrawerOpen(false)}
            variant="contained"
            disableElevation
            fullWidth
            startIcon={<EditOutlinedIcon />}
            sx={{ borderRadius: 999 }}
          >
            {user ? "Write a story" : "Dive in to write"}
          </Button>
        </Stack>
      </Drawer>
    </>
  );
};

const NavPill = ({
  href,
  icon,
  active,
  onClick,
  block = false,
  children,
}: {
  href: string;
  icon: ReactNode;
  active: boolean;
  onClick?: () => void;
  block?: boolean;
  children: ReactNode;
}) => (
  <Button
    component={NextLink}
    href={href}
    onClick={onClick}
    startIcon={icon}
    aria-current={active ? "page" : undefined}
    color="inherit"
    sx={{
      borderRadius: 999,
      px: block ? 2 : 1.75,
      py: block ? 1 : 0.5,
      justifyContent: block ? "flex-start" : "center",
      fontSize: block ? "1rem" : "0.875rem",
      fontWeight: active ? 700 : 500,
      color: active ? "primary.main" : "text.secondary",
      bgcolor: active ? "action.selected" : "transparent",
      "&:hover": { bgcolor: "action.hover", color: "primary.main" },
    }}
  >
    {children}
  </Button>
);

// links visitors to the like / pledge panel on the roadmap.
// only reads the cache filled by the roadmap page, so it doesn't hit /api/support on every page load
const SupportHeart = () => {
  const { data } = useSupport({ enabled: false });
  const liked = data?.me?.liked ?? false;

  return (
    <Tooltip title={liked ? "Thanks for the love!" : "Love Aura? Show your support"}>
      <IconButton
        component={NextLink}
        href="/roadmap#support"
        aria-label={liked ? "You like Aura" : "Show your support for Aura"}
        size="small"
        sx={{
          color: liked ? "secondary.main" : "text.secondary",
          "&:hover": { color: "secondary.main" },
        }}
      >
        {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};

// a compact search box that hands off to the search page
const HeaderSearch = ({ sx, onSubmitted }: { sx?: object; onSubmitted?: () => void }) => {
  const router = useRouter();
  const [value, setValue] = useState("");
  const { mutate: recordSearch } = useRecordSearch();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    if (q) recordSearch(q);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
    setValue("");
    onSubmitted?.();
  };

  return (
    <Box
      component="form"
      role="search"
      onSubmit={submit}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        width: { md: 260 },
        px: 1.5,
        height: 38,
        borderRadius: 999,
        bgcolor: "action.hover",
        border: "1px solid transparent",
        transition: "border-color 0.15s, background-color 0.15s, width 0.2s",
        "&:focus-within": { borderColor: "primary.main", bgcolor: "background.paper", width: { md: 320 } },
        ...sx,
      }}
    >
      <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
      <InputBase
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search stories…"
        inputProps={{ "aria-label": "Search stories", maxLength: 100 }}
        sx={{ flex: 1, fontSize: "0.875rem" }}
      />
    </Box>
  );
};

const Brand = ({ onClick }: { onClick?: () => void }) => (
  <Box
    component={NextLink}
    href="/"
    onClick={onClick}
    aria-label="Aura home"
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      textDecoration: "none",
      color: "primary.main",
      "&:hover .brand-mark": { transform: "rotate(-8deg)" },
    }}
  >
    <Box
      className="brand-mark"
      aria-hidden
      sx={{
        width: 30,
        height: 30,
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        fontFamily: "var(--font-literata), Georgia, serif",
        fontWeight: 700,
        fontSize: "1.15rem",
        lineHeight: 1,
        pb: "2px",
        transition: "transform 0.2s ease",
      }}
    >
      a
    </Box>
    <Typography
      component="span"
      sx={{
        fontFamily: "var(--font-literata), Georgia, serif",
        fontWeight: 700,
        fontSize: "1.3rem",
        letterSpacing: "-0.02em",
        color: "text.primary",
      }}
    >
      aura
    </Typography>
  </Box>
);
