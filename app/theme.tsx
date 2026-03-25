"use client";

import { createTheme, responsiveFontSizes } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-google-sans-flex), Arial, Helvetica, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
  palette: {
    mode: "light",
    primary: {
      light: "#7a9688",
      main: "#4e6e5d",
      dark: "#2d4036",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#c8ad7f",
      light: "#e6d4b7",
      dark: "#8a6f4b",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f4f5f2",
      paper: "#fafbf9",
    },
    text: {
      primary: "#1b2621",
      secondary: "#54635c",
    },
  },
  cssVariables: true,
  components: {
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
