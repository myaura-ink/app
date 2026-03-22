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
      main: "#4e6e5d", // Deep, rich green
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
      default: "#f4f5f2", // Tinted background reduces glare
      paper: "#fafbf9",
    },
    text: {
      primary: "#1b2621", // Deep forest black
      secondary: "#54635c",
    },
  },
  cssVariables: true,
});

export default responsiveFontSizes(theme);
