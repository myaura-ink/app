"use client";

import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import FullscreenExitOutlined from "@mui/icons-material/FullscreenExitOutlined";
import FullscreenOutlined from "@mui/icons-material/FullscreenOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessOutlined from "@mui/icons-material/SettingsBrightnessOutlined";
import TuneOutlined from "@mui/icons-material/TuneOutlined";
import {
  Box,
  Button,
  IconButton,
  Popover,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import { type ReactNode, useEffect, useState } from "react";

const STORAGE_KEY = "aura-reader-settings";

const SIZES = ["1rem", "1.0625rem", "1.1875rem", "1.3125rem", "1.4375rem"] as const;
const MEASURES = { narrow: "34rem", normal: "40rem", wide: "48rem" } as const;

export interface ReaderSettings {
  font: "serif" | "sans";
  size: number;
  width: keyof typeof MEASURES;
  tone: "theme" | "sepia";
  focus: boolean;
  /** desktop chapter list folded down to a strip of chapter numbers */
  contentsCollapsed: boolean;
}

const DEFAULTS: ReaderSettings = {
  font: "serif",
  size: 2,
  width: "normal",
  tone: "theme",
  focus: false,
  contentsCollapsed: false,
};

const load = (): ReaderSettings => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    const merged = { ...DEFAULTS, ...stored };
    // guard against stale or hand-edited values
    if (!(merged.size >= 0 && merged.size < SIZES.length)) merged.size = DEFAULTS.size;
    if (!(merged.width in MEASURES)) merged.width = DEFAULTS.width;
    return merged;
  } catch {
    return DEFAULTS;
  }
};

// Per-reader preferences, kept in this browser only.
export const useReaderSettings = () => {
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULTS);

  useEffect(() => setSettings(load()), []);

  const update = (patch: Partial<ReaderSettings>) =>
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable (private mode); settings still apply for this visit
      }
      return next;
    });

  // attributes and custom properties consumed by the .reader rules in globals.css
  const readerProps = {
    "data-font": settings.font,
    "data-tone": settings.tone,
    style: {
      "--reader-size": SIZES[settings.size],
      "--reader-measure": MEASURES[settings.width],
    } as React.CSSProperties,
  };

  return { settings, update, readerProps };
};

// Browser fullscreen for the whole page. The page, not just the article, goes
// fullscreen so popovers and drawers (rendered into <body>) stay visible.
export const useFullscreen = () => {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // unsupported on iPhone Safari, and in iframes without allowfullscreen
    setSupported(!!document.fullscreenEnabled);
    const sync = () => setActive(!!document.fullscreenElement);
    sync();
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggle = () => {
    const request = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();
    // rejected when not triggered by a click or blocked by the browser; nothing to do
    request.catch(() => {});
  };

  return { supported, active, toggle };
};

export type Fullscreen = ReturnType<typeof useFullscreen>;

