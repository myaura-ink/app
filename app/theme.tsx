"use client";

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-google-sans-flex), Arial, Helvetica, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
  // Warm "paper and ink" neutrals for long-form reading, with sage as the brand
  // accent and a muted brass for highlights. Text colors avoid pure black/white
  // to reduce glare over long sessions.
  colorSchemes: {
    light: {
      palette: {
        primary: {
          light: "#6f9682",
          main: "#3d6650",
          dark: "#24402f",
          contrastText: "#ffffff",
        },
        secondary: {
          light: "#e2cfa8",
          main: "#8c6a3c",
          dark: "#6b4f2a",
          contrastText: "#ffffff",
        },
        background: {
          default: "#f8f6f1",
          paper: "#fffdf9",
        },
        text: {
          primary: "#221f1a",
          secondary: "#625b50",
          disabled: "#9b9387",
        },
        divider: "rgba(58, 48, 32, 0.12)",
        action: {
          hover: "rgba(58, 48, 32, 0.05)",
          selected: "rgba(58, 48, 32, 0.08)",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          light: "#b4d6c3",
          main: "#8fbfa5",
          dark: "#1d3527",
          contrastText: "#0f1d16",
        },
        secondary: {
          light: "#e2cfa8",
          main: "#d6b885",
          dark: "#b39563",
          contrastText: "#1f170b",
        },
        background: {
          default: "#151412",
          paper: "#1d1b18",
        },
        text: {
          primary: "#ebe6dc",
          secondary: "#aaa294",
          disabled: "#6f685d",
        },
        divider: "rgba(235, 230, 220, 0.12)",
        action: {
          hover: "rgba(235, 230, 220, 0.06)",
          selected: "rgba(235, 230, 220, 0.1)",
        },
      },
    },
  },
  cssVariables: {
    colorSchemeSelector: "class",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        // drop the dark-mode elevation overlay so cards keep the paper tone
        root: { backgroundImage: "none" },
      },
    },
    MuiTab: {
      defaultProps: {
        disableRipple: false,
      },
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.9375rem",
          paddingLeft: 0,
          paddingRight: 0,
          marginRight: 24,
          minWidth: 0,
          "&.Mui-selected": {
            fontWeight: 700,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 2,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        sizeSmall: {
          height: 22,
          fontSize: "0.7rem",
        },
      },
    },
  },
});

export default responsiveFontSizes(theme);