export const FullscreenButton = ({ fullscreen }: { fullscreen: Fullscreen }) => {
  if (!fullscreen.supported) return null;
  const label = fullscreen.active ? "Exit full screen" : "Full screen";
  return (
    <Tooltip title={label}>
      <IconButton size="small" onClick={fullscreen.toggle} aria-label={label}>
        {fullscreen.active ? <FullscreenExitOutlined fontSize="small" /> : <FullscreenOutlined fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <Stack sx={{ gap: 0.75 }}>
    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
      {label}
    </Typography>
    {children}
  </Stack>
);

const groupSx = { "& .MuiToggleButton-root": { flex: 1, py: 0.5, textTransform: "none" } };

export const ReaderSettingsButton = ({
  settings,
  update,
  fullscreen,
}: {
  settings: ReaderSettings;
  update: (patch: Partial<ReaderSettings>) => void;
  fullscreen: Fullscreen;
}) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // site-wide color mode, shared with the footer toggle
  const { mode, setMode } = useColorScheme();

  return (
    <>
      {/* labelled on wider screens so it reads as "customize how this looks", not just an icon */}
      <Tooltip title="Customize font, size, theme and layout">
        <Button
          size="small"
          color="inherit"
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="Customize reading"
          aria-haspopup="dialog"
          startIcon={<TuneOutlined fontSize="small" />}
          sx={{
            color: "text.secondary",
            minWidth: 0,
            px: { xs: 0.75, sm: 1.25 },
            "& .MuiButton-startIcon": { mr: { xs: 0, sm: 0.75 }, ml: 0 },
          }}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Customize
          </Box>
        </Button>
      </Tooltip>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 300, p: 2, mt: 1 } } }}
      >
        <Stack sx={{ gap: 2 }}>
          <Row label="Font">
            <ToggleButtonGroup
              size="small"
              exclusive
              fullWidth
              value={settings.font}
              onChange={(_, font) => font && update({ font })}
              sx={groupSx}
            >
              <ToggleButton value="serif" sx={{ fontFamily: "var(--font-literata), Georgia, serif" }}>
                Serif
              </ToggleButton>
              <ToggleButton value="sans">Sans</ToggleButton>
            </ToggleButtonGroup>
          </Row>

          <Row label="Text size">
            <ToggleButtonGroup
              size="small"
              exclusive
              fullWidth
              value={settings.size}
              onChange={(_, size) => size !== null && update({ size })}
              sx={groupSx}
            >
              {SIZES.map((size, i) => (
                <ToggleButton key={size} value={i} aria-label={`Text size ${i + 1}`}>
                  <Box component="span" sx={{ fontSize: `${0.75 + i * 0.125}rem`, lineHeight: 1, fontWeight: 600 }}>
                    A
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Row>

          <Row label="Line width">
            <ToggleButtonGroup
              size="small"
              exclusive
              fullWidth
              value={settings.width}
              onChange={(_, width) => width && update({ width })}
              sx={groupSx}
            >
              <ToggleButton value="narrow">Narrow</ToggleButton>
              <ToggleButton value="normal">Normal</ToggleButton>
              <ToggleButton value="wide">Wide</ToggleButton>
            </ToggleButtonGroup>
          </Row>

          <Row label="Theme">
            <ToggleButtonGroup
              size="small"
              exclusive
              fullWidth
              value={mode ?? null}
              onChange={(_, value: "system" | "light" | "dark" | null) => value && setMode(value)}
              sx={{ ...groupSx, "& .MuiToggleButton-root": { ...groupSx["& .MuiToggleButton-root"], gap: 0.5 } }}
            >
              <ToggleButton value="system">
                <SettingsBrightnessOutlined sx={{ fontSize: 16 }} />
                System
              </ToggleButton>
              <ToggleButton value="light">
                <LightModeOutlined sx={{ fontSize: 16 }} />
                Light
              </ToggleButton>
              <ToggleButton value="dark">
                <DarkModeOutlined sx={{ fontSize: 16 }} />
                Dark
              </ToggleButton>
            </ToggleButtonGroup>
          </Row>

          <Row label="Paper">
            <ToggleButtonGroup
              size="small"
              exclusive
              fullWidth
              value={settings.tone}
              onChange={(_, tone) => tone && update({ tone })}
              sx={groupSx}
            >
              <ToggleButton value="theme">Plain</ToggleButton>
              <ToggleButton value="sepia" sx={{ "&.Mui-selected": { bgcolor: "#e9dcbf", color: "#3b2f1e" } }}>
                Sepia
              </ToggleButton>
            </ToggleButtonGroup>
          </Row>

          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Focus mode
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Hide the chapter list entirely
              </Typography>
            </Box>
            <Switch
              checked={settings.focus}
              onChange={(e) => update({ focus: e.target.checked })}
              slotProps={{ input: { "aria-label": "Focus mode" } }}
            />
          </Stack>

          {fullscreen.supported && (
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Full screen
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Hide the browser around the page
                </Typography>
              </Box>
              {/* not persisted: browsers only allow fullscreen from a click */}
              <Switch
                checked={fullscreen.active}
                onChange={fullscreen.toggle}
                slotProps={{ input: { "aria-label": "Full screen" } }}
              />
            </Stack>
          )}
        </Stack>
      </Popover>
    </>
  );
};
